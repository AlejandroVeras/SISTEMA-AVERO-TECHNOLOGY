import { redirect } from "next/navigation"
import { getProfile } from "@/lib/data/profile"
import { SettingsForm } from "@/components/settings-form"

export default async function SettingsPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect("/login")
  }

  return (
    <div className="flex-1 w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configuración Comercial</h1>
        <p className="text-muted-foreground mt-1">Administra tu perfil, logo y detalles del negocio</p>
      </div>

      <SettingsForm profile={profile} />
    </div>
  )
}


