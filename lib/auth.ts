import { cookies } from "next/headers"
import { sql } from "./db"

export async function getSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("session")
  if (!sessionCookie) return null

  try {
    const data = JSON.parse(atob(sessionCookie.value))
    const rows = await sql`
      SELECT u.id, u.nombre, u.email, u.activo, r.nombre as rol
      FROM usuarios u
      JOIN roles r ON r.id = u.rol_id
      WHERE u.id = ${data.userId} AND u.activo = true
    `
    if (rows.length === 0) return null
    return rows[0] as { id: number; nombre: string; email: string; activo: boolean; rol: string }
  } catch {
    return null
  }
}

export function createSessionCookie(userId: number) {
  const value = btoa(JSON.stringify({ userId, ts: Date.now() }))
  return {
    name: "session",
    value,
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24, // 24 hours
  }
}
