import { redirect, notFound } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getTicket } from "@/lib/data/tickets"
import { TicketForm } from "@/components/ticket-form"

export const dynamic = "force-dynamic"

export default async function EditTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  if (!user) redirect("/login")

  const { id } = await params
  const ticket = await getTicket(id)
  if (!ticket) notFound()

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Ticket</h1>
        <p className="text-muted-foreground mt-1">Actualiza la información del ticket de soporte</p>
      </div>
      <TicketForm ticket={ticket} />
    </div>
  )
}
