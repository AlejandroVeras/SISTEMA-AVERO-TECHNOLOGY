"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface Expense {
  id: string
  userId: string
  category: string
  description: string
  amount: number
  date: string
  paymentMethod?: string
  receiptUrl?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export async function getExpenseCategories() {
  return [
    "Servicios",
    "Suministros de Oficina",
    "Tecnología",
    "Marketing",
    "Transporte",
    "Alimentos",
    "Servicios Profesionales",
    "Seguros",
    "Alquiler",
    "Servicios Públicos",
    "Nómina",
    "Impuestos",
    "Mantenimiento",
    "Otro",
  ]
}

export async function getExpenses(): Promise<Expense[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })

  if (error) throw error

  return (data || []).map((e) => ({
    id: e.id,
    userId: e.user_id,
    category: e.category,
    description: e.description,
    amount: Number(e.amount),
    date: e.date,
    paymentMethod: e.payment_method,
    receiptUrl: e.receipt_url,
    notes: e.notes,
    createdAt: new Date(e.created_at),
    updatedAt: new Date(e.updated_at),
  }))
}

export async function getExpense(id: string): Promise<Expense | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    userId: data.user_id,
    category: data.category,
    description: data.description,
    amount: Number(data.amount),
    date: data.date,
    paymentMethod: data.payment_method,
    receiptUrl: data.receipt_url,
    notes: data.notes,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}

export async function createExpense(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const category = formData.get("category") as string
  const description = formData.get("description") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const date = formData.get("date") as string
  const paymentMethod = formData.get("paymentMethod") as string
  const notes = formData.get("notes") as string

  if (!category || !description || isNaN(amount) || !date) {
    return { error: "Categoría, descripción, monto y fecha son requeridos" }
  }

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      user_id: user.id,
      category,
      description,
      amount,
      date,
      payment_method: paymentMethod || null,
      notes: notes || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Actualizar caché
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/expenses")
  revalidatePath("/dashboard/reports")

  return { success: true, id: data.id }
}

export async function updateExpense(id: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const category = formData.get("category") as string
  const description = formData.get("description") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const date = formData.get("date") as string

  if (!category || !description || isNaN(amount) || !date) {
    return { error: "Categoría, descripción, monto y fecha son requeridos" }
  }

  const { error } = await supabase
    .from("expenses")
    .update({
      category,
      description,
      amount,
      date,
      payment_method: (formData.get("paymentMethod") as string) || null,
      notes: (formData.get("notes") as string) || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  // Actualizar caché
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/expenses")
  revalidatePath("/dashboard/reports")

  return { success: true }
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  // Actualizar caché
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/expenses")
  revalidatePath("/dashboard/reports")

  return { success: true }
}

export async function getExpensesByCategory(): Promise<Record<string, number>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const expenses = await getExpenses()

  const byCategory: Record<string, number> = {}

  for (const expense of expenses) {
    byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount
  }

  return byCategory
}
