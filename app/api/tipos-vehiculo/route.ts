import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  const tipos = await sql`SELECT * FROM tipos_vehiculo ORDER BY id`
  return NextResponse.json(tipos)
}
