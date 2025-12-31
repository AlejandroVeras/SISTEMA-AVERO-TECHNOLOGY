import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getFinancialSummary, getMonthlyData, getExpensesByCategory } from "@/lib/data/reports"
import { DashboardHeader } from "@/components/dashboard-header"
import { FinancialSummaryCards } from "@/components/financial-summary-cards"
import { MonthlyChart } from "@/components/monthly-chart"
import { ExpensesCategoryChart } from "@/components/expenses-category-chart"

export default async function ReportsPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const [summary, monthlyData, categoryExpenses] = await Promise.all([
    getFinancialSummary(),
    getMonthlyData(6),
    getExpensesByCategory(),
  ])

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reportes y Análisis</h1>
          <p className="text-slate-600 mt-1">Visualiza el desempeño financiero de tu negocio</p>
        </div>

        <FinancialSummaryCards summary={summary} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyChart data={monthlyData} />
          <ExpensesCategoryChart data={categoryExpenses} />
        </div>
      </main>
    </div>
  )
}
