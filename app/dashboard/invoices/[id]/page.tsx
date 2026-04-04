import { redirect, notFound } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getInvoice } from "@/lib/data/invoices"
import { getCustomers } from "@/lib/data/customers"
import { getProducts } from "@/lib/data/products"

import { InvoiceForm } from "@/components/invoice-form"

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const { id } = await params
  const [invoice, customers, products] = await Promise.all([getInvoice(id), getCustomers(), getProducts()])

  if (!invoice) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Editar Factura</h1>
          <p className="text-muted-foreground mt-1">Actualiza la información de la factura</p>
        </div>

        <InvoiceForm invoice={invoice} customers={customers} products={products} />
      </main>
    </div>
  )
}
