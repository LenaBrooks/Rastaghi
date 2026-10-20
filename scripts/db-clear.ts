import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });
config();

const url =
  process.env.DATABASE_URL?.trim() ||
  process.env.POSTGRES_URL?.trim() ||
  process.env.POSTGRES_PRISMA_URL?.trim();

if (!url) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

async function main() {
  const sql = neon(url!);
  await sql`DELETE FROM posts`;
  await sql`DELETE FROM projects`;
  await sql`DELETE FROM categories`;
  const posts = await sql`SELECT count(*)::int AS c FROM posts`;
  const projects = await sql`SELECT count(*)::int AS c FROM projects`;
  const categories = await sql`SELECT count(*)::int AS c FROM categories`;
  console.log(
    `Cleared. posts=${posts[0].c} projects=${projects[0].c} categories=${categories[0].c}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
