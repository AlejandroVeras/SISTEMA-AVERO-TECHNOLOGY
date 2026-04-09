"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { addTicketMessage, type TicketMessage } from "@/lib/data/tickets"
import { Send, MessageSquare } from "lucide-react"
import { toast } from "sonner"

interface TicketMessagesProps {
  ticketId: string
  messages: TicketMessage[]
}

export function TicketMessages({ ticketId, messages }: TicketMessagesProps) {
  const router = useRouter()
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)

  async function handleSend() {
    if (!newMessage.trim()) return
    setSending(true)
    const result = await addTicketMessage(ticketId, newMessage)
    setSending(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      setNewMessage("")
      toast.success("Nota agregada")
      router.refresh()
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleString("es-DO", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Notas y Actividad ({messages.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages list */}
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No hay notas todavía</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.map(msg => (
              <div key={msg.id} className="p-3 rounded-lg border bg-muted/30">
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                <p className="text-xs text-muted-foreground mt-2">{formatDate(msg.createdAt)}</p>
              </div>
            ))}
          </div>
        )}

        {/* New message */}
        <div className="flex gap-2 pt-2 border-t">
          <Textarea
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Agregar nota o actualización..."
            rows={2}
            className="resize-none"
            disabled={sending}
            onKeyDown={e => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <Button onClick={handleSend} disabled={sending || !newMessage.trim()} size="icon" className="shrink-0 h-auto">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Ctrl+Enter para enviar</p>
      </CardContent>
    </Card>
  )
}
