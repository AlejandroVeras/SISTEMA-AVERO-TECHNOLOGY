import { getPublicProducts } from "@/lib/data/products"
import { Storefront } from "@/components/landing/storefront"
import { getUser } from "@/lib/auth"

export default async function HomePage() {
  const user = await getUser()
  const publicProducts = await getPublicProducts()
  
  return (
    <Storefront 
      initialProducts={publicProducts} 
      isLoggedIn={!!user}
    />
  )
}
