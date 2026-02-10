"use client"

import React from "react"

import { useState, useEffect } from "react"
import { LogIn, Car, Bike, Check, Printer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface TipoVehiculo {
  id: number
  nombre: string
  categoria: string
}

interface EntradaResult {
  registro: { id: number; placa: string; fecha_hora_entrada: string }
  espacio: { id: number; codigo: string }
  ticket: { codigo_ticket: string }
}

export default function EntradaPage() {
  const [placa, setPlaca] = useState("")
  const [tipoVehiculoId, setTipoVehiculoId] = useState<number | null>(null)
  const [tipos, setTipos] = useState<TipoVehiculo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<EntradaResult | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/tipos-vehiculo")
      .then((r) => r.json())
      .then(setTipos)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!placa || !tipoVehiculoId) {
      setError("Selecciona tipo de vehiculo e ingresa la placa")
      return
    }

    setError("")
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("/api/registros/entrada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placa, tipo_vehiculo_id: tipoVehiculoId }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }

      setResult(data)
      // generar QR del codigo de ticket para escaneo en salida
      try {
        const QR = await import('qrcode')
        const qr = await QR.toDataURL(data.ticket.codigo_ticket, {
          width: 200,
          margin: 2,
          errorCorrectionLevel: 'M',
        })
        setQrDataUrl(qr)
      } catch (err) {
        console.error('QR generation failed', err)
        setQrDataUrl(null)
      }
      setPlaca("")
      setTipoVehiculoId(null)
    } catch {
      setError("Error de conexion")
    } finally {
      setLoading(false)
    }
  }

  function handlePrint() {
    if (!result) return
    const printWindow = window.open("", "_blank", "width=400,height=500")
    if (!printWindow) return
    printWindow.document.write(`
      <html>
        <head><title>Ticket de Entrada</title>
        <style>
          body { font-family: monospace; text-align: center; padding: 20px; }
          h1 { font-size: 18px; margin-bottom: 4px; }
          .line { border-top: 1px dashed #000; margin: 10px 0; }
          .big { font-size: 24px; font-weight: bold; letter-spacing: 2px; }
        </style>
        </head>
        <body>
          <h1>PARKCONTROL</h1>
          <p>Ticket de Entrada</p>
          <div class="line"></div>
          <p class="big">${result.ticket.codigo_ticket}</p>
          ${qrDataUrl ? `<div style="margin:12px 0"><img src="${qrDataUrl}" width="180" height="180" style="display:inline-block"/><p style="font-size:10px;margin-top:4px;">Escanee este codigo QR para registrar la salida</p></div>` : ""}
          <div class="line"></div>
          <p><strong>Placa:</strong> ${result.registro.placa}</p>
          <p><strong>Espacio:</strong> ${result.espacio.codigo}</p>
          <p><strong>Entrada:</strong> ${new Date(result.registro.fecha_hora_entrada).toLocaleString("es-CO")}</p>
          <div class="line"></div>
          <p style="font-size:11px;">Conserve este ticket para la salida</p>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const selectedTipo = tipos.find((t) => t.id === tipoVehiculoId)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Registrar Entrada</h1>
        <p className="text-muted-foreground">Ingreso de vehiculos al parqueadero</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <LogIn className="h-5 w-5 text-primary" />
              Datos del Vehiculo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Vehicle type selection */}
              <div className="flex flex-col gap-2">
                <Label>Tipo de vehiculo</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {tipos.map((tipo) => (
                    <button
                      key={tipo.id}
                      type="button"
                      onClick={() => setTipoVehiculoId(tipo.id)}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 sm:p-4 transition-all ${
                        tipoVehiculoId === tipo.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      {tipo.categoria === "MOTO" ? (
                        <Bike className={`h-6 w-6 sm:h-8 sm:w-8 ${tipoVehiculoId === tipo.id ? "text-primary" : "text-muted-foreground"}`} />
                      ) : (
                        <Car className={`h-6 w-6 sm:h-8 sm:w-8 ${tipoVehiculoId === tipo.id ? "text-primary" : "text-muted-foreground"}`} />
                      )}
                      <span className={`text-xs sm:text-sm font-medium ${tipoVehiculoId === tipo.id ? "text-primary" : "text-foreground"}`}>
                        {tipo.nombre}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Plate input */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="placa">Placa del vehiculo</Label>
                <Input
                  id="placa"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="text-center text-lg font-mono font-bold tracking-widest"
                  maxLength={7}
                  required
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                type="submit"
                size="lg"
                className="w-full text-base"
                disabled={loading || !placa || !tipoVehiculoId}
              >
                {loading ? "Registrando..." : "Registrar Entrada"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result Card */}
        {result && (
          <Card className="border-success/30 bg-success/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <Check className="h-5 w-5" />
                Entrada Registrada
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="rounded-xl bg-card p-4 sm:p-6 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">Codigo de Ticket</p>
                <p className="mt-1 font-mono text-lg sm:text-2xl font-bold text-foreground">{result.ticket.codigo_ticket}</p>
                {qrDataUrl && (
                  <div className="mt-3 flex justify-center">
                    <img src={qrDataUrl || "/placeholder.svg"} alt="QR codigo ticket" width={140} height={140} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Placa</p>
                  <p className="font-mono text-base sm:text-lg font-bold text-foreground">{result.registro.placa}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Espacio Asignado</p>
                  <p className="text-base sm:text-lg font-bold text-primary">{result.espacio.codigo}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Hora de Entrada</p>
                  <p className="text-xs sm:text-base font-medium text-foreground">
                    {new Date(result.registro.fecha_hora_entrada).toLocaleTimeString("es-CO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Estado</p>
                  <Badge className="bg-warning text-warning-foreground text-xs">En curso</Badge>
                </div>
              </div>

              <Button variant="outline" className="gap-2 bg-transparent text-sm sm:text-base" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
                Imprimir Ticket
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
