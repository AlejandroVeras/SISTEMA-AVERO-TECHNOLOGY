import { redirect, notFound } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getInvoice } from "@/lib/data/invoices"
import { getPayments, createPayment } from "@/lib/data/payments"
import { DashboardHeader } from "@/components/dashboard-header"
import { InvoicePDF } from "@/components/invoice-pdf"
import { PaymentReceiptPDF } from "@/components/payment-receipt-pdf"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Edit, CreditCard, History } from "lucide-react"
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

  const payments = await getPayments(id)
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const balanceDue = Math.max(0, invoice.total - totalPaid)
  const isFullyPaid = balanceDue < 1

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
      <main className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Encabezado Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/invoices">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{invoice.invoiceNumber}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isFullyPaid ? "default" : "outline"} className={isFullyPaid ? "bg-green-600" : ""}>
                  {isFullyPaid ? "Pagada" : `Pendiente: ${formatCurrency(balanceDue)}`}
                </Badge>
                <span className="text-slate-500 text-sm">• {invoice.customerName}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/invoices/${invoice.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Factura
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna Izquierda: Información y Productos (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalles de la Transacción</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-slate-500">Fecha de Emisión</p>
                    <p className="font-medium">{formatDate(invoice.issueDate)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500">Vencimiento</p>
                    <p className="font-medium">{invoice.dueDate ? formatDate(invoice.dueDate) : "N/A"}</p>
                  </div>
                </div>

                <div className="border rounded-lg overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="p-3 font-semibold">Descripción</th>
                        <th className="p-3 text-right font-semibold">Cant.</th>
                        <th className="p-3 text-right font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {invoice.items.map((item) => (
                        <tr key={item.id}>
                          <td className="p-3">{item.description}</td>
                          <td className="p-3 text-right">{item.quantity}</td>
                          <td className="p-3 text-right font-medium">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-4">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Subtotal</span>
                      <span>{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    {invoice.discount > 0 && (
                      <div className="flex justify-between text-sm text-red-600">
                        <span>Descuento</span>
                        <span>-{formatCurrency(invoice.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>ITBIS (18%)</span>
                      <span>{formatCurrency(invoice.itbis)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2 text-slate-900">
                      <span>Total</span>
                      <span>{formatCurrency(invoice.total)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t flex justify-center">
                   <InvoicePDF invoice={invoice} businessName={user.businessName} businessEmail={user.email} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna Derecha: Pagos y Caja (1/3) */}
          <div className="space-y-6">
            
            {/* Formulario de Pago Rápido */}
            {!isFullyPaid && (
              <Card className="border-blue-200 bg-blue-50/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    Registrar Pago
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form action={registerPayment} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Monto a abonar</Label>
                      <Input 
                        name="amount" 
                        type="number" 
                        step="0.01" 
                        max={balanceDue} 
                        defaultValue={balanceDue}
                        className="bg-white"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="method">Método</Label>
                      <Select name="method" defaultValue="Efectivo">
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Efectivo">Efectivo</SelectItem>
                          <SelectItem value="Transferencia">Transferencia</SelectItem>
                          <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Input name="date" type="hidden" value={new Date().toISOString().split('T')[0]} />
                    <div className="space-y-2">
                      <Label htmlFor="reference">Referencia</Label>
                      <Input name="reference" placeholder="Opcional" className="bg-white" />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                      Aplicar Pago
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Historial de Cuotas/Pagos */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5 text-slate-500" />
                  Historial de Pagos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {payments.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4 italic">No hay pagos registrados aún.</p>
                ) : (
                  <div className="space-y-3">
                    {payments.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900">{formatCurrency(p.amount)}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-semibold">{p.method} • {new Date(p.date).toLocaleDateString()}</p>
                        </div>
                        <PaymentReceiptPDF 
                          payment={p} 
                          invoice={invoice} 
                          businessName={user.businessName} 
                          balanceDue={balanceDue} 
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="pt-4 mt-4 border-t space-y-2 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Total Pagado:</span>
                    <span className="text-green-600 font-bold">{formatCurrency(totalPaid)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 text-base">
                    <span>Balance Pendiente:</span>
                    <span className={balanceDue > 0 ? "text-red-600" : "text-green-600"}>
                      {formatCurrency(balanceDue)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}