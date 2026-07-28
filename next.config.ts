import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Coolify / Docker: lean runtime image via `.next/standalone`
  output: "standalone",
  experimental: {
    // Receipt / document uploads via Server Actions (PDF/görsel, max ~10 MB + multipart overhead).
    serverActions: {
      bodySizeLimit: "12mb",
    },
    proxyClientMaxBodySize: "12mb",
  },
  images: {
    localPatterns: [
      {
        pathname: "/images/**",
      },
      {
        pathname: "/uploads/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/kayit-evraklari.php",
        destination: "/uyelik-islemleri",
        permanent: true,
      },
      {
        source: "/aidat-sorgulama.php",
        destination: "/aidat-sorgulama",
        permanent: true,
      },
      {
        source: "/egitimler",
        destination: "/etkinlikler",
        permanent: true,
      },
      {
        source: "/egitimler/:slug",
        destination: "/etkinlikler/:slug",
        permanent: true,
      },
      {
        source: "/haberler",
        has: [{ type: "query", key: "tur", value: "news" }],
        destination: "/haberler/oda-haberleri",
        permanent: true,
      },
      {
        source: "/haberler",
        has: [{ type: "query", key: "tur", value: "sector" }],
        destination: "/haberler/sektorden",
        permanent: true,
      },
    ];
  },
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-mariadb",
    "mariadb",
    "bcryptjs",
    "sharp",
  ],
};

export default nextConfig;
