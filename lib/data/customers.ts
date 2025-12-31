"use server"

import { createClient } from "@/lib/supabase/server"

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

export async function getCustomers(): Promise<Customer[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw error

  return (data || []).map((c) => ({
    id: c.id,
    userId: c.user_id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    rnc: c.rnc,
    address: c.address,
    notes: c.notes,
    createdAt: new Date(c.created_at),
    updatedAt: new Date(c.updated_at),
  }))
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase.from("customers").select("*").eq("id", id).eq("user_id", user.id).single()

  if (error || !data) return null

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    rnc: data.rnc,
    address: data.address,
    notes: data.notes,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}

export async function createCustomer(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  const { data, error } = await supabase
    .from("customers")
    .insert({
      user_id: user.id,
      name,
      email: email || null,
      phone: phone || null,
      rnc: rnc || null,
      address: address || null,
      notes: notes || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { success: true, id: data.id }
}

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const name = formData.get("name") as string

  if (!name) {
    return { error: "El nombre es requerido" }
  }

  const { error } = await supabase
    .from("customers")
    .update({
      name,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      rnc: (formData.get("rnc") as string) || null,
      address: (formData.get("address") as string) || null,
      notes: (formData.get("notes") as string) || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase.from("customers").delete().eq("id", id).eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
