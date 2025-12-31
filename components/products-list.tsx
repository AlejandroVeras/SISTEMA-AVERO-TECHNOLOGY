"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Package } from "lucide-react"
import type { Product } from "@/lib/data/products"
import { useRouter } from "next/navigation"
import { deleteProduct } from "@/lib/data/products"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ProductsListProps {
  products: Product[]
}

export function ProductsList({ products }: ProductsListProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!deleteId) return

    setDeleting(true)
    await deleteProduct(deleteId)
    setDeleting(false)
    setDeleteId(null)
    router.refresh()
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(amount)
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-slate-600">No hay productos registrados aún</p>
          <Button className="mt-4" onClick={() => router.push("/dashboard/products/new")}>
            Agregar Primer Producto
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="h-6 w-6 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-slate-900 truncate">{product.name}</h3>
                    {product.sku && <p className="text-sm text-slate-600">SKU: {product.sku}</p>}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => router.push(`/dashboard/products/${product.id}`)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleteId(product.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {product.description && <p className="text-sm text-slate-600 line-clamp-2">{product.description}</p>}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Precio:</span>
                  <span className="font-bold text-lg text-slate-900">{formatCurrency(product.price)}</span>
                </div>

                {product.cost && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Costo:</span>
                    <span className="text-sm text-slate-900">{formatCurrency(product.cost)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  {product.category && <Badge variant="secondary">{product.category}</Badge>}
                  {product.trackInventory && (
                    <Badge variant={product.stockQuantity > 0 ? "default" : "destructive"}>
                      Stock: {product.stockQuantity}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
