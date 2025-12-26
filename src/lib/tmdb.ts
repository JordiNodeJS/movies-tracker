"use server";

// ⚠️ CACHING STRATEGY: Time-based revalidation
// Using default cacheLife for TMDB API data.
// Revalidates every 15 minutes by default in Next.js 16.

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_ACCESS_TOKEN =
  process.env.TMDB_ACCESS_TOKEN || process.env.TMDB_READ_ACCESS_TOKEN;
const BASE_URL = "https://api.themoviedb.org/3";

export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date: string;
  overview: string;
  genres: { id: number; name: string }[];
  runtime: number;
  status: string;
  budget: number;
  revenue: number;
  genre_ids: number[];
}

// Mock data for development
const MOCK_MOVIES: Movie[] = [
  {
    id: 1,
    title: "Dune: Part Two",
    poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdrop_path: "/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
    vote_average: 8.3,
    release_date: "2024-02-27",
    overview:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    genres: [
      { id: 878, name: "Science Fiction" },
      { id: 12, name: "Adventure" },
    ],
    runtime: 166,
    status: "Released",
    budget: 190000000,
    revenue: 714400000,
    genre_ids: [878, 12],
  },
  {
    id: 2,
    title: "The Batman",
    poster_path: "/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    backdrop_path: "/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
    vote_average: 7.8,
    release_date: "2022-03-01",
    overview:
      "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption.",
    genres: [
      { id: 80, name: "Crime" },
      { id: 18, name: "Drama" },
    ],
    runtime: 176,
    status: "Released",
    budget: 185000000,
    revenue: 770836163,
    genre_ids: [80, 18],
  },
  {
    id: 3,
    title: "Spider-Man: No Way Home",
    poster_path: "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    backdrop_path: "/iQFcwSGbZXMkeyKrxbPnwnRo5fl.jpg",
    vote_average: 8.1,
    release_date: "2021-12-15",
    overview:
      "Peter Parker is unmasked and no longer able to separate his normal life from the high-stakes of being a super-hero.",
    genres: [
      { id: 28, name: "Action" },
      { id: 12, name: "Adventure" },
    ],
    runtime: 148,
    status: "Released",
    budget: 200000000,
    revenue: 1921847111,
    genre_ids: [28, 12],
  },
  {
    id: 4,
    title: "Top Gun: Maverick",
    poster_path: "/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    backdrop_path: "/odJ4hx6g6vBt4lBWKFD1tI8WS4x.jpg",
    vote_average: 8.2,
    release_date: "2022-05-24",
    overview:
      "After thirty years, Maverick is still pushing the envelope as a top naval aviator.",
    genres: [
      { id: 28, name: "Action" },
      { id: 18, name: "Drama" },
    ],
    runtime: 131,
    status: "Released",
    budget: 170000000,
    revenue: 1488732821,
    genre_ids: [28, 18],
  },
  {
    id: 5,
    title: "Black Panther: Wakanda Forever",
    poster_path: "/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",
    backdrop_path: "/yYrvN5WFeGYjJnRzhY0QXuo4Isw.jpg",
    vote_average: 7.2,
    release_date: "2022-11-09",
    overview:
      "Queen Ramonda, Shuri, M'Baku, Okoye and the Dora Milaje fight to protect their nation from intervening world powers.",
    genres: [
      { id: 28, name: "Action" },
      { id: 12, name: "Adventure" },
    ],
    runtime: 161,
    status: "Released",
    budget: 250000000,
    revenue: 828058927,
    genre_ids: [28, 12],
  },
];

// Mock API responses
const MOCK_TRENDING = {
  page: 1,
  results: MOCK_MOVIES.slice(0, 5),
  total_pages: 1,
  total_results: 5,
};

const MOCK_POPULAR = {
  page: 1,
  results: MOCK_MOVIES.slice(2, 7),
  total_pages: 1,
  total_results: 5,
};

const MOCK_TOP_RATED = {
  page: 1,
  results: MOCK_MOVIES.slice(4, 9),
  total_pages: 1,
  total_results: 5,
};

const MOCK_SEARCH = {
  page: 1,
  results: MOCK_MOVIES,
  total_pages: 1,
  total_results: 5,
};

const MOCK_MOVIE_DETAILS = {
  ...MOCK_MOVIES[0],
  videos: { results: [] },
  credits: { cast: [] },
  recommendations: { results: [] },
};

const MOCK_GENRES = {
  genres: [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" },
    { id: 36, name: "History" },
    { id: 27, name: "Horror" },
    { id: 10402, name: "Music" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Science Fiction" },
    { id: 10770, name: "TV Movie" },
    { id: 53, name: "Thriller" },
    { id: 10752, name: "War" },
    { id: 37, name: "Western" },
  ],
};

export async function fetchTMDB(
  endpoint: string,
  language: string = "en",
  options: RequestInit = {}
) {
  "use cache";
  // Check if we have valid credentials
  const hasValidCredentials =
    TMDB_ACCESS_TOKEN &&
    TMDB_ACCESS_TOKEN !== "demo_token" &&
    !TMDB_ACCESS_TOKEN.startsWith("your_");

  // Return mock data if no valid credentials
  if (!hasValidCredentials) {
    await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate network delay

    if (endpoint.includes("/trending/movie/")) {
      return MOCK_TRENDING;
    } else if (endpoint.includes("/movie/popular")) {
      return MOCK_POPULAR;
    } else if (endpoint.includes("/movie/top_rated")) {
      return MOCK_TOP_RATED;
    } else if (endpoint.includes("/search/movie")) {
      return MOCK_SEARCH;
    } else if (
      endpoint.includes("/movie/") &&
      !endpoint.includes("/genre/movie/list")
    ) {
      return MOCK_MOVIE_DETAILS;
    } else if (endpoint.includes("/genre/movie/list")) {
      return MOCK_GENRES;
    }

    return { results: [] };
  }

  // Use real API if credentials are valid
  const separator = endpoint.includes("?") ? "&" : "?";
  const url = `${BASE_URL}${endpoint}${separator}language=${language}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getTrendingMovies(language: string = "en") {
  return fetchTMDB("/trending/movie/day", language);
}

export async function searchMovies(query: string, language: string = "en") {
  return fetchTMDB(
    `/search/movie?query=${encodeURIComponent(query)}`,
    language
  );
}

export async function getMovieDetails(
  movieId: number,
  language: string = "en"
) {
  return fetchTMDB(
    `/movie/${movieId}?append_to_response=videos,credits,recommendations`,
    language
  );
}

export async function getGenres(language: string = "en") {
  return fetchTMDB("/genre/movie/list", language);
}
