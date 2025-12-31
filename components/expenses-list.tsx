"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Receipt } from "lucide-react"
import type { Expense } from "@/lib/data/expenses"
import { useRouter } from "next/navigation"
import { deleteExpense } from "@/lib/data/expenses"
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

interface ExpensesListProps {
  expenses: Expense[]
}

export function ExpensesList({ expenses }: ExpensesListProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!deleteId) return

    setDeleting(true)
    await deleteExpense(deleteId)
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

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("es-DO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Group expenses by month
  const groupedExpenses = expenses.reduce(
    (groups, expense) => {
      const date = new Date(expense.date)
      const monthYear = date.toLocaleDateString("es-DO", { year: "numeric", month: "long" })

      if (!groups[monthYear]) {
        groups[monthYear] = []
      }
      groups[monthYear].push(expense)
      return groups
    },
    {} as Record<string, Expense[]>,
  )

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-slate-600">No hay gastos registrados aún</p>
          <Button className="mt-4" onClick={() => router.push("/dashboard/expenses/new")}>
            Registrar Primer Gasto
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {Object.entries(groupedExpenses).map(([monthYear, monthExpenses]) => {
          const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0)

          return (
            <div key={monthYear}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-slate-900 capitalize">{monthYear}</h2>
                <Badge variant="secondary" className="text-base">
                  {formatCurrency(monthTotal)}
                </Badge>
              </div>

              <div className="space-y-3">
                {monthExpenses.map((expense) => (
                  <Card key={expense.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Receipt className="h-5 w-5 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900">{expense.description}</h3>
                              <Badge variant="outline" className="text-xs">
                                {expense.category}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-600">
                              <span>{formatDate(expense.date)}</span>
                              {expense.paymentMethod && <span>• {expense.paymentMethod}</span>}
                            </div>
                            {expense.notes && (
                              <p className="text-sm text-slate-500 mt-1 line-clamp-1">{expense.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-900">{formatCurrency(expense.amount)}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => router.push(`/dashboard/expenses/${expense.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setDeleteId(expense.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar gasto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El gasto será eliminado permanentemente.
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
