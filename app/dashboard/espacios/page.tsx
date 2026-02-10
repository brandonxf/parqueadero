"use client"

import { useEffect, useState } from "react"
import { ParkingSquare, Car, Bike, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Espacio {
  id: number
  codigo: string
  categoria: string
  disponible: boolean
  vehiculo_placa: string | null
  registro_id?: number | null
}

interface Resumen {
  categoria: string
  total: string
  disponibles: string
  ocupados: string
}

interface RegistroDetail {
  id: number
  placa: string
  espacio_id: number
  tipo_vehiculo: string | null
  usuario_entrada: string | null
  fecha_hora_entrada: string | null
}

interface SalidaResult {
  registro: any
  minutos_totales: number
  valor_calculado: number
  valor_final: number
  tipo_vehiculo: string | null
}

export default function EspaciosPage() {
  const [espacios, setEspacios] = useState<Espacio[]>([])
  const [resumen, setResumen] = useState<Resumen[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Espacio | null>(null)
  const [registro, setRegistro] = useState<RegistroDetail | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [salidaResult, setSalidaResult] = useState<SalidaResult | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch("/api/espacios")
      const data = await res.json()
      setEspacios(data.espacios)
      setResumen(data.resumen)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const autoEspacios = espacios.filter((e) => e.categoria === "AUTO")
  const motoEspacios = espacios.filter((e) => e.categoria === "MOTO")

  async function openEspacioModal(esp: Espacio) {
    setSelected(esp)
    setModalOpen(true)
    // fetch registro details (active records) and find by registro_id
    try {
      const res = await fetch(`/api/registros?estado=EN_CURSO`)
      const data: RegistroDetail[] = await res.json()
      const found = data.find((r) => r.id === (esp as any).registro_id)
      if (found) setRegistro(found)
      else setRegistro(null)
    } catch (e) {
      setRegistro(null)
    }
  }

  async function registrarSalida() {
    if (!registro) return
    try {
      const res = await fetch(`/api/registros/salida`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placa: registro.placa }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err?.error || "Error al registrar salida")
        return
      }
      const data = await res.json()
      // success: close modal, show lateral panel with salida
      setModalOpen(false)
      setSelected(null)
      setRegistro(null)
      setSalidaResult(data)
      setPanelOpen(true)
      fetchData()
    } catch (e) {
      alert("Error de red")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mapa de Espacios</h1>
          <p className="text-muted-foreground">Visualizacion en tiempo real de los espacios</p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {resumen.map((r) => {
          const Icon = r.categoria === "AUTO" ? Car : Bike
          const color = r.categoria === "AUTO" ? "primary" : "accent"
          return (
            <Card key={r.categoria}>
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <Icon className={`h-6 w-6 text-${color}`} />
                  <div>
                    <p className="font-semibold text-foreground">{r.categoria === "AUTO" ? "Autos" : "Motos"}</p>
                    <p className="text-sm text-muted-foreground">
                      {r.disponibles} disponibles / {r.total} total
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-foreground">{r.disponibles}</p>
                  <p className="text-xs text-muted-foreground">libres</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Auto Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Car className="h-5 w-5 text-primary" />
            Espacios para Autos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10">
            {autoEspacios.map((esp) => (
              <div
                key={esp.id}
                onClick={() => !esp.disponible && openEspacioModal(esp)}
                role={!esp.disponible ? "button" : undefined}
                tabIndex={!esp.disponible ? 0 : undefined}
                className={`cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center rounded-lg border-2 p-2 sm:p-3 text-center ${
                  esp.disponible
                    ? "border-success/30 bg-success/5"
                    : "border-destructive/30 bg-destructive/5 animate-pulse"
                }`}
              >
                <Car className={`h-4 w-4 sm:h-5 sm:w-5 ${esp.disponible ? "text-success" : "text-destructive"}`} />
                <span className="mt-0.5 text-[10px] sm:text-xs font-bold text-foreground">{esp.codigo}</span>
                {esp.vehiculo_placa && (
                  <span className="mt-0.5 font-mono text-[8px] sm:text-[10px] text-muted-foreground">{esp.vehiculo_placa}</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal for selected espacio */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl">Espacio {selected?.codigo}</DialogTitle>
              <DialogDescription>
                Información del vehículo y acciones disponibles.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Placa</span>
                <span className="font-mono">{registro?.placa ?? selected?.vehiculo_placa ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo</span>
                <span>{registro?.tipo_vehiculo ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Usuario (entrada)</span>
                <span>{registro?.usuario_entrada ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hora entrada</span>
                <span className="font-mono">{registro?.fecha_hora_entrada ?? "-"}</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cerrar</Button>
              <Button variant="destructive" onClick={registrarSalida}>Registrar salida</Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>

        {/* Panel lateral con la salida registrada */}
        {/* Modal centrado con la salida registrada */}
        <Dialog open={panelOpen} onOpenChange={(v) => { setPanelOpen(v); if (!v) setSalidaResult(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl">Salida registrada</DialogTitle>
              <DialogDescription>Resumen de la salida generada</DialogDescription>
            </DialogHeader>

            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Placa</span>
                <span className="font-mono">{salidaResult?.registro?.placa ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo</span>
                <span>{salidaResult?.tipo_vehiculo ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minutos</span>
                <span>{salidaResult?.minutos_totales ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor calculado</span>
                <span className="font-mono">{salidaResult?.valor_calculado ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Descuento</span>
                <span className="font-mono">{salidaResult?.registro?.descuento ?? 0}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total a pagar</span>
                <span className="font-mono">{salidaResult?.valor_final ?? "-"}</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => { setPanelOpen(false); setSalidaResult(null); }}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      {/* Moto Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Bike className="h-5 w-5 text-accent" />
            Espacios para Motos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10">
            {motoEspacios.map((esp) => (
              <div
                key={esp.id}
                onClick={() => !esp.disponible && openEspacioModal(esp)}
                role={!esp.disponible ? "button" : undefined}
                tabIndex={!esp.disponible ? 0 : undefined}
                className={`cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center rounded-lg border-2 p-2 sm:p-3 text-center ${
                  esp.disponible
                    ? "border-success/30 bg-success/5"
                    : "border-destructive/30 bg-destructive/5 animate-pulse"
                }`}
              >
                <Bike className={`h-4 w-4 sm:h-5 sm:w-5 ${esp.disponible ? "text-success" : "text-destructive"}`} />
                <span className="mt-0.5 text-[10px] sm:text-xs font-bold text-foreground">{esp.codigo}</span>
                {esp.vehiculo_placa && (
                  <span className="mt-0.5 font-mono text-[8px] sm:text-[10px] text-muted-foreground">{esp.vehiculo_placa}</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-success/30 bg-success/5" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-destructive/30 bg-destructive/5" />
          <span>Ocupado</span>
        </div>
      </div>
    </div>
  )
}
