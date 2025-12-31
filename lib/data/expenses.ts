"use server"

import { getUser } from "@/lib/auth"

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

// In-memory storage for demo purposes
const expenses: Map<string, Expense> = new Map()

export const expenseCategories = [
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

export async function getExpenses(): Promise<Expense[]> {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  return Array.from(expenses.values())
    .filter((e) => e.userId === user.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getExpense(id: string): Promise<Expense | null> {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const expense = expenses.get(id)
  if (!expense || expense.userId !== user.id) return null

  return expense
}

export async function createExpense(formData: FormData) {
  const user = await getUser()
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

  const id = crypto.randomUUID()
  const expense: Expense = {
    id,
    userId: user.id,
    category,
    description,
    amount,
    date,
    paymentMethod: paymentMethod || undefined,
    notes: notes || undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  expenses.set(id, expense)

  return { success: true, id }
}

export async function updateExpense(id: string, formData: FormData) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const expense = expenses.get(id)
  if (!expense || expense.userId !== user.id) {
    return { error: "Gasto no encontrado" }
  }

  const category = formData.get("category") as string
  const description = formData.get("description") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const date = formData.get("date") as string

  if (!category || !description || isNaN(amount) || !date) {
    return { error: "Categoría, descripción, monto y fecha son requeridos" }
  }

  const updated: Expense = {
    ...expense,
    category,
    description,
    amount,
    date,
    paymentMethod: (formData.get("paymentMethod") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
    updatedAt: new Date(),
  }

  expenses.set(id, updated)

  return { success: true }
}

export async function deleteExpense(id: string) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const expense = expenses.get(id)
  if (!expense || expense.userId !== user.id) {
    return { error: "Gasto no encontrado" }
  }

  expenses.delete(id)

  return { success: true }
}

export async function getExpensesByCategory(): Promise<Record<string, number>> {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const userExpenses = Array.from(expenses.values()).filter((e) => e.userId === user.id)

  const byCategory: Record<string, number> = {}

  for (const expense of userExpenses) {
    byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount
  }

  return byCategory
}
