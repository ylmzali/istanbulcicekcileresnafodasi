import "server-only";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getMysqlConfig() {
  const base = {
    connectionLimit: 10,
    connectTimeout: 5_000,
    acquireTimeout: 10_000,
    idleTimeout: 300,
    allowPublicKeyRetrieval: true,
  };

  if (
    process.env.MYSQL_HOST &&
    process.env.MYSQL_USER &&
    process.env.MYSQL_DATABASE
  ) {
    return {
      ...base,
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD ?? "",
      database: process.env.MYSQL_DATABASE,
    };
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "Set MYSQL_HOST/MYSQL_USER/MYSQL_DATABASE or DATABASE_URL in .env",
    );
  }

  const parsed = new URL(databaseUrl);
  return {
    ...base,
    host: parsed.hostname,
    port: Number(parsed.port || 3306),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ""),
  };
}

function createPrismaClient() {
  const adapter = new PrismaMariaDb(getMysqlConfig());

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Warm the pool once so the first request doesn't pay full connect cost.
void prisma.$connect().catch(() => undefined);
