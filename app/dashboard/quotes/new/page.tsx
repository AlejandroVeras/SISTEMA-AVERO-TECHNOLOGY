import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getCustomers } from "@/lib/data/customers"
import { getProducts } from "@/lib/data/products"
import { QuoteForm } from "@/components/quote-form"

export default async function NewQuotePage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const [customers, products] = await Promise.all([getCustomers(), getProducts()])

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nueva Cotización</h1>
        <p className="text-muted-foreground mt-1">Crea una nueva propuesta para tus clientes</p>
      </div>

      <QuoteForm customers={customers} products={products} />
    </div>
  )
}
