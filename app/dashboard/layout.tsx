import React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileNav } from "@/components/mobile-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  return (
    <>
      <MobileNav user={session} />
      <div className="flex h-[calc(100vh_-_4rem)] overflow-hidden bg-background md:h-screen">
        <AppSidebar user={session} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </>
  )
}
