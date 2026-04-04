import { redirect, notFound } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getQuote } from "@/lib/data/quotes"
import { getCustomers } from "@/lib/data/customers"
import { getProducts } from "@/lib/data/products"
import { getProfile } from "@/lib/data/profile"
import { QuoteForm } from "@/components/quote-form"
import { QuotePDF } from "@/components/quote-pdf"

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const { id } = await params
  const [quote, customers, products, profile] = await Promise.all([getQuote(id), getCustomers(), getProducts(), getProfile()])

  if (!quote || !profile) {
    notFound()
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Cotización</h1>
          <p className="text-muted-foreground mt-1">Modifica los detalles de la cotización {quote.quoteNumber}</p>
        </div>
        <QuotePDF quote={quote} profile={profile} />
      </div>

      <QuoteForm quote={quote} customers={customers} products={products} />
    </div>
  )
}

