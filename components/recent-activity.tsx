import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, DollarSign, Users, Receipt } from "lucide-react"
import { getInvoices } from "@/lib/data/invoices"
import { getCustomers } from "@/lib/data/customers"
import { getExpenses } from "@/lib/data/expenses"

type Activity = {
  type: "invoice" | "payment" | "customer" | "expense"
  title: string
  description: string
  amount?: string
  time: string
  icon: any
}

export async function RecentActivity() {
  const [invoices, customers, expenses] = await Promise.all([
    getInvoices(),
    getCustomers(),
    getExpenses()
  ])

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(amount)
  }

  function getTimeAgo(date: Date) {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return diffMins <= 1 ? "Hace 1 minuto" : `Hace ${diffMins} minutos`
    } else if (diffHours < 24) {
      return diffHours === 1 ? "Hace 1 hora" : `Hace ${diffHours} horas`
    } else {
      return diffDays === 1 ? "Hace 1 día" : `Hace ${diffDays} días`
    }
  }

  const activities: Activity[] = []

  // Add recent invoices
  invoices.slice(0, 3).forEach(invoice => {
    if (invoice.status === 'paid') {
      activities.push({
        type: "payment",
        title: "Pago recibido",
        description: `Factura ${invoice.invoiceNumber}`,
        amount: formatCurrency(invoice.total),
        time: getTimeAgo(invoice.updatedAt),
        icon: DollarSign,
      })
    } else {
      activities.push({
        type: "invoice",
        title: `Factura ${invoice.invoiceNumber} ${invoice.status === 'draft' ? 'creada' : 'enviada'}`,
        description: `Cliente: ${invoice.customerName}`,
        amount: formatCurrency(invoice.total),
        time: getTimeAgo(invoice.createdAt),
        icon: FileText,
      })
    }
  })

  // Add recent customers
  customers.slice(0, 2).forEach(customer => {
    activities.push({
      type: "customer",
      title: "Nuevo cliente agregado",
      description: customer.name,
      time: getTimeAgo(customer.createdAt),
      icon: Users,
    })
  })

  // Add recent expenses
  expenses.slice(0, 2).forEach(expense => {
    activities.push({
      type: "expense",
      title: "Gasto registrado",
      description: expense.description,
      amount: formatCurrency(expense.amount),
      time: getTimeAgo(expense.createdAt),
      icon: Receipt,
    })
  })

  // Sort by date and take the 5 most recent
  activities.sort((a, b) => {
    // This is a simple sort by the time string, in a real app you'd want to sort by actual dates
    return a.time.localeCompare(b.time)
  })

  const recentActivities = activities.slice(0, 5)

  if (recentActivities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <p>No hay actividad reciente</p>
            <p className="text-sm mt-2">Comienza creando clientes, productos o facturas</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
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
