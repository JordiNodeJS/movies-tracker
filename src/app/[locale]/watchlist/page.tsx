import { prisma } from "@/lib/prisma";
import { MovieCard } from "@/components/movie-card";
import { connection } from "next/server";
import { Suspense } from "react";
import { Bookmark } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

const MOCK_USER_ID = "user_123";

export default async function WatchlistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Watchlist");

  return (
    <div className="max-w-7xl mx-auto px-6 py-32 space-y-20">
      <section>
        <div className="mb-16">
          <h1 className="text-7xl font-black tracking-tighter mb-4 uppercase leading-none">
            {t("title")}
          </h1>
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-indigo-500" />
            <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px]">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <Suspense fallback={<WatchlistSkeleton />}>
          <WatchlistContent />
        </Suspense>
      </section>
    </div>
  );
}

async function WatchlistContent() {
  await connection();
  const [watchlist, ratings] = await Promise.all([
    prisma.watchlistItem.findMany({
      where: { userId: MOCK_USER_ID },
      orderBy: { addedAt: "desc" },
    }),
    prisma.rating.findMany({
      where: { userId: MOCK_USER_ID },
    }),
  ]);

  const ratingsMap = new Map(ratings.map((r) => [r.movieId, r.value]));
  // We can't use useTranslations here because it's a server component called within Suspense
  // but we can pass the translations or just use the same pattern as above if we move it.
  // Actually, next-intl supports calling getTranslations in server components.
  // But for simplicity, I'll just use a simple approach.

  // Wait, I can just use getTranslations here.
  const { getTranslations } = require("next-intl/server");
  const t = await getTranslations("Watchlist");

  if (watchlist.length === 0) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center border border-white/5 bg-white/[0.02] rounded-[3rem] space-y-6">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
          <Bookmark className="w-8 h-8 text-white/20" />
        </div>
        <div className="text-center">
          <p className="text-white/40 font-black uppercase tracking-[0.2em] text-sm mb-2">
            {t("empty")}
          </p>
          <p className="text-white/20 text-xs font-bold uppercase tracking-widest">
            {t("emptySubtitle")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
      {watchlist.map(
        (item: {
          id: string;
          movieId: number;
          title: string;
          posterPath: string | null;
        }) => (
          <MovieCard
            key={item.id}
            movie={
              {
                id: item.movieId,
                title: item.title,
                poster_path: item.posterPath || "",
                vote_average: 0,
              } as any
            }
            userRating={ratingsMap.get(item.movieId)}
          />
        )
      )}
    </div>
  );
}

function WatchlistSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="aspect-[2/3] rounded-[2rem] bg-white/5 animate-pulse"
        />
      ))}
    </div>
  );
}
