"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface FinancingPayment {
  id: string
  customerId: string
  amount: number
  date: string
  paymentMethod: string
  reference?: string
  notes?: string
  createdAt: Date
}

export async function getFinancingPayments(customerId: string): Promise<FinancingPayment[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("financing_payments")
    .select("*")
    .eq("customer_id", customerId)
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching financing payments:", error)
    return []
  }

  return (data || []).map((p) => ({
    id: p.id,
    customerId: p.customer_id,
    amount: Number(p.amount),
    date: p.date,
    paymentMethod: p.payment_method,
    reference: p.reference,
    notes: p.notes,
    createdAt: new Date(p.created_at),
  }))
}

export async function createFinancingPayment(data: {
  customerId: string
  amount: number
  date: string
  paymentMethod: string
  reference?: string
  notes?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  // Validaciones
  if (!data.customerId || data.amount <= 0) {
    return { error: "Cliente y monto válido son requeridos" }
  }

  // 1. Obtener cliente actual
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("financing_used, financing_limit")
    .eq("id", data.customerId)
    .eq("user_id", user.id)
    .single()

  if (customerError || !customer) {
    return { error: "Cliente no encontrado" }
  }

  // 2. Validar que el pago no exceda la deuda actual
  const newFinancingUsed = Math.max(0, customer.financing_used - data.amount)
  
  if (newFinancingUsed < 0) {
    return { error: "El pago no puede ser mayor que la deuda actual" }
  }

  // 3. Insertar el pago
  const { data: paymentData, error: paymentError } = await supabase
    .from("financing_payments")
    .insert({
      customer_id: data.customerId,
      amount: data.amount,
      date: data.date,
      payment_method: data.paymentMethod,
      reference: data.reference || null,
      notes: data.notes || null,
    })
    .select()
    .single()

  if (paymentError) {
    return { error: paymentError.message }
  }

  // 4. Actualizar deuda del cliente
  const { error: updateError } = await supabase
    .from("customers")
    .update({ financing_used: newFinancingUsed })
    .eq("id", data.customerId)
    .eq("user_id", user.id)

  if (updateError) {
    // Si falla la actualización, eliminar el pago registrado
    await supabase.from("financing_payments").delete().eq("id", paymentData.id)
    return { error: updateError.message }
  }

  revalidatePath("/dashboard/customers")
  revalidatePath(`/dashboard/customers/${data.customerId}`)
  
  return { success: true, id: paymentData.id }
}

export async function deleteFinancingPayment(paymentId: string, customerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  // 1. Obtener datos del pago
  const { data: payment, error: paymentError } = await supabase
    .from("financing_payments")
    .select("amount")
    .eq("id", paymentId)
    .single()

  if (paymentError || !payment) {
    return { error: "Pago no encontrado" }
  }

  // 2. Obtener cliente actual
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("financing_used")
    .eq("id", customerId)
    .eq("user_id", user.id)
    .single()

  if (customerError || !customer) {
    return { error: "Cliente no encontrado" }
  }

  // 3. Eliminar el pago
  const { error: deleteError } = await supabase
    .from("financing_payments")
    .delete()
    .eq("id", paymentId)
    .eq("customer_id", customerId)

  if (deleteError) {
    return { error: deleteError.message }
  }

  // 4. Restaurar la deuda del cliente
  const newFinancingUsed = customer.financing_used + Number(payment.amount)
  
  await supabase
    .from("customers")
    .update({ financing_used: newFinancingUsed })
    .eq("id", customerId)
    .eq("user_id", user.id)

  revalidatePath("/dashboard/customers")
  revalidatePath(`/dashboard/customers/${customerId}`)
  
  return { success: true }
}
