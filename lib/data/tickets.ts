"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// ─── Types ────────────────────────────────────────────
export interface Ticket {
  id: string
  userId: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  subject: string
  description: string
  problemType: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  assignedTo?: string
  deviceModel?: string
  serialNumber?: string
  createdAt: string
  updatedAt: string
}

export interface TicketMessage {
  id: string
  ticketId: string
  userId: string
  message: string
  isInternal: boolean
  createdAt: string
}

// ─── Helpers ──────────────────────────────────────────
function mapTicket(row: any): Ticket {
  return {
    id: row.id,
    userId: row.user_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    subject: row.subject,
    description: row.description,
    problemType: row.problem_type,
    status: row.status,
    priority: row.priority,
    assignedTo: row.assigned_to,
    deviceModel: row.device_model,
    serialNumber: row.serial_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapMessage(row: any): TicketMessage {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    userId: row.user_id,
    message: row.message,
    isInternal: row.is_internal,
    createdAt: row.created_at,
  }
}

// ─── Get all tickets ──────────────────────────────────
export async function getTickets(): Promise<Ticket[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data || []).map(mapTicket)
}

// ─── Get single ticket ───────────────────────────────
export async function getTicket(id: string): Promise<Ticket | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !data) return null
  return mapTicket(data)
}

// ─── Create ticket ───────────────────────────────────
export async function createTicket(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const customerName = formData.get("customerName") as string
  const subject = formData.get("subject") as string
  const description = formData.get("description") as string

  if (!customerName || !subject || !description) {
    return { error: "Nombre, asunto y descripción son requeridos" }
  }

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      user_id: user.id,
      customer_name: customerName,
      customer_email: (formData.get("customerEmail") as string) || null,
      customer_phone: (formData.get("customerPhone") as string) || null,
      subject,
      description,
      problem_type: (formData.get("problemType") as string) || "other",
      priority: (formData.get("priority") as string) || "medium",
      assigned_to: (formData.get("assignedTo") as string) || null,
      device_model: (formData.get("deviceModel") as string) || null,
      serial_number: (formData.get("serialNumber") as string) || null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath("/dashboard/tickets")
  return { success: true, id: data.id }
}

// ─── Update ticket ───────────────────────────────────
export async function updateTicket(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const customerName = formData.get("customerName") as string
  const subject = formData.get("subject") as string

  if (!customerName || !subject) {
    return { error: "Nombre y asunto son requeridos" }
  }

  const { error } = await supabase
    .from("tickets")
    .update({
      customer_name: customerName,
      customer_email: (formData.get("customerEmail") as string) || null,
      customer_phone: (formData.get("customerPhone") as string) || null,
      subject,
      description: (formData.get("description") as string) || "",
      problem_type: (formData.get("problemType") as string) || "other",
      status: (formData.get("status") as string) || "open",
      priority: (formData.get("priority") as string) || "medium",
      assigned_to: (formData.get("assignedTo") as string) || null,
      device_model: (formData.get("deviceModel") as string) || null,
      serial_number: (formData.get("serialNumber") as string) || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/dashboard/tickets")
  revalidatePath(`/dashboard/tickets/${id}`)
  return { success: true }
}

// ─── Update ticket status ────────────────────────────
export async function updateTicketStatus(id: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("tickets")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/dashboard/tickets")
  revalidatePath(`/dashboard/tickets/${id}`)
  return { success: true }
}

// ─── Delete ticket ───────────────────────────────────
export async function deleteTicket(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("tickets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/dashboard/tickets")
  return { success: true }
}

// ─── Get ticket messages ─────────────────────────────
export async function getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("ticket_messages")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true })

  if (error) return []
  return (data || []).map(mapMessage)
}

// ─── Add message to ticket ───────────────────────────
export async function addTicketMessage(ticketId: string, message: string, isInternal = false) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  if (!message.trim()) return { error: "El mensaje no puede estar vacío" }

  const { error } = await supabase
    .from("ticket_messages")
    .insert({
      ticket_id: ticketId,
      user_id: user.id,
      message: message.trim(),
      is_internal: isInternal,
    })

  if (error) return { error: error.message }

  // Also update the ticket's updated_at
  await supabase
    .from("tickets")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", ticketId)
    .eq("user_id", user.id)

  revalidatePath(`/dashboard/tickets/${ticketId}`)
  return { success: true }
}
