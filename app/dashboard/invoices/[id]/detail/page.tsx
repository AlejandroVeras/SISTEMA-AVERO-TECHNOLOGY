import { redirect, notFound } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getInvoice } from "@/lib/data/invoices"
import { getPayments, createPayment } from "@/lib/data/payments" // Importamos lógica de pagos
import { DashboardHeader } from "@/components/dashboard-header"
import { InvoicePDF } from "@/components/invoice-pdf"
import { PaymentReceiptPDF } from "@/components/payment-receipt-pdf" // Importamos el recibo
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Edit, PlusCircle, CreditCard } from "lucide-react"
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

  // Obtener historial de pagos
  const payments = await getPayments(id)
  
  // Cálculos de balance
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const balanceDue = Math.max(0, invoice.total - totalPaid)
  const isFullyPaid = balanceDue < 1 // Margen de error pequeño

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
    if (status === "paid") return "bg-green-100 text-green-800"
    if (status === "cancelled") return "bg-gray-100 text-gray-800"
    if (balanceDue > 0 && totalPaid > 0) return "bg-blue-100 text-blue-800" // Parcial
    if (status === "overdue") return "bg-red-100 text-red-800"
    return "bg-yellow-100 text-yellow-800"
  }

  function getStatusLabel(status: string) {
    if (status === "paid") return "Pagada"
    if (status === "cancelled") return "Cancelada"
    if (balanceDue > 0 && totalPaid > 0) return "Pago Parcial"
    if (status === "overdue") return "Vencida"
    if (status === "sent") return "Enviada"
    return "Borrador"
  }

  // Server Action para registrar pago desde el formulario
  async function registerPayment(formData: FormData) {
    "use server"
    const amount = Number(formData.get("amount"))
    const date = formData.get("date") as string
    const method = formData.get("method") as string
    const reference = formData.get("reference") as string
    
    if (amount > 0) {
      await createPayment({
        invoiceId: invoice!.id,
        amount,
        date,
        method,
        reference
      })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />
      <main className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Cabecera */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/invoices">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Factura {invoice.invoiceNumber}</h1>
              <p className="text-slate-600 mt-1">Gestión de Cobranza</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isFullyPaid && invoice.status !== 'cancelled' && (
               <Dialog>
               <DialogTrigger asChild>
                 <Button>
                   <PlusCircle className="h-4 w-4 mr-2" />
                   Registrar Pago
                 </Button>
               </DialogTrigger>
               <DialogContent>
                 <DialogHeader>
                   <DialogTitle>Registrar Nuevo Pago</DialogTitle>
                 </DialogHeader>
                 <form action={registerPayment} className="space-y-4 pt-4">
                   <div className="space-y-2">
                     <Label>Monto a Pagar (Pendiente: {formatCurrency(balanceDue)})</Label>
                     <Input 
                       name="amount" 
                       type="number" 
                       step="0.01" 
                       max={balanceDue} 
                       defaultValue={balanceDue}
                       required 
                     />
                   </div>
                   <div className="space-y-2">
                     <Label>Fecha de Pago</Label>
                     <Input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                   </div>
                   <div className="space-y-2">
                     <Label>Método de Pago</Label>
                     <Select name="method" defaultValue="Efectivo">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Efectivo">Efectivo</SelectItem>
                          <SelectItem value="Transferencia">Transferencia</SelectItem>
                          <SelectItem value="Tarjeta">Tarjeta de Crédito</SelectItem>
                          <SelectItem value="Cheque">Cheque</SelectItem>
                        </SelectContent>
                     </Select>
                   </div>
                   <div className="space-y-2">
                     <Label>Referencia / Nota (Opcional)</Label>
                     <Input name="reference" placeholder="Ej. #Transacción 1234" />
                   </div>
                   <div className="pt-4 flex justify-end">
                      <Button type="submit">Guardar Pago</Button>
                   </div>
                 </form>
               </DialogContent>
             </Dialog>
            )}
            
            <Button variant="outline" asChild>
              <Link href={`/dashboard/invoices/${invoice.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna Izquierda: Detalles Factura */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Detalle de Factura</CardTitle>
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

                {/* Tabla de Items */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold text-slate-700">Desc.</th>
                        <th className="text-right p-3 text-sm font-semibold text-slate-700">Cant.</th>
                        <th className="text-right p-3 text-sm font-semibold text-slate-700">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-3 text-slate-900 text-sm">{item.description}</td>
                          <td className="p-3 text-right text-slate-700 text-sm">{item.quantity}</td>
                          <td className="p-3 text-right text-slate-900 font-medium text-sm">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between text-sm text-slate-700">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    {invoice.discount > 0 && (
                      <div className="flex justify-between text-sm text-red-600">
                        <span>Descuento:</span>
                        <span>-{formatCurrency(invoice.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-slate-700">
                      <span>ITBIS:</span>
                      <span>{formatCurrency(invoice.itbis)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t">
                      <span>Total Factura:</span>
                      <span>{formatCurrency(invoice.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <InvoicePDF invoice={invoice} businessName={user.businessName} businessEmail={user.email} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna Derecha: Pagos y Balance */}
          <div className="space-y-6">
            {/* Tarjeta de Balance */}
            <Card className={`${isFullyPaid ? 'bg-green-50 border-green-200' : 'bg-slate-50'}`}>
               <CardContent className="pt-6 text-center">
                  <p className="text-sm font-medium text-slate-600 uppercase tracking-wider mb-1">Balance Pendiente</p>
                  <h2 className={`text-3xl font-bold ${isFullyPaid ? 'text-green-700' : 'text-slate-900'}`}>
                    {formatCurrency(balanceDue)}
                  </h2>
                  <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between text-sm">
                     <span className="text-slate-600">Total Pagado:</span>
                     <span className="font-semibold text-green-700">{formatCurrency(totalPaid)}</span>
                  </div>
               </CardContent>
            </Card>

            {/* Historial de Pagos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                   <CreditCard className="h-4 w-4" />
                   Historial de Pagos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {payments.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No hay pagos registrados.</p>
                 ) : (
                    payments.map((payment) => (
                       <div key={payment.id} className="flex flex-col gap-2 border-b last:border-0 pb-3 last:pb-0">
                          <div className="flex justify-between items-start">
                             <div>
                                <p className="font-bold text-slate-900">{formatCurrency(payment.amount)}</p>
                                <p className="text-xs text-slate-500">{formatDate(payment.date)} • {payment.method}</p>
                             </div>
                             <PaymentReceiptPDF 
                                payment={payment} 
                                invoice={invoice} 
                                businessName={user.businessName} 
                                balanceDue={balanceDue} // Enviamos el balance actual para referencia
                             />
                          </div>
                          {payment.reference && (
                             <p className="text-xs text-slate-600 bg-slate-100 p-1 rounded">Ref: {payment.reference}</p>
                          )}
                       </div>
                    ))
                 )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}