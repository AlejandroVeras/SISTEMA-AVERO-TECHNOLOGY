"use server"

import { getUser } from "@/lib/auth"

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

// In-memory storage for demo purposes
const products: Map<string, Product> = new Map()

export async function getProducts(): Promise<Product[]> {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  return Array.from(products.values())
    .filter((p) => p.userId === user.id)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export async function getProduct(id: string): Promise<Product | null> {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const product = products.get(id)
  if (!product || product.userId !== user.id) return null

  return product
}

export async function createProduct(formData: FormData) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const sku = formData.get("sku") as string
  const price = Number.parseFloat(formData.get("price") as string)
  const cost = formData.get("cost") as string
  const stockQuantity = Number.parseInt(formData.get("stockQuantity") as string) || 0
  const trackInventory = formData.get("trackInventory") === "on"
  const category = formData.get("category") as string

  if (!name || isNaN(price)) {
    return { error: "Nombre y precio son requeridos" }
  }

  const id = crypto.randomUUID()
  const product: Product = {
    id,
    userId: user.id,
    name,
    description: description || undefined,
    sku: sku || undefined,
    price,
    cost: cost ? Number.parseFloat(cost) : undefined,
    stockQuantity,
    trackInventory,
    category: category || undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  products.set(id, product)

  return { success: true, id }
}

export async function updateProduct(id: string, formData: FormData) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const product = products.get(id)
  if (!product || product.userId !== user.id) {
    return { error: "Producto no encontrado" }
  }

  const name = formData.get("name") as string
  const price = Number.parseFloat(formData.get("price") as string)

  if (!name || isNaN(price)) {
    return { error: "Nombre y precio son requeridos" }
  }

  const cost = formData.get("cost") as string
  const stockQuantity = Number.parseInt(formData.get("stockQuantity") as string) || 0

  const updated: Product = {
    ...product,
    name,
    description: (formData.get("description") as string) || undefined,
    sku: (formData.get("sku") as string) || undefined,
    price,
    cost: cost ? Number.parseFloat(cost) : undefined,
    stockQuantity,
    trackInventory: formData.get("trackInventory") === "on",
    category: (formData.get("category") as string) || undefined,
    updatedAt: new Date(),
  }

  products.set(id, updated)

  return { success: true }
}

export async function deleteProduct(id: string) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const product = products.get(id)
  if (!product || product.userId !== user.id) {
    return { error: "Producto no encontrado" }
  }

  products.delete(id)

  return { success: true }
}
