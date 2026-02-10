import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { createSessionCookie } from "@/lib/auth"

export async function POST(request: Request) {
  const { nombre, email, password, rol_id } = await request.json()

  if (!nombre || !email || !password) {
    return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
  }

  const existing = await sql`SELECT id FROM usuarios WHERE email = ${email}`
  if (existing.length > 0) {
    return NextResponse.json({ error: "El email ya esta registrado" }, { status: 409 })
  }

  // Default to Operario role (id=2) if no role specified
  const roleId = rol_id || 2

  const result = await sql`
    INSERT INTO usuarios (nombre, email, password_hash, rol_id)
    VALUES (${nombre}, ${email}, ${password}, ${roleId})
    RETURNING id, nombre, email
  `

  const user = result[0]
  const roles = await sql`SELECT nombre FROM roles WHERE id = ${roleId}`
  const cookie = createSessionCookie(user.id)

  const response = NextResponse.json({
    user: { id: user.id, nombre: user.nombre, email: user.email, rol: roles[0].nombre },
  })
  response.cookies.set(cookie)
  return response
}
