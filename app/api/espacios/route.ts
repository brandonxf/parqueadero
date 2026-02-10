import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  const espacios = await sql`
    SELECT e.*, 
      r.placa as vehiculo_placa,
      r.id as registro_id
    FROM espacios e
    LEFT JOIN registros r ON r.espacio_id = e.id AND r.estado = 'EN_CURSO'
    ORDER BY e.codigo
  `

  const resumen = await sql`
    SELECT 
      categoria,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE disponible = true) as disponibles,
      COUNT(*) FILTER (WHERE disponible = false) as ocupados
    FROM espacios
    GROUP BY categoria
  `

  return NextResponse.json({ espacios, resumen })
}
