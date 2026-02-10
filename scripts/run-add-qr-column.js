import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Adding qr_code_data column to tickets table...");
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS qr_code_data TEXT`;
  console.log("Done! Column added successfully.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
