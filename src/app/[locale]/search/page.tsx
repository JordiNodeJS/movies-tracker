"use client";

import { useState, useEffect } from "react";
import { Search as SearchIcon, Loader2, AlertCircle } from "lucide-react";
import { searchMoviesAction } from "@/lib/movie-actions";
import { MovieCard } from "@/components/movie-card";
import { useDebounce } from "@/hooks/use-debounce";
import { useTranslations, useLocale } from "next-intl";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 500);
  const t = useTranslations("Search");
  const locale = useLocale();

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery && debouncedQuery.trim().length > 0) {
        setIsLoading(true);
        setError(null);
        try {
          const data = await searchMoviesAction(debouncedQuery, locale);
          setResults(data.results || []);
        } catch (error) {
          console.error("Search error:", error);
          setError(
            error instanceof Error
              ? error.message
              : "Failed to search movies. Please try again."
          );
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setError(null);
      }
    };

    performSearch();
  }, [debouncedQuery, locale]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-32 space-y-20">
      <section className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-6xl font-black tracking-tighter uppercase">
          {t("title")}{" "}
          <span className="text-ui-accent-primary">{t("obsession")}</span>
        </h1>
        <div className="relative group">
          <SearchIcon className="absolute left-8 top-1/2 -translate-y-1/2 opacity-20 w-8 h-8 group-focus-within:text-ui-accent-primary group-focus-within:opacity-100 transition-all" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("placeholder")}
            aria-label={t("placeholder")}
            className="w-full bg-ui-text/5 border border-ui-border/10 py-8 pl-20 pr-10 text-2xl font-bold focus:outline-none focus:border-ui-accent-primary/50 focus:bg-ui-text/[0.07] transition-all shadow-2xl placeholder:opacity-30"
          />
          {isLoading && (
            <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 text-ui-accent-primary w-8 h-8 animate-spin" />
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3 items-center text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </section>

      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {results.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      {debouncedQuery && results.length === 0 && !isLoading && !error && (
        <div className="h-[40vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-20 h-20 bg-ui-text/5 flex items-center justify-center rounded-lg">
            <SearchIcon className="w-8 h-8 opacity-20" />
          </div>
          <p className="opacity-40 font-black uppercase tracking-widest text-sm">
            {t("noResults")}
          </p>
        </div>
      )}
    </div>
  );
}
