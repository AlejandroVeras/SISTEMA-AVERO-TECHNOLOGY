import { redirect, notFound } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getExpense } from "@/lib/data/expenses"
import { DashboardHeader } from "@/components/dashboard-header"
import { ExpenseForm } from "@/components/expense-form"

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const { id } = await params
  const expense = await getExpense(id)

  if (!expense) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />
      <main className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Editar Gasto</h1>
          <p className="text-slate-600 mt-1">Actualiza la información del gasto</p>
        </div>

        <ExpenseForm expense={expense} />
      </main>
    </div>
  )
}
