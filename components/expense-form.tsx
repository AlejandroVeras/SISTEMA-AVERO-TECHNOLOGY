"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createExpense, updateExpense, type Expense, getExpenseCategories } from "@/lib/data/expenses"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ExpenseFormProps {
  expense?: Expense
}

export function ExpenseForm({ expense }: ExpenseFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    async function loadCategories() {
      const cats = await getExpenseCategories()
      setCategories(cats)
    }
    loadCategories()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)

    const result = expense ? await updateExpense(expense.id, formData) : await createExpense(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push("/dashboard/expenses")
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6 space-y-4">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select name="category" defaultValue={expense?.category} required disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                disabled={loading}
                defaultValue={expense?.date || new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descripción *</Label>
              <Input
                id="description"
                name="description"
                type="text"
                placeholder="Descripción del gasto"
                required
                disabled={loading}
                defaultValue={expense?.description}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Monto (RD$) *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
                disabled={loading}
                defaultValue={expense?.amount}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Método de Pago</Label>
              <Select name="paymentMethod" defaultValue={expense?.paymentMethod} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                  <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                  <SelectItem value="Tarjeta de Débito">Tarjeta de Débito</SelectItem>
                  <SelectItem value="Transferencia">Transferencia</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Información adicional sobre el gasto"
                disabled={loading}
                defaultValue={expense?.notes}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/expenses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancelar
            </Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : expense ? "Actualizar Gasto" : "Registrar Gasto"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
