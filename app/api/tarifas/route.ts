import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  const tarifas = await sql`
    SELECT t.*, tv.nombre as tipo_vehiculo_nombre
    FROM tarifas t
    JOIN tipos_vehiculo tv ON tv.id = t.tipo_vehiculo_id
    ORDER BY t.activo DESC, tv.nombre
  `
  return NextResponse.json(tarifas)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { tipo_vehiculo_id, nombre, tipo_cobro, valor } = await request.json()

  if (!tipo_vehiculo_id || !nombre || !tipo_cobro || !valor) {
    return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
  }

  // Deactivate existing active tariff for same vehicle type
  await sql`
    UPDATE tarifas SET activo = false
    WHERE tipo_vehiculo_id = ${tipo_vehiculo_id} AND activo = true
  `

  const result = await sql`
    INSERT INTO tarifas (tipo_vehiculo_id, nombre, tipo_cobro, valor, activo, fecha_inicio)
    VALUES (${tipo_vehiculo_id}, ${nombre}, ${tipo_cobro}, ${valor}, true, CURRENT_DATE)
    RETURNING *
  `

  return NextResponse.json(result[0])
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { id, nombre, tipo_cobro, valor, activo } = await request.json()

  const result = await sql`
    UPDATE tarifas
    SET nombre = ${nombre}, tipo_cobro = ${tipo_cobro}, valor = ${valor}, activo = ${activo}
    WHERE id = ${id}
    RETURNING *
  `

  return NextResponse.json(result[0])
}
