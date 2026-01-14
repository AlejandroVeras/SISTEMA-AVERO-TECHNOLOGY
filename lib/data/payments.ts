"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { updateInvoiceStatus } from "./invoices"

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  date: string
  method: string
  reference?: string
  notes?: string
  createdAt: Date
}

export async function getPayments(invoiceId: string): Promise<Payment[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("date", { ascending: false })

  if (error) return []

  return data.map((p) => ({
    id: p.id,
    invoiceId: p.invoice_id,
    amount: Number(p.amount),
    date: p.date,
    method: p.method,
    reference: p.reference,
    notes: p.notes,
    createdAt: new Date(p.created_at),
  }))
}

export async function createPayment(data: {
  invoiceId: string
  amount: number
  date: string
  method: string
  reference?: string
  notes?: string
}) {
  const supabase = await createClient()

  // 1. Insertar el pago
  const { error } = await supabase.from("payments").insert({
    invoice_id: data.invoiceId,
    amount: data.amount,
    date: data.date,
    method: data.method,
    reference: data.reference,
    notes: data.notes
  })

  if (error) return { error: error.message }

  // 2. Verificar totales para ver si la factura está pagada
  const { data: invoice } = await supabase
    .from("invoices")
    .select("total")
    .eq("id", data.invoiceId)
    .single()

  const { data: payments } = await supabase
    .from("payments")
    .select("amount")
    .eq("invoice_id", data.invoiceId)

  if (invoice && payments) {
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0)
    
    // Si pagó todo (o más), marcamos como 'paid'
    // Usamos una pequeña tolerancia para errores de decimales
    if (totalPaid >= (invoice.total - 0.1)) {
       await updateInvoiceStatus(data.invoiceId, "paid")
    }
  }

  revalidatePath(`/dashboard/invoices/${data.invoiceId}`)
  revalidatePath("/dashboard/invoices")
  
  return { success: true }
}

export async function deletePayment(id: string, invoiceId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from("payments").delete().eq("id", id)
    
    if (error) return { error: error.message }

    // Al borrar un pago, la factura podría dejar de estar "pagada", 
    // pero por seguridad dejaremos que el usuario cambie el estado manualmente si es necesario,
    // o podríamos recalcular. Por ahora, solo revalidamos.
    
    revalidatePath(`/dashboard/invoices/${invoiceId}`)
    return { success: true }
}