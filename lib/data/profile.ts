"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"

export interface Profile {
  id: string
  businessName: string
  email: string
  phone?: string
  address?: string
  taxId?: string
  website?: string
  logoUrl?: string
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) return null

  const { data: profileError, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching profile:", error)
    return null
  }

  // If no profile, we can fallback to the minimal data from auth
  if (!profileError) {
    return {
      id: user.id,
      businessName: user.businessName,
      email: user.email,
    }
  }

  return {
    id: profileError.id,
    businessName: profileError.business_name || user.businessName,
    email: user.email,
    phone: profileError.phone,
    address: profileError.address,
    taxId: profileError.tax_id,
    website: profileError.website,
    logoUrl: profileError.logo_url,
  }
}

export async function updateProfile(data: {
  businessName: string
  phone?: string
  address?: string
  taxId?: string
  website?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "No autorizado" }

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      business_name: data.businessName,
      phone: data.phone || null,
      address: data.address || null,
      tax_id: data.taxId || null,
      website: data.website || null,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error("Error updating profile:", error)
    return { error: "Ocurrió un error guardando el perfil" }
  }

  revalidatePath("/dashboard/settings")
  return { success: true }
}
