"use client"

import { Bell, UserIcon, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { signOut } from "@/lib/auth"
import { useRouter, usePathname } from "next/navigation"
import type { User } from "@/lib/auth"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"
import {
  BarChart3,
  CreditCard,
  FileText,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  Users,
  Ticket
} from "lucide-react"

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()

  async function handleSignOut() {
    await signOut()
    router.push("/login")
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Clientes", href: "/dashboard/customers", icon: Users },
    { name: "Productos", href: "/dashboard/products", icon: Package },
    { name: "Cotizaciones", href: "/dashboard/quotes", icon: FileText },
    { name: "Facturas", href: "/dashboard/invoices", icon: Receipt },
    { name: "Gastos", href: "/dashboard/expenses", icon: CreditCard },
    { name: "Tickets", href: "/dashboard/tickets", icon: Ticket },
    { name: "Reportes", href: "/dashboard/reports", icon: BarChart3 },
    { name: "Configuración", href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-40 w-full">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Navegación Móvil</SheetTitle>
              <div className="flex h-16 items-center gap-2 border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Image
                    src="/LOGO.png"
                    alt="AVERO Technology"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-base leading-tight">AVERO</span>
                    <span className="text-[10px] leading-none text-muted-foreground uppercase tracking-widest">
                      Technology
                    </span>
                  </div>
                </Link>
              </div>
              <div className="flex flex-col gap-2 p-4">
                {navigation.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (pathname.startsWith(`${item.href}/`) && item.href !== "/dashboard")

                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn("w-full justify-start gap-3", !isActive && "text-muted-foreground")}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </SheetContent>
          </Sheet>
          
          <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
            <span className="font-bold text-lg">AVERO</span>
          </Link>
        </div>

        <div className="flex-1 md:hidden" />

        {/* Global Search / Context could go here in the middle for desktop */}
        <div className="hidden md:flex flex-1" />

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50">
                <UserIcon className="h-5 w-5 text-secondary-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="font-medium text-sm leading-none">{user.businessName}</p>
                  <p className="text-xs text-muted-foreground leading-none">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                Configuración
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
