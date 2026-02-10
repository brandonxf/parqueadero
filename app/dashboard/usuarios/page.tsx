"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Users, Plus, UserCheck, UserX } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Usuario {
  id: number
  nombre: string
  email: string
  rol: string
  activo: boolean
  fecha_creacion: string
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formNombre, setFormNombre] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formRol, setFormRol] = useState("2")

  async function fetchUsers() {
    const res = await fetch("/api/usuarios")
    if (res.ok) {
      setUsuarios(await res.json())
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formNombre,
          email: formEmail,
          password: formPassword,
          rol_id: Number(formRol),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error)
        return
      }

      setOpen(false)
      setFormNombre("")
      setFormEmail("")
      setFormPassword("")
      setFormRol("2")
      fetchUsers()
    } catch {
      setError("Error de conexion")
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(user: Usuario) {
    await fetch("/api/usuarios", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, activo: !user.activo }),
    })
    fetchUsers()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion de Usuarios</h1>
          <p className="text-muted-foreground">Administra los usuarios del sistema</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Nombre completo</Label>
                <Input
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  placeholder="Nombre del usuario"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Correo electronico</Label>
                <Input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Contrasena</Label>
                <Input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Contrasena"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Rol</Label>
                <Select value={formRol} onValueChange={setFormRol}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Administrador</SelectItem>
                    <SelectItem value="2">Operario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear Usuario"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5 text-primary" />
            Usuarios del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usuarios.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No hay usuarios registrados</p>
          ) : (
            <div className="space-y-3 sm:overflow-x-auto">
              {/* Mobile view */}
              <div className="space-y-3 sm:hidden">
                {usuarios.map((user) => (
                  <div key={user.id} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">{user.nombre}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <Badge
                        className={
                          user.activo
                            ? "bg-success text-success-foreground text-xs"
                            : "bg-muted text-muted-foreground text-xs"
                        }
                      >
                        {user.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {new Date(user.fecha_creacion).toLocaleDateString("es-CO")}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          user.rol === "Administrador"
                            ? "border-primary text-primary text-xs"
                            : "border-accent text-accent text-xs"
                        }
                      >
                        {user.rol}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(user)}
                      className="gap-1 w-full text-xs"
                    >
                      {user.activo ? (
                        <>
                          <UserX className="h-3 w-3" />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-3 w-3" />
                          Activar
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>

              {/* Desktop view */}
              <table className="hidden w-full text-sm sm:table">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Nombre</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Rol</th>
                    <th className="pb-3 font-medium">Estado</th>
                    <th className="pb-3 font-medium">Fecha Registro</th>
                    <th className="pb-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="py-3 font-medium text-foreground">{user.nombre}</td>
                      <td className="py-3 text-foreground">{user.email}</td>
                      <td className="py-3">
                        <Badge
                          variant="outline"
                          className={
                            user.rol === "Administrador"
                              ? "border-primary text-primary"
                              : "border-accent text-accent"
                          }
                        >
                          {user.rol}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Badge
                          className={
                            user.activo
                              ? "bg-success text-success-foreground"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {user.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="py-3 text-foreground">
                        {new Date(user.fecha_creacion).toLocaleDateString("es-CO")}
                      </td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(user)}
                          className="gap-1"
                        >
                          {user.activo ? (
                            <>
                              <UserX className="h-3.5 w-3.5" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3.5 w-3.5" />
                              Activar
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
