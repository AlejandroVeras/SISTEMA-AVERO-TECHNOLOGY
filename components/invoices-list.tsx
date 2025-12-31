"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, FileText, Eye } from "lucide-react"
import type { Invoice } from "@/lib/data/invoices"
import { useRouter } from "next/navigation"
import { deleteInvoice } from "@/lib/data/invoices"
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

interface InvoicesListProps {
  invoices: Invoice[]
}

export function InvoicesList({ invoices }: InvoicesListProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!deleteId) return

    setDeleting(true)
    try {
      await deleteInvoice(deleteId)
      setDeleteId(null)
      router.refresh()
    } catch (error) {
      console.error("Error al eliminar factura", error)
    } finally {
      setDeleting(false)
    }
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

  function getStatusColor(status: string) {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "paid":
        return "Pagada"
      case "sent":
        return "Enviada"
      case "overdue":
        return "Vencida"
      case "cancelled":
        return "Cancelada"
      default:
        return "Borrador"
    }
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-slate-600">No hay facturas registradas aún</p>
          <Button className="mt-4" onClick={() => router.push("/dashboard/invoices/new")}>
            Crear Primera Factura
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {invoices.map((invoice) => (
          <Card key={invoice.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-slate-900">{invoice.invoiceNumber}</h3>
                      <Badge className={getStatusColor(invoice.status)}>{getStatusLabel(invoice.status)}</Badge>
                    </div>
                    <p className="text-slate-600 mb-1">{invoice.customerName}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span>Emitida: {formatDate(invoice.issueDate)}</span>
                      {invoice.dueDate && <span>Vence: {formatDate(invoice.dueDate)}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Total</p>
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(invoice.total)}</p>
                  </div>
                  <div className="flex gap-1">
                    {/* Botón para ver detalle y acceder a exportar */}
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Ver detalle y exportar"
                      onClick={() => router.push(`/dashboard/invoices/${invoice.id}/detail`)}
                    >
                      <Eye className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Editar"
                      onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteId(invoice.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar factura?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La factura será eliminada permanentemente.
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
