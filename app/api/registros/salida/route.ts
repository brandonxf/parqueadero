import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { placa, descuento, codigo_ticket } = await request.json()

  if (!placa && !codigo_ticket) {
    return NextResponse.json({ error: "Placa o codigo de ticket requerido" }, { status: 400 })
  }

  let registros;

  if (codigo_ticket) {
    // Lookup by ticket code (from QR scanner)
    registros = await sql`
      SELECT r.*, t.tipo_cobro, t.valor as tarifa_valor, tv.nombre as tipo_vehiculo_nombre
      FROM registros r
      LEFT JOIN tarifas t ON t.id = r.tarifa_id
      LEFT JOIN tipos_vehiculo tv ON tv.id = r.tipo_vehiculo_id
      INNER JOIN tickets tk ON tk.registro_id = r.id
      WHERE tk.codigo_ticket = ${codigo_ticket.trim()} AND r.estado = 'EN_CURSO'
    `
  } else {
    // Lookup by license plate
    registros = await sql`
      SELECT r.*, t.tipo_cobro, t.valor as tarifa_valor, tv.nombre as tipo_vehiculo_nombre
      FROM registros r
      LEFT JOIN tarifas t ON t.id = r.tarifa_id
      LEFT JOIN tipos_vehiculo tv ON tv.id = r.tipo_vehiculo_id
      WHERE r.placa = ${placa.toUpperCase()} AND r.estado = 'EN_CURSO'
    `
  }

  if (registros.length === 0) {
    return NextResponse.json({ error: codigo_ticket ? "No se encontro registro activo para este ticket" : "No se encontro registro activo para esta placa" }, { status: 404 })
  }

  const registro = registros[0]
  const entrada = new Date(registro.fecha_hora_entrada)
  const salida = new Date()
  const diffMs = salida.getTime() - entrada.getTime()
  const minutosTotales = Math.ceil(diffMs / 60000)

  // Calculate cost
  let valorCalculado = 0
  if (registro.tarifa_valor) {
    switch (registro.tipo_cobro) {
      case "POR_MINUTO":
        valorCalculado = minutosTotales * Number(registro.tarifa_valor)
        break
      case "POR_HORA":
        const horas = Math.ceil(minutosTotales / 60)
        valorCalculado = horas * Number(registro.tarifa_valor)
        break
      case "POR_DIA":
        const dias = Math.ceil(minutosTotales / 1440)
        valorCalculado = dias * Number(registro.tarifa_valor)
        break
      case "FRACCION":
        // First hour full, then by 30-min fractions
        if (minutosTotales <= 60) {
          valorCalculado = Number(registro.tarifa_valor)
        } else {
          const extraMinutes = minutosTotales - 60
          const fracciones = Math.ceil(extraMinutes / 30)
          valorCalculado = Number(registro.tarifa_valor) + fracciones * (Number(registro.tarifa_valor) / 2)
        }
        break
    }
  }

  const desc = descuento ? Number(descuento) : 0
  const valorFinal = Math.max(0, valorCalculado - desc)

  // Update record
  const updated = await sql`
    UPDATE registros SET
      fecha_hora_salida = NOW(),
      minutos_totales = ${minutosTotales},
      valor_calculado = ${valorCalculado},
      descuento = ${desc},
      valor_final = ${valorFinal},
      estado = 'FINALIZADO',
      usuario_salida_id = ${session.id}
    WHERE id = ${registro.id}
    RETURNING *
  `

  // Free up space
  await sql`UPDATE espacios SET disponible = true WHERE id = ${registro.espacio_id}`

  return NextResponse.json({
    registro: updated[0],
    minutos_totales: minutosTotales,
    valor_calculado: valorCalculado,
    valor_final: valorFinal,
    tipo_vehiculo: registro.tipo_vehiculo_nombre,
  })
}
