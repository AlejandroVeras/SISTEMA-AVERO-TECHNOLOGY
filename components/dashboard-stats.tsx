import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, FileText, Users, TrendingUp } from "lucide-react"
import { getInvoices } from "@/lib/data/invoices"
import { getCustomers } from "@/lib/data/customers"
import { getExpenses } from "@/lib/data/expenses"

export async function DashboardStats() {
  const [invoices, customers, expenses] = await Promise.all([
    getInvoices(),
    getCustomers(),
    getExpenses()
  ])

  // Calculate current month's income from paid invoices
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const currentMonthInvoices = invoices.filter(inv => {
    const invoiceDate = new Date(inv.issueDate)
    return invoiceDate >= currentMonthStart && inv.status === 'paid'
  })
  
  const monthlyIncome = currentMonthInvoices.reduce((sum, inv) => sum + inv.total, 0)
  
  // Calculate pending invoices
  const pendingInvoices = invoices.filter(inv => 
    inv.status === 'sent' || inv.status === 'overdue'
  )
  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0)
  
  // Calculate current month's expenses
  const currentMonthExpenses = expenses.filter(exp => {
    const expenseDate = new Date(exp.date)
    return expenseDate >= currentMonthStart
  })
  const monthlyExpenseTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  
  // Calculate net profit
  const netProfit = monthlyIncome - monthlyExpenseTotal
  
  // Count active customers (customers with at least one invoice)
  const activeCustomerIds = new Set(invoices.map(inv => inv.customerId).filter(Boolean))
  const activeCustomers = activeCustomerIds.size

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(amount)
  }

  const stats = [
    {
      title: "Ingresos del Mes",
      value: formatCurrency(monthlyIncome),
      change: monthlyIncome > 0 ? `${currentMonthInvoices.length} facturas` : "Sin ingresos",
      icon: DollarSign,
      positive: monthlyIncome > 0,
    },
    {
      title: "Facturas Pendientes",
      value: pendingInvoices.length.toString(),
      change: formatCurrency(pendingAmount),
      icon: FileText,
      positive: false,
    },
    {
      title: "Clientes Activos",
      value: activeCustomers.toString(),
      change: `${customers.length} total`,
      icon: Users,
      positive: true,
    },
    {
      title: "Ganancia Neta",
      value: formatCurrency(netProfit),
      change: netProfit >= 0 ? "Utilidad del mes" : "Pérdida del mes",
      icon: TrendingUp,
      positive: netProfit >= 0,
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
