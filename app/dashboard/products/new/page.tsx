import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard-header"
import { ProductForm } from "@/components/product-form"

export default async function NewProductPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />
      <main className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Nuevo Producto</h1>
          <p className="text-slate-600 mt-1">Agrega un nuevo producto o servicio a tu catálogo</p>
        </div>

        <ProductForm />
      </main>
    </div>
  )
}
