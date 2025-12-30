"use server";

import { searchMovies as searchMoviesApi } from "./tmdb";

export async function searchMoviesAction(
  query: string,
  language: string = "en"
) {
  // Validate input
  if (!query || query.trim().length === 0) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }

  try {
    const result = await searchMoviesApi(query.trim(), language);
    return result;
  } catch (error) {
    console.error("Search action error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to search movies"
    );
  }
}
