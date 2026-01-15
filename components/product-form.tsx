"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { createProduct, updateProduct, type Product } from "@/lib/data/products"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ProductFormProps {
  product?: Product
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)
  // Por defecto, TODOS los productos tracken inventario (true)
  const [trackInventory, setTrackInventory] = useState(product?.trackInventory !== false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new FormData(e.currentTarget)
      // Ajustar valor del checkbox manual si es necesario, 
      // pero FormData suele capturarlo si tiene 'name' y está checked.
      // Aseguramos que 'trackInventory' sea booleano para el formData si el backend lo requiere estricto
      if (!formData.get("trackInventory")) {
        formData.append("trackInventory", "false")
      }

      const result = product ? await updateProduct(product.id, formData) : await createProduct(formData)

      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        router.refresh()
        router.push("/dashboard/products")
      }
    } catch (err) {
      console.error(err)
      setError("Error al guardar el producto")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6 space-y-4">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nombre del Producto *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Nombre del producto o servicio"
                required
                disabled={loading}
                defaultValue={product?.name}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Descripción del producto o servicio"
                disabled={loading}
                defaultValue={product?.description}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU / Código</Label>
              <Input
                id="sku"
                name="sku"
                type="text"
                placeholder="SKU-001"
                disabled={loading}
                defaultValue={product?.sku}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                name="category"
                type="text"
                placeholder="Ej: Servicios, Hardware"
                disabled={loading}
                defaultValue={product?.category}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio de Venta (RD$) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
                disabled={loading}
                defaultValue={product?.price}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Costo (RD$)</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                disabled={loading}
                defaultValue={product?.cost}
              />
            </div>

            <div className="space-y-3 md:col-span-2 pt-2">
              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Checkbox
                  id="trackInventory"
                  name="trackInventory"
                  checked={trackInventory}
                  onCheckedChange={(checked) => setTrackInventory(checked as boolean)}
                  disabled={loading}
                />
                <div className="flex-1">
                  <Label htmlFor="trackInventory" className="cursor-pointer font-semibold">
                    ✓ Controlar inventario automáticamente
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Desactiva esto solo si el stock es ilimitado o no lo necesitas controlar
                  </p>
                </div>
              </div>
            </div>

            {trackInventory && (
              <div className="space-y-2 md:col-span-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <Label htmlFor="stockQuantity" className="font-semibold">
                  📦 Cantidad disponible en Stock
                </Label>
                <Input
                  id="stockQuantity"
                  name="stockQuantity"
                  type="number"
                  min="0"
                  placeholder="0"
                  disabled={loading}
                  defaultValue={product?.stockQuantity || 0}
                  className="border-green-300"
                />
                <p className="text-xs text-gray-600">
                  Esta cantidad se reducirá automáticamente cuando hagas una venta
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancelar
            </Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : product ? "Actualizar Producto" : "Crear Producto"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
