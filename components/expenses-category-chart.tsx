"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CategoryExpense } from "@/lib/data/reports"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface ExpensesCategoryChartProps {
  data: CategoryExpense[]
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function ExpensesCategoryChart({ data }: ExpensesCategoryChartProps) {
  function formatCurrency(value: number) {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(value)
  }

  // Take top 5 categories
  const topCategories = data.slice(0, 5)

  if (topCategories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gastos por Categoría</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-slate-500">No hay gastos registrados</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Categoría (Top 5)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={topCategories}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ category, percentage }) => `${category} (${percentage.toFixed(0)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
            >
              {topCategories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-4 space-y-2">
          {topCategories.map((category, index) => (
            <div key={category.category} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-slate-700">{category.category}</span>
              </div>
              <span className="font-semibold text-slate-900">{formatCurrency(category.amount)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
