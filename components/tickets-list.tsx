"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { deleteTicket, updateTicketStatus, type Ticket } from "@/lib/data/tickets"
import { Trash2, Search, Plus, Eye, Clock, User } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface TicketsListProps {
  tickets: Ticket[]
}

const statusLabels: Record<string, string> = {
  open: "Abierto",
  in_progress: "En Proceso",
  resolved: "Resuelto",
  closed: "Cerrado",
}

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300",
}

const priorityLabels: Record<string, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
}

const priorityColors: Record<string, string> = {
  low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}

const problemLabels: Record<string, string> = {
  hardware: "Hardware",
  software: "Software",
  network: "Red",
  server: "Servidor",
  security: "Seguridad",
  other: "Otro",
}

export function TicketsList({ tickets }: TicketsListProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = tickets.filter(t => {
    const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || t.status === statusFilter
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter
    return matchSearch && matchStatus && matchPriority
  })

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    const result = await deleteTicket(deleteId)
    setDeleting(false)
    setDeleteId(null)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Ticket eliminado")
      router.refresh()
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("es-DO", { day: "numeric", month: "short", year: "numeric" })
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar tickets..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="open">Abierto</SelectItem>
            <SelectItem value="in_progress">En Proceso</SelectItem>
            <SelectItem value="resolved">Resuelto</SelectItem>
            <SelectItem value="closed">Cerrado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Prioridad" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="low">🟢 Baja</SelectItem>
            <SelectItem value="medium">🟡 Media</SelectItem>
            <SelectItem value="high">🟠 Alta</SelectItem>
            <SelectItem value="urgent">🔴 Urgente</SelectItem>
          </SelectContent>
        </Select>
        <Button asChild>
          <Link href="/dashboard/tickets/new"><Plus className="h-4 w-4 mr-2" /> Nuevo Ticket</Link>
        </Button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg">No hay tickets</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {search ? "Intenta con otra búsqueda" : "Crea tu primer ticket de soporte"}
            </p>
            {!search && (
              <Button className="mt-4" asChild>
                <Link href="/dashboard/tickets/new"><Plus className="h-4 w-4 mr-2" /> Crear Ticket</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(ticket => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow group">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Link href={`/dashboard/tickets/${ticket.id}`} className="font-semibold hover:text-primary transition-colors truncate">
                        {ticket.subject}
                      </Link>
                      <Badge className={`text-[10px] ${statusColors[ticket.status]}`}>{statusLabels[ticket.status]}</Badge>
                      <Badge className={`text-[10px] ${priorityColors[ticket.priority]}`}>{priorityLabels[ticket.priority]}</Badge>
                      <Badge variant="outline" className="text-[10px]">{problemLabels[ticket.problemType] || ticket.problemType}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {ticket.customerName}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(ticket.createdAt)}</span>
                      {ticket.assignedTo && <span>→ {ticket.assignedTo}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/tickets/${ticket.id}`}><Eye className="h-3 w-3 mr-1" /> Ver</Link>
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(ticket.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar ticket?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. Se eliminarán el ticket y todas sus notas.</AlertDialogDescription>
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
