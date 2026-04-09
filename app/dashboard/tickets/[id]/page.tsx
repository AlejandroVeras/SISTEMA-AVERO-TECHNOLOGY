import { redirect, notFound } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getTicket, getTicketMessages } from "@/lib/data/tickets"
import { TicketForm } from "@/components/ticket-form"
import { TicketMessages } from "@/components/ticket-messages"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Mail, Phone, Monitor, Hash, Clock, Calendar } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

const statusLabels: Record<string, string> = {
  open: "Abierto", in_progress: "En Proceso", resolved: "Resuelto", closed: "Cerrado",
}
const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300",
}
const priorityLabels: Record<string, string> = {
  low: "🟢 Baja", medium: "🟡 Media", high: "🟠 Alta", urgent: "🔴 Urgente",
}

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  if (!user) redirect("/login")

  const { id } = await params
  const ticket = await getTicket(id)
  if (!ticket) notFound()

  const messages = await getTicketMessages(id)

  function formatDate(d: string) {
    return new Date(d).toLocaleString("es-DO", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/tickets"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{ticket.subject}</h1>
            <Badge className={statusColors[ticket.status]}>{statusLabels[ticket.status]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{priorityLabels[ticket.priority]} • Creado {formatDate(ticket.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info + Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader><CardTitle>Descripción</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Messages / Notes */}
          <TicketMessages ticketId={id} messages={messages} />
        </div>

        {/* Right: Sidebar info */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Información</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4 shrink-0" />
                <span className="font-medium text-foreground">{ticket.customerName}</span>
              </div>
              {ticket.customerEmail && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>{ticket.customerEmail}</span>
                </div>
              )}
              {ticket.customerPhone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{ticket.customerPhone}</span>
                </div>
              )}
              {ticket.deviceModel && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Monitor className="h-4 w-4 shrink-0" />
                  <span>{ticket.deviceModel}</span>
                </div>
              )}
              {ticket.serialNumber && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="h-4 w-4 shrink-0" />
                  <span className="font-mono text-xs">{ticket.serialNumber}</span>
                </div>
              )}
              {ticket.assignedTo && (
                <div className="flex items-center gap-2 text-muted-foreground pt-2 border-t">
                  <span className="text-xs">Técnico:</span>
                  <span className="font-medium text-foreground">{ticket.assignedTo}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground pt-2 border-t">
                <Clock className="h-4 w-4 shrink-0" />
                <span className="text-xs">Actualizado: {formatDate(ticket.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full" asChild>
            <Link href={`/dashboard/tickets/${id}/edit`}>Editar Ticket</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
