import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Star } from "lucide-react";
import type { Movie } from "@/lib/tmdb";
import { useTranslations } from "next-intl";

export function MovieCard({
  movie,
  userRating,
}: {
  movie: Partial<Movie> & {
    id: number;
    title: string;
    poster_path: string | null;
    vote_average: number;
  };
  userRating?: number;
}) {
  const t = useTranslations("Common");

  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group relative block aspect-[2/3] overflow-hidden border-2 border-ui-border/20 bg-ui-text/5 transition-all duration-500 hover:scale-[1.03] hover:border-ui-accent-primary hover:shadow-[0_0_30px_var(--ui-glow)]"
      aria-label={`${t("viewDetails")} ${movie.title}`}
    >
      {movie.poster_path ? (
        <Image
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-110"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-ui-text/5 opacity-20 p-4 text-center scanlines">
          <span className="text-xs font-black uppercase tracking-[0.2em] mb-2">
            {t("noPoster")}
          </span>
          <span className="text-[10px] font-medium">{movie.title}</span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4 sm:p-6">
        <div className="translate-y-0 md:translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          <h3 className="font-black text-sm sm:text-lg leading-tight mb-2 tracking-tighter uppercase text-ui-accent-primary neon-text-cyan italic">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-ui-accent-tertiary/20 border border-ui-accent-tertiary text-ui-accent-tertiary text-[10px] font-black shadow-[0_0_10px_rgba(253,238,0,0.3)]">
              <Star className="w-3 h-3 fill-current" />
              <span>{movie.vote_average?.toFixed(1) || "0.0"}</span>
            </div>
            {userRating && userRating > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-ui-accent-secondary/20 border border-ui-accent-secondary text-ui-accent-secondary text-[10px] font-black shadow-[0_0_10px_rgba(255,0,255,0.3)]">
                <Star className="w-3 h-3 fill-current" />
                <span>{userRating}</span>
              </div>
            )}
            <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">
              {t("movie")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
