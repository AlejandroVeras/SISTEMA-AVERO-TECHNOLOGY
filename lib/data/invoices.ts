"use server"

import { getUser } from "@/lib/auth"

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

// In-memory storage for demo purposes
const invoices: Map<string, Invoice> = new Map()
let invoiceCounter = 1

export async function getInvoices(): Promise<Invoice[]> {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  return Array.from(invoices.values())
    .filter((i) => i.userId === user.id)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const invoice = invoices.get(id)
  if (!invoice || invoice.userId !== user.id) return null

  return invoice
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
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  if (!data.customerName || data.items.length === 0) {
    return { error: "Cliente y al menos un item son requeridos" }
  }

  const id = crypto.randomUUID()

  // Calculate totals
  const items: InvoiceItem[] = data.items.map((item) => ({
    id: crypto.randomUUID(),
    invoiceId: id,
    productId: item.productId,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.quantity * item.unitPrice,
  }))

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const itbis = subtotal * 0.18 // 18% ITBIS tax
  const total = subtotal + itbis

  const invoice: Invoice = {
    id,
    userId: user.id,
    customerId: data.customerId,
    customerName: data.customerName,
    invoiceNumber: generateInvoiceNumber(),
    issueDate: data.issueDate,
    dueDate: data.dueDate,
    status: data.status,
    subtotal,
    itbis,
    total,
    notes: data.notes,
    items,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  invoices.set(id, invoice)

  return { success: true, id }
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
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const invoice = invoices.get(id)
  if (!invoice || invoice.userId !== user.id) {
    return { error: "Factura no encontrada" }
  }

  if (!data.customerName || data.items.length === 0) {
    return { error: "Cliente y al menos un item son requeridos" }
  }

  // Calculate totals
  const items: InvoiceItem[] = data.items.map((item) => ({
    id: crypto.randomUUID(),
    invoiceId: id,
    productId: item.productId,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.quantity * item.unitPrice,
  }))

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const itbis = subtotal * 0.18
  const total = subtotal + itbis

  const updated: Invoice = {
    ...invoice,
    customerId: data.customerId,
    customerName: data.customerName,
    issueDate: data.issueDate,
    dueDate: data.dueDate,
    status: data.status,
    subtotal,
    itbis,
    total,
    notes: data.notes,
    items,
    updatedAt: new Date(),
  }

  invoices.set(id, updated)

  return { success: true }
}

export async function deleteInvoice(id: string) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const invoice = invoices.get(id)
  if (!invoice || invoice.userId !== user.id) {
    return { error: "Factura no encontrada" }
  }

  invoices.delete(id)

  return { success: true }
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const invoice = invoices.get(id)
  if (!invoice || invoice.userId !== user.id) {
    return { error: "Factura no encontrada" }
  }

  invoice.status = status
  invoice.updatedAt = new Date()

  invoices.set(id, invoice)

  return { success: true }
}
