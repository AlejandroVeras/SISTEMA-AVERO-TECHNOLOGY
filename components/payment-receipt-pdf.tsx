"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import type { Payment } from "@/lib/data/payments"
import type { Invoice } from "@/lib/data/invoices"

interface PaymentReceiptPDFProps {
  payment: Payment
  invoice: Invoice
  businessName: string
  balanceDue: number
}

export function PaymentReceiptPDF({ payment, invoice, businessName, balanceDue }: PaymentReceiptPDFProps) {
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

  function generatePDF() {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Comprobante de Pago</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .subtitle { color: #666; }
            .amount-box { background: #f8fafc; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .amount-label { font-size: 14px; color: #666; text-transform: uppercase; }
            .amount-value { font-size: 32px; font-weight: bold; color: #166534; margin-top: 5px; }
            .details { margin-top: 30px; }
            .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #555; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${businessName}</div>
            <div class="subtitle">Comprobante de Pago</div>
          </div>

          <div class="amount-box">
            <div class="amount-label">Monto Pagado</div>
            <div class="amount-value">${formatCurrency(payment.amount)}</div>
          </div>

          <div class="details">
            <div class="row">
              <span class="label">Fecha de Pago:</span>
              <span>${formatDate(payment.date)}</span>
            </div>
            <div class="row">
              <span class="label">Factura Aplicada:</span>
              <span>${invoice.invoiceNumber}</span>
            </div>
            <div class="row">
              <span class="label">Método:</span>
              <span>${payment.method}</span>
            </div>
            ${payment.reference ? `
            <div class="row">
              <span class="label">Referencia:</span>
              <span>${payment.reference}</span>
            </div>` : ''}
            
            <div class="row" style="margin-top: 20px; border-top: 2px solid #333;">
              <span class="label">Total Factura:</span>
              <span>${formatCurrency(invoice.total)}</span>
            </div>
            <div class="row">
              <span class="label">Balance Pendiente:</span>
              <span>${formatCurrency(balanceDue)}</span>
            </div>
          </div>

          <div class="footer">
            <p>Gracias por su pago.</p>
            <p>Generado el ${new Date().toLocaleDateString('es-DO')}</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 250)
  }

  return (
    <Button onClick={generatePDF} size="sm" variant="ghost">
      <Printer className="h-4 w-4 mr-2" />
      Imprimir
    </Button>
  )
}