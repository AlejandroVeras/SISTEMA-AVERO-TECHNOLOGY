import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SettingsPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />
      <main className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Configuración</h1>
          <p className="text-slate-600 mt-1">Administra tu perfil y configuración de negocio</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información de Cuenta</CardTitle>
            <CardDescription>Tu información de usuario</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Correo Electrónico</label>
              <p className="text-slate-900 mt-1">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Nombre de Negocio</label>
              <p className="text-slate-900 mt-1">{user.businessName}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximamente</CardTitle>
            <CardDescription>Más opciones de configuración estarán disponibles pronto</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• Editar información del perfil</li>
              <li>• Cambiar contraseña</li>
              <li>• Configuración de impuestos</li>
              <li>• Personalización de facturas</li>
              <li>• Notificaciones por correo</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
