import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const desde = searchParams.get("desde")
  const hasta = searchParams.get("hasta")

  const today = new Date().toISOString().split("T")[0]
  const fechaDesde = desde || today
  const fechaHasta = hasta || today

  // Summary stats
  const stats = await sql`
    SELECT
      COUNT(*) FILTER (WHERE estado = 'FINALIZADO') as total_finalizados,
      COUNT(*) FILTER (WHERE estado = 'EN_CURSO') as total_en_curso,
      COALESCE(SUM(valor_final) FILTER (WHERE estado = 'FINALIZADO'), 0) as ingresos_total,
      COALESCE(AVG(minutos_totales) FILTER (WHERE estado = 'FINALIZADO'), 0) as promedio_minutos
    FROM registros
    WHERE fecha_hora_entrada::date BETWEEN ${fechaDesde}::date AND ${fechaHasta}::date
  `

  // By vehicle type
  const porTipo = await sql`
    SELECT tv.nombre, COUNT(*) as cantidad,
      COALESCE(SUM(r.valor_final), 0) as ingresos
    FROM registros r
    JOIN tipos_vehiculo tv ON tv.id = r.tipo_vehiculo_id
    WHERE r.fecha_hora_entrada::date BETWEEN ${fechaDesde}::date AND ${fechaHasta}::date
      AND r.estado = 'FINALIZADO'
    GROUP BY tv.nombre
    ORDER BY cantidad DESC
  `

  // Daily breakdown
  const porDia = await sql`
    SELECT
      fecha_hora_entrada::date as fecha,
      COUNT(*) as cantidad,
      COALESCE(SUM(valor_final), 0) as ingresos
    FROM registros
    WHERE fecha_hora_entrada::date BETWEEN ${fechaDesde}::date AND ${fechaHasta}::date
      AND estado = 'FINALIZADO'
    GROUP BY fecha_hora_entrada::date
    ORDER BY fecha
  `

  return NextResponse.json({
    stats: stats[0],
    porTipo,
    porDia,
  })
}
