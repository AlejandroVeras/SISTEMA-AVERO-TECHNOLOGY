import { redirect, notFound } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getProduct } from "@/lib/data/products"

import { ProductForm } from "@/components/product-form"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Editar Producto</h1>
          <p className="text-muted-foreground mt-1">Actualiza la información del producto</p>
        </div>

        <ProductForm product={product} />
      </main>
    </div>
  )
}
