"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { deleteFinancingPayment, type FinancingPayment } from "@/lib/data/financing-payments"
import { Trash2, Download, FileText } from "lucide-react"
import html2pdf from "html2pdf.js"

interface FinancingPaymentListProps {
  payments: FinancingPayment[]
  customerName: string
  customerEmail?: string
}

const paymentMethodLabels: Record<string, string> = {
  cash: "Efectivo",
  check: "Cheque",
  transfer: "Transferencia",
  card: "Tarjeta",
  other: "Otro",
}

export function FinancingPaymentList({ payments, customerName, customerEmail }: FinancingPaymentListProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(amount)
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("es-DO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  async function handleDelete() {
    if (!deleteId) return

    setDeleting(true)
    // Asumiendo que tenemos acceso a customerId, pero por ahora usaremos la ruta
    // Necesitarías pasar customerId como prop
    setDeleting(false)
    setDeleteId(null)
  }

  function generatePDF(payment: FinancingPayment) {
    const element = document.createElement("div")
    element.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="text-align: center; margin-bottom: 30px;">COMPROBANTE DE PAGO</h2>
        
        <div style="margin-bottom: 20px;">
          <p><strong>Cliente:</strong> ${customerName}</p>
          ${customerEmail ? `<p><strong>Email:</strong> ${customerEmail}</p>` : ""}
          <p><strong>Fecha de Pago:</strong> ${formatDate(payment.date)}</p>
        </div>

        <div style="border-top: 2px solid #333; border-bottom: 2px solid #333; padding: 20px 0; margin: 20px 0;">
          <p style="font-size: 18px; margin: 0;"><strong>Monto Pagado:</strong></p>
          <p style="font-size: 24px; color: #2563eb; margin: 10px 0;">${formatCurrency(payment.amount)}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <p><strong>Método de Pago:</strong> ${paymentMethodLabels[payment.paymentMethod] || payment.paymentMethod}</p>
          ${payment.reference ? `<p><strong>Referencia:</strong> ${payment.reference}</p>` : ""}
          ${payment.notes ? `<p><strong>Notas:</strong> ${payment.notes}</p>` : ""}
        </div>

        <div style="margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; font-size: 12px;">
          <p style="margin: 5px 0;">Este comprobante acredita el pago del monto indicado contra el financiamiento otorgado.</p>
          <p style="margin: 5px 0;">Generado: ${new Date().toLocaleString("es-DO")}</p>
          <p style="margin: 5px 0;">ID: ${payment.id}</p>
        </div>
      </div>
    `

    html2pdf().set({
      margin: 10,
      filename: `comprobante-pago-${payment.id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    }).save(element)
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No hay pagos registrados aún</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-lg text-green-600">{formatCurrency(payment.amount)}</span>
                    <Badge variant="outline">{paymentMethodLabels[payment.paymentMethod] || payment.paymentMethod}</Badge>
                  </div>
                  <div className="text-sm text-slate-600">
                    <p>{formatDate(payment.date)}</p>
                    {payment.reference && <p className="text-xs">Ref: {payment.reference}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generatePDF(payment)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Comprobante
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteId(payment.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar pago?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El monto será devuelto a la deuda del cliente.
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
