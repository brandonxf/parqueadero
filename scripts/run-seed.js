import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedUsers() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("DATABASE_URL no configurado");
    process.exit(1);
  }

  const sql = neon(connectionString);

  try {
    const seedPath = path.join(__dirname, "seed-users.sql");
    console.log(`Leyendo: ${seedPath}`);

    let seedSQL = fs.readFileSync(seedPath, "utf-8");

    // Remover comentarios de línea
    seedSQL = seedSQL
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n");

    // Dividir por puntos y coma
    const statements = seedSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`Encontradas ${statements.length} sentencias SQL\n`);

    let success = 0;
    let warnings = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`[${i + 1}/${statements.length}] Ejecutando...`);
        await sql(statement);
        success++;
        console.log("OK\n");
      } catch (error) {
        warnings++;
        console.log(`Warning: ${error.message}\n`);
      }
    }

    console.log(`Seed completed`);
    console.log(`   Success: ${success}`);
    console.log(`   Warnings: ${warnings}`);
  } catch (error) {
    console.error("Error en seed:", error.message);
    process.exit(1);
  }
}

seedUsers();
