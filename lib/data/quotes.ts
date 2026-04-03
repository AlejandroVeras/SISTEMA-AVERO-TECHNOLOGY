"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createInvoice } from "./invoices"

export type QuoteStatus = "draft" | "sent" | "approved" | "rejected"

export interface QuoteItem {
  id: string
  quoteId: string
  productId?: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Quote {
  id: string
  userId: string
  customerId?: string
  customerName: string
  quoteNumber: string
  issueDate: string
  validUntil?: string
  status: QuoteStatus
  subtotal: number
  discount: number
  itbis: number
  total: number
  notes?: string
  items: QuoteItem[]
  createdAt: Date
  updatedAt: Date
}

export async function getQuotes(): Promise<Quote[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data: quotesData, error: quotesError } = await supabase
    .from("quotes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (quotesError) throw quotesError
  if (!quotesData || quotesData.length === 0) return []

  const quoteIds = quotesData.map((qt) => qt.id)
  const { data: itemsData, error: itemsError } = await supabase
    .from("quote_items")
    .select("*")
    .in("quote_id", quoteIds)

  if (itemsError) throw itemsError

  return quotesData.map((qt) => ({
    id: qt.id,
    userId: qt.user_id,
    customerId: qt.customer_id,
    customerName: qt.customer_name || "",
    quoteNumber: qt.quote_number,
    issueDate: qt.issue_date,
    validUntil: qt.valid_until,
    status: qt.status as QuoteStatus,
    subtotal: Number(qt.subtotal),
    discount: Number(qt.discount || 0),
    itbis: Number(qt.itbis),
    total: Number(qt.total),
    notes: qt.notes,
    items: (itemsData || [])
      .filter((item) => item.quote_id === qt.id)
      .map((item) => ({
        id: item.id,
        quoteId: item.quote_id,
        productId: item.product_id,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unit_price),
        total: Number(item.total),
      })),
    createdAt: new Date(qt.created_at),
    updatedAt: new Date(qt.updated_at),
  }))
}

export async function getQuote(id: string): Promise<Quote | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data: quoteData, error: quoteError } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (quoteError || !quoteData) return null

  const { data: itemsData, error: itemsError } = await supabase
    .from("quote_items")
    .select("*")
    .eq("quote_id", id)

  if (itemsError) throw itemsError

  return {
    id: quoteData.id,
    userId: quoteData.user_id,
    customerId: quoteData.customer_id,
    customerName: quoteData.customer_name || "",
    quoteNumber: quoteData.quote_number,
    issueDate: quoteData.issue_date,
    validUntil: quoteData.valid_until,
    status: quoteData.status as QuoteStatus,
    subtotal: Number(quoteData.subtotal),
    discount: Number(quoteData.discount || 0),
    itbis: Number(quoteData.itbis),
    total: Number(quoteData.total),
    notes: quoteData.notes,
    items: (itemsData || []).map((item) => ({
      id: item.id,
      quoteId: item.quote_id,
      productId: item.product_id,
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      total: Number(item.total),
    })),
    createdAt: new Date(quoteData.created_at),
    updatedAt: new Date(quoteData.updated_at),
  }
}

export async function createQuote(data: {
  customerId?: string
  customerName: string
  issueDate: string
  validUntil?: string
  status: QuoteStatus
  notes?: string
  applyItbis: boolean
  discount: number
  items: Array<{
    productId?: string
    description: string
    quantity: number
    unitPrice: number
  }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  if (!data.customerName || data.items.length === 0) {
    return { error: "Cliente y al menos un item son requeridos" }
  }

  const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  
  const discount = data.discount || 0
  const taxableAmount = Math.max(0, subtotal - discount)
  const itbis = data.applyItbis ? taxableAmount * 0.18 : 0
  const total = taxableAmount + itbis

  const { data: lastQuote } = await supabase
    .from("quotes")
    .select("quote_number")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  let quoteNumber = "COT-0001"
  if (lastQuote?.quote_number) {
    const match = lastQuote.quote_number.match(/COT-(\d+)/)
    if (match) {
      const nextNum = parseInt(match[1]) + 1
      quoteNumber = `COT-${String(nextNum).padStart(4, "0")}`
    }
  }

  const { data: quoteData, error: quoteError } = await supabase
    .from("quotes")
    .insert({
      user_id: user.id,
      customer_id: data.customerId || null,
      customer_name: data.customerName,
      quote_number: quoteNumber,
      issue_date: data.issueDate,
      valid_until: data.validUntil || null,
      status: data.status,
      subtotal,
      discount,
      itbis,
      total,
      notes: data.notes || null,
    })
    .select()
    .single()

  if (quoteError) return { error: quoteError.message }

  const itemsToInsert = data.items.map((item) => ({
    quote_id: quoteData.id,
    product_id: item.productId || null,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total: item.quantity * item.unitPrice,
  }))

  const { error: itemsError } = await supabase.from("quote_items").insert(itemsToInsert)

  if (itemsError) {
    await supabase.from("quotes").delete().eq("id", quoteData.id)
    return { error: itemsError.message }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/quotes")

  return { success: true, id: quoteData.id }
}

export async function updateQuote(
  id: string,
  data: {
    customerId?: string
    customerName: string
    issueDate: string
    validUntil?: string
    status: QuoteStatus
    notes?: string
    applyItbis: boolean
    discount: number
    items: Array<{
      productId?: string
      description: string
      quantity: number
      unitPrice: number
    }>
  },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  if (!data.customerName || data.items.length === 0) {
    return { error: "Cliente y al menos un item son requeridos" }
  }

  const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  
  const discount = data.discount || 0
  const taxableAmount = Math.max(0, subtotal - discount)
  const itbis = data.applyItbis ? taxableAmount * 0.18 : 0
  const total = taxableAmount + itbis

  const { error: updateError } = await supabase
    .from("quotes")
    .update({
      customer_id: data.customerId || null,
      customer_name: data.customerName,
      issue_date: data.issueDate,
      valid_until: data.validUntil || null,
      status: data.status,
      subtotal,
      discount,
      itbis,
      total,
      notes: data.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (updateError) return { error: updateError.message }

  await supabase.from("quote_items").delete().eq("quote_id", id)

  const itemsToInsert = data.items.map((item) => ({
    quote_id: id,
    product_id: item.productId || null,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total: item.quantity * item.unitPrice,
  }))

  const { error: itemsError } = await supabase.from("quote_items").insert(itemsToInsert)

  if (itemsError) return { error: itemsError.message }

  revalidatePath("/dashboard/quotes")
  revalidatePath(`/dashboard/quotes/${id}`)

  return { success: true }
}

export async function deleteQuote(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase.from("quotes").delete().eq("id", id).eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/quotes")

  return { success: true }
}

export async function updateQuoteStatus(id: string, status: QuoteStatus) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("quotes")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/dashboard/quotes")
  revalidatePath(`/dashboard/quotes/${id}`)

  return { success: true }
}

export async function convertQuoteToInvoice(id: string) {
  const quote = await getQuote(id)
  
  if (!quote) {
    return { error: "Cotización no encontrada" }
  }

  // Marcar como "approved" si no lo está
  if (quote.status !== "approved") {
     await updateQuoteStatus(id, "approved")
  }

  // Prepara los datos para la factura usando la cotización
  const result = await createInvoice({
    customerId: quote.customerId,
    customerName: quote.customerName,
    issueDate: new Date().toISOString().split('T')[0], // Hoy
    status: "draft",
    notes: `Generada a partir de la Cotización ${quote.quoteNumber}. ` + (quote.notes || ""),
    applyItbis: quote.itbis > 0,
    applyFinancing: false,
    discount: quote.discount,
    items: quote.items.map(item => ({
      productId: item.productId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    }))
  })

  return result
}
