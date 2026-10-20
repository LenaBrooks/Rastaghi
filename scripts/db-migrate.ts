import { config } from "dotenv";
import { readFileSync } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });
config();

const url =
  process.env.DATABASE_URL?.trim() ||
  process.env.POSTGRES_URL?.trim() ||
  process.env.POSTGRES_PRISMA_URL?.trim();

if (!url) {
  console.error(
    "Missing DATABASE_URL. Put your Neon URI in .env.local then retry.",
  );
  process.exit(1);
}

async function main() {
  const sql = neon(url!);
  const schemaPath = path.join(process.cwd(), "db", "schema.sql");
  const schema = readFileSync(schemaPath, "utf8");

  const statements = schema
    .split(";")
    .map((s) =>
      s
        .split("\n")
        .map((line) => line.replace(/--.*$/, ""))
        .join("\n")
        .trim(),
    )
    .filter(Boolean);

  for (const statement of statements) {
    await sql.query(statement);
    const preview = statement.replace(/\s+/g, " ").slice(0, 72);
    console.log("OK:", preview + (statement.length > 72 ? "…" : ""));
  }

  console.log("Migration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
