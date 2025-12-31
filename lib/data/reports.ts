"use server"

import { getUser } from "@/lib/auth"
import { getInvoices } from "@/lib/data/invoices"
import { getExpenses } from "@/lib/data/expenses"

export interface FinancialSummary {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  pendingInvoices: number
  pendingAmount: number
  paidInvoices: number
  paidAmount: number
}

export interface MonthlyData {
  month: string
  income: number
  expenses: number
  profit: number
}

export interface CategoryExpense {
  category: string
  amount: number
  percentage: number
}

export async function getFinancialSummary(startDate?: string, endDate?: string): Promise<FinancialSummary> {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const [invoices, expenses] = await Promise.all([getInvoices(), getExpenses()])

  // Filter by date range if provided
  const filteredInvoices =
    startDate && endDate ? invoices.filter((inv) => inv.issueDate >= startDate && inv.issueDate <= endDate) : invoices

  const filteredExpenses =
    startDate && endDate ? expenses.filter((exp) => exp.date >= startDate && exp.date <= endDate) : expenses

  const paidInvoices = filteredInvoices.filter((inv) => inv.status === "paid")
  const pendingInvoices = filteredInvoices.filter((inv) => inv.status === "sent" || inv.status === "overdue")

  const totalIncome = paidInvoices.reduce((sum, inv) => sum + inv.total, 0)
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const netProfit = totalIncome - totalExpenses

  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0)

  return {
    totalIncome,
    totalExpenses,
    netProfit,
    pendingInvoices: pendingInvoices.length,
    pendingAmount,
    paidInvoices: paidInvoices.length,
    paidAmount: totalIncome,
  }
}

export async function getMonthlyData(months = 6): Promise<MonthlyData[]> {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const [invoices, expenses] = await Promise.all([getInvoices(), getExpenses()])

  const monthlyMap = new Map<string, MonthlyData>()

  // Initialize last N months
  const now = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = date.toISOString().slice(0, 7) // YYYY-MM
    const monthLabel = date.toLocaleDateString("es-DO", { year: "numeric", month: "short" })

    monthlyMap.set(monthKey, {
      month: monthLabel,
      income: 0,
      expenses: 0,
      profit: 0,
    })
  }

  // Add invoice income
  for (const invoice of invoices) {
    if (invoice.status === "paid") {
      const monthKey = invoice.issueDate.slice(0, 7)
      const data = monthlyMap.get(monthKey)
      if (data) {
        data.income += invoice.total
      }
    }
  }

  // Add expenses
  for (const expense of expenses) {
    const monthKey = expense.date.slice(0, 7)
    const data = monthlyMap.get(monthKey)
    if (data) {
      data.expenses += expense.amount
    }
  }

  // Calculate profit
  for (const data of monthlyMap.values()) {
    data.profit = data.income - data.expenses
  }

  return Array.from(monthlyMap.values())
}

export async function getExpensesByCategory(): Promise<CategoryExpense[]> {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const expenses = await getExpenses()

  const categoryMap = new Map<string, number>()
  let total = 0

  for (const expense of expenses) {
    categoryMap.set(expense.category, (categoryMap.get(expense.category) || 0) + expense.amount)
    total += expense.amount
  }

  const categoryExpenses: CategoryExpense[] = []
  for (const [category, amount] of categoryMap.entries()) {
    categoryExpenses.push({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    })
  }

  // Sort by amount descending
  categoryExpenses.sort((a, b) => b.amount - a.amount)

  return categoryExpenses
}
