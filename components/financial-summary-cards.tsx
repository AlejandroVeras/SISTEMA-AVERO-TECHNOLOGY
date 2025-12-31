"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Clock } from "lucide-react"
import type { FinancialSummary } from "@/lib/data/reports"

interface FinancialSummaryCardsProps {
  summary: FinancialSummary
}

export function FinancialSummaryCards({ summary }: FinancialSummaryCardsProps) {
  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(amount)
  }

  const cards = [
    {
      title: "Ingresos Totales",
      value: formatCurrency(summary.totalIncome),
      subtitle: `${summary.paidInvoices} facturas pagadas`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Gastos Totales",
      value: formatCurrency(summary.totalExpenses),
      subtitle: "Total de gastos registrados",
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Ganancia Neta",
      value: formatCurrency(summary.netProfit),
      subtitle: summary.netProfit >= 0 ? "Utilidad del período" : "Pérdida del período",
      icon: DollarSign,
      color: summary.netProfit >= 0 ? "text-blue-600" : "text-red-600",
      bgColor: summary.netProfit >= 0 ? "bg-blue-100" : "bg-red-100",
    },
    {
      title: "Facturas Pendientes",
      value: `${summary.pendingInvoices}`,
      subtitle: formatCurrency(summary.pendingAmount),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">{card.title}</CardTitle>
            <div className={`${card.bgColor} p-2 rounded-lg`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <p className="text-xs text-slate-600 mt-1">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
