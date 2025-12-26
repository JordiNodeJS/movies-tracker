"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { connection } from "next/server";
import { getMovieDetails } from "@/lib/tmdb";

// Mock user ID for now - in a real app, this would come from auth
const MOCK_USER_ID = process.env.DEMO_USER_ID || "demo-user-001";

export async function ensureUser() {
  await connection();
  return await prisma.user.upsert({
    where: { email: "jordi.nodejs@gmail.com" },
    update: {},
    create: {
      id: MOCK_USER_ID,
      email: "jordi.nodejs@gmail.com",
      name: "Jordi",
    },
  });
}

export async function toggleWatchlist(
  movieId: number,
  title: string,
  posterPath: string
) {
  await ensureUser();

  const existing = await prisma.watchlistItem.findUnique({
    where: {
      userId_movieId: {
        userId: MOCK_USER_ID,
        movieId,
      },
    },
  });

  if (existing) {
    await prisma.watchlistItem.delete({
      where: { id: existing.id },
    });
  } else {
    await prisma.watchlistItem.create({
      data: {
        userId: MOCK_USER_ID,
        movieId,
        title,
        posterPath,
      },
    });
  }

  revalidatePath(`/movie/${movieId}`);
  revalidatePath("/watchlist");
  revalidateTag("recommendations");
  revalidateTag(`movie-${movieId}`);
}

export async function saveNote(
  movieId: number,
  content: string,
  title?: string,
  posterPath?: string
) {
  await ensureUser();

  await prisma.note.upsert({
    where: {
      userId_movieId: {
        userId: MOCK_USER_ID,
        movieId,
      },
    },
    update: { content, title, posterPath },
    create: {
      userId: MOCK_USER_ID,
      movieId,
      content,
      title,
      posterPath,
    },
  });

  revalidatePath(`/movie/${movieId}`);
  revalidateTag("recommendations");
  revalidateTag(`movie-${movieId}`);
}

export async function saveRating(
  movieId: number,
  value: number,
  title?: string,
  posterPath?: string
) {
  await ensureUser();

  await prisma.rating.upsert({
    where: {
      userId_movieId: {
        userId: MOCK_USER_ID,
        movieId,
      },
    },
    update: { value, title, posterPath },
    create: {
      userId: MOCK_USER_ID,
      movieId,
      value,
      title,
      posterPath,
    },
  });

  revalidatePath(`/movie/${movieId}`);
  revalidateTag("recommendations");
  revalidateTag(`movie-${movieId}`);
}

export async function deleteNote(movieId: number) {
  await ensureUser();

  await prisma.note.delete({
    where: {
      userId_movieId: {
        userId: MOCK_USER_ID,
        movieId,
      },
    },
  });

  revalidatePath(`/movie/${movieId}`);
  revalidateTag("recommendations");
  revalidateTag(`movie-${movieId}`);
}

export async function deleteRating(movieId: number) {
  await ensureUser();

  await prisma.rating.delete({
    where: {
      userId_movieId: {
        userId: MOCK_USER_ID,
        movieId,
      },
    },
  });

  revalidatePath(`/movie/${movieId}`);
  revalidateTag("recommendations");
  revalidateTag(`movie-${movieId}`);
}

export async function getMovieUserData(movieId: number) {
  await connection();
  console.log("Fetching user data for movie:", movieId);
  try {
    await ensureUser();
    console.log("User ensured");

    const [watchlist, note, rating] = await Promise.all([
      prisma.watchlistItem.findUnique({
        where: { userId_movieId: { userId: MOCK_USER_ID, movieId } },
      }),
      prisma.note.findUnique({
        where: { userId_movieId: { userId: MOCK_USER_ID, movieId } },
      }),
      prisma.rating.findUnique({
        where: { userId_movieId: { userId: MOCK_USER_ID, movieId } },
      }),
    ]);
    console.log("Data fetched:", {
      watchlist: !!watchlist,
      note: !!note,
      rating: !!rating,
    });

    return {
      isInWatchlist: !!watchlist,
      note: note?.content || "",
      rating: rating?.value || 0,
    };
  } catch (error) {
    console.error("Error in getMovieUserData:", error);
    return {
      isInWatchlist: false,
      note: "",
      rating: 0,
    };
  }
}

export async function getProfileData() {
  await connection();
  await ensureUser();

  const [ratings, notes, watchlist, recs] = await Promise.all([
    prisma.rating.findMany({
      where: { userId: MOCK_USER_ID },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    prisma.note.findMany({
      where: { userId: MOCK_USER_ID },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.watchlistItem.count({
      where: { userId: MOCK_USER_ID },
    }),
    prisma.recommendation.findMany({
      where: { userId: MOCK_USER_ID },
      orderBy: { score: "desc" },
      take: 5,
    }),
  ]);

  const recommendations = recs.map((rec) => ({
    ...rec,
    title: rec.title || "Unknown Movie",
  }));

  const allRatings = await prisma.rating.findMany({
    where: { userId: MOCK_USER_ID },
    select: { value: true },
  });

  const avgRating =
    allRatings.length > 0
      ? (
          allRatings.reduce((acc, r) => acc + r.value, 0) / allRatings.length
        ).toFixed(1)
      : "0.0";

  return {
    ratings,
    notes,
    recommendations,
    stats: {
      watched: allRatings.length,
      watchlist,
      avgRating,
    },
  };
}
