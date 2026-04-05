"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ShoppingCart, Laptop, Wrench, Settings, ArrowRight, X, Phone, Plus, Minus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Product } from "@/lib/data/products"

interface StorefrontProps {
  initialProducts: Product[]
  isLoggedIn: boolean
}

interface CartItem extends Product {
  cartQuantity: number
}

const WHATSAPP_NUMBER = "18298122103" // Formato internacional, sin '+' ni '-' (1 para Do, 829-812-2103) -> asumiendo 18298122103

export function Storefront({ initialProducts, isLoggedIn }: StorefrontProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  // Soporte Tecnico
  const [supportName, setSupportName] = useState("")
  const [supportDevice, setSupportDevice] = useState("")
  const [supportIssue, setSupportIssue] = useState("")

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(amount)
  }

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
        )
      }
      return [...prev, { ...product, cartQuantity: 1 }]
    })
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQ = item.cartQuantity + delta
          return newQ > 0 ? { ...item, cartQuantity: newQ } : item
        }
        return item
      })
    )
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.cartQuantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.cartQuantity, 0)

  const handleCheckoutWhatsApp = () => {
    let message = `*Hola Avero Technology*, me gustaría ordenar los siguientes artículos de su web:\n\n`
    cart.forEach(item => {
      message += `- ${item.cartQuantity}x ${item.name} (${formatCurrency(item.price)})\n`
    })
    message += `\n*Total estimado: ${formatCurrency(cartTotal)}*\n\nPor favor contáctenme para concretar el pago y envío.`
    
    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank")
  }

  const handleSupportWhatsApp = (e: React.FormEvent) => {
    e.preventDefault()
    const message = `*Solicitud de Soporte Técnico (Web)*\n\n*A nombre de:* ${supportName}\n*Equipo:* ${supportDevice}\n*Problema reportado:*\n${supportIssue}\n\nPor favor indíquenme los pasos a seguir.`
    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-indigo-500/30">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl cursor-default">
              A
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:inline-block">AVERO TECHNOLOGY</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            
            {/* CART BUTTON */}
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative group">
                  <ShoppingCart className="h-5 w-5 group-hover:text-indigo-500 transition-colors" />
                  {cartCount > 0 && (
                    <motion.div 
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] sm:text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                    >
                      {cartCount}
                    </motion.div>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md flex flex-col">
                <SheetHeader>
                  <SheetTitle>Tu Carrito ({cartCount})</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                  <AnimatePresence>
                    {cart.map((item) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center justify-between gap-4 p-3 border rounded-lg bg-card"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{item.name}</h4>
                          <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, -1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-4 text-center text-sm">{item.cartQuantity}</span>
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeFromCart(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                    {cart.length === 0 && (
                      <div className="text-center py-10 text-muted-foreground flex flex-col items-center justify-center">
                        <ShoppingCart className="h-12 w-12 opacity-20 mb-3" />
                        <p>Tu carrito está vacío</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
                {cart.length > 0 && (
                  <div className="pt-4 border-t space-y-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(cartTotal)}</span>
                    </div>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" size="lg" onClick={handleCheckoutWhatsApp}>
                      Hacer pedido por WhatsApp
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>

            <Button asChild variant="default" className="bg-foreground text-background hover:bg-foreground/90">
              <Link href={isLoggedIn ? "/dashboard" : "/login"}>
                {isLoggedIn ? "Dashboard" : "Ingresar"} <ArrowRight className="h-4 w-4 ml-2 hidden sm:block" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-background to-background" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <Badge variant="outline" className="text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20 px-3 py-1 text-sm">
                Soluciones Tecnológicas Confiables
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                Bienvenidos a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Avero Technology</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Nuestro compromiso es ofrecerte tecnología clara, honesta y funcional, lista para trabajar desde el primer día.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}>
                  Ver Equipos en Venta
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-900/30" onClick={() => document.getElementById('soporte')?.scrollIntoView({ behavior: 'smooth' })}>
                  Solicitar Soporte Técnico
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SERVICIOS SECTION */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Especialistas en IT</h2>
              <p className="text-muted-foreground mt-2">Cubrimos todas tus necesidades tecnológicas empresariales y personales</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { icon: Laptop, title: "Venta de Tecnología", desc: "Equipos nuevos y reacondicionados con garantía. Laptops, PCs, y periféricos para tu oficina." },
                { icon: Wrench, title: "Soporte Técnico", desc: "Reparación, mantenimiento preventivo y diagnóstico de fallas en hardware y software." },
                { icon: Settings, title: "Soluciones IT", desc: "Redes, servidores, sistemas de seguridad y consultoría para digitalizar tu negocio." }
              ].map((service, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <Card className="h-full border-border/50 bg-background/50 backdrop-blur hover:shadow-lg hover:border-indigo-500/30 transition-all duration-300">
                    <CardContent className="p-6 text-center space-y-4 flex flex-col items-center">
                      <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                        <service.icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold">{service.title}</h3>
                      <p className="text-muted-foreground text-sm">{service.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CATALOGO PÚBLICO */}
        <section id="catalogo" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Catálogo de Equipos</h2>
                <p className="text-muted-foreground mt-2">Inventario disponible para entrega inmediata</p>
              </div>
            </div>

            {initialProducts.length === 0 ? (
              <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-muted-foreground/30">
                <Laptop className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">El catálogo se está actualizando</h3>
                <p className="text-muted-foreground">Pronto publicaremos nuestros nuevos equipos en stock.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {initialProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full flex flex-col overflow-hidden border-border/50 hover:shadow-xl hover:border-indigo-500/50 transition-all">
                      <div className="aspect-video bg-muted/30 flex items-center justify-center p-6 border-b">
                        <Laptop className="w-16 h-16 text-indigo-500/20" />
                      </div>
                      <CardContent className="p-5 flex-1 flex flex-col">
                        <Badge className="w-fit mb-2 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 pointer-events-none">
                          {product.category || "Equipos"}
                        </Badge>
                        <h3 className="font-semibold text-lg line-clamp-2 mb-1">{product.name}</h3>
                        {product.sku && <p className="text-xs text-muted-foreground mb-3 font-mono">SKU: {product.sku}</p>}
                        
                        <div className="mt-auto pt-4 flex items-center justify-between">
                          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                            {formatCurrency(product.price)}
                          </p>
                        </div>
                        <Button 
                          className="w-full mt-4 bg-foreground text-background hover:bg-foreground/90" 
                          onClick={() => {
                            addToCart(product)
                            setIsCartOpen(true)
                          }}
                        >
                          Agregar al Carrito
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* FORMULARIO DE SOPORTE */}
        <section id="soporte" className="py-16 md:py-24 bg-indigo-950 text-indigo-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 opacity-5 pointer-events-none">
            <Wrench className="w-96 h-96" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1 space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">¿Tu equipo necesita ayuda?</h2>
                <p className="text-indigo-200 text-lg">
                  Nuestro equipo de expertos está listo para diagnosticar y reparar tus equipos. Envía tu reporte ahora y te responderemos inmediatamente vía WhatsApp.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-sm text-indigo-300">Respuesta Rápida WhatsApp</p>
                      <p className="font-semibold text-white">(829)-812-2103</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 w-full">
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white shadow-2xl">
                  <CardContent className="p-6 md:p-8 space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Abre un Ticket de Soporte</h3>
                    <form onSubmit={handleSupportWhatsApp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="sName" className="text-indigo-100">Tu Nombre *</Label>
                        <Input 
                          id="sName" 
                          required 
                          value={supportName}
                          onChange={(e) => setSupportName(e.target.value)}
                          className="bg-white/5 border-white/20 text-white placeholder:text-indigo-300/50" 
                          placeholder="Juan Pérez" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sDevice" className="text-indigo-100">Modelo del Equipo *</Label>
                        <Input 
                          id="sDevice" 
                          required 
                          value={supportDevice}
                          onChange={(e) => setSupportDevice(e.target.value)}
                          className="bg-white/5 border-white/20 text-white placeholder:text-indigo-300/50" 
                          placeholder="Ej: Laptop HP Pavilion 15" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sIssue" className="text-indigo-100">Describe el problema *</Label>
                        <Textarea 
                          id="sIssue" 
                          required 
                          rows={4}
                          value={supportIssue}
                          onChange={(e) => setSupportIssue(e.target.value)}
                          className="bg-white/5 border-white/20 text-white placeholder:text-indigo-300/50 resize-none" 
                          placeholder="La pantalla parpadea y la batería no carga..." 
                        />
                      </div>
                      <Button type="submit" className="w-full bg-white text-indigo-950 hover:bg-indigo-100 font-bold" size="lg">
                        Enviar a WhatsApp <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t bg-muted/20 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-xs">A</div>
              <span className="font-bold">AVERO TECHNOLOGY</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm">
              Tecnología clara, honesta y funcional, lista para trabajar desde el primer día.
            </p>
          </div>
          
          <div className="text-center md:text-right space-y-1">
            <p className="font-medium text-sm">📍 Santo Domingo, República Dominicana</p>
            <p className="text-muted-foreground text-sm">📲 WhatsApp: (829)-812-2103</p>
            <p className="text-xs text-muted-foreground pt-4">
              &copy; {new Date().getFullYear()} Avero Technology. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
