import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        // Omitting `search` allows any query string (e.g. ?v=...) for cache busting
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
