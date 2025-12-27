import { getProfileData } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { Star, MessageSquare, Quote, Bookmark, Loader2 } from "lucide-react";
import { RecommendationButton } from "@/components/recommendation-button";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-7xl mx-auto px-6 py-32 space-y-20">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}

async function ProfileContent() {
  const data = await getProfileData();
  const t = await getTranslations("Profile");
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
    select: { email: true, name: true },
  });

  const displayName = user?.name || user?.email?.split("@")[0] || "User";

  return (
    <div className="space-y-20">
      <header className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-ui-accent-primary to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-ui-bg border border-ui-border/10 flex items-center justify-center text-4xl sm:text-5xl font-black tracking-tighter">
            {displayName[0].toUpperCase()}
          </div>
        </div>
        <div className="text-center sm:text-left space-y-2">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase leading-[1.1] py-2 px-1">
            {displayName}
          </h1>
          <div className="flex items-center justify-center sm:justify-start gap-4">
            <div className="h-[1px] w-12 bg-ui-accent-primary" />
            <p className="opacity-80 font-black uppercase tracking-[0.3em] text-[10px]">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-ui-bg/[0.02] border border-ui-border/5 p-12 space-y-10">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-ui-accent-primary/10 blur-[120px] rounded-full" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-black tracking-tighter uppercase">
              {t("engineTitle")}
            </h2>
            <p className="opacity-80 font-medium text-lg max-w-xl">
              {t("engineDescription")}
            </p>
          </div>

          <RecommendationButton />
        </div>

        <div className="grid md:grid-cols-3 gap-6 pt-10 border-t border-ui-border/5">
          <StatCard
            label={t("moviesWatched")}
            value={data.stats.watched.toString()}
          />
          <StatCard
            label={t("watchlistCount")}
            value={data.stats.watchlist.toString()}
          />
          <StatCard label={t("averageRating")} value={data.stats.avgRating} />
        </div>
      </section>

      <div className="grid lg:grid-cols-[1fr_400px] gap-20">
        <section className="space-y-12">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black tracking-tighter uppercase">
              {t("recentJournalEntries")}
            </h2>
            <Link
              href="/watchlist"
              className="text-[10px] font-black uppercase tracking-[0.2em] opacity-20 hover:opacity-100 transition-all"
            >
              {t("viewAll")}
            </Link>
          </div>

          {data.notes.length > 0 ? (
            <div className="space-y-6">
              {data.notes.map((note) => (
                <div
                  key={note.id}
                  className="group relative p-10 rounded-[2.5rem] bg-foreground/[0.02] border border-foreground/5 hover:bg-foreground/[0.04] transition-all"
                >
                  <Quote className="absolute top-6 right-10 w-12 h-12 opacity-[0.03] group-hover:text-accent/10 transition-colors" />
                  <div className="flex gap-8">
                    {note.posterPath && (
                      <div className="relative w-24 aspect-[2/3] rounded-xl overflow-hidden border border-foreground/10 shrink-0">
                        <Image
                          src={`https://image.tmdb.org/t/p/w200${note.posterPath}`}
                          alt={note.title || ""}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                    )}
                    <div className="space-y-4">
                      <h3 className="text-xl font-black uppercase tracking-tight">
                        {note.title}
                      </h3>
                      <p className="opacity-60 leading-relaxed italic">
                        &quot;{note.content}&quot;
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 rounded-[2.5rem] border border-dashed border-foreground/10 flex flex-col items-center justify-center gap-4 opacity-20">
              <MessageSquare className="w-8 h-8" />
              <p className="text-xs font-black uppercase tracking-widest">
                {t("noJournal")}
              </p>
            </div>
          )}
        </section>

        <aside className="space-y-12">
          <h2 className="text-4xl font-black tracking-tighter uppercase">
            {t("recommendations")}
          </h2>
          <div className="space-y-4">
            {data.recommendations.map((rec) => (
              <Link
                key={rec.movieId}
                href={`/movie/${rec.movieId}`}
                className="group block p-6 rounded-3xl bg-foreground/[0.02] border border-foreground/5 hover:border-accent/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-black">
                    {rec.score.toFixed(1)}
                  </div>
                  <div>
                    <h4 className="font-black uppercase tracking-tight group-hover:text-accent transition-colors">
                      {rec.title}
                    </h4>
                    <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">
                      {rec.reason}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-8 rounded-[2rem] bg-foreground/[0.02] border border-foreground/5 space-y-1">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20">
        {label}
      </p>
      <p className="text-4xl font-black tracking-tighter">{value}</p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );
}
