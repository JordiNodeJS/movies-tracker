import { getMovieDetails } from "@/lib/tmdb";
import Image from "next/image";
import { Star, Clock, Calendar, Quote } from "lucide-react";
import { MovieActions } from "@/components/movie-actions";
import { Suspense } from "react";
import { getMovieUserData } from "@/lib/actions";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default function MoviePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  return (
    <Suspense fallback={<MovieSkeleton />}>
      <MovieContent params={params} />
    </Suspense>
  );
}

async function MovieContent({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  setRequestLocale(locale);

  const movieId = parseInt(id);
  const [movie, userData] = await Promise.all([
    getMovieDetails(movieId, locale),
    getMovieUserData(movieId),
  ]);
  const t = await getTranslations("Movie");

  return (
    <div className="relative min-h-screen overflow-x-hidden scanlines">
      {/* Backdrop Layer */}
      <div className="fixed inset-0 -z-10 h-screen w-full">
        {movie.backdrop_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            fill
            className="object-cover opacity-20 blur-[1px] brightness-50"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-zinc-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/80" />
      </div>

      {/* Decorative Background Title - Cyberpunk touch */}
      <div className="fixed top-20 left-0 w-full -z-5 pointer-events-none overflow-hidden whitespace-nowrap opacity-[0.05] select-none hidden lg:block">
        <span className="text-[25vw] font-black uppercase tracking-tighter leading-none text-neon-cyan italic">
          {movie.title}
        </span>
      </div>

      <main className="relative pt-8 md:pt-24 lg:pt-32 px-6 max-w-7xl mx-auto pb-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Left Column: Poster & Actions */}
          <div className="w-full lg:w-[400px] shrink-0 space-y-8">
            <div className="relative group mx-auto lg:mx-0 max-w-[300px] md:max-w-[400px] lg:max-w-none">
              {/* Poster with a "glitch" effect hover */}
              <div className="relative aspect-[2/3] overflow-hidden border-2 border-neon-cyan/30 shadow-[0_0_30px_rgba(0,243,255,0.1)] transform transition-transform duration-700 group-hover:scale-[1.02] group-hover:border-neon-cyan group-hover:shadow-[0_0_50px_rgba(0,243,255,0.3)]">
                {movie.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w780${movie.poster_path}`}
                    alt={movie.title}
                    fill
                    className="object-cover group-hover:brightness-110"
                    priority
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-foreground/5">
                    <span className="text-xs font-black uppercase tracking-widest opacity-20">
                      {t("noPoster")}
                    </span>
                  </div>
                )}
              </div>

              {/* Sharp Badge for Rating */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-neon-cyan flex flex-col items-center justify-center shadow-[0_0_20px_#00f3ff] z-20 skew-x-12 group-hover:skew-x-0 transition-transform duration-500 text-black">
                <span className="text-2xl font-black leading-none">
                  {movie.vote_average.toFixed(1)}
                </span>
                <span className="text-[8px] font-black uppercase tracking-tighter opacity-70">
                  TMDB
                </span>
              </div>
            </div>

            <div className="max-w-[300px] md:max-w-[400px] lg:max-w-none mx-auto lg:mx-0">
              <MovieActions
                movieId={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
                initialData={userData}
              />
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="flex-1 space-y-12">
            <header className="space-y-8">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-neon-cyan font-black uppercase tracking-[0.2em] text-[10px]">
                  {movie.genres.map((g: { id: number; name: string }) => (
                    <span
                      key={g.id}
                      className="px-3 py-1 border border-neon-cyan/30 bg-neon-cyan/5"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter leading-[0.85] uppercase text-balance italic text-neon-cyan neon-text-cyan">
                  {movie.title}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-8 text-neon-cyan/40 font-black uppercase tracking-[0.2em] text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-neon-cyan" />
                  <span>{t("minutes", { count: movie.runtime })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-neon-cyan" />
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                </div>
                {movie.tagline && (
                  <div className="hidden md:flex items-center gap-2 italic text-neon-magenta/60 normal-case tracking-normal font-black">
                    <Quote className="w-3 h-3" />
                    <span>{movie.tagline}</span>
                  </div>
                )}
              </div>
            </header>

            <section className="space-y-12">
              <div className="relative glass p-8 md:p-12 border-2 border-neon-cyan/20 scanlines">
                <div className="absolute -left-1 top-12 w-2 h-12 bg-neon-cyan shadow-[0_0_15px_#00f3ff] hidden md:block" />
                <p className="text-xl md:text-3xl text-neon-cyan/90 leading-tight font-black text-balance uppercase tracking-tight">
                  {movie.overview}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y-2 border-neon-cyan/10">
                <InfoItem label={t("status")} value={movie.status} />
                <InfoItem
                  label={t("budget")}
                  value={
                    movie.budget > 0
                      ? `$${(movie.budget / 1000000).toFixed(1)}M`
                      : "N/A"
                  }
                />
                <InfoItem
                  label={t("revenue")}
                  value={
                    movie.revenue > 0
                      ? `$${(movie.revenue / 1000000).toFixed(1)}M`
                      : "N/A"
                  }
                />
                <InfoItem
                  label={t("releaseDate")}
                  value={new Date(movie.release_date).toLocaleDateString(
                    locale,
                    { dateStyle: "long" }
                  )}
                />
              </div>

              {userData.rating > 0 && (
                <div className="inline-flex items-center gap-4 px-6 py-4 border-2 border-neon-yellow bg-neon-yellow/10 shadow-[0_0_20px_rgba(253,238,0,0.3)]">
                  <Star className="w-6 h-6 text-neon-yellow fill-current" />
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-neon-yellow leading-none neon-text-yellow">
                      {userData.rating}/10
                    </span>
                    <span className="text-[10px] font-black text-neon-yellow/40 uppercase tracking-widest">
                      {t("yourRating")}
                    </span>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <span className="text-[10px] font-black text-neon-cyan/30 uppercase tracking-widest">
        {label}
      </span>
      <p className="text-sm md:text-base font-black text-neon-cyan/80 uppercase tracking-tight italic">
        {value}
      </p>
    </div>
  );
}

function MovieSkeleton() {
  return (
    <div className="relative min-h-screen bg-background scanlines">
      <div className="max-w-7xl mx-auto px-6 pt-12 md:pt-24 lg:pt-32 animate-pulse">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          <div className="w-full lg:w-[400px] aspect-[2/3] bg-neon-cyan/5 border-2 border-neon-cyan/10" />
          <div className="flex-1 space-y-12">
            <div className="space-y-4">
              <div className="h-4 bg-neon-cyan/5 w-1/4" />
              <div className="h-20 md:h-32 bg-neon-cyan/5 w-3/4" />
            </div>
            <div className="h-48 bg-neon-cyan/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
