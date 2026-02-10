"use client"

import React from "react"

import { useState, useEffect } from "react"
import { BarChart3, DollarSign, Car, Clock, CalendarDays } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Stats {
  total_finalizados: string
  total_en_curso: string
  ingresos_total: string
  promedio_minutos: string
}

interface PorTipo {
  nombre: string
  cantidad: string
  ingresos: string
}

interface PorDia {
  fecha: string
  cantidad: string
  ingresos: string
}

function formatCurrency(val: string | number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(
    Number(val)
  )
}

export default function ReportesPage() {
  const today = new Date().toISOString().split("T")[0]
  const [desde, setDesde] = useState(today)
  const [hasta, setHasta] = useState(today)
  const [stats, setStats] = useState<Stats | null>(null)
  const [porTipo, setPorTipo] = useState<PorTipo[]>([])
  const [porDia, setPorDia] = useState<PorDia[]>([])
  const [loading, setLoading] = useState(false)

  async function fetchReport() {
    setLoading(true)
    try {
      const res = await fetch(`/api/reportes?desde=${desde}&hasta=${hasta}`)
      const data = await res.json()
      setStats(data.stats)
      setPorTipo(data.porTipo)
      setPorDia(data.porDia)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  function handleFilter(e: React.FormEvent) {
    e.preventDefault()
    fetchReport()
  }

  const maxIngresos = porDia.length > 0 ? Math.max(...porDia.map((d) => Number(d.ingresos)), 1) : 1

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
        <p className="text-muted-foreground">Estadisticas e informes del parqueadero</p>
      </div>

      {/* Date Filter */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <form onSubmit={handleFilter} className="flex flex-col sm:flex-row sm:flex-wrap items-end gap-3 sm:gap-4">
            <div className="flex flex-col gap-2 flex-1 sm:flex-none">
              <Label htmlFor="desde" className="text-xs sm:text-sm">Desde</Label>
              <Input
                id="desde"
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="text-xs sm:text-sm"
              />
            </div>
            <div className="flex flex-col gap-2 flex-1 sm:flex-none">
              <Label htmlFor="hasta" className="text-xs sm:text-sm">Hasta</Label>
              <Input
                id="hasta"
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="text-xs sm:text-sm"
              />
            </div>
            <Button type="submit" disabled={loading} className="gap-2 w-full sm:w-auto text-xs sm:text-sm">
              <CalendarDays className="h-4 w-4" />
              {loading ? "Cargando..." : "Filtrar"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success/10">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(stats.ingresos_total)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vehiculos Atendidos</p>
                <p className="text-xl font-bold text-foreground">{stats.total_finalizados}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En curso</p>
                <p className="text-xl font-bold text-foreground">{stats.total_en_curso}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Promedio Estadia</p>
                <p className="text-xl font-bold text-foreground">{Math.round(Number(stats.promedio_minutos))} min</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* By Vehicle Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Car className="h-5 w-5 text-primary" />
              Por Tipo de Vehiculo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {porTipo.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">Sin datos para el periodo</p>
            ) : (
              <div className="flex flex-col gap-4">
                {porTipo.map((item) => (
                  <div key={item.nombre} className="flex items-center justify-between rounded-lg bg-muted p-4">
                    <div>
                      <p className="font-semibold text-foreground">{item.nombre}</p>
                      <p className="text-sm text-muted-foreground">{item.cantidad} vehiculos</p>
                    </div>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(item.ingresos)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="h-5 w-5 text-accent" />
              Ingresos por Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            {porDia.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">Sin datos para el periodo</p>
            ) : (
              <div className="flex flex-col gap-3">
                {porDia.map((day) => {
                  const pct = (Number(day.ingresos) / maxIngresos) * 100
                  return (
                    <div key={day.fecha}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {new Date(day.fecha + "T12:00:00").toLocaleDateString("es-CO", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <span className="font-semibold text-foreground">{formatCurrency(day.ingresos)}</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{day.cantidad} vehiculos</p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
