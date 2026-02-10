import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { DashboardContent } from "@/components/dashboard-content"

export default async function DashboardPage() {
  const session = await getSession()

  const resumen = await sql`
    SELECT 
      categoria,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE disponible = true) as disponibles,
      COUNT(*) FILTER (WHERE disponible = false) as ocupados
    FROM espacios
    GROUP BY categoria
  `

  const today = new Date().toISOString().split("T")[0]
  const statsHoy = await sql`
    SELECT
      COUNT(*) FILTER (WHERE estado = 'EN_CURSO') as vehiculos_dentro,
      COUNT(*) FILTER (WHERE estado = 'FINALIZADO' AND fecha_hora_entrada::date = ${today}::date) as salidas_hoy,
      COALESCE(SUM(valor_final) FILTER (WHERE estado = 'FINALIZADO' AND fecha_hora_entrada::date = ${today}::date), 0) as ingresos_hoy
    FROM registros
  `

  const ultimosRegistros = await sql`
    SELECT r.placa, tv.nombre as tipo_vehiculo, e.codigo as espacio, r.estado, r.fecha_hora_entrada
    FROM registros r
    LEFT JOIN tipos_vehiculo tv ON tv.id = r.tipo_vehiculo_id
    LEFT JOIN espacios e ON e.id = r.espacio_id
    ORDER BY r.fecha_hora_entrada DESC
    LIMIT 8
  `

  return (
    <DashboardContent
      user={session!}
      resumen={resumen}
      statsHoy={statsHoy[0]}
      ultimosRegistros={ultimosRegistros}
    />
  )
}
