import Navigation from "@/components/navigation"
import MobileNavigation from "@/components/mobile-navigation"
import MobileOptimizedLayout from "@/components/mobile-optimized-layout"
import Cafe from "@/components/pages/cafe"

export default function CafePage() {
  return (
    <MobileOptimizedLayout>
      <Navigation />
      <Cafe />
      <MobileNavigation />
    </MobileOptimizedLayout>
  )
}
