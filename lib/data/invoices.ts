"use server"

import { createClient } from "@/lib/supabase/server"

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled"

export interface InvoiceItem {
  id: string
  invoiceId: string
  productId?: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Invoice {
  id: string
  userId: string
  customerId?: string
  customerName: string
  invoiceNumber: string
  issueDate: string
  dueDate?: string
  status: InvoiceStatus
  subtotal: number
  itbis: number
  total: number
  notes?: string
  items: InvoiceItem[]
  createdAt: Date
  updatedAt: Date
}

// Counter for invoice numbers - in production, this should be in the database
let invoiceCounter = 1

export async function getInvoices(): Promise<Invoice[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data: invoicesData, error: invoicesError } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (invoicesError) throw invoicesError

  if (!invoicesData || invoicesData.length === 0) return []

  const invoiceIds = invoicesData.map((inv) => inv.id)

  const { data: itemsData, error: itemsError } = await supabase
    .from("invoice_items")
    .select("*")
    .in("invoice_id", invoiceIds)

  if (itemsError) throw itemsError

  return invoicesData.map((inv) => ({
    id: inv.id,
    userId: inv.user_id,
    customerId: inv.customer_id,
    customerName: inv.customer_name || "",
    invoiceNumber: inv.invoice_number,
    issueDate: inv.issue_date,
    dueDate: inv.due_date,
    status: inv.status as InvoiceStatus,
    subtotal: Number(inv.subtotal),
    itbis: Number(inv.itbis),
    total: Number(inv.total),
    notes: inv.notes,
    items: (itemsData || [])
      .filter((item) => item.invoice_id === inv.id)
      .map((item) => ({
        id: item.id,
        invoiceId: item.invoice_id,
        productId: item.product_id,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unit_price),
        total: Number(item.total),
      })),
    createdAt: new Date(inv.created_at),
    updatedAt: new Date(inv.updated_at),
  }))
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data: invoiceData, error: invoiceError } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (invoiceError || !invoiceData) return null

  const { data: itemsData, error: itemsError } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", id)

  if (itemsError) throw itemsError

  return {
    id: invoiceData.id,
    userId: invoiceData.user_id,
    customerId: invoiceData.customer_id,
    customerName: invoiceData.customer_name || "",
    invoiceNumber: invoiceData.invoice_number,
    issueDate: invoiceData.issue_date,
    dueDate: invoiceData.due_date,
    status: invoiceData.status as InvoiceStatus,
    subtotal: Number(invoiceData.subtotal),
    itbis: Number(invoiceData.itbis),
    total: Number(invoiceData.total),
    notes: invoiceData.notes,
    items: (itemsData || []).map((item) => ({
      id: item.id,
      invoiceId: item.invoice_id,
      productId: item.product_id,
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      total: Number(item.total),
    })),
    createdAt: new Date(invoiceData.created_at),
    updatedAt: new Date(invoiceData.updated_at),
  }
}

function generateInvoiceNumber(): string {
  const num = invoiceCounter++
  return `INV-${String(num).padStart(4, "0")}`
}

export async function createInvoice(data: {
  customerId?: string
  customerName: string
  issueDate: string
  dueDate?: string
  status: InvoiceStatus
  notes?: string
  items: Array<{
    productId?: string
    description: string
    quantity: number
    unitPrice: number
  }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  if (!data.customerName || data.items.length === 0) {
    return { error: "Cliente y al menos un item son requeridos" }
  }

  // Calculate subtotal from items
  const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const itbis = subtotal * 0.18
  const total = subtotal + itbis

  // Get the highest invoice number to generate next one
  const { data: lastInvoice } = await supabase
    .from("invoices")
    .select("invoice_number")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  let invoiceNumber = "INV-0001"
  if (lastInvoice?.invoice_number) {
    const match = lastInvoice.invoice_number.match(/INV-(\d+)/)
    if (match) {
      const nextNum = parseInt(match[1]) + 1
      invoiceNumber = `INV-${String(nextNum).padStart(4, "0")}`
    }
  }

  const { data: invoiceData, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
      customer_id: data.customerId || null,
      customer_name: data.customerName,
      invoice_number: invoiceNumber,
      issue_date: data.issueDate,
      due_date: data.dueDate || null,
      status: data.status,
      subtotal,
      itbis,
      total,
      notes: data.notes || null,
    })
    .select()
    .single()

  if (invoiceError) {
    return { error: invoiceError.message }
  }

  const itemsToInsert = data.items.map((item) => ({
    invoice_id: invoiceData.id,
    product_id: item.productId || null,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total: item.quantity * item.unitPrice,
  }))

  const { error: itemsError } = await supabase.from("invoice_items").insert(itemsToInsert)

  if (itemsError) {
    await supabase.from("invoices").delete().eq("id", invoiceData.id)
    return { error: itemsError.message }
  }

  return { success: true, id: invoiceData.id }
}

export async function updateInvoice(
  id: string,
  data: {
    customerId?: string
    customerName: string
    issueDate: string
    dueDate?: string
    status: InvoiceStatus
    notes?: string
    items: Array<{
      productId?: string
      description: string
      quantity: number
      unitPrice: number
    }>
  },
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  if (!data.customerName || data.items.length === 0) {
    return { error: "Cliente y al menos un item son requeridos" }
  }

  const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const itbis = subtotal * 0.18
  const total = subtotal + itbis

  const { error: updateError } = await supabase
    .from("invoices")
    .update({
      customer_id: data.customerId || null,
      customer_name: data.customerName,
      issue_date: data.issueDate,
      due_date: data.dueDate || null,
      status: data.status,
      subtotal,
      itbis,
      total,
      notes: data.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  await supabase.from("invoice_items").delete().eq("invoice_id", id)

  const itemsToInsert = data.items.map((item) => ({
    invoice_id: id,
    product_id: item.productId || null,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total: item.quantity * item.unitPrice,
  }))

  const { error: itemsError } = await supabase.from("invoice_items").insert(itemsToInsert)

  if (itemsError) {
    return { error: itemsError.message }
  }

  return { success: true }
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase.from("invoices").delete().eq("id", id).eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("invoices")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
