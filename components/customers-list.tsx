"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, Edit, Trash2, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Customer } from "@/lib/data/customers"
import { useRouter } from "next/navigation"
import { deleteCustomer } from "@/lib/data/customers"
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

interface CustomersListProps {
  customers: Customer[]
}

export function CustomersList({ customers }: CustomersListProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!deleteId) return

    setDeleting(true)
    await deleteCustomer(deleteId)
    setDeleting(false)
    setDeleteId(null)
    router.refresh()
  }

  if (customers.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-slate-600">No hay clientes registrados aún</p>
          <Button className="mt-4" onClick={() => router.push("/dashboard/customers/new")}>
            Agregar Primer Cliente
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((customer) => {
          const financingPercentage = customer.financingLimit > 0 
            ? (customer.financingUsed / customer.financingLimit) * 100 
            : 0

          return (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-900">{customer.name}</h3>
                    <div className="flex gap-2 mt-1">
                      {customer.rnc && <p className="text-xs text-slate-600">RNC: {customer.rnc}</p>}
                      {customer.financingAvailable && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Financiamiento
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteId(customer.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="h-4 w-4" />
                      <span>{customer.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="h-4 w-4" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-2">{customer.address}</span>
                    </div>
                  )}
                </div>

                {customer.financingAvailable && (
                  <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Financiamiento</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Usado</span>
                        <span className="font-semibold">{customer.financingUsed.toFixed(0)} DOP</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Límite</span>
                        <span className="font-semibold">{customer.financingLimit.toFixed(0)} DOP</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            financingPercentage >= 100 ? "bg-red-500" : financingPercentage >= 75 ? "bg-yellow-500" : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(financingPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El cliente será eliminado permanentemente.
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
