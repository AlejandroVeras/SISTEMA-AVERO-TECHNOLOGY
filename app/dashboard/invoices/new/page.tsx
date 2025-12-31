import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getCustomers } from "@/lib/data/customers"
import { getProducts } from "@/lib/data/products"
import { DashboardHeader } from "@/components/dashboard-header"
import { InvoiceForm } from "@/components/invoice-form"

export default async function NewInvoicePage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const [customers, products] = await Promise.all([getCustomers(), getProducts()])

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />
      <main className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Nueva Factura</h1>
          <p className="text-slate-600 mt-1">Crea una nueva factura para tus clientes</p>
        </div>

        <InvoiceForm customers={customers} products={products} />
      </main>
    </div>
  )
}
