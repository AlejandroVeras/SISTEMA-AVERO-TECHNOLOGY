"use server"
import { createClient } from "@/lib/supabase/server"

export interface User {
  id: string
  email: string
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

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        businessName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !user) {
    return { error: "Invalid credentials" }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return { success: true }
}

export async function getUser(): Promise<User | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null

  return {
    id: user.id,
    email: user.email!,
  }
}
