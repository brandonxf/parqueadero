import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { createSessionCookie } from "@/lib/auth"

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Email y contrasena requeridos" }, { status: 400 })
  }

  const users = await sql`
    SELECT u.id, u.nombre, u.email, u.password_hash, u.activo, r.nombre as rol
    FROM usuarios u
    JOIN roles r ON r.id = u.rol_id
    WHERE u.email = ${email} AND u.activo = true
  `

  if (users.length === 0) {
    return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 })
  }

  const user = users[0]

  // Simple hash comparison (for production, use bcrypt)
  if (user.password_hash !== password) {
    return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 })
  }

  const cookie = createSessionCookie(user.id)
  const response = NextResponse.json({
    user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
  })
  response.cookies.set(cookie)
  return response
}
