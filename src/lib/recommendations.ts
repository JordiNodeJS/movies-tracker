"use server";

import { prisma } from "@/lib/prisma";
import { fetchTMDB } from "@/lib/tmdb";
import { cacheLife, cacheTag } from "next/cache";

const MOCK_USER_ID = process.env.DEMO_USER_ID || "demo-user-001";

export async function generateRecommendations(language: string = "en") {
  "use cache";
  cacheTag("recommendations");
  // 1. Get user's high rated movies (8+) for genre preference
  const highRated = await prisma.rating.findMany({
    where: { userId: MOCK_USER_ID, value: { gte: 8 } },
    select: { movieId: true },
  });

  // 2. Get ALL user interactions to filter them out
  const [watchlist, allRatings, notes] = await Promise.all([
    prisma.watchlistItem.findMany({
      where: { userId: MOCK_USER_ID },
      select: { movieId: true },
    }),
    prisma.rating.findMany({
      where: { userId: MOCK_USER_ID },
      select: { movieId: true },
    }),
    prisma.note.findMany({
      where: { userId: MOCK_USER_ID },
      select: { movieId: true },
    }),
  ]);

  // 3. Get trending movies to avoid duplication on Home page
  const trending = await fetchTMDB("/trending/movie/week", language);
  const trendingIds = new Set(trending.results.map((m: any) => m.id));

  const seenMovieIds = new Set([
    ...watchlist.map((w) => w.movieId),
    ...allRatings.map((r) => r.movieId),
    ...notes.map((n) => n.movieId),
    ...Array.from(trendingIds), // Also exclude trending
  ]);

  // 4. Infer favorite genres from high rated movies (limit to top 5 to avoid too many API calls)
  const genreScores: Record<number, number> = {};
  const topHighRated = highRated.slice(0, 5);

  await Promise.all(
    topHighRated.map(async (rating) => {
      try {
        const movie = await fetchTMDB(`/movie/${rating.movieId}`, language);
        movie.genres?.forEach((g: any) => {
          genreScores[g.id] = (genreScores[g.id] || 0) + 1;
        });
      } catch (e) {
        console.error(`Failed to fetch genres for movie ${rating.movieId}`);
      }
    })
  );

  // 5. Fetch more candidates (multiple pages) to ensure we have enough after filtering
  const [popular1, popular2, topRated1, topRated2] = await Promise.all([
    fetchTMDB("/movie/popular?page=1", language),
    fetchTMDB("/movie/popular?page=2", language),
    fetchTMDB("/movie/top_rated?page=1", language),
    fetchTMDB("/movie/top_rated?page=2", language),
  ]);

  const candidates = [
    ...popular1.results,
    ...popular2.results,
    ...topRated1.results,
    ...topRated2.results,
  ];
  const recommendations = [];
  const addedMovieIds = new Set<number>();

  for (const movie of candidates) {
    // Filter out: already seen, already added to recs, or NO POSTER
    if (
      seenMovieIds.has(movie.id) ||
      addedMovieIds.has(movie.id) ||
      !movie.poster_path
    )
      continue;

    let score = movie.vote_average;

    // Boost score based on genre match
    movie.genre_ids?.forEach((gid: number) => {
      if (genreScores[gid]) {
        score += genreScores[gid] * 1.5;
      }
    });

    recommendations.push({
      userId: MOCK_USER_ID,
      movieId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      voteAverage: movie.vote_average,
      score,
      reason: genreScores[movie.genre_ids?.[0]]
        ? "Based on your favorite genres"
        : "Highly rated and popular",
    });
    addedMovieIds.add(movie.id);
  }

  // 6. If we still don't have enough recommendations, relax the "seen" filter for trending
  if (recommendations.length < 5) {
    for (const movie of candidates) {
      if (addedMovieIds.has(movie.id) || !movie.poster_path) continue;

      recommendations.push({
        userId: MOCK_USER_ID,
        movieId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        voteAverage: movie.vote_average,
        score: movie.vote_average,
        reason: "Popular choice",
      });
      addedMovieIds.add(movie.id);
      if (recommendations.length >= 10) break;
    }
  }

  // 7. Sort and save top 10
  recommendations.sort((a, b) => b.score - a.score);
  const top10 = recommendations.slice(0, 10);

  // Clear old recommendations and save new ones in a transaction
  await prisma.$transaction([
    prisma.recommendation.deleteMany({ where: { userId: MOCK_USER_ID } }),
    prisma.recommendation.createMany({ data: top10 }),
  ]);

  return top10;
}

export async function getRecommendations() {
  const recs = await prisma.recommendation.findMany({
    where: { userId: MOCK_USER_ID },
    orderBy: { score: "desc" },
    take: 10,
  });

  if (recs.length === 0) {
    return await generateRecommendations();
  }

  return recs;
}
