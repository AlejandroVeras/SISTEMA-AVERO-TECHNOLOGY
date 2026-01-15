"use server"

import { createClient } from "@/lib/supabase/server"

export interface Product {
  id: string
  userId: string
  name: string
  description?: string
  sku?: string
  price: number
  cost?: number
  stockQuantity: number
  trackInventory: boolean
  category?: string
  createdAt: Date
  updatedAt: Date
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw error

  return (data || []).map((p) => ({
    id: p.id,
    userId: p.user_id,
    name: p.name,
    description: p.description,
    sku: p.sku,
    price: Number(p.price),
    cost: p.cost ? Number(p.cost) : undefined,
    stockQuantity: p.stock_quantity,
    trackInventory: p.track_inventory,
    category: p.category,
    createdAt: new Date(p.created_at),
    updatedAt: new Date(p.updated_at),
  }))
}

export async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase.from("products").select("*").eq("id", id).eq("user_id", user.id).single()

  if (error || !data) return null

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    description: data.description,
    sku: data.sku,
    price: Number(data.price),
    cost: data.cost ? Number(data.cost) : undefined,
    stockQuantity: data.stock_quantity,
    trackInventory: data.track_inventory,
    category: data.category,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const sku = formData.get("sku") as string
  const price = Number.parseFloat(formData.get("price") as string)
  const cost = formData.get("cost") as string
  const stockQuantity = Number.parseInt(formData.get("stockQuantity") as string) || 0
  // trackInventory por defecto es TRUE (habilitado)
  const trackInventory = formData.get("trackInventory") !== "false"
  const category = formData.get("category") as string

  if (!name || isNaN(price)) {
    return { error: "Nombre y precio son requeridos" }
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      user_id: user.id,
      name,
      description: description || null,
      sku: sku || null,
      price,
      cost: cost ? Number.parseFloat(cost) : null,
      stock_quantity: stockQuantity,
      track_inventory: trackInventory,
      category: category || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { success: true, id: data.id }
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const price = Number.parseFloat(formData.get("price") as string)

  if (!name || isNaN(price)) {
    return { error: "Nombre y precio son requeridos" }
  }

  const cost = formData.get("cost") as string
  const stockQuantity = Number.parseInt(formData.get("stockQuantity") as string) || 0
  // trackInventory por defecto es TRUE (habilitado)
  const trackInventory = formData.get("trackInventory") !== "false"

  const { error } = await supabase
    .from("products")
    .update({
      name,
      description: (formData.get("description") as string) || null,
      sku: (formData.get("sku") as string) || null,
      price,
      cost: cost ? Number.parseFloat(cost) : null,
      stock_quantity: stockQuantity,
      track_inventory: trackInventory,
      category: (formData.get("category") as string) || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase.from("products").delete().eq("id", id).eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
