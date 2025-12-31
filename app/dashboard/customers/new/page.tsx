import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard-header"
import { CustomerForm } from "@/components/customer-form"

export default async function NewCustomerPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />
      <main className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Nuevo Cliente</h1>
          <p className="text-slate-600 mt-1">Agrega un nuevo cliente a tu base de datos</p>
        </div>

        <CustomerForm />
      </main>
    </div>
  )
}
