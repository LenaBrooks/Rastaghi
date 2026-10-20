import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

function resolveDatabaseUrl(): string {
  const url =
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim();

  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon connection string to .env.local (see .env.example).",
    );
  }

  return url;
}

let sqlClient: NeonQueryFunction<false, false> | null = null;

/** Shared Neon SQL tagged-template client (server-only). */
export function sql() {
  if (!sqlClient) {
    sqlClient = neon(resolveDatabaseUrl());
  }
  return sqlClient;
}

export function hasDatabaseUrl(): boolean {
  return Boolean(
    process.env.DATABASE_URL?.trim() ||
      process.env.POSTGRES_URL?.trim() ||
      process.env.POSTGRES_PRISMA_URL?.trim(),
  );
}
