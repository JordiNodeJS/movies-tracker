import { getTrendingMovies, getMovieDetails, type Movie } from "@/lib/tmdb";
import { getRecommendations } from "@/lib/recommendations";
import { MovieCard } from "@/components/movie-card";
import { RecommendationInfo } from "@/components/recommendation-info";
import { Suspense } from "react";
import { connection } from "next/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
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
    <div className="space-y-24 pb-24">
      <div className="max-w-7xl mx-auto px-6 pt-12">
        <h1 className="text-4xl font-black tracking-tighter uppercase italic">
          {t("title")}{" "}
          <span className="text-neon-cyan neon-text-cyan">
            {t("obsession")}
          </span>
        </h1>
      </div>

      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection locale={locale} />
      </Suspense>

      <div className="max-w-7xl mx-auto px-6 space-y-32">
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
    <section className="relative h-[90vh] w-full overflow-hidden border-y-2 border-neon-cyan/20 scanlines">
      {/* Backdrop */}
      <div className="absolute inset-0">
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
          <div className="absolute inset-0 bg-neon-cyan/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
        <div className="max-w-3xl space-y-10">
          <div className="flex items-center gap-4">
            <div className="h-[2px] w-16 bg-neon-cyan shadow-[0_0_10px_#00f3ff]" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-neon-cyan neon-text-cyan">
              {t("featured")}
            </span>
          </div>

          <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-[0.85] text-balance italic text-neon-cyan neon-text-cyan">
            {featured.title}
          </h1>

          <p className="text-xl text-neon-cyan/60 max-w-xl leading-relaxed font-black text-balance uppercase tracking-tight">
            {featured.overview}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-6">
            <Link
              href={`/movie/${featured.id}`}
              className="h-16 px-10 bg-neon-cyan text-black flex items-center gap-4 font-black uppercase tracking-tighter hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] transition-all italic"
            >
              <Play className="w-6 h-6 fill-current" />
              {t("watchlistAdd")}
            </Link>
            <Link
              href={`/movie/${featured.id}`}
              className="h-16 px-10 bg-background/40 backdrop-blur-2xl border-2 border-neon-cyan text-neon-cyan flex items-center gap-4 font-black uppercase tracking-tighter hover:bg-neon-cyan hover:text-black transition-all italic"
            >
              <Info className="w-6 h-6" />
              {t("overview")}
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
      <div className="flex items-end justify-between mb-16">
        <div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase leading-none italic text-neon-cyan neon-text-cyan">
            {t("trending")}
          </h2>
          <div className="h-2 w-24 bg-neon-cyan shadow-[0_0_15px_#00f3ff]" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-16">
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
    <section className="space-y-16">
      <div className="flex items-end justify-between mb-16">
        <div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase leading-none italic text-neon-magenta neon-text-magenta">
            {t("forYou")}
          </h2>
          <div className="h-2 w-24 bg-neon-magenta shadow-[0_0_15px_#ff00ff]" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-16">
        {recommendations.map((rec) => (
          <div key={rec.movieId} className="space-y-4">
            <MovieCard
              movie={{
                id: rec.movieId,
                title: rec.title,
                poster_path: rec.posterPath,
                vote_average: rec.voteAverage,
                release_date: "",
                overview: "",
                backdrop_path: "",
                media_type: "movie",
              }}
            />
            <RecommendationInfo reason={rec.reason} score={rec.score} />
          </div>
        ))}
      </div>
    </section>
  );
}

function HeroSkeleton() {
  return (
    <div className="h-[90vh] w-full bg-neon-cyan/5 animate-pulse scanlines" />
  );
}

function SectionSkeleton({ title }: { title: string }) {
  return (
    <section className="space-y-12">
      <h2 className="text-4xl font-black tracking-tighter uppercase italic opacity-20 text-neon-cyan">
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="aspect-[2/3] bg-neon-cyan/5 border border-neon-cyan/10 animate-pulse"
          />
        ))}
      </div>
    </section>
  );
}
