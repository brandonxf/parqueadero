"use client"

import { Car, Bike, DollarSign, ArrowDownRight, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DashboardProps {
  user: { nombre: string; rol: string }
  resumen: Array<{ categoria: string; total: string; disponibles: string; ocupados: string }>
  statsHoy: { vehiculos_dentro: string; salidas_hoy: string; ingresos_hoy: string }
  ultimosRegistros: Array<{
    placa: string
    tipo_vehiculo: string
    espacio: string
    estado: string
    fecha_hora_entrada: string
  }>
}

function formatCurrency(val: string | number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(
    Number(val)
  )
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function DashboardContent({ user, resumen, statsHoy, ultimosRegistros }: DashboardProps) {
  const autoData = resumen.find((r) => r.categoria === "AUTO") || { total: "0", disponibles: "0", ocupados: "0" }
  const motoData = resumen.find((r) => r.categoria === "MOTO") || { total: "0", disponibles: "0", ocupados: "0" }

  const autoPercent = Number(autoData.total) > 0 ? (Number(autoData.ocupados) / Number(autoData.total)) * 100 : 0
  const motoPercent = Number(motoData.total) > 0 ? (Number(motoData.ocupados) / Number(motoData.total)) * 100 : 0

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bienvenido, {user.nombre}
        </h1>
        <p className="text-muted-foreground">
          Panel de control del parqueadero
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Auto Spaces */}
        <Card>
          <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-5">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Car className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Autos</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground">
                {autoData.disponibles}
                <span className="text-xs sm:text-sm font-normal text-muted-foreground">/{autoData.total}</span>
              </p>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${autoPercent}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Moto Spaces */}
        <Card>
          <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-5">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
              <Bike className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Motos</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground">
                {motoData.disponibles}
                <span className="text-xs sm:text-sm font-normal text-muted-foreground">/{motoData.total}</span>
              </p>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${motoPercent}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles Inside */}
        <Card>
          <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-5">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-warning/10">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-warning" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Vehiculos dentro</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{statsHoy.vehiculos_dentro}</p>
            </div>
          </CardContent>
        </Card>

        {/* Today's Income */}
        <Card>
          <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-5">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-success/10">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Ingresos hoy</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{formatCurrency(statsHoy.ingresos_hoy)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Availability Visual */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground text-lg sm:text-base">
              <Car className="h-5 w-5 text-primary" />
              Espacios Autos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold text-primary">{autoData.disponibles}</p>
                <p className="text-sm text-muted-foreground">disponibles de {autoData.total}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-destructive">{autoData.ocupados}</p>
                <p className="text-sm text-muted-foreground">ocupados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground text-lg sm:text-base">
              <Bike className="h-5 w-5 text-accent" />
              Espacios Motos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold text-accent">{motoData.disponibles}</p>
                <p className="text-sm text-muted-foreground">disponibles de {motoData.total}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-destructive">{motoData.ocupados}</p>
                <p className="text-sm text-muted-foreground">ocupados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ArrowDownRight className="h-5 w-5 text-primary" />
            Ultimos Movimientos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ultimosRegistros.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No hay movimientos registrados</p>
          ) : (
            <div className="space-y-3 sm:overflow-x-auto">
              {/* Mobile view */}
              <div className="space-y-3 sm:hidden">
                {ultimosRegistros.map((reg, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-foreground">{reg.placa}</span>
                      <Badge
                        variant={reg.estado === "EN_CURSO" ? "default" : "secondary"}
                        className={
                          reg.estado === "EN_CURSO"
                            ? "bg-warning text-warning-foreground"
                            : "bg-success text-success-foreground"
                        }
                      >
                        {reg.estado === "EN_CURSO" ? "En curso" : "Finalizado"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div>{reg.tipo_vehiculo}</div>
                      <div>Espacio: {reg.espacio}</div>
                      <div>{formatTime(reg.fecha_hora_entrada)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop view */}
              <table className="hidden w-full text-sm sm:table">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Placa</th>
                    <th className="pb-3 font-medium">Tipo</th>
                    <th className="pb-3 font-medium">Espacio</th>
                    <th className="pb-3 font-medium">Hora Entrada</th>
                    <th className="pb-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimosRegistros.map((reg, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-3 font-mono font-semibold text-foreground">{reg.placa}</td>
                      <td className="py-3 text-foreground">{reg.tipo_vehiculo}</td>
                      <td className="py-3 text-foreground">{reg.espacio}</td>
                      <td className="py-3 text-foreground">{formatTime(reg.fecha_hora_entrada)}</td>
                      <td className="py-3">
                        <Badge
                          variant={reg.estado === "EN_CURSO" ? "default" : "secondary"}
                          className={
                            reg.estado === "EN_CURSO"
                              ? "bg-warning text-warning-foreground"
                              : "bg-success text-success-foreground"
                          }
                        >
                          {reg.estado === "EN_CURSO" ? "En curso" : "Finalizado"}
                        </Badge>
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
