import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function PricingPage() {
  const user = await getUser()

  // If already logged in, redirect to dashboard
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple navbar */}
      <header className="border-b bg-background/90 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">A</div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight">AVERO</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] leading-none">Technology</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Ya tengo cuenta</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-lg">
        <div className="text-center mb-8">
          <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 mb-4">
            Empieza hoy
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">Elige tu plan</h1>
          <p className="text-muted-foreground mt-2">
            Accede a todo el sistema de gestión de Avero Technology
          </p>
        </div>

        <Card className="border-primary/50 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-blue-500" />
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Plan Profesional</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-extrabold">$15</span>
                <span className="text-muted-foreground">/mes</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                o $150/año (ahorra 2 meses)
              </p>
            </div>

            <ul className="text-left space-y-3">
              {[
                "Inventario ilimitado",
                "Tickets de soporte",
                "Base de clientes",
                "Facturación y cotizaciones PDF",
                "Reportes financieros",
                "Soporte técnico prioritario",
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-3 pt-2">
              <p className="text-sm text-muted-foreground">
                La integración de pago con Stripe se activará próximamente.
                Por ahora, contacta con nosotros para crear tu cuenta.
              </p>
              <Button size="lg" className="w-full" asChild>
                <a href="https://wa.me/18298122103?text=Hola%2C%20quiero%20contratar%20el%20sistema%20de%20gesti%C3%B3n%20de%20Avero%20Technology" target="_blank" rel="noopener">
                  Contactar para Suscribirse
                </a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/signup">Crear cuenta gratuita (demo)</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" /> Volver al inicio</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
