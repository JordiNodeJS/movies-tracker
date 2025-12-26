# Avant-Garde Movie Tracker

A high-performance movie tracking application built with the latest web technologies.

## Tech Stack

- **Framework:** [Next.js 16 (Canary)](https://nextjs.org/)
- **Database:** [Neon Serverless Postgres](https://neon.tech/)
- **ORM:** [Prisma 7](https://www.prisma.io/)
- **API:** [TMDB API](https://www.themoviedb.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

## Key Features

- **Trending Dashboard:** Instant access to popular movies using Next.js 16's `use cache`.
- **Advanced Search:** Real-time movie search with debounced input.
- **Persistent Watchlist:** Save movies to your personal list, stored securely in Neon.
- **Movie Notes & Ranking:** Bespoke drawer UI for taking notes and a 1-10 star ranking system.
- **Scalable Recommendations:** A custom recommendation engine that analyzes your high-rated movies and genres to suggest new content.

## Architecture

### Data Fetching & Caching

The application leverages Next.js 16's `use cache` directive for high-performance data retrieval from TMDB. This ensures that trending data and movie details are served instantly while maintaining freshness.

### Database Schema

The schema is designed for scalability, with separate tables for `users`, `watchlist_items`, `notes`, `ratings`, and `recommendations`. Prisma 7 is used with the Neon driver adapter for optimal performance in serverless environments.

### Recommendation System

The recommendation system uses a scoring algorithm based on:

1. **Genre Affinity:** Inferred from movies the user has rated 8 or higher.
2. **TMDB Popularity:** Combined with user preferences to surface relevant content.
3. **Exclusion Logic:** Automatically filters out movies already in the user's watchlist or highly rated list.

## Getting Started

1. Clone the repository.
2. Install dependencies: `pnpm install`.
3. Set up environment variables in `.env`.
4. Push the database schema: `pnpm prisma db push`.
5. Run the development server: `pnpm dev`.

## Design Philosophy: Intentional Minimalism

The UI follows an "Avant-Garde" aesthetic, focusing on:

- **High Contrast:** Deep blacks and vibrant indigo accents.
- **Typography:** Bold, black-weighted headings for a brutalist yet refined look.
- **Micro-interactions:** Smooth transitions and backdrop blurs for a premium feel.
