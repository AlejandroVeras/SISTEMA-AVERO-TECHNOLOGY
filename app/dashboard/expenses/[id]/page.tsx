import { redirect, notFound } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getExpense } from "@/lib/data/expenses"

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
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Editar Gasto</h1>
          <p className="text-muted-foreground mt-1">Actualiza la información del gasto</p>
        </div>

        <ExpenseForm expense={expense} />
      </main>
    </div>
  )
}
