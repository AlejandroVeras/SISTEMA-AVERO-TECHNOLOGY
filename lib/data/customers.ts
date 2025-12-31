"use server"

import { getUser } from "@/lib/auth"

export interface Customer {
  id: string
  userId: string
  name: string
  email?: string
  phone?: string
  rnc?: string
  address?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// In-memory storage for demo purposes
const customers: Map<string, Customer> = new Map()

export async function getCustomers(): Promise<Customer[]> {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  return Array.from(customers.values())
    .filter((c) => c.userId === user.id)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const customer = customers.get(id)
  if (!customer || customer.userId !== user.id) return null

  return customer
}

export async function createCustomer(formData: FormData) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const rnc = formData.get("rnc") as string
  const address = formData.get("address") as string
  const notes = formData.get("notes") as string

  if (!name) {
    return { error: "El nombre es requerido" }
  }

  const id = crypto.randomUUID()
  const customer: Customer = {
    id,
    userId: user.id,
    name,
    email: email || undefined,
    phone: phone || undefined,
    rnc: rnc || undefined,
    address: address || undefined,
    notes: notes || undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  customers.set(id, customer)

  return { success: true, id }
}

export async function updateCustomer(id: string, formData: FormData) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const customer = customers.get(id)
  if (!customer || customer.userId !== user.id) {
    return { error: "Cliente no encontrado" }
  }

  const name = formData.get("name") as string

  if (!name) {
    return { error: "El nombre es requerido" }
  }

  const updated: Customer = {
    ...customer,
    name,
    email: (formData.get("email") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    rnc: (formData.get("rnc") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
    updatedAt: new Date(),
  }

  customers.set(id, updated)

  return { success: true }
}

export async function deleteCustomer(id: string) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const customer = customers.get(id)
  if (!customer || customer.userId !== user.id) {
    return { error: "Cliente no encontrado" }
  }

  customers.delete(id)

  return { success: true }
}
