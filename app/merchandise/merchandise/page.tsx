import Navigation from "@/components/navigation"
import MobileNavigation from "@/components/mobile-navigation"
import MobileOptimizedLayout from "@/components/mobile-optimized-layout"
import Merchandise from "@/components/pages/merchandise"

export default function MerchandisePage() {
  return (
    <MobileOptimizedLayout>
      <Navigation />
      <Merchandise />
      <MobileNavigation />
    </MobileOptimizedLayout>
  )
}
