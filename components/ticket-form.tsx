"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTicket, updateTicket, type Ticket } from "@/lib/data/tickets"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface TicketFormProps {
  ticket?: Ticket
}

export function TicketForm({ ticket }: TicketFormProps) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new FormData(e.currentTarget)
      const result = ticket
        ? await updateTicket(ticket.id, formData)
        : await createTicket(formData)

      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        toast.success(ticket ? "Ticket actualizado" : "Ticket creado")
        router.refresh()
        router.push("/dashboard/tickets")
      }
    } catch {
      setError("Error al guardar el ticket")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">{error}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nombre del Cliente *</Label>
                <Input id="customerName" name="customerName" required disabled={loading} defaultValue={ticket?.customerName} placeholder="Juan Pérez" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input id="customerEmail" name="customerEmail" type="email" disabled={loading} defaultValue={ticket?.customerEmail} placeholder="cliente@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Teléfono</Label>
                <Input id="customerPhone" name="customerPhone" disabled={loading} defaultValue={ticket?.customerPhone} placeholder="829-000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deviceModel">Modelo del Equipo</Label>
                <Input id="deviceModel" name="deviceModel" disabled={loading} defaultValue={ticket?.deviceModel} placeholder="Laptop HP Pavilion 15" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalle del Ticket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Asunto *</Label>
              <Input id="subject" name="subject" required disabled={loading} defaultValue={ticket?.subject} placeholder="Pantalla negra al encender" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="problemType">Tipo de Problema</Label>
                <Select name="problemType" defaultValue={ticket?.problemType || "hardware"} disabled={loading}>
                  <SelectTrigger id="problemType"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="network">Red / Internet</SelectItem>
                    <SelectItem value="server">Servidor</SelectItem>
                    <SelectItem value="security">Seguridad</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad</Label>
                <Select name="priority" defaultValue={ticket?.priority || "medium"} disabled={loading}>
                  <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Baja</SelectItem>
                    <SelectItem value="medium">🟡 Media</SelectItem>
                    <SelectItem value="high">🟠 Alta</SelectItem>
                    <SelectItem value="urgent">🔴 Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {ticket && (
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select name="status" defaultValue={ticket.status} disabled={loading}>
                    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Abierto</SelectItem>
                      <SelectItem value="in_progress">En Proceso</SelectItem>
                      <SelectItem value="resolved">Resuelto</SelectItem>
                      <SelectItem value="closed">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Técnico Asignado</Label>
              <Input id="assignedTo" name="assignedTo" disabled={loading} defaultValue={ticket?.assignedTo} placeholder="Nombre del técnico" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción del Problema *</Label>
              <Textarea id="description" name="description" required disabled={loading} defaultValue={ticket?.description} placeholder="Describe el problema con el mayor detalle posible..." rows={5} className="resize-none" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Número de Serie</Label>
              <Input id="serialNumber" name="serialNumber" disabled={loading} defaultValue={ticket?.serialNumber} placeholder="S/N del equipo" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/50 border-transparent shadow-none">
          <CardFooter className="flex justify-between pt-6 px-0 pl-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/tickets"><ArrowLeft className="h-4 w-4 mr-2" /> Cancelar</Link>
            </Button>
            <Button type="submit" disabled={loading} size="lg">
              {loading ? "Guardando..." : ticket ? "Actualizar Ticket" : "Crear Ticket"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  )
}
