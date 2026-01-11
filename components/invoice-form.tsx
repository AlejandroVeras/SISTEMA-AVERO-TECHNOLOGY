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
import { createInvoice, updateInvoice, type Invoice } from "@/lib/data/invoices"
import type { Customer } from "@/lib/data/customers"
import type { Product } from "@/lib/data/products"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

interface InvoiceFormProps {
  invoice?: Invoice
  customers: Customer[]
  products: Product[]
}

interface InvoiceItemForm {
  productId?: string
  description: string
  quantity: number
  unitPrice: number
}

export function InvoiceForm({ invoice, customers, products }: InvoiceFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const [customerId, setCustomerId] = useState(invoice?.customerId || "")
  const [customerName, setCustomerName] = useState(invoice?.customerName || "")
  const [issueDate, setIssueDate] = useState(invoice?.issueDate || new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = useState(invoice?.dueDate || "")
  const [status, setStatus] = useState(invoice?.status || "draft")
  const [notes, setNotes] = useState(invoice?.notes || "")
  
  // Estado para controlar si se aplica ITBIS (si editamos, verificamos si tenía impuestos)
  const [applyItbis, setApplyItbis] = useState(invoice ? invoice.itbis > 0 : true)

  const [items, setItems] = useState<InvoiceItemForm[]>(
    invoice?.items.map((item) => ({
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

  function updateItem(index: number, field: keyof InvoiceItemForm, value: string | number) {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  function selectProduct(index: number, productId: string) {
    const product = products.find((p) => p.id === productId)
    if (product) {
      updateItem(index, "productId", productId)
      updateItem(index, "description", product.name)
      updateItem(index, "unitPrice", product.price)
    }
  }

  function selectCustomer(customerId: string) {
    const customer = customers.find((c) => c.id === customerId)
    if (customer) {
      setCustomerId(customerId)
      setCustomerName(customer.name)
    }
  }

  // Cálculos de totales
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const itbis = applyItbis ? subtotal * 0.18 : 0
  const total = subtotal + itbis

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
        dueDate: dueDate || undefined,
        status: status as "draft" | "sent" | "paid" | "overdue" | "cancelled",
        notes: notes || undefined,
        applyItbis: applyItbis, // Enviamos el estado del checkbox al servidor
        items: items.filter((item) => item.description && item.quantity > 0 && item.unitPrice > 0),
      }

      const result = invoice ? await updateInvoice(invoice.id, data) : await createInvoice(data)

      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        // Fix de congelamiento: Refrescar antes de navegar
        router.refresh()
        router.push("/dashboard/invoices")
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
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">{error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Cliente</Label>
                <Select value={customerId} onValueChange={selectCustomer} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
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
                <Label htmlFor="customerName">Nombre del Cliente *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre del cliente"
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
                <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={status} onValueChange={setStatus} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="sent">Enviada</SelectItem>
                    <SelectItem value="paid">Pagada</SelectItem>
                    <SelectItem value="overdue">Vencida</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Items</CardTitle>
            <Button type="button" size="sm" variant="outline" onClick={addItem} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-start p-4 border rounded-lg">
                <div className="col-span-12 md:col-span-4">
                  <Label className="text-xs">Producto</Label>
                  <Select
                    value={item.productId || ""}
                    onValueChange={(value) => selectProduct(index, value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-12 md:col-span-4">
                  <Label className="text-xs">Descripción *</Label>
                  <Input
                    className="mt-1"
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    placeholder="Descripción"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="col-span-4 md:col-span-1">
                  <Label className="text-xs">Cant.</Label>
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
                  <Label className="text-xs">Precio</Label>
                  <Input
                    className="mt-1"
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, "unitPrice", Number.parseFloat(e.target.value))}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="col-span-1 flex items-end justify-end">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeItem(index)}
                    disabled={loading || items.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-2 pt-4 border-t">
              {/* Checkbox para controlar el ITBIS */}
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
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">ITBIS (18%):</span>
                <span className="font-medium">{formatCurrency(itbis)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notas Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Términos y condiciones, información adicional..."
              disabled={loading}
              rows={4}
            />
          </CardContent>
        </Card>

        <Card>
          <CardFooter className="flex justify-between pt-6">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/invoices">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : invoice ? "Actualizar Factura" : "Crear Factura"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  )
}
