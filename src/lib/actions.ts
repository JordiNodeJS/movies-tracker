"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { connection } from "next/server";
import { getMovieDetails } from "@/lib/tmdb";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function ensureUser() {
  await connection();
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) throw new Error("Unauthorized");

  const payload = await verifyJWT(token);
  if (!payload || !payload.userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw new Error("Unauthorized");

  return user;
}

export async function toggleWatchlist(
  movieId: number,
  title: string,
  posterPath: string
) {
  const user = await ensureUser();

  const existing = await prisma.watchlistItem.findUnique({
    where: {
      userId_movieId: {
        userId: user.id,
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
        userId: user.id,
        movieId,
        title,
        posterPath,
      },
    });
  }

  revalidatePath(`/movie/${movieId}`);
  revalidatePath("/watchlist");
  revalidateTag("recommendations", "max");
  revalidateTag(`movie-${movieId}`, "max");
}

export async function saveNote(
  movieId: number,
  content: string,
  title?: string,
  posterPath?: string
) {
  const user = await ensureUser();

  await prisma.note.upsert({
    where: {
      userId_movieId: {
        userId: user.id,
        movieId,
      },
    },
    update: { content, title, posterPath },
    create: {
      userId: user.id,
      movieId,
      content,
      title,
      posterPath,
    },
  });

  revalidatePath(`/movie/${movieId}`);
  revalidateTag("recommendations", "max");
  revalidateTag(`movie-${movieId}`, "max");
}

export async function saveRating(
  movieId: number,
  value: number,
  title?: string,
  posterPath?: string
) {
  const user = await ensureUser();

  await prisma.rating.upsert({
    where: {
      userId_movieId: {
        userId: user.id,
        movieId,
      },
    },
    update: { value, title, posterPath },
    create: {
      userId: user.id,
      movieId,
      value,
      title,
      posterPath,
    },
  });

  revalidatePath(`/movie/${movieId}`);
  revalidateTag("recommendations", "max");
  revalidateTag(`movie-${movieId}`, "max");
}

export async function deleteNote(movieId: number) {
  const user = await ensureUser();

  await prisma.note.delete({
    where: {
      userId_movieId: {
        userId: user.id,
        movieId,
      },
    },
  });

  revalidatePath(`/movie/${movieId}`);
  revalidateTag("recommendations", "max");
  revalidateTag(`movie-${movieId}`, "max");
}

export async function deleteRating(movieId: number) {
  const user = await ensureUser();

  await prisma.rating.delete({
    where: {
      userId_movieId: {
        userId: user.id,
        movieId,
      },
    },
  });

  revalidatePath(`/movie/${movieId}`);
  revalidateTag("recommendations", "max");
  revalidateTag(`movie-${movieId}`, "max");
}

export async function getMovieUserData(movieId: number) {
  await connection();
  try {
    const user = await ensureUser();

    const [watchlist, note, rating] = await Promise.all([
      prisma.watchlistItem.findUnique({
        where: { userId_movieId: { userId: user.id, movieId } },
      }),
      prisma.note.findUnique({
        where: { userId_movieId: { userId: user.id, movieId } },
      }),
      prisma.rating.findUnique({
        where: { userId_movieId: { userId: user.id, movieId } },
      }),
    ]);

    return {
      isInWatchlist: !!watchlist,
      note: note?.content || "",
      rating: rating?.value || 0,
    };
  } catch (error) {
    return {
      isInWatchlist: false,
      note: "",
      rating: 0,
    };
  }
}

export async function getProfileData() {
  await connection();
  const user = await ensureUser();

  const [ratings, notes, watchlist, recs] = await Promise.all([
    prisma.rating.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    prisma.note.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.watchlistItem.count({
      where: { userId: user.id },
    }),
    prisma.recommendation.findMany({
      where: { userId: user.id },
      orderBy: { score: "desc" },
      take: 5,
    }),
  ]);

  const recommendations = recs.map((rec) => ({
    ...rec,
    title: rec.title || "Unknown Movie",
  }));

  const allRatings = await prisma.rating.findMany({
    where: { userId: user.id },
    select: { value: true },
  });

  const avgRating =
    allRatings.length > 0
      ? (
          allRatings.reduce((acc, r) => acc + r.value, 0) / allRatings.length
        ).toFixed(1)
      : "0.0";

  return {
    userId: user.id,
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
