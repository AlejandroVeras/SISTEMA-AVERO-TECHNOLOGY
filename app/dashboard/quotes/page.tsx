import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getQuotes } from "@/lib/data/quotes"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { QuotesList } from "@/components/quotes-list"

export default async function QuotesPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const quotes = await getQuotes()

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cotizaciones</h1>
          <p className="text-muted-foreground mt-1">Crea y administra las propuestas para tus clientes</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/quotes/new">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cotización
          </Link>
        </Button>
      </div>

      <QuotesList quotes={quotes} />
    </div>
  )
}
