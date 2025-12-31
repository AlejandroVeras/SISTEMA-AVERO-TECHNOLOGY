"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { MonthlyData } from "@/lib/data/reports"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface MonthlyChartProps {
  data: MonthlyData[]
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  function formatCurrency(value: number) {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
      notation: "compact",
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos vs Gastos (Últimos 6 Meses)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis tickFormatter={formatCurrency} className="text-xs" />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="income" fill="hsl(var(--chart-1))" name="Ingresos" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expenses" fill="hsl(var(--chart-5))" name="Gastos" radius={[8, 8, 0, 0]} />
            <Bar dataKey="profit" fill="hsl(var(--chart-3))" name="Ganancia" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
