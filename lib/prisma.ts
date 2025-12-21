import "server-only";

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl = process.env.DATABASE_URL;

function getEffectiveDatabaseUrl(rawUrl: string | undefined): string | undefined {
  if (!rawUrl) return rawUrl;
  const overrideHost = process.env.DB_HOST?.trim();
  if (!overrideHost) return rawUrl;

  try {
    const url = new URL(rawUrl);
    url.hostname = overrideHost;
    return url.toString();
  } catch {
    return rawUrl;
  }
}

const effectiveDatabaseUrl = getEffectiveDatabaseUrl(databaseUrl);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(process.env.NODE_ENV === "production" ? { log: ["error", "warn"] as const } : {}),
    ...(effectiveDatabaseUrl && effectiveDatabaseUrl !== databaseUrl
      ? { datasources: { db: { url: effectiveDatabaseUrl } } }
      : {}),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
