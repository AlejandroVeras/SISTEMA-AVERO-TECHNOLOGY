"use server"

import { cookies } from "next/headers"

export interface User {
  id: string
  email: string
  businessName: string
  rnc?: string
  phone?: string
  address?: string
}

// In-memory storage for demo purposes (replace with database in production)
const users: Map<string, User & { passwordHash: string }> = new Map()
const sessions: Map<string, string> = new Map() // sessionId -> userId

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const businessName = formData.get("businessName") as string

  if (!email || !password || !businessName) {
    return { error: "All fields are required" }
  }

  if (Array.from(users.values()).some((u) => u.email === email)) {
    return { error: "Email already exists" }
  }

  const userId = crypto.randomUUID()
  const user: User & { passwordHash: string } = {
    id: userId,
    email,
    passwordHash: password, // In production, use bcrypt
    businessName,
  }

  users.set(userId, user)

  // Create session
  const sessionId = crypto.randomUUID()
  sessions.set(sessionId, userId)

  const cookieStore = await cookies()
  cookieStore.set("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })

  return { success: true }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const user = Array.from(users.values()).find((u) => u.email === email)

  if (!user || user.passwordHash !== password) {
    return { error: "Invalid credentials" }
  }

  // Create session
  const sessionId = crypto.randomUUID()
  sessions.set(sessionId, user.id)

  const cookieStore = await cookies()
  cookieStore.set("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  })

  return { success: true }
}

export async function signOut() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session")?.value

  if (sessionId) {
    sessions.delete(sessionId)
    cookieStore.delete("session")
  }

  return { success: true }
}

export async function getUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session")?.value

  if (!sessionId) return null

  const userId = sessions.get(sessionId)
  if (!userId) return null

  const user = users.get(userId)
  if (!user) return null

  const { passwordHash, ...userWithoutPassword } = user
  return userWithoutPassword
}
