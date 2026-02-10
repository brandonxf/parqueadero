"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Car,
  LayoutDashboard,
  LogIn,
  LogOut,
  DollarSign,
  Users,
  BarChart3,
  ParkingSquare,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface User {
  id: number
  nombre: string
  email: string
  rol: string
}

const operarioLinks = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/dashboard/entrada", label: "Registrar Entrada", icon: LogIn },
  { href: "/dashboard/salida", label: "Registrar Salida", icon: LogOut },
  { href: "/dashboard/espacios", label: "Espacios", icon: ParkingSquare },
]

const adminLinks = [
  { href: "/dashboard/tarifas", label: "Tarifas", icon: DollarSign },
  { href: "/dashboard/usuarios", label: "Usuarios", icon: Users },
  { href: "/dashboard/reportes", label: "Reportes", icon: BarChart3 },
]

export function MobileNav({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  const links = user.rol === "Administrador"
    ? [...operarioLinks, ...adminLinks]
    : operarioLinks

  const NavLinks = () => (
    <>
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
        Operaciones
      </p>
      <ul className="flex flex-col gap-1">
        {operarioLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <link.icon className="h-5 w-5 shrink-0" />
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>

      {user.rol === "Administrador" && (
        <>
          <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            Administracion
          </p>
          <ul className="flex flex-col gap-1">
            {adminLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <link.icon className="h-5 w-5 shrink-0" />
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </>
  )

  return (
    <div className="flex h-16 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 text-sidebar-foreground md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-sidebar-foreground">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-sidebar p-0 text-sidebar-foreground">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary">
                <Car className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base font-bold text-sidebar-foreground">ParkControl</h1>
                <p className="text-xs text-sidebar-foreground/60">Sistema de Parqueadero</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <NavLinks />
            </nav>

            {/* User info */}
            <div className="border-t border-sidebar-border p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sm font-bold text-sidebar-primary">
                  {user.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">{user.nombre}</p>
                  <p className="truncate text-xs text-sidebar-foreground/60">{user.rol}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                onClick={() => {
                  setOpen(false)
                  handleLogout()
                }}
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesion
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <Car className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <span className="text-sm font-semibold">ParkControl</span>
      </div>

      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-xs font-bold text-sidebar-primary">
        {user.nombre.charAt(0).toUpperCase()}
      </div>
    </div>
  )
}
