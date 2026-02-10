"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [nombre, setNombre] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login"
      const body = isRegister
        ? { nombre, email, password }
        : { email, password }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesion")
        return
      }

      router.push("/dashboard")
    } catch {
      setError("Error de conexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary/5 p-3 sm:p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-primary">
            <Car className="h-7 w-7 sm:h-8 sm:w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">ParkControl</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {isRegister ? "Crea tu cuenta para acceder al sistema" : "Ingresa al sistema de parqueadero"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isRegister && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="nombre" className="text-xs sm:text-sm">Nombre completo</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="text-xs sm:text-sm"
                  required
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-xs sm:text-sm">Correo electronico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                autoComplete="email"
                className="text-xs sm:text-sm"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-xs sm:text-sm">Contrasena</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contrasena"
                autoComplete="current-password"
                className="text-xs sm:text-sm"
                required
              />
            </div>

            {error && (
              <p className="text-xs sm:text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full text-xs sm:text-sm" disabled={loading}>
              {loading ? "Procesando..." : isRegister ? "Registrarse" : "Iniciar Sesion"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-xs sm:text-sm text-muted-foreground"
              onClick={() => {
                setIsRegister(!isRegister)
                setError("")
              }}
            >
              {isRegister
                ? "Ya tienes cuenta? Inicia sesion"
                : "No tienes cuenta? Registrate"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
