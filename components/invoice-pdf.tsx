"use client"

import { Button } from "@/components/ui/button"
import { Download, Mail } from "lucide-react"
import type { Invoice } from "@/lib/data/invoices"

import type { Profile } from "@/lib/data/profile"

interface InvoicePDFProps {
  invoice: Invoice
  profile: Profile
}

export function InvoicePDF({ invoice, profile }: InvoicePDFProps) {
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
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; background: white; }
            .invoice-container { max-width: 800px; margin: 0 auto; }
            
            /* Modern Header Design */
            .header { display: flex; justify-content: space-between; margin-bottom: 50px; padding-bottom: 25px; border-bottom: 3px solid #f1f5f9; }
            .company-info h1 { color: #0f172a; font-size: 32px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 8px; }
            .company-info p { color: #64748b; font-size: 14px; margin: 4px 0; }
            
            .invoice-info { text-align: right; }
            .invoice-info h2 { color: #10b981; font-size: 36px; font-weight: 900; letter-spacing: 2px; margin-bottom: 12px; }
            .invoice-info p { margin: 4px 0; color: #475569; font-size: 14px;}
            .invoice-info strong { color: #0f172a; }
            
            .status-badge { display: inline-block; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: bold; margin-top: 10px; letter-spacing: 0.5px; text-transform: uppercase; }
            .status-paid { background: #dcfce7; color: #166534; }
            .status-sent { background: #e0f2fe; color: #0369a1; }
            .status-draft { background: #f1f5f9; color: #475569; }
            .status-overdue { background: #fee2e2; color: #991b1b; }
            .status-cancelled { background: #f3f4f6; color: #374151; }
            
            /* Client and Date Details */
            .details { display: flex; justify-content: space-between; margin-bottom: 40px; background: #f8fafc; padding: 25px; border-radius: 12px; }
            .details-section { flex: 1; }
            .details-section h3 { color: #94a3b8; font-size: 12px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
            .details-section p { margin: 6px 0; color: #334155; font-size: 15px; }
            .details-section strong { color: #0f172a; }
            
            /* Table Modernization */
            table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 40px; }
            thead th { background: #0f172a; color: white; text-align: left; padding: 14px 16px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
            thead th:first-child { border-top-left-radius: 8px; border-bottom-left-radius: 8px; }
            thead th:last-child { border-top-right-radius: 8px; border-bottom-right-radius: 8px; }
            
            tbody td { padding: 16px; font-size: 14px; color: #334155; border-bottom: 1px solid #f1f5f9; }
            tbody tr:last-child td { border-bottom: none; }
            .text-right { text-align: right; }
            
            /* Totals Section */
            .totals-container { display: flex; justify-content: flex-end; }
            .totals { width: 350px; background: #f8fafc; padding: 25px; border-radius: 12px; }
            .totals-row { display: flex; justify-content: space-between; padding: 10px 0; }
            .totals-row.subtotal { color: #64748b; font-size: 14px; }
            .totals-row.discount { color: #ef4444; font-size: 14px; }
            .totals-row.tax { color: #64748b; font-size: 14px; }
            .totals-row.total { border-top: 2px dashed #cbd5e1; margin-top: 10px; padding-top: 15px; font-size: 20px; font-weight: 800; color: #10b981; }
            
            /* Notes Section */
            .notes { margin-top: 40px; padding: 25px; border-left: 4px solid #10b981; background: #ecfdf5; border-radius: 0 12px 12px 0; }
            .notes h3 { color: #047857; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
            .notes p { color: #064e3b; line-height: 1.6; font-size: 14px; }
            
            /* Footer */
            .footer { margin-top: 60px; padding-top: 30px; border-top: 1px solid #f1f5f9; text-align: center; color: #94a3b8; font-size: 13px; }
            .footer strong { color: #64748b; }
            
            @media print { 
              body { padding: 0; } 
              .invoice-container { max-width: 100%; } 
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="company-info">
                <h1>${profile.businessName}</h1>
                ${profile.taxId ? `<p><strong>RNC:</strong> ${profile.taxId}</p>` : ''}
                ${profile.phone ? `<p><strong>Teléfono:</strong> ${profile.phone}</p>` : ''}
                ${profile.address ? `<p><strong>Dirección:</strong> ${profile.address}</p>` : ''}
                ${profile.website ? `<p><strong>Web:</strong> ${profile.website}</p>` : ''}
                <p><strong>Email:</strong> ${profile.email}</p>
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
              <div class="details-section" style="text-align: right;">
                <h3>Fechas</h3>
                <p><strong>Emisión:</strong> ${formatDate(invoice.issueDate)}</p>
                ${invoice.dueDate ? `<p><strong>Vencimiento:</strong> ${formatDate(invoice.dueDate)}</p>` : ''}
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
                    <td class="text-right"><strong>${formatCurrency(item.total)}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals-container">
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
                  <span>Total a Pagar:</span>
                  <span>${formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>

            ${invoice.notes ? `
              <div class="notes">
                <h3>Notas</h3>
                <p>${invoice.notes.replace(/\n/g, '<br/>')}</p>
              </div>
            ` : ''}

            <div class="footer">
              <p>Gracias por su preferencia</p>
              <p style="margin-top: 8px;"><strong>Factura emitida el:</strong> ${new Date().toLocaleDateString('es-DO')}</p>
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
    const subject = encodeURIComponent(`Factura ${invoice.invoiceNumber} de ${profile.businessName}`)
    const body = encodeURIComponent(
      `Estimado/a ${invoice.customerName},\n\n` +
      `Adjunto encontrará la factura ${invoice.invoiceNumber} por un monto de ${formatCurrency(invoice.total)}.\n\n` +
      `Fecha de emisión: ${formatDate(invoice.issueDate)}\n` +
      (invoice.dueDate ? `Fecha de vencimiento: ${formatDate(invoice.dueDate)}\n\n` : '\n') +
      `Gracias por su preferencia.\n\n` +
      `Saludos,\n${profile.businessName}`
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
