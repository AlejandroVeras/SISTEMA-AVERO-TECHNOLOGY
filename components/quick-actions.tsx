"use client"

import { FileText, Users, Package, DollarSign } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      icon: FileText,
      label: "Nueva Factura",
      href: "/dashboard/invoices/new",
      color: "bg-blue-500",
    },
    {
      icon: Users,
      label: "Agregar Cliente",
      href: "/dashboard/customers/new",
      color: "bg-green-500",
    },
    {
      icon: Package,
      label: "Nuevo Producto",
      href: "/dashboard/products/new",
      color: "bg-purple-500",
    },
    {
      icon: DollarSign,
      label: "Registrar Gasto",
      href: "/dashboard/expenses/new",
      color: "bg-orange-500",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => (
        <Card
          key={action.label}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push(action.href)}
        >
          <CardContent className="p-6 flex flex-col items-center gap-3">
            <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
              <action.icon className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-center text-slate-900">{action.label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
