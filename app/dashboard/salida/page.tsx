"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { LogOut, Search, QrCode, Check, Printer, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface SalidaResult {
  registro: {
    id: number
    placa: string
    fecha_hora_entrada: string
    fecha_hora_salida: string
    valor_final: string
    valor_calculado: string
    descuento: string
  }
  minutos_totales: number
  valor_calculado: number
  valor_final: number
  tipo_vehiculo: string
}

function formatCurrency(val: string | number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(
    Number(val)
  )
}

function formatDuration(minutes: number) {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hrs > 0) return `${hrs}h ${mins}m`
  return `${mins}m`
}

export default function SalidaPage() {
  const [searchMode, setSearchMode] = useState<"qr" | "placa">("qr")
  const [placa, setPlaca] = useState("")
  const [codigoTicket, setCodigoTicket] = useState("")
  const [descuento, setDescuento] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<SalidaResult | null>(null)
  const qrInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus QR input when switching to QR mode
  useEffect(() => {
    if (searchMode === "qr" && qrInputRef.current) {
      qrInputRef.current.focus()
    }
  }, [searchMode])

  // Re-focus QR input after a successful scan so the scanner is ready for the next one
  useEffect(() => {
    if (result && searchMode === "qr" && qrInputRef.current) {
      // small delay so the result card renders first
      const timer = setTimeout(() => qrInputRef.current?.focus(), 300)
      return () => clearTimeout(timer)
    }
  }, [result, searchMode])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const body: Record<string, unknown> = {
      descuento: descuento ? Number(descuento) : 0,
    }

    if (searchMode === "qr") {
      if (!codigoTicket) {
        setError("Escanee el codigo QR del ticket")
        return
      }
      body.codigo_ticket = codigoTicket.trim()
    } else {
      if (!placa) {
        setError("Ingresa la placa del vehiculo")
        return
      }
      body.placa = placa
    }

    setError("")
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("/api/registros/salida", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }

      setResult(data)
      setPlaca("")
      setCodigoTicket("")
      setDescuento("")
    } catch {
      setError("Error de conexion")
    } finally {
      setLoading(false)
    }
  }

  // Handle Enter key from QR scanner (the scanner acts as a keyboard: types value + Enter)
  function handleQrKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && codigoTicket.trim()) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  function handlePlacaKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && placa.trim()) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  function handlePrint() {
    if (!result) return
    const printWindow = window.open("", "_blank", "width=400,height=600")
    if (!printWindow) return
    printWindow.document.write(`
      <html>
        <head><title>Ticket de Salida</title>
        <style>
          body { font-family: monospace; text-align: center; padding: 20px; }
          h1 { font-size: 18px; margin-bottom: 4px; }
          .line { border-top: 1px dashed #000; margin: 10px 0; }
          .big { font-size: 28px; font-weight: bold; }
          .row { display: flex; justify-content: space-between; margin: 4px 0; }
        </style>
        </head>
        <body>
          <h1>PARKCONTROL</h1>
          <p>Ticket de Salida</p>
          <div class="line"></div>
          <p><strong>Placa:</strong> ${result.registro.placa}</p>
          <p><strong>Tipo:</strong> ${result.tipo_vehiculo}</p>
          <div class="line"></div>
          <p><strong>Entrada:</strong> ${new Date(result.registro.fecha_hora_entrada).toLocaleString("es-CO")}</p>
          <p><strong>Salida:</strong> ${new Date(result.registro.fecha_hora_salida).toLocaleString("es-CO")}</p>
          <p><strong>Duracion:</strong> ${formatDuration(result.minutos_totales)}</p>
          <div class="line"></div>
          <div class="row"><span>Subtotal:</span><span>${formatCurrency(result.valor_calculado)}</span></div>
          ${Number(result.registro.descuento) > 0 ? `<div class="row"><span>Descuento:</span><span>-${formatCurrency(result.registro.descuento)}</span></div>` : ""}
          <p class="big">${formatCurrency(result.valor_final)}</p>
          <div class="line"></div>
          <p style="font-size:11px;">Gracias por su visita</p>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Registrar Salida</h1>
        <p className="text-muted-foreground">Salida de vehiculos y calculo de cobro</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Exit Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Search className="h-5 w-5 text-primary" />
              Buscar Vehiculo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Tabs
                value={searchMode}
                onValueChange={(v) => {
                  setSearchMode(v as "qr" | "placa")
                  setError("")
                  setResult(null)
                }}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="qr" className="gap-2">
                    <QrCode className="h-4 w-4" />
                    Escanear QR
                  </TabsTrigger>
                  <TabsTrigger value="placa" className="gap-2">
                    <Search className="h-4 w-4" />
                    Buscar por Placa
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="qr" className="mt-4">
                  <div className="flex flex-col gap-3">
                    <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center">
                      <QrCode className="mx-auto h-10 w-10 text-primary" />
                      <p className="mt-2 text-sm font-medium text-foreground">
                        Escanee el codigo QR del ticket
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Use la pistola scanner QR apuntando al ticket de entrada
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="qr-input">Codigo del ticket</Label>
                      <Input
                        ref={qrInputRef}
                        id="qr-input"
                        value={codigoTicket}
                        onChange={(e) => setCodigoTicket(e.target.value.trim())}
                        onKeyDown={handleQrKeyDown}
                        placeholder="Esperando escaneo QR..."
                        className="text-center text-lg font-mono font-bold tracking-widest"
                        autoFocus
                        autoComplete="off"
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        El campo se llena automaticamente al escanear el QR
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="placa" className="mt-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="placa-salida">Placa del vehiculo</Label>
                    <Input
                      id="placa-salida"
                      value={placa}
                      onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                      onKeyDown={handlePlacaKeyDown}
                      placeholder="ABC123"
                      className="text-center text-lg font-mono font-bold tracking-widest"
                      maxLength={7}
                      autoComplete="off"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex flex-col gap-2">
                <Label htmlFor="descuento">Descuento (opcional)</Label>
                <Input
                  id="descuento"
                  type="number"
                  value={descuento}
                  onChange={(e) => setDescuento(e.target.value)}
                  placeholder="0"
                  min={0}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                type="submit"
                size="lg"
                className="w-full text-base"
                disabled={loading || (searchMode === "qr" ? !codigoTicket : !placa)}
              >
                {loading ? "Procesando..." : "Registrar Salida"}
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
                Salida Registrada
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Total */}
              <div className="rounded-xl bg-card p-4 sm:p-6 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">Total a Cobrar</p>
                <p className="mt-1 text-2xl sm:text-3xl font-bold text-foreground">
                  {formatCurrency(result.valor_final)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Placa</p>
                  <p className="font-mono text-base sm:text-lg font-bold text-foreground">{result.registro.placa}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Tipo</p>
                  <p className="text-base sm:text-lg font-medium text-foreground">{result.tipo_vehiculo}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Entrada</p>
                  <p className="text-xs sm:text-base font-medium text-foreground">
                    {new Date(result.registro.fecha_hora_entrada).toLocaleTimeString("es-CO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Salida</p>
                  <p className="text-xs sm:text-base font-medium text-foreground">
                    {new Date(result.registro.fecha_hora_salida).toLocaleTimeString("es-CO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Duracion</p>
                    <p className="text-xs sm:text-base font-semibold text-foreground">{formatDuration(result.minutos_totales)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Estado</p>
                  <Badge className="bg-success text-success-foreground text-xs">Finalizado</Badge>
                </div>
              </div>

              {/* Cost breakdown */}
              <div className="rounded-lg bg-muted p-3 sm:p-4">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatCurrency(result.valor_calculado)}</span>
                </div>
                {Number(result.registro.descuento) > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Descuento</span>
                    <span className="text-destructive">-{formatCurrency(result.registro.descuento)}</span>
                  </div>
                )}
                <div className="mt-2 flex justify-between border-t pt-2 text-sm sm:text-base font-bold">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{formatCurrency(result.valor_final)}</span>
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
