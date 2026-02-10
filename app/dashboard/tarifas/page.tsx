"use client"

import React from "react"

import { useState, useEffect } from "react"
import { DollarSign, Plus, Edit2 } from "lucide-react"
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

interface Tarifa {
  id: number
  tipo_vehiculo_id: number
  tipo_vehiculo_nombre: string
  nombre: string
  tipo_cobro: string
  valor: string
  activo: boolean
}

interface TipoVehiculo {
  id: number
  nombre: string
}

function formatCurrency(val: string | number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(
    Number(val)
  )
}

const TIPOS_COBRO = [
  { value: "POR_MINUTO", label: "Por Minuto" },
  { value: "POR_HORA", label: "Por Hora" },
  { value: "POR_DIA", label: "Por Dia" },
  { value: "FRACCION", label: "Fraccion" },
]

export default function TarifasPage() {
  const [tarifas, setTarifas] = useState<Tarifa[]>([])
  const [tipos, setTipos] = useState<TipoVehiculo[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Form fields
  const [formTipoVehiculo, setFormTipoVehiculo] = useState("")
  const [formNombre, setFormNombre] = useState("")
  const [formTipoCobro, setFormTipoCobro] = useState("")
  const [formValor, setFormValor] = useState("")

  async function fetchData() {
    const [tarifasRes, tiposRes] = await Promise.all([
      fetch("/api/tarifas").then((r) => r.json()),
      fetch("/api/tipos-vehiculo").then((r) => r.json()),
    ])
    setTarifas(tarifasRes)
    setTipos(tiposRes)
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/tarifas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo_vehiculo_id: Number(formTipoVehiculo),
          nombre: formNombre,
          tipo_cobro: formTipoCobro,
          valor: Number(formValor),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error)
        return
      }

      setOpen(false)
      setFormNombre("")
      setFormTipoVehiculo("")
      setFormTipoCobro("")
      setFormValor("")
      fetchData()
    } catch {
      setError("Error de conexion")
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(tarifa: Tarifa) {
    await fetch("/api/tarifas", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: tarifa.id,
        nombre: tarifa.nombre,
        tipo_cobro: tarifa.tipo_cobro,
        valor: Number(tarifa.valor),
        activo: !tarifa.activo,
      }),
    })
    fetchData()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion de Tarifas</h1>
          <p className="text-muted-foreground">Configura las tarifas por tipo de vehiculo</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Tarifa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Tarifa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Tipo de Vehiculo</Label>
                <Select value={formTipoVehiculo} onValueChange={setFormTipoVehiculo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipos.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Nombre de la tarifa</Label>
                <Input
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  placeholder="Ej: Tarifa Hora Sedan"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Tipo de Cobro</Label>
                <Select value={formTipoCobro} onValueChange={setFormTipoCobro}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo cobro" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_COBRO.map((tc) => (
                      <SelectItem key={tc.value} value={tc.value}>
                        {tc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Valor (COP)</Label>
                <Input
                  type="number"
                  value={formValor}
                  onChange={(e) => setFormValor(e.target.value)}
                  placeholder="5000"
                  min={0}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear Tarifa"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tariffs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <DollarSign className="h-5 w-5 text-primary" />
            Tarifas Configuradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tarifas.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No hay tarifas configuradas</p>
          ) : (
            <div className="space-y-3 sm:overflow-x-auto">
              {/* Mobile view */}
              <div className="space-y-3 sm:hidden">
                {tarifas.map((tarifa) => (
                  <div key={tarifa.id} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">{tarifa.nombre}</p>
                        <p className="text-xs text-muted-foreground">{tarifa.tipo_vehiculo_nombre}</p>
                      </div>
                      <Badge
                        className={
                          tarifa.activo
                            ? "bg-success text-success-foreground text-xs"
                            : "bg-muted text-muted-foreground text-xs"
                        }
                      >
                        {tarifa.activo ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {TIPOS_COBRO.find((tc) => tc.value === tarifa.tipo_cobro)?.label || tarifa.tipo_cobro}
                      </span>
                      <span className="font-semibold text-foreground">{formatCurrency(tarifa.valor)}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(tarifa)}
                      className="gap-1 w-full text-xs"
                    >
                      <Edit2 className="h-3 w-3" />
                      {tarifa.activo ? "Desactivar" : "Activar"}
                    </Button>
                  </div>
                ))}
              </div>

              {/* Desktop view */}
              <table className="hidden w-full text-sm sm:table">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Nombre</th>
                    <th className="pb-3 font-medium">Tipo Vehiculo</th>
                    <th className="pb-3 font-medium">Tipo Cobro</th>
                    <th className="pb-3 font-medium">Valor</th>
                    <th className="pb-3 font-medium">Estado</th>
                    <th className="pb-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tarifas.map((tarifa) => (
                    <tr key={tarifa.id} className="border-b last:border-0">
                      <td className="py-3 font-medium text-foreground">{tarifa.nombre}</td>
                      <td className="py-3 text-foreground">{tarifa.tipo_vehiculo_nombre}</td>
                      <td className="py-3 text-foreground">
                        {TIPOS_COBRO.find((tc) => tc.value === tarifa.tipo_cobro)?.label || tarifa.tipo_cobro}
                      </td>
                      <td className="py-3 font-semibold text-foreground">{formatCurrency(tarifa.valor)}</td>
                      <td className="py-3">
                        <Badge
                          className={
                            tarifa.activo
                              ? "bg-success text-success-foreground"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {tarifa.activo ? "Activa" : "Inactiva"}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(tarifa)}
                          className="gap-1"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          {tarifa.activo ? "Desactivar" : "Activar"}
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
