"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { 
  BarChart3, 
  CreditCard, 
  FileText, 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Settings, 
  Users 
} from "lucide-react"

import { cn } from "@/lib/utils"

export function DashboardSidebar() {
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Clientes", href: "/dashboard/customers", icon: Users },
    { name: "Productos", href: "/dashboard/products", icon: Package },
    { name: "Cotizaciones", href: "/dashboard/quotes", icon: FileText },
    { name: "Facturas", href: "/dashboard/invoices", icon: Receipt },
    { name: "Gastos", href: "/dashboard/expenses", icon: CreditCard },
    { name: "Reportes", href: "/dashboard/reports", icon: BarChart3 },
    { name: "Configuración", href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <aside className="hidden border-r bg-card md:block w-64 shrink-0 h-[calc(100vh-4rem)] lg:h-screen sticky top-0 overflow-y-auto">
      <div className="flex h-16 items-center gap-2 border-b px-6 lg:flex">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image 
            src="/LOGO.png" 
            alt="AVERO Technology" 
            width={32} 
            height={32}
            className="rounded-lg"
          />
          <div className="flex flex-col">
            <span className="font-bold text-base leading-tight text-foreground/90">AVERO</span>
            <span className="text-[10px] leading-none text-muted-foreground uppercase tracking-widest">Technology</span>
          </div>
        </Link>
      </div>

      <div className="px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`) && item.href !== "/dashboard"
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors relative group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
              {item.name}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
