import { redirect, notFound } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getInvoice } from "@/lib/data/invoices"
import { DashboardHeader } from "@/components/dashboard-header"
import { InvoicePDF } from "@/components/invoice-pdf"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const { id } = await params
  const invoice = await getInvoice(id)

  if (!invoice) {
    notFound()
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
      month: "long",
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

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />
      <main className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/invoices">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Factura {invoice.invoiceNumber}</h1>
              <p className="text-slate-600 mt-1">Detalles de la factura</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/invoices/${invoice.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Información de la Factura</CardTitle>
              <Badge className={getStatusColor(invoice.status)}>{getStatusLabel(invoice.status)}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-sm text-slate-600 mb-2">Cliente</h3>
                <p className="text-slate-900 font-medium">{invoice.customerName}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-600 mb-2">Fechas</h3>
                <p className="text-sm text-slate-700">
                  <strong>Emisión:</strong> {formatDate(invoice.issueDate)}
                </p>
                {invoice.dueDate && (
                  <p className="text-sm text-slate-700">
                    <strong>Vencimiento:</strong> {formatDate(invoice.dueDate)}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-slate-600 mb-3">Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">Descripción</th>
                      <th className="text-right p-3 text-sm font-semibold text-slate-700">Cantidad</th>
                      <th className="text-right p-3 text-sm font-semibold text-slate-700">Precio Unit.</th>
                      <th className="text-right p-3 text-sm font-semibold text-slate-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-3 text-slate-900">{item.description}</td>
                        <td className="p-3 text-right text-slate-700">{item.quantity}</td>
                        <td className="p-3 text-right text-slate-700">{formatCurrency(item.unitPrice)}</td>
                        <td className="p-3 text-right text-slate-900 font-medium">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-sm text-slate-700">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                
                {/* MOSTRAR DESCUENTO SI EXISTE */}
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-sm text-red-600 font-medium">
                    <span>Descuento:</span>
                    <span>-{formatCurrency(invoice.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-slate-700">
                  <span>ITBIS (18%):</span>
                  <span>{formatCurrency(invoice.itbis)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>

            {invoice.notes && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-sm text-slate-600 mb-2">Notas</h3>
                <p className="text-slate-700 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <InvoicePDF invoice={invoice} businessName={user.businessName} businessEmail={user.email} />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
