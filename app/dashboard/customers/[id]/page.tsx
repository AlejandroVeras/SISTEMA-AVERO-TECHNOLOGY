import { redirect, notFound } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getCustomer } from "@/lib/data/customers"
import { getFinancingPayments } from "@/lib/data/financing-payments"
import { DashboardHeader } from "@/components/dashboard-header"
import { CustomerForm } from "@/components/customer-form"
import { FinancingPaymentForm } from "@/components/financing-payment-form"
import { FinancingPaymentList } from "@/components/financing-payment-list"
import { CustomerFinancing } from "@/components/customer-financing"

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

  const financingPayments = customer.financingAvailable ? await getFinancingPayments(id) : []

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />
      <main className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Editar Cliente</h1>
          <p className="text-slate-600 mt-1">Actualiza la información del cliente</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CustomerForm customer={customer} />
          </div>

          {customer.financingAvailable && (
            <div className="space-y-6">
              <CustomerFinancing customer={customer} />
            </div>
          )}
        </div>

        {customer.financingAvailable && (
          <div className="space-y-6">
            <FinancingPaymentForm customer={customer} />
            <FinancingPaymentList 
              payments={financingPayments}
              customerName={customer.name}
              customerEmail={customer.email}
            />
          </div>
        )}
      </main>
    </div>
  )
}
