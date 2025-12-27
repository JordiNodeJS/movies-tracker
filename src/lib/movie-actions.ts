"use server";

import { searchMovies as searchMoviesApi } from "./tmdb";

export async function searchMoviesAction(
  query: string,
  language: string = "en"
) {
  if (!query) return { results: [] };
  return await searchMoviesApi(query, language);
}
