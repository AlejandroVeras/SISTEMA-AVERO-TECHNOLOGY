import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getCustomers } from "@/lib/data/customers"
import { DashboardHeader } from "@/components/dashboard-header"
import { CustomersList } from "@/components/customers-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function CustomersPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const customers = await getCustomers()

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
            <p className="text-slate-600 mt-1">Gestiona tus clientes y contactos</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/customers/new">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Link>
          </Button>
        </div>

        <CustomersList customers={customers} />
      </main>
    </div>
  )
}
