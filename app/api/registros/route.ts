import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const estado = searchParams.get("estado")
  const fecha = searchParams.get("fecha")

  let registros
  if (estado && fecha) {
    registros = await sql`
      SELECT r.*, tv.nombre as tipo_vehiculo, e.codigo as espacio_codigo,
        ue.nombre as usuario_entrada, us.nombre as usuario_salida,
        tk.codigo_ticket
      FROM registros r
      LEFT JOIN tipos_vehiculo tv ON tv.id = r.tipo_vehiculo_id
      LEFT JOIN espacios e ON e.id = r.espacio_id
      LEFT JOIN usuarios ue ON ue.id = r.usuario_entrada_id
      LEFT JOIN usuarios us ON us.id = r.usuario_salida_id
      LEFT JOIN tickets tk ON tk.registro_id = r.id
      WHERE r.estado = ${estado} AND r.fecha_hora_entrada::date = ${fecha}::date
      ORDER BY r.fecha_hora_entrada DESC
    `
  } else if (estado) {
    registros = await sql`
      SELECT r.*, tv.nombre as tipo_vehiculo, e.codigo as espacio_codigo,
        ue.nombre as usuario_entrada, us.nombre as usuario_salida,
        tk.codigo_ticket
      FROM registros r
      LEFT JOIN tipos_vehiculo tv ON tv.id = r.tipo_vehiculo_id
      LEFT JOIN espacios e ON e.id = r.espacio_id
      LEFT JOIN usuarios ue ON ue.id = r.usuario_entrada_id
      LEFT JOIN usuarios us ON us.id = r.usuario_salida_id
      LEFT JOIN tickets tk ON tk.registro_id = r.id
      WHERE r.estado = ${estado}
      ORDER BY r.fecha_hora_entrada DESC
    `
  } else {
    registros = await sql`
      SELECT r.*, tv.nombre as tipo_vehiculo, e.codigo as espacio_codigo,
        ue.nombre as usuario_entrada, us.nombre as usuario_salida,
        tk.codigo_ticket
      FROM registros r
      LEFT JOIN tipos_vehiculo tv ON tv.id = r.tipo_vehiculo_id
      LEFT JOIN espacios e ON e.id = r.espacio_id
      LEFT JOIN usuarios ue ON ue.id = r.usuario_entrada_id
      LEFT JOIN usuarios us ON us.id = r.usuario_salida_id
      LEFT JOIN tickets tk ON tk.registro_id = r.id
      ORDER BY r.fecha_hora_entrada DESC
      LIMIT 100
    `
  }

  return NextResponse.json(registros)
}
