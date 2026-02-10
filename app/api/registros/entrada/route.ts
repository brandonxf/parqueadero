import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { placa, tipo_vehiculo_id } = await request.json()

  if (!placa || !tipo_vehiculo_id) {
    return NextResponse.json({ error: "Placa y tipo de vehiculo son requeridos" }, { status: 400 })
  }

  // Check if vehicle is already inside
  const existing = await sql`
    SELECT id FROM registros WHERE placa = ${placa.toUpperCase()} AND estado = 'EN_CURSO'
  `
  if (existing.length > 0) {
    return NextResponse.json({ error: "Este vehiculo ya tiene un registro activo" }, { status: 409 })
  }

  // Get vehicle type to determine category
  const tipoRows = await sql`SELECT * FROM tipos_vehiculo WHERE id = ${tipo_vehiculo_id}`
  if (tipoRows.length === 0) {
    return NextResponse.json({ error: "Tipo de vehiculo invalido" }, { status: 400 })
  }
  const tipo = tipoRows[0]

  // Find available space
  const espacios = await sql`
    SELECT id, codigo FROM espacios
    WHERE categoria = ${tipo.categoria} AND disponible = true
    ORDER BY codigo
    LIMIT 1
  `
  if (espacios.length === 0) {
    return NextResponse.json({ error: "No hay espacios disponibles para este tipo de vehiculo" }, { status: 409 })
  }

  const espacio = espacios[0]

  // Find active tariff
  const tarifas = await sql`
    SELECT id FROM tarifas WHERE tipo_vehiculo_id = ${tipo_vehiculo_id} AND activo = true LIMIT 1
  `
  const tarifaId = tarifas.length > 0 ? tarifas[0].id : null

  // Create register
  const registro = await sql`
    INSERT INTO registros (placa, tipo_vehiculo_id, espacio_id, tarifa_id, usuario_entrada_id, estado)
    VALUES (${placa.toUpperCase()}, ${tipo_vehiculo_id}, ${espacio.id}, ${tarifaId}, ${session.id}, 'EN_CURSO')
    RETURNING *
  `

  // Mark space as occupied
  await sql`UPDATE espacios SET disponible = false WHERE id = ${espacio.id}`

  // Create ticket with QR code data
  const codigoTicket = `TK-${Date.now().toString(36).toUpperCase()}`
  const ticket = await sql`
    INSERT INTO tickets (registro_id, codigo_ticket, qr_code_data)
    VALUES (${registro[0].id}, ${codigoTicket}, ${codigoTicket})
    RETURNING *
  `

  return NextResponse.json({
    registro: registro[0],
    espacio: espacio,
    ticket: ticket[0],
  })
}
