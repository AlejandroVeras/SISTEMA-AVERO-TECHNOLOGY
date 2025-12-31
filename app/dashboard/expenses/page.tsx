import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getExpenses } from "@/lib/data/expenses"
import { DashboardHeader } from "@/components/dashboard-header"
import { ExpensesList } from "@/components/expenses-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function ExpensesPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const expenses = await getExpenses()

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gastos</h1>
            <p className="text-slate-600 mt-1">Registra y controla los gastos de tu negocio</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/expenses/new">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Gasto
            </Link>
          </Button>
        </div>

        <ExpensesList expenses={expenses} />
      </main>
    </div>
  )
}
