import Image from "next/image";
import { Link } from "@/i18n/routing";
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
      className="group relative block aspect-[2/3] overflow-hidden rounded-2xl bg-white/5 transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_20px_50px_rgba(99,102,241,0.2)]"
    >
      {movie.poster_path ? (
        <Image
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 text-white/20 p-4 text-center">
          <span className="text-xs font-black uppercase tracking-[0.2em] mb-2">
            {t("noPoster")}
          </span>
          <span className="text-[10px] font-medium opacity-50">
            {movie.title}
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          <h3 className="font-black text-lg leading-tight mb-2 tracking-tighter uppercase">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/20 border border-yellow-500/20 text-yellow-500 text-[10px] font-black">
              <Star className="w-3 h-3 fill-current" />
              <span>{movie.vote_average?.toFixed(1) || "0.0"}</span>
            </div>
            {userRating && userRating > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/20 text-indigo-500 text-[10px] font-black">
                <Star className="w-3 h-3 fill-current" />
                <span>{userRating}</span>
              </div>
            )}
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              {t("movie")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
