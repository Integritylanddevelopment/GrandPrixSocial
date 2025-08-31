import Navigation from "@/components/navigation"
import MobileNavigation from "@/components/mobile-navigation"
import MobileOptimizedLayout from "@/components/mobile-optimized-layout"
import Profile from "@/components/pages/profile"

export default function ProfilePage() {
  return (
    <MobileOptimizedLayout>
      <Navigation />
      <Profile />
      <MobileNavigation />
    </MobileOptimizedLayout>
  )
}
