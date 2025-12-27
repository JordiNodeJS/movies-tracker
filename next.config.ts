import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  cacheComponents: false,
  cacheLife: {
    trending: {
      stale: 3600, // 1 hour
      revalidate: 900, // 15 mins
      expire: 86400, // 1 day
    },
    movie: {
      stale: 86400,
      revalidate: 3600,
      expire: 604800,
    },
    search: {
      stale: 300,
      revalidate: 60,
      expire: 3600,
    },
    genres: {
      stale: 86400,
      revalidate: 86400,
      expire: 604800,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
