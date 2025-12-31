import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getProducts } from "@/lib/data/products"
import { DashboardHeader } from "@/components/dashboard-header"
import { ProductsList } from "@/components/products-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function ProductsPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const products = await getProducts()

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Productos y Servicios</h1>
            <p className="text-slate-600 mt-1">Administra tu catálogo de productos y servicios</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Link>
          </Button>
        </div>

        <ProductsList products={products} />
      </main>
    </div>
  )
}
