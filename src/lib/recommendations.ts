"use server";

import { prisma } from "@/lib/prisma";
import { fetchTMDB } from "@/lib/tmdb";

const MOCK_USER_ID = "user_123";

export async function generateRecommendations(language: string = 'en') {
  // 1. Get user's high rated movies (8+)
  const highRated = await prisma.rating.findMany({
    where: { userId: MOCK_USER_ID, value: { gte: 8 } },
    select: { movieId: true },
  });

  // 2. Get user's watchlist
  const watchlist = await prisma.watchlistItem.findMany({
    where: { userId: MOCK_USER_ID },
    select: { movieId: true },
  });

  const seenMovieIds = new Set([
    ...highRated.map((r: { movieId: number }) => r.movieId),
    ...watchlist.map((w: { movieId: number }) => w.movieId),
  ]);

  // 3. Infer favorite genres from high rated movies
  const genreScores: Record<number, number> = {};

  for (const rating of highRated) {
    const movie = await fetchTMDB(`/movie/${rating.movieId}`, language);
    movie.genres.forEach((g: any) => {
      genreScores[g.id] = (genreScores[g.id] || 0) + 1;
    });
  }

  // 4. Fetch trending or popular movies to recommend
  const popular = await fetchTMDB("/movie/popular", language);
  const recommendations = [];

  for (const movie of popular.results) {
    if (seenMovieIds.has(movie.id)) continue;

    let score = movie.vote_average;

    // Boost score based on genre match
    movie.genre_ids.forEach((gid: number) => {
      if (genreScores[gid]) {
        score += genreScores[gid] * 0.5;
      }
    });

    recommendations.push({
      userId: MOCK_USER_ID,
      movieId: movie.id,
      score,
      reason: "Based on your high-rated genres",
    });
  }

  // 5. Sort and save top 10
  recommendations.sort((a, b) => b.score - a.score);
  const top10 = recommendations.slice(0, 10);

  // Clear old recommendations and save new ones
  await prisma.recommendation.deleteMany({ where: { userId: MOCK_USER_ID } });
  await prisma.recommendation.createMany({ data: top10 });

  return top10;
}

export async function getRecommendations() {
  // "use cache";
  // ⚠️ CACHING STRATEGY: Tag-based revalidation
  // This cache is invalidated when recommendations are regenerated.

  return prisma.recommendation.findMany({
    where: { userId: MOCK_USER_ID },
    orderBy: { score: "desc" },
    take: 10,
  });
}
