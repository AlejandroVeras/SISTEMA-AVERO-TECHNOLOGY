import { redirect, notFound } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getCustomer } from "@/lib/data/customers"
import { DashboardHeader } from "@/components/dashboard-header"
import { CustomerForm } from "@/components/customer-form"

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const { id } = await params
  const customer = await getCustomer(id)

  if (!customer) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />
      <main className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Editar Cliente</h1>
          <p className="text-slate-600 mt-1">Actualiza la información del cliente</p>
        </div>

        <CustomerForm customer={customer} />
      </main>
    </div>
  )
}
