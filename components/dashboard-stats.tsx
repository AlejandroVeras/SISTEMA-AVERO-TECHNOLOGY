"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, FileText, Users, TrendingUp } from "lucide-react"

export function DashboardStats() {
  // Mock data - in production, fetch from database
  const stats = [
    {
      title: "Ingresos del Mes",
      value: "RD$ 125,430",
      change: "+12.5%",
      icon: DollarSign,
      positive: true,
    },
    {
      title: "Facturas Pendientes",
      value: "8",
      change: "RD$ 45,200",
      icon: FileText,
      positive: false,
    },
    {
      title: "Clientes Activos",
      value: "34",
      change: "+3 este mes",
      icon: Users,
      positive: true,
    },
    {
      title: "Ganancia Neta",
      value: "RD$ 89,320",
      change: "+8.2%",
      icon: TrendingUp,
      positive: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <p className={`text-xs mt-1 ${stat.positive ? "text-green-600" : "text-slate-600"}`}>{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
