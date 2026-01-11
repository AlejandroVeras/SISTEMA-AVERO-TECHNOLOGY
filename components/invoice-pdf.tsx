"use client"

import { Button } from "@/components/ui/button"
import { Download, Mail } from "lucide-react"
import type { Invoice } from "@/lib/data/invoices"

interface InvoicePDFProps {
  invoice: Invoice
  businessName: string
  businessEmail: string
}

export function InvoicePDF({ invoice, businessName, businessEmail }: InvoicePDFProps) {
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
          <title>Factura ${invoice.invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .invoice-container { max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #1e293b; }
            .company-info h1 { color: #1e293b; font-size: 28px; margin-bottom: 10px; }
            .company-info p { color: #64748b; margin: 4px 0; }
            .invoice-info { text-align: right; }
            .invoice-info h2 { color: #1e293b; font-size: 32px; margin-bottom: 10px; }
            .invoice-info p { margin: 4px 0; }
            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-top: 8px; }
            .status-paid { background: #dcfce7; color: #166534; }
            .status-sent { background: #dbeafe; color: #1e40af; }
            .status-draft { background: #fef3c7; color: #92400e; }
            .status-overdue { background: #fee2e2; color: #991b1b; }
            .status-cancelled { background: #f3f4f6; color: #374151; }
            .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .details-section { flex: 1; }
            .details-section h3 { color: #1e293b; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
            .details-section p { margin: 6px 0; color: #475569; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            thead { background: #f8fafc; }
            th { text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
            .text-right { text-align: right; }
            .totals { margin-left: auto; width: 300px; }
            .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .totals-row.subtotal { color: #64748b; font-size: 14px; }
            .totals-row.discount { color: #ef4444; font-size: 14px; } /* Estilo para descuento */
            .totals-row.tax { color: #64748b; font-size: 14px; }
            .totals-row.total { border-top: 2px solid #1e293b; margin-top: 8px; padding-top: 12px; font-size: 18px; font-weight: bold; color: #1e293b; }
            .notes { margin-top: 40px; padding: 20px; background: #f8fafc; border-radius: 8px; }
            .notes h3 { color: #1e293b; margin-bottom: 10px; font-size: 14px; }
            .notes p { color: #475569; line-height: 1.6; }
            .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; }
            @media print { body { padding: 20px; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="company-info">
                <h1>${businessName}</h1>
                <p>${businessEmail}</p>
              </div>
              <div class="invoice-info">
                <h2>FACTURA</h2>
                <p><strong>${invoice.invoiceNumber}</strong></p>
                <span class="status-badge status-${invoice.status}">
                  ${invoice.status === 'paid' ? 'PAGADA' : 
                    invoice.status === 'sent' ? 'ENVIADA' : 
                    invoice.status === 'draft' ? 'BORRADOR' : 
                    invoice.status === 'overdue' ? 'VENCIDA' : 'CANCELADA'}
                </span>
              </div>
            </div>

            <div class="details">
              <div class="details-section">
                <h3>Facturado a</h3>
                <p><strong>${invoice.customerName}</strong></p>
              </div>
              <div class="details-section">
                <h3>Fechas</h3>
                <p><strong>Fecha de emisión:</strong> ${formatDate(invoice.issueDate)}</p>
                ${invoice.dueDate ? `<p><strong>Fecha de vencimiento:</strong> ${formatDate(invoice.dueDate)}</p>` : ''}
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th class="text-right">Cantidad</th>
                  <th class="text-right">Precio Unit.</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr>
                    <td>${item.description}</td>
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                    <td class="text-right">${formatCurrency(item.total)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals">
              <div class="totals-row subtotal">
                <span>Subtotal:</span>
                <span>${formatCurrency(invoice.subtotal)}</span>
              </div>
              
              ${invoice.discount > 0 ? `
              <div class="totals-row discount">
                <span>Descuento:</span>
                <span>-${formatCurrency(invoice.discount)}</span>
              </div>` : ''}

              <div class="totals-row tax">
                <span>ITBIS (18%):</span>
                <span>${formatCurrency(invoice.itbis)}</span>
              </div>
              <div class="totals-row total">
                <span>Total:</span>
                <span>${formatCurrency(invoice.total)}</span>
              </div>
            </div>

            ${invoice.notes ? `
              <div class="notes">
                <h3>Notas</h3>
                <p>${invoice.notes}</p>
              </div>
            ` : ''}

            <div class="footer">
              <p>Gracias por su preferencia</p>
              <p>Esta factura fue generada el ${new Date().toLocaleDateString('es-DO')}</p>
            </div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    
    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  function sendEmail() {
    const subject = encodeURIComponent(`Factura ${invoice.invoiceNumber}`)
    const body = encodeURIComponent(
      `Estimado/a ${invoice.customerName},\n\n` +
      `Adjunto encontrará la factura ${invoice.invoiceNumber} por un monto de ${formatCurrency(invoice.total)}.\n\n` +
      `Fecha de emisión: ${formatDate(invoice.issueDate)}\n` +
      (invoice.dueDate ? `Fecha de vencimiento: ${formatDate(invoice.dueDate)}\n\n` : '\n') +
      `Gracias por su preferencia.\n\n` +
      `Saludos,\n${businessName}`
    )
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return (
    <div className="flex gap-2">
      <Button onClick={generatePDF} variant="outline">
        <Download className="h-4 w-4 mr-2" />
        Descargar PDF
      </Button>
      <Button onClick={sendEmail} variant="outline">
        <Mail className="h-4 w-4 mr-2" />
        Enviar por Email
      </Button>
    </div>
  )
}
