import type React from "react"
import { getUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <DashboardSidebar />
      <div className="flex flex-col flex-1 w-full lg:w-[calc(100%-16rem)] border-l">
        <DashboardHeader user={user} />
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
