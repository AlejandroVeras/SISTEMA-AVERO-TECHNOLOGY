"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, MoreVertical, Edit, FileDown, CheckCircle, XCircle, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Quote } from "@/lib/data/quotes"
import { useRouter } from "next/navigation"
import { deleteQuote, updateQuoteStatus, convertQuoteToInvoice } from "@/lib/data/quotes"
import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { toast } from "sonner"

const statusConfig = {
  draft: { label: "Borrador", variant: "secondary" as const },
  sent: { label: "Enviada", variant: "outline" as const },
  approved: { label: "Aprobada", variant: "default" as const }, // Assuming default is primary/brand
  rejected: { label: "Rechazada", variant: "destructive" as const },
}

interface QuotesListProps {
  quotes: Quote[]
}

export function QuotesList({ quotes }: QuotesListProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [isConverting, setIsConverting] = useState(false)

  async function handleDelete() {
    if (!deleteId) return

    setDeleting(true)
    const res = await deleteQuote(deleteId)
    setDeleting(false)
    setDeleteId(null)
    
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Cotización eliminada")
      router.refresh()
    }
  }

  async function handleStatusChange(id: string, status: Quote["status"]) {
    const res = await updateQuoteStatus(id, status)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(`Estado actualizado a ${statusConfig[status].label}`)
      router.refresh()
    }
  }

  async function handleConvertToInvoice(id: string) {
    if (!confirm("¿Convertir esta cotización en factura? Esto creará una nueva factura en estado Borrador.")) return;
    
    setIsConverting(true)
    const res = await convertQuoteToInvoice(id)
    setIsConverting(false)
    
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Cotización convertida a factura exitosamente")
      if (res.id) {
        router.push(`/dashboard/invoices/${res.id}`)
      } else {
        router.refresh()
      }
    }
  }

  if (quotes.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium">No hay cotizaciones</h3>
          <p className="text-muted-foreground max-w-sm mt-1">
            Comienza creando una cotización para enviar propuestas profesionales a tus clientes.
          </p>
          <Button className="mt-6" onClick={() => router.push("/dashboard/quotes/new")}>
            Crear Primera Cotización
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quotes.map((quote) => {
          const config = statusConfig[quote.status]
          
          return (
            <Card key={quote.id} className="overflow-hidden hover:border-primary/50 transition-colors">
              <CardContent className="p-0">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-muted-foreground">{quote.quoteNumber}</span>
                        <Badge variant={config.variant} className={quote.status === "approved" ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
                          {config.label}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg line-clamp-1">{quote.customerName}</h3>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/quotes/${quote.id}`)}>
                          <Edit className="h-4 w-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/quotes/${quote.id}`)}>
                          <FileDown className="h-4 w-4 mr-2" /> Ver PDF
                        </DropdownMenuItem>
                        
                        {(quote.status === "approved" || quote.status === "sent") && (
                          <DropdownMenuItem onClick={() => handleConvertToInvoice(quote.id)} disabled={isConverting}>
                            <ArrowRight className="h-4 w-4 mr-2 text-primary" /> Convertir a Factura
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator />
                        
                        {quote.status !== "approved" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(quote.id, "approved")}>
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Marcar Aprobada
                          </DropdownMenuItem>
                        )}
                        {quote.status !== "rejected" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(quote.id, "rejected")}>
                            <XCircle className="h-4 w-4 mr-2 text-red-500" /> Marcar Rechazada
                          </DropdownMenuItem>
                        )}
                        {quote.status !== "sent" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(quote.id, "sent")}>
                            <FileText className="h-4 w-4 mr-2 text-blue-500" /> Marcar Enviada
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setDeleteId(quote.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fecha:</span>
                      <span className="font-medium">
                        {format(new Date(quote.issueDate + "T00:00:00"), "d MMM, yyyy", { locale: es })}
                      </span>
                    </div>
                    {quote.validUntil && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Válida hasta:</span>
                        <span className="font-medium">
                          {format(new Date(quote.validUntil + "T00:00:00"), "d MMM, yyyy", { locale: es })}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items:</span>
                      <span className="font-medium">{quote.items.length}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/50 p-4 border-t flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Total</span>
                  <span className="text-lg font-bold">
                    DOP {quote.total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cotización?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La cotización será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
