"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateProfile, type Profile } from "@/lib/data/profile"
import { toast } from "sonner"
import { BuildingIcon, Save } from "lucide-react"

interface SettingsFormProps {
  profile: Profile
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [businessName, setBusinessName] = useState(profile.businessName || "")
  const [phone, setPhone] = useState(profile.phone || "")
  const [address, setAddress] = useState(profile.address || "")
  const [taxId, setTaxId] = useState(profile.taxId || "")
  const [website, setWebsite] = useState(profile.website || "")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const result = await updateProfile({
      businessName,
      phone,
      address,
      taxId,
      website
    })

    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Configuración actualizada correctamente", {
        description: "Estos datos aparecerán en los encabezados de tus facturas."
      })
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BuildingIcon className="h-5 w-5 text-primary" />
            Perfil Fiscal del Negocio
          </CardTitle>
          <CardDescription>
            Información que aparecerá de forma oficial en tus cobros, facturas y cotizaciones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Nombre Comercial *</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="El nombre de tu empresa"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxId">RNC / Identificación Fiscal</Label>
              <Input
                id="taxId"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="Ejemplo: 402-1234567-8"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Número de Teléfono</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ejemplo: 809-555-5555"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Página Web</Label>
            <Input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Ejemplo: avero.tech"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección Física</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle principal, Edificio #1, Ciudad, País"
              rows={3}
              className="resize-none"
            />
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 py-4 px-6 border-t font-medium text-sm flex justify-between items-center">
          <p className="text-muted-foreground text-xs md:text-sm">Tus datos nunca se comparten bajo ningún contexto ajeno a tus cotizaciones.</p>
          <Button type="submit" disabled={loading} size="lg" className="min-w-[150px]">
            {loading ? "Guardando..." : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Personalización de Marca (Próximamente)</CardTitle>
          <CardDescription>Opciones avanzadas para personalizar tu identidad y correos automáticos.</CardDescription>
        </CardHeader>
        <CardContent>
           <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Ajustar Logo PDF personalizado</li>
              <li>• Editar formato de color de facturas</li>
              <li>• Configurar recordatorios automáticos por correo</li>
            </ul>
        </CardContent>
      </Card>
    </form>
  )
}
