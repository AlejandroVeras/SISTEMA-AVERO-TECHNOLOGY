import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getTickets } from "@/lib/data/tickets"
import { TicketsList } from "@/components/tickets-list"
import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"

export const dynamic = "force-dynamic"

function TicketsLoading() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function TicketsContent() {
  const tickets = await getTickets()
  return <TicketsList tickets={tickets} />
}

export default async function TicketsPage() {
  const user = await getUser()
  if (!user) redirect("/login")

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tickets de Soporte</h1>
        <p className="text-muted-foreground mt-1">Gestiona las solicitudes de soporte técnico</p>
      </div>
      <Suspense fallback={<TicketsLoading />}>
        <TicketsContent />
      </Suspense>
    </div>
  )
}
