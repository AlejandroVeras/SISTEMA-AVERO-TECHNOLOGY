"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import Link from "next/link"
import {
  ShoppingCart, Laptop, Wrench, Settings, ArrowRight, Phone, Plus, Minus,
  Trash2, Search, LayoutGrid, List, Filter, ChevronDown, ChevronUp,
  Shield, Zap, Heart, Monitor, Server, Wifi, HardDrive, Headphones,
  BarChart3, Users, Package, Ticket, Smartphone, Globe, CheckCircle2,
  MessageCircle, Mail, MapPin, Menu, X, ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Product } from "@/lib/data/products"

// ─── Types ────────────────────────────────────────────────────────
interface StorefrontProps {
  initialProducts: Product[]
  isLoggedIn: boolean
}

interface CartItem extends Product {
  cartQuantity: number
}

const WHATSAPP_NUMBER = "18298122103"
const MONTHLY_PRICE = 15
const ANNUAL_PRICE = 150

// ─── Animated Counter ─────────────────────────────────────────────
function AnimatedCounter({ target, label, suffix = "" }: { target: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const duration = 2000
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, target])

  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl md:text-5xl font-extrabold text-primary">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  )
}

// ─── FAQ Item ─────────────────────────────────────────────────────
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-medium text-foreground group-hover:text-primary transition-colors pr-4">
          {question}
        </span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-primary shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-muted-foreground text-sm leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────
export function Storefront({ initialProducts, isLoggedIn }: StorefrontProps) {
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Catalog state
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Pricing toggle
  const [isAnnual, setIsAnnual] = useState(true)

  // Support form
  const [supportForm, setSupportForm] = useState({
    name: "", email: "", phone: "", problemType: "hardware", description: ""
  })

  // Helper
  function formatCurrency(amount: number, currency = "USD") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
  }

  // Cart functions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, cartQuantity: i.cartQuantity + 1 } : i)
      return [...prev, { ...product, cartQuantity: 1 }]
    })
  }
  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, cartQuantity: Math.max(1, i.cartQuantity + delta) } : i))
  }
  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id))

  const cartTotal = cart.reduce((s, i) => s + i.price * i.cartQuantity, 0)
  const cartCount = cart.reduce((s, i) => s + i.cartQuantity, 0)

  const handleCheckoutWhatsApp = () => {
    let msg = `*Hola Avero Technology*, me gustaría ordenar:\n\n`
    cart.forEach(i => { msg += `• ${i.cartQuantity}x ${i.name} — ${formatCurrency(i.price)}\n` })
    msg += `\n*Total: ${formatCurrency(cartTotal)}*\n\nQuedo atento a su respuesta.`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank")
  }

  // Filtered products
  const categories = useMemo(() => {
    const cats = new Set(initialProducts.map(p => p.category || "Otros"))
    return ["all", ...Array.from(cats)]
  }, [initialProducts])

  const filteredProducts = useMemo(() => {
    return initialProducts.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
      const matchCategory = categoryFilter === "all" || (p.category || "Otros") === categoryFilter
      return matchSearch && matchCategory
    })
  }, [initialProducts, searchQuery, categoryFilter])

  // Support WhatsApp
  const handleSupportWhatsApp = (e: React.FormEvent) => {
    e.preventDefault()
    const msg = `*Solicitud de Soporte Técnico*\n\n` +
      `*Nombre:* ${supportForm.name}\n` +
      `*Email:* ${supportForm.email}\n` +
      `${supportForm.phone ? `*Teléfono:* ${supportForm.phone}\n` : ""}` +
      `*Tipo:* ${supportForm.problemType}\n` +
      `*Descripción:*\n${supportForm.description}\n\n` +
      `Enviado desde averotech.com`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank")
  }

  // Nav links
  const navLinks = [
    { label: "Inicio", href: "#" },
    { label: "Catálogo", href: "#catalogo" },
    { label: "Sistemas", href: "#sistemas" },
    { label: "Soporte", href: "#soporte" },
    { label: "Contacto", href: "#contacto" },
  ]

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false)
    if (id === "#") { window.scrollTo({ top: 0, behavior: "smooth" }); return }
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" })
  }

  // ─── RENDER ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ══════════════════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => scrollTo("#")} className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg group-hover:scale-105 transition-transform">
              A
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-sm leading-tight">AVERO</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] leading-none">Technology</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Cart */}
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md flex flex-col">
                <SheetHeader>
                  <SheetTitle>Carrito ({cartCount})</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto py-4 space-y-3">
                  <AnimatePresence>
                    {cart.map(item => (
                      <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-primary font-semibold text-sm">{formatCurrency(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, -1)}><Minus className="h-3 w-3" /></Button>
                          <span className="w-6 text-center text-sm">{item.cartQuantity}</span>
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, 1)}><Plus className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(item.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {cart.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>Tu carrito está vacío</p>
                    </div>
                  )}
                </div>
                {cart.length > 0 && (
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span><span>{formatCurrency(cartTotal)}</span>
                    </div>
                    <Button className="w-full" size="lg" onClick={handleCheckoutWhatsApp}>
                      <MessageCircle className="h-4 w-4 mr-2" /> Pedir por WhatsApp
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>

            <Button asChild size="sm" className="hidden sm:flex">
              <Link href={isLoggedIn ? "/dashboard" : "/login"}>
                {isLoggedIn ? "Dashboard" : "Mi Cuenta"}
              </Link>
            </Button>

            {/* Mobile menu */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t overflow-hidden bg-background"
            >
              <div className="p-4 space-y-1">
                {navLinks.map(link => (
                  <button key={link.label} onClick={() => scrollTo(link.href)}
                    className="block w-full text-left px-3 py-2.5 text-sm font-medium rounded-md hover:bg-muted"
                  >
                    {link.label}
                  </button>
                ))}
                <Link href={isLoggedIn ? "/dashboard" : "/login"}
                  className="block w-full text-left px-3 py-2.5 text-sm font-medium text-primary rounded-md hover:bg-muted"
                >
                  {isLoggedIn ? "Ir al Dashboard" : "Iniciar Sesión"}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* ══════════════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/8 via-background to-background" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHpNMjAgMzRoNHYxaC00ek0zNiAyMGg0djFoLTR6TTIwIDIwaDR2MWgtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center space-y-6"
            >
              <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 px-4 py-1.5">
                Soluciones Tecnológicas en Santo Domingo, RD
              </Badge>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
                Tecnología que{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                  impulsa tu negocio
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Equipos, software y soporte IT. Todo lo que necesitas para digitalizar tu empresa con confianza y garantía.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Button size="lg" onClick={() => scrollTo("#catalogo")} className="w-full sm:w-auto">
                  <Monitor className="h-4 w-4 mr-2" /> Ver Catálogo
                </Button>
                <Button size="lg" variant="outline" onClick={() => scrollTo("#sistemas")} className="w-full sm:w-auto">
                  <Globe className="h-4 w-4 mr-2" /> Ver Sistemas
                </Button>
                <Button size="lg" variant="ghost" onClick={() => scrollTo("#soporte")} className="w-full sm:w-auto">
                  <Wrench className="h-4 w-4 mr-2" /> Solicitar Soporte
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            CATÁLOGO
        ══════════════════════════════════════════════════════════ */}
        <section id="catalogo" className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Catálogo de Equipos</h2>
              <p className="text-muted-foreground mt-2 max-w-lg mx-auto">Laptops, PCs y periféricos disponibles para entrega inmediata</p>
            </motion.div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar equipos..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat === "all" ? "Todas" : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex border rounded-md overflow-hidden">
                <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("grid")} className="rounded-none">
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("list")} className="rounded-none">
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-background rounded-2xl border border-dashed">
                <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-medium text-lg">No se encontraron equipos</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {searchQuery ? "Intenta con otra búsqueda" : "Pronto publicaremos nuestro inventario"}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredProducts.map((product, i) => (
                  <motion.div key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="h-full flex flex-col overflow-hidden group hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                      <div className="aspect-[4/3] bg-muted/50 flex items-center justify-center border-b relative">
                        <Laptop className="w-16 h-16 text-primary/15 group-hover:scale-110 transition-transform" />
                        <Badge className="absolute top-3 right-3 text-[10px]" variant={product.stockQuantity > 0 ? "default" : "destructive"}>
                          {product.stockQuantity > 0 ? "Disponible" : "Agotado"}
                        </Badge>
                      </div>
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <Badge variant="outline" className="w-fit mb-2 text-[10px]">{product.category || "Equipos"}</Badge>
                        <h3 className="font-semibold line-clamp-2 mb-1">{product.name}</h3>
                        {product.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
                        )}
                        <div className="mt-auto pt-3">
                          <p className="text-xl font-bold text-primary">{formatCurrency(product.price)}</p>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" className="flex-1" onClick={() => {
                              const msg = `Hola, me interesa el ${product.name} (${formatCurrency(product.price)})`
                              window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank")
                            }}>
                              <MessageCircle className="h-3 w-3 mr-1" /> Consultar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { addToCart(product); setIsCartOpen(true) }}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* List view */
              <div className="space-y-3">
                {filteredProducts.map(product => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                        <Laptop className="w-8 h-8 text-primary/20" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{product.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{product.category || "Equipos"} {product.sku ? `• SKU: ${product.sku}` : ""}</p>
                      </div>
                      <Badge variant={product.stockQuantity > 0 ? "default" : "destructive"} className="hidden sm:flex shrink-0">
                        {product.stockQuantity > 0 ? "Disponible" : "Agotado"}
                      </Badge>
                      <p className="text-lg font-bold text-primary shrink-0">{formatCurrency(product.price)}</p>
                      <Button size="sm" onClick={() => {
                        const msg = `Hola, me interesa el ${product.name}`
                        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank")
                      }}>
                        <MessageCircle className="h-3 w-3 mr-1" /> Consultar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SISTEMAS TECNOLÓGICOS
        ══════════════════════════════════════════════════════════ */}
        <section id="sistemas" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
              <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 mb-4">Software SaaS</Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Sistemas de Gestión Empresarial</h2>
              <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                Digitaliza tu negocio con nuestro sistema todo-en-uno de inventario, soporte y control de clientes
              </p>
            </motion.div>

            {/* Features grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
              {[
                { icon: Package, label: "Gestión de Inventario" },
                { icon: Ticket, label: "Tickets de Soporte" },
                { icon: Users, label: "Control de Clientes" },
                { icon: BarChart3, label: "Reportes y Métricas" },
                { icon: Globe, label: "Acceso Web 24/7" },
                { icon: Smartphone, label: "App Móvil" },
              ].map((feat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:border-primary/30 transition-colors">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <feat.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{feat.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pricing toggle */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className={`text-sm font-medium ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>Mensual</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative w-14 h-7 rounded-full transition-colors ${isAnnual ? "bg-primary" : "bg-muted-foreground/30"}`}
              >
                <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${isAnnual ? "translate-x-7" : "translate-x-0.5"}`} />
              </button>
              <span className={`text-sm font-medium ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
                Anual <Badge className="ml-1 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30">-17%</Badge>
              </span>
            </div>

            {/* Plan card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-md mx-auto"
            >
              <Card className="border-primary/50 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-blue-500" />
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl">Plan Profesional</CardTitle>
                  <p className="text-muted-foreground text-sm">Todo lo que necesitas para gestionar tu negocio</p>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <div>
                    {isAnnual && (
                      <p className="text-muted-foreground line-through text-lg">{formatCurrency(MONTHLY_PRICE)}/mes</p>
                    )}
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-extrabold">
                        {formatCurrency(isAnnual ? ANNUAL_PRICE / 12 : MONTHLY_PRICE).replace(".00", "")}
                      </span>
                      <span className="text-muted-foreground">/mes</span>
                    </div>
                    {isAnnual && (
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                        {formatCurrency(ANNUAL_PRICE)}/año — Ahorras 2 meses gratis
                      </p>
                    )}
                  </div>

                  <ul className="text-left space-y-3">
                    {[
                      "Inventario ilimitado de productos",
                      "Sistema de tickets de soporte",
                      "Base de clientes completa",
                      "Facturación y cotizaciones PDF",
                      "Reportes financieros",
                      "Multi-usuario por empresa",
                      "Soporte técnico prioritario",
                      "Acceso web + app móvil",
                    ].map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <Button size="lg" className="w-full" asChild>
                    <Link href="/pricing">
                      Comenzar ahora <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <p className="text-xs text-muted-foreground">Cancela cuando quieras. Sin contratos.</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SOPORTE TÉCNICO
        ══════════════════════════════════════════════════════════ */}
        <section id="soporte" className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Soporte Técnico IT</h2>
              <p className="text-muted-foreground mt-2">Diagnóstico, reparación y consultoría tecnológica profesional</p>
            </motion.div>

            {/* Service cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
              {[
                { icon: Monitor, title: "Reparación", desc: "Hardware y software" },
                { icon: Shield, title: "Mantenimiento", desc: "Preventivo y correctivo" },
                { icon: Wifi, title: "Redes", desc: "Instalación y config" },
                { icon: Server, title: "Servidores", desc: "Setup y administración" },
                { icon: HardDrive, title: "Diagnóstico", desc: "Análisis completo" },
                { icon: Headphones, title: "Consultoría", desc: "Asesoría IT empresarial" },
              ].map((svc, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <Card className="text-center h-full hover:border-primary/30 transition-colors">
                    <CardContent className="p-5 space-y-2">
                      <div className="w-10 h-10 mx-auto rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <svc.icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-sm">{svc.title}</h3>
                      <p className="text-xs text-muted-foreground">{svc.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Support form */}
            <div className="max-w-2xl mx-auto">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-primary" />
                    Solicitar Soporte Técnico
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Completa el formulario y recibirás respuesta por WhatsApp en menos de 2 horas</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSupportWhatsApp} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sName">Nombre completo *</Label>
                        <Input id="sName" required value={supportForm.name}
                          onChange={e => setSupportForm(p => ({ ...p, name: e.target.value }))}
                          placeholder="Juan Pérez"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sEmail">Correo electrónico *</Label>
                        <Input id="sEmail" type="email" required value={supportForm.email}
                          onChange={e => setSupportForm(p => ({ ...p, email: e.target.value }))}
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sPhone">Teléfono (opcional)</Label>
                        <Input id="sPhone" value={supportForm.phone}
                          onChange={e => setSupportForm(p => ({ ...p, phone: e.target.value }))}
                          placeholder="829-000-0000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sType">Tipo de problema *</Label>
                        <Select value={supportForm.problemType} onValueChange={(val: any) => setSupportForm(p => ({ ...p, problemType: val }))}>
                          <SelectTrigger id="sType"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hardware">Falla de Hardware</SelectItem>
                            <SelectItem value="software">Problema de Software</SelectItem>
                            <SelectItem value="network">Red / Internet</SelectItem>
                            <SelectItem value="server">Servidor</SelectItem>
                            <SelectItem value="security">Seguridad / Virus</SelectItem>
                            <SelectItem value="other">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sDesc">Descripción del problema *</Label>
                      <Textarea id="sDesc" required rows={4} value={supportForm.description}
                        onChange={e => setSupportForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="Mi laptop no enciende, se queda en pantalla negra..."
                        className="resize-none"
                      />
                    </div>
                    <Button type="submit" size="lg" className="w-full">
                      <MessageCircle className="h-4 w-4 mr-2" /> Enviar por WhatsApp
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            CONFIANZA / NOSOTROS
        ══════════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">¿Por qué Avero Technology?</h2>
              <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                Más que una empresa de tecnología — somos tu aliado digital de confianza en Santo Domingo
              </p>
            </motion.div>

            {/* Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
              {[
                { icon: Zap, title: "Rapidez", desc: "Respuesta en menos de 2 horas. Equipos listos para entregar el mismo día." },
                { icon: Heart, title: "Honestidad", desc: "Precios transparentes, sin letras pequeñas. Tecnología que funciona desde el día 1." },
                { icon: Shield, title: "Garantía", desc: "Todos nuestros equipos y servicios incluyen garantía completa." },
              ].map((val, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Card className="h-full text-center hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 space-y-4">
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <val.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-semibold">{val.title}</h3>
                      <p className="text-sm text-muted-foreground">{val.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Counters */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <AnimatedCounter target={500} label="Equipos Vendidos" suffix="+" />
              <AnimatedCounter target={200} label="Clientes Satisfechos" suffix="+" />
              <AnimatedCounter target={1500} label="Tickets Resueltos" suffix="+" />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            FAQ
        ══════════════════════════════════════════════════════════ */}
        <section id="faq" className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Preguntas Frecuentes</h2>
            </motion.div>

            <div className="max-w-2xl mx-auto bg-card rounded-xl border p-6">
              <FaqItem
                question="¿Los equipos tienen garantía?"
                answer="Sí. Todos nuestros equipos nuevos y reacondicionados incluyen garantía. El período varía según el producto — consulta los detalles al momento de la compra."
              />
              <FaqItem
                question="¿Cómo funciona el sistema de gestión?"
                answer="Es una plataforma web (SaaS) a la que accedes desde cualquier navegador. Incluye inventario, tickets de soporte, clientes, facturación y reportes. Pagas una suscripción mensual o anual."
              />
              <FaqItem
                question="¿Puedo cancelar mi suscripción en cualquier momento?"
                answer="Sí, puedes cancelar cuando quieras desde tu panel de cuenta. No hay contratos de permanencia ni penalizaciones."
              />
              <FaqItem
                question="¿Ofrecen soporte técnico remoto?"
                answer="Sí. Podemos diagnosticar y resolver muchos problemas de forma remota. Si requiere intervención física, coordinamos una visita."
              />
              <FaqItem
                question="¿Hacen envíos a todo el país?"
                answer="Actualmente operamos en Santo Domingo y alrededores. Para otras provincias, contáctanos por WhatsApp para coordinar el envío."
              />
              <FaqItem
                question="¿Aceptan pagos con tarjeta?"
                answer="Sí. Para equipos puedes pagar con transferencia o efectivo. Para las suscripciones del sistema aceptamos tarjetas de crédito/débito internacionales vía Stripe."
              />
              <FaqItem
                question="¿El sistema incluye app móvil?"
                answer="Sí, el plan incluye acceso desde la app móvil para iOS y Android, con las mismas funcionalidades que la versión web."
              />
              <FaqItem
                question="¿Qué pasa si mi suscripción vence?"
                answer="Tu cuenta se desactiva temporalmente pero tus datos se conservan. Al renovar, todo vuelve a estar disponible exactamente como lo dejaste."
              />
            </div>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer id="contacto" className="border-t bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">A</div>
                <div>
                  <span className="font-bold text-sm">AVERO</span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest ml-1">Technology</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Tecnología clara, honesta y funcional, lista para trabajar desde el primer día.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Navegación</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {navLinks.map(l => (
                  <li key={l.label}><button onClick={() => scrollTo(l.href)} className="hover:text-foreground transition-colors">{l.label}</button></li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Servicios</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Venta de Equipos</li>
                <li>Sistemas de Gestión</li>
                <li>Soporte Técnico</li>
                <li>Consultoría IT</li>
                <li>Redes y Servidores</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Contacto</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Santo Domingo, República Dominicana</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  <a href="https://wa.me/18298122103" target="_blank" rel="noopener" className="hover:text-foreground transition-colors">(829)-812-2103</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>info@averotech.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Avero Technology. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4">
              <Link href={isLoggedIn ? "/dashboard" : "/login"} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {isLoggedIn ? "Dashboard" : "Iniciar Sesión"}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
