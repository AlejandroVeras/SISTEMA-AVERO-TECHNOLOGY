"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { FinancialSummary, MonthlyData, CategoryExpense } from "@/lib/data/reports"

interface ExportReportsButtonProps {
  summary: FinancialSummary
  monthlyData: MonthlyData[]
  categoryExpenses: CategoryExpense[]
}

export function ExportReportsButton({ summary, monthlyData, categoryExpenses }: ExportReportsButtonProps) {
  function handleExport() {
    // Preparamos las filas del CSV
    const rows = [
      ["REPORTE FINANCIERO GENERADO EL", new Date().toLocaleDateString("es-DO")],
      [""],
      ["RESUMEN GENERAL"],
      ["Concepto", "Valor"],
      ["Ingresos Totales", summary.totalIncome],
      ["Gastos Totales", summary.totalExpenses],
      ["Ganancia Neta", summary.netProfit],
      ["Facturas Pagadas (Cant.)", summary.paidInvoices],
      ["Monto Cobrado", summary.paidAmount],
      ["Facturas Pendientes (Cant.)", summary.pendingInvoices],
      ["Monto por Cobrar", summary.pendingAmount],
      [""],
      ["DESEMPEÑO MENSUAL (Últimos 6 meses)"],
      ["Mes", "Ingresos", "Gastos", "Ganancia"],
      ...monthlyData.map((m) => [m.month, m.income, m.expenses, m.profit]),
      [""],
      ["GASTOS POR CATEGORÍA"],
      ["Categoría", "Monto", "Porcentaje"],
      ...categoryExpenses.map((c) => [c.category, c.amount, `${c.percentage.toFixed(2)}%`]),
    ]

    // Convertimos a string CSV
    const csvContent = rows
      .map((row) => row.map((cell) => `"${cell}"`).join(",")) // Envolvemos en comillas para evitar errores con comas
      .join("\n")

    // Creamos el archivo Blob con BOM para que Excel reconozca tildes y caracteres especiales
    const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `reporte_financiero_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button onClick={handleExport} variant="outline" className="w-full sm:w-auto">
      <Download className="h-4 w-4 mr-2" />
      Exportar Reporte
    </Button>
  )
}
