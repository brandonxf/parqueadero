import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  const session = await getSession()
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const usuarios = await sql`
    SELECT u.id, u.nombre, u.email, u.activo, u.fecha_creacion, r.nombre as rol
    FROM usuarios u
    JOIN roles r ON r.id = u.rol_id
    ORDER BY u.fecha_creacion DESC
  `

  return NextResponse.json(usuarios)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { nombre, email, password, rol_id } = await request.json()

  if (!nombre || !email || !password || !rol_id) {
    return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
  }

  const existing = await sql`SELECT id FROM usuarios WHERE email = ${email}`
  if (existing.length > 0) {
    return NextResponse.json({ error: "El email ya esta registrado" }, { status: 409 })
  }

  const result = await sql`
    INSERT INTO usuarios (nombre, email, password_hash, rol_id)
    VALUES (${nombre}, ${email}, ${password}, ${rol_id})
    RETURNING id, nombre, email
  `

  return NextResponse.json(result[0])
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { id, activo } = await request.json()

  const result = await sql`
    UPDATE usuarios SET activo = ${activo} WHERE id = ${id}
    RETURNING id, nombre, email, activo
  `

  return NextResponse.json(result[0])
}
