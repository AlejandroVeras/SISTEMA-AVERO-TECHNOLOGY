"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createQuote, updateQuote, type Quote } from "@/lib/data/quotes"
import type { Customer } from "@/lib/data/customers"
import type { Product } from "@/lib/data/products"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface QuoteFormProps {
  quote?: Quote
  customers: Customer[]
  products: Product[]
}

interface QuoteItemForm {
  productId?: string
  description: string
  quantity: number
  unitPrice: number
}

export function QuoteForm({ quote, customers, products }: QuoteFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const [customerId, setCustomerId] = useState(quote?.customerId || "")
  const [customerName, setCustomerName] = useState(quote?.customerName || "")
  const [issueDate, setIssueDate] = useState(quote?.issueDate || new Date().toISOString().split("T")[0])
  const [validUntil, setValidUntil] = useState(quote?.validUntil || "")
  const [status, setStatus] = useState(quote?.status || "draft")
  const [notes, setNotes] = useState(quote?.notes || "")
  
  const [discount, setDiscount] = useState<number>(quote?.discount || 0)
  const [applyItbis, setApplyItbis] = useState(quote ? quote.itbis > 0 : true)

  const [items, setItems] = useState<QuoteItemForm[]>(
    quote?.items.map((item) => ({
      productId: item.productId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })) || [{ description: "", quantity: 1, unitPrice: 0 }],
  )

  function addItem() {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }])
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: keyof QuoteItemForm, value: string | number) {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  function selectProduct(index: number, productId: string) {
    const product = products.find((p) => p.id === productId)
    if (product) {
      const updated = [...items]
      updated[index] = {
        ...updated[index],
        productId: productId,
        description: product.name,
        unitPrice: product.price,
      }
      setItems(updated)
    }
  }

  function selectCustomer(customerId: string) {
    const customer = customers.find((c) => c.id === customerId)
    if (customer) {
      setCustomerId(customerId)
      setCustomerName(customer.name)
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const taxableAmount = Math.max(0, subtotal - discount)
  const itbis = applyItbis ? taxableAmount * 0.18 : 0
  const total = taxableAmount + itbis

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(amount)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const data = {
        customerId: customerId || undefined,
        customerName,
        issueDate,
        validUntil: validUntil || undefined,
        status: status as "draft" | "sent" | "approved" | "rejected",
        notes: notes || undefined,
        applyItbis,
        discount,
        items: items.filter((item) => item.description && item.quantity > 0 && item.unitPrice > 0),
      }

      const result = quote ? await updateQuote(quote.id, data) : await createQuote(data)

      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        toast.success(quote ? "Cotización actualizada" : "Cotización creada")
        router.refresh()
        router.push("/dashboard/quotes")
      }
    } catch (err) {
      console.error(err)
      setError("Ocurrió un error inesperado al guardar.")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">{error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Cliente Registrado</Label>
                <Select value={customerId} onValueChange={selectCustomer} disabled={loading}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar cliente (Opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerName">A nombre de (Cliente) *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre de la empresa o persona"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issueDate">Fecha de Emisión *</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">Válida hasta</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  disabled={loading}
                  title="Fecha de expiración de esta cotización"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado de Cotización</Label>
                <Select value={status} onValueChange={setStatus} disabled={loading}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="sent">Enviada al Cliente</SelectItem>
                    <SelectItem value="approved">Aprobada</SelectItem>
                    <SelectItem value="rejected">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Productos y Servicios</CardTitle>
            <Button type="button" size="sm" variant="outline" onClick={addItem} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-start p-4 bg-muted/20 border rounded-lg">
                <div className="col-span-12 md:col-span-4">
                  <Label className="text-xs font-semibold">Catálogo</Label>
                  <Select
                    value={item.productId || ""}
                    onValueChange={(value) => selectProduct(index, value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="mt-1 border-2">
                      <SelectValue placeholder="Seleccionar producto..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex gap-2">
                            <span>{product.name}</span>
                            <span className="text-muted-foreground text-xs">({formatCurrency(product.price)})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-12 md:col-span-4">
                  <Label className="text-xs font-semibold">Descripción *</Label>
                  <Input
                    className="mt-1"
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    placeholder="Descripción manual"
                    required
                    disabled={loading || !!item.productId}
                  />
                </div>

                <div className="col-span-4 md:col-span-1">
                  <Label className="text-xs font-semibold">Cant.</Label>
                  <Input
                    className="mt-1"
                    type="number"
                    min="1"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", Number.parseFloat(e.target.value))}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="col-span-6 md:col-span-2">
                  <Label className="text-xs font-semibold">Precio U.</Label>
                  <div className="mt-1">
                    {item.productId ? (
                      <div className="p-2 bg-primary/10 rounded border border-primary/20 text-sm font-semibold flex justify-between items-center h-9">
                        <span>{formatCurrency(item.unitPrice)}</span>
                      </div>
                    ) : (
                      <Input
                        className="h-9"
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, "unitPrice", Number.parseFloat(e.target.value))}
                        placeholder="0.00"
                        required
                        disabled={loading}
                      />
                    )}
                  </div>
                </div>

                <div className="col-span-2 md:col-span-1 flex items-end justify-end pb-1 md:pb-0 h-full">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeItem(index)}
                    disabled={loading || items.length === 1}
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-2 pt-4 border-t mt-6">
              <div className="flex items-center space-x-2 pb-2 border-b mb-2">
                <Checkbox 
                  id="applyItbis" 
                  checked={applyItbis} 
                  onCheckedChange={(checked) => setApplyItbis(checked as boolean)} 
                  disabled={loading}
                />
                <Label htmlFor="applyItbis" className="text-sm font-medium cursor-pointer">Aplicar ITBIS (18%)</Label>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="flex justify-between text-sm items-center">
                <Label htmlFor="discount" className="text-muted-foreground">Descuento (DOP):</Label>
                <div className="w-32">
                   <Input
                    id="discount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(Number.parseFloat(e.target.value) || 0)}
                    className="h-8 text-right"
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Importe Gravable:</span>
                <span className="font-medium">{formatCurrency(taxableAmount)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ITBIS (18%):</span>
                <span className="font-medium">{formatCurrency(itbis)}</span>
              </div>
              
              <div className="flex justify-between text-lg font-bold pt-4 border-t mt-2">
                <span>Total Cotizado:</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Términos y condiciones, detalles de entrega, información adicional..."
              disabled={loading}
              rows={4}
              className="resize-none"
            />
          </CardContent>
        </Card>

        <Card className="bg-muted/50 border-transparent shadow-none">
          <CardFooter className="flex justify-between pt-6 px-0 pl-4 w-full">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/quotes">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={loading} size="lg">
              {loading ? "Guardando..." : quote ? "Actualizar Cotización" : "Crear Cotización"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  )
}
