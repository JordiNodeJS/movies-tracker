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
        <h1 className="text-4xl font-black tracking-tighter uppercase">
          {t("title")} <span className="text-indigo-500">{t("obsession")}</span>
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
    <section className="relative h-[90vh] w-full overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0">
        {featured.backdrop_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/original${featured.backdrop_path}`}
            alt={featured.title}
            fill
            className="object-cover scale-105 animate-pulse-slow"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-indigo-500/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
        <div className="max-w-3xl space-y-10">
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-16 bg-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">
              {t("featured")}
            </span>
          </div>

          <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-[0.85] text-balance">
            {featured.title}
          </h1>

          <p className="text-xl opacity-50 max-w-xl leading-relaxed font-medium text-balance">
            {featured.overview}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-6">
            <Link
              href={`/movie/${featured.id}`}
              className="h-16 px-10 bg-foreground text-background rounded-full flex items-center gap-4 font-black uppercase tracking-tighter hover:scale-105 transition-transform shadow-foreground/10 shadow-xl"
            >
              <Play className="w-6 h-6 fill-current" />
              {t("watchlistAdd")}
            </Link>
            <Link
              href={`/movie/${featured.id}`}
              className="h-16 px-10 bg-white/5 backdrop-blur-2xl border border-white/10 text-white rounded-full flex items-center gap-4 font-black uppercase tracking-tighter hover:bg-white/10 transition-all"
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
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase leading-none">
            {t("trending")}
          </h2>
          <div className="h-2 w-24 bg-indigo-600" />
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
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase leading-none">
            {t("forYou")}
          </h2>
          <div className="h-2 w-24 bg-indigo-600" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-16">
        {recommendations.map((rec) => (
          <div key={rec.id} className="space-y-4">
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
  return <div className="h-[90vh] w-full bg-white/5 animate-pulse" />;
}

function SectionSkeleton({ title }: { title: string }) {
  return (
    <section className="space-y-12">
      <h2 className="text-4xl font-black tracking-tighter uppercase italic opacity-20">
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="aspect-[2/3] bg-white/5 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    </section>
  );
}
