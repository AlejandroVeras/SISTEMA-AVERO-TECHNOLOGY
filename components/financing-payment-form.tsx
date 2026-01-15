"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createFinancingPayment, type FinancingPayment } from "@/lib/data/financing-payments"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Trash2, Download } from "lucide-react"
import type { Customer } from "@/lib/data/customers"

interface FinancingPaymentFormProps {
  customer: Customer
}

export function FinancingPaymentForm({ customer }: FinancingPaymentFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  // Form state
  const [amount, setAmount] = useState<number>(0)
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")

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
      if (amount <= 0) {
        setError("El monto debe ser mayor a 0")
        setLoading(false)
        return
      }

      if (amount > customer.financingUsed) {
        setError(`El pago no puede exceder la deuda actual (${formatCurrency(customer.financingUsed)})`)
        setLoading(false)
        return
      }

      const result = await createFinancingPayment({
        customerId: customer.id,
        amount,
        date,
        paymentMethod,
        reference: reference || undefined,
        notes: notes || undefined,
      })

      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        // Reset form
        setAmount(0)
        setDate(new Date().toISOString().split("T")[0])
        setPaymentMethod("cash")
        setReference("")
        setNotes("")
        setShowForm(false)
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      setError("Ocurrió un error al procesar el pago")
      setLoading(false)
    }
  }

  if (!customer.financingAvailable) {
    return null
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Registrar Pago de Financiamiento</CardTitle>
          {!showForm && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              Agregar Pago
            </Button>
          )}
        </CardHeader>

        {showForm && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Monto a Pagar (DOP) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={customer.financingUsed}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="0.00"
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-slate-600">
                    Deuda actual: {formatCurrency(customer.financingUsed)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Fecha de Pago *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Método de Pago *</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="check">Cheque</SelectItem>
                      <SelectItem value="transfer">Transferencia</SelectItem>
                      <SelectItem value="card">Tarjeta</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">Referencia (Ej: #Cheque, Comprobante)</Label>
                  <Input
                    id="reference"
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Referencia del pago"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observaciones adicionales..."
                  rows={3}
                  disabled={loading}
                />
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button type="submit" disabled={loading}>
                  {loading ? "Procesando..." : "Registrar Pago"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
