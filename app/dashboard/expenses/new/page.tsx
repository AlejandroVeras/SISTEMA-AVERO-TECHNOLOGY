import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"

import { ExpenseForm } from "@/components/expense-form"

export default async function NewExpensePage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">

      <main className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nuevo Gasto</h1>
          <p className="text-muted-foreground mt-1">Registra un nuevo gasto de negocio</p>
        </div>

        <ExpenseForm />
      </main>
    </div>
  )
}

