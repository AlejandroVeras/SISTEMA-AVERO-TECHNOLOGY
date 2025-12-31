"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createCustomer, updateCustomer, type Customer } from "@/lib/data/customers"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface CustomerFormProps {
  customer?: Customer
}

export function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)

    const result = customer ? await updateCustomer(customer.id, formData) : await createCustomer(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push("/dashboard/customers")
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6 space-y-4">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nombre del Cliente *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Nombre completo o empresa"
                required
                disabled={loading}
                defaultValue={customer?.name}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="cliente@email.com"
                disabled={loading}
                defaultValue={customer?.email}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="(809) 555-5555"
                disabled={loading}
                defaultValue={customer?.phone}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rnc">RNC</Label>
              <Input
                id="rnc"
                name="rnc"
                type="text"
                placeholder="000-0000000-0"
                disabled={loading}
                defaultValue={customer?.rnc}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                name="address"
                type="text"
                placeholder="Dirección completa"
                disabled={loading}
                defaultValue={customer?.address}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Información adicional sobre el cliente"
                disabled={loading}
                defaultValue={customer?.notes}
                rows={4}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/customers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancelar
            </Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : customer ? "Actualizar Cliente" : "Crear Cliente"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
