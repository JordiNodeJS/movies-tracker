import { getTrendingMovies, getMovieDetails, type Movie } from "@/lib/tmdb";
import { getRecommendations } from "@/lib/recommendations";
import { MovieCard } from "@/components/movie-card";
import { RecommendationInfo } from "@/components/recommendation-info";
import { Suspense } from "react";
import { connection } from "next/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Play, Info, Sparkles } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  return (
    <div className="space-y-12 md:space-y-24 pb-20 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 md:pt-12">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-tight">
          {t("title")}{" "}
          <span className="text-ui-accent-primary neon-text-cyan block md:inline">
            {t("obsession")}
          </span>
        </h1>
      </div>

      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection locale={locale} />
      </Suspense>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16 md:space-y-32">
        <Suspense fallback={<SectionSkeleton title={t("trending")} />}>
          <TrendingSection locale={locale} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton title={t("forYou")} />}>
          <RecommendationsSection locale={locale} />
        </Suspense>
      </div>
    </div>
  );
}

async function HeroSection({ locale }: { locale: string }) {
  await connection();
  const trending = await getTrendingMovies(locale);
  const featured = trending.results[0];
  const t = await getTranslations("Movie");

  if (!featured) return null;

  return (
    <section className="relative h-[90vh] w-full border-y-2 border-ui-border/20 scanlines">
      {/* Backdrop */}
      <div className="absolute inset-0 overflow-hidden">
        {featured.backdrop_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/original${featured.backdrop_path}`}
            alt={featured.title}
            fill
            className="object-cover scale-105 animate-pulse-slow brightness-50"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-ui-accent-primary/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-center">
        <div className="max-w-3xl space-y-6 md:space-y-10">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-[2px] w-12 md:w-16 bg-ui-accent-primary shadow-[0_0_10px_var(--ui-accent-primary)]" />
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] text-ui-accent-primary neon-text-cyan">
              {t("featured")}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter uppercase leading-[1.1] text-balance italic text-ui-accent-primary neon-text-cyan py-4 md:py-6 px-1 md:px-2">
            {featured.title}
          </h1>

          <p className="text-sm sm:text-lg md:text-xl text-ui-accent-primary/80 max-w-xl leading-relaxed font-black text-balance uppercase tracking-tight line-clamp-3 sm:line-clamp-4">
            {featured.overview}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 pt-6">
            <Link
              href={`/movie/${featured.id}`}
              className="h-14 sm:h-16 px-6 sm:px-10 bg-ui-accent-primary text-black flex items-center justify-center sm:justify-start gap-4 font-black uppercase tracking-tighter hover:shadow-[0_0_30px_var(--ui-glow)] transition-all italic"
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              <span className="text-sm sm:text-base">{t("watchlistAdd")}</span>
            </Link>
            <Link
              href={`/movie/${featured.id}`}
              className="h-14 sm:h-16 px-6 sm:px-10 bg-ui-bg/40 backdrop-blur-2xl border-2 border-ui-accent-primary text-ui-accent-primary flex items-center justify-center sm:justify-start gap-4 font-black uppercase tracking-tighter hover:bg-ui-accent-primary hover:text-black transition-all italic"
            >
              <Info className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-sm sm:text-base">{t("overview")}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

async function TrendingSection({ locale }: { locale: string }) {
  await connection();
  const trending = await getTrendingMovies(locale);
  const t = await getTranslations("Home");

  return (
    <section>
      <div className="flex items-end justify-between mb-8 md:mb-16">
        <div>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-4 md:mb-6 uppercase leading-[1.1] italic text-ui-accent-primary neon-text-cyan py-2 px-1">
            {t("trending")}
          </h2>
          <div className="h-1 md:h-2 w-16 md:w-24 bg-ui-accent-primary shadow-[0_0_15px_var(--ui-accent-primary)]" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-8 md:gap-y-16">
        {trending.results.slice(0, 10).map((movie: Movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}

async function RecommendationsSection({ locale }: { locale: string }) {
  const recommendations = await getRecommendations();
  const t = await getTranslations("Home");

  if (recommendations.length === 0) return null;

  return (
    <section className="space-y-8 md:space-y-16">
      <div className="flex items-end justify-between mb-8 md:mb-16">
        <div>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-4 md:mb-6 uppercase leading-[1.1] italic text-ui-accent-secondary neon-text-magenta py-2 px-1">
            {t("forYou")}
          </h2>
          <div className="h-1 md:h-2 w-16 md:w-24 bg-ui-accent-secondary shadow-[0_0_15px_var(--ui-accent-secondary)]" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-8 md:gap-y-16">
        {recommendations.map((rec) => (
          <div key={rec.movieId} className="space-y-4">
            <MovieCard
              movie={{
                id: rec.movieId,
                title: rec.title || "Unknown Movie",
                poster_path: rec.posterPath || "/placeholder.jpg",
                vote_average: rec.voteAverage || 0,
                release_date: "",
                overview: "",
                backdrop_path: "",
              }}
            />
            <RecommendationInfo />
          </div>
        ))}
      </div>
    </section>
  );
}

function HeroSkeleton() {
  return (
    <div className="h-[90vh] w-full bg-ui-accent-primary/5 animate-pulse scanlines" />
  );
}

function SectionSkeleton({ title }: { title: string }) {
  return (
    <section className="space-y-12">
      <h2 className="text-4xl font-black tracking-tighter uppercase italic opacity-20 text-ui-accent-primary">
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="aspect-[2/3] bg-ui-accent-primary/5 border border-ui-border/10 animate-pulse"
          />
        ))}
      </div>
    </section>
  );
}
