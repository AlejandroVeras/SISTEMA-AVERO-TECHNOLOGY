import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { TicketForm } from "@/components/ticket-form"

export default async function NewTicketPage() {
  const user = await getUser()
  if (!user) redirect("/login")

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nuevo Ticket</h1>
        <p className="text-muted-foreground mt-1">Registra una nueva solicitud de soporte técnico</p>
      </div>
      <TicketForm />
    </div>
  )
}
