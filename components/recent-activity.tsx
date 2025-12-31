"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, DollarSign, Users } from "lucide-react"

export function RecentActivity() {
  // Mock data - in production, fetch from database
  const activities = [
    {
      type: "invoice",
      title: "Factura #1234 creada",
      description: "Cliente: María García",
      amount: "RD$ 5,400",
      time: "Hace 2 horas",
      icon: FileText,
    },
    {
      type: "payment",
      title: "Pago recibido",
      description: "Factura #1230",
      amount: "RD$ 12,300",
      time: "Hace 5 horas",
      icon: DollarSign,
    },
    {
      type: "customer",
      title: "Nuevo cliente agregado",
      description: "Tech Solutions RD",
      time: "Hace 1 día",
      icon: Users,
    },
    {
      type: "invoice",
      title: "Factura #1233 pagada",
      description: "Cliente: Juan Pérez",
      amount: "RD$ 8,900",
      time: "Hace 1 día",
      icon: FileText,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <activity.icon className="h-5 w-5 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900">{activity.title}</p>
                <p className="text-sm text-slate-600">{activity.description}</p>
                <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
              </div>
              {activity.amount && (
                <Badge variant="secondary" className="flex-shrink-0">
                  {activity.amount}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
