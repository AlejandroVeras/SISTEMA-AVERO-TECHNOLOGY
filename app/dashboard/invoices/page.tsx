import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getInvoices } from "@/lib/data/invoices"
import { DashboardHeader } from "@/components/dashboard-header"
import { InvoicesList } from "@/components/invoices-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function InvoicesPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const invoices = await getInvoices()

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Facturas</h1>
            <p className="text-slate-600 mt-1">Administra tus facturas y pagos</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/invoices/new">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Factura
            </Link>
          </Button>
        </div>

        <InvoicesList invoices={invoices} />
      </main>
    </div>
  )
}
