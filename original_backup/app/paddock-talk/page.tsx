import Navigation from "@/components/navigation"
import MobileNavigation from "@/components/mobile-navigation"
import MobileOptimizedLayout from "@/components/mobile-optimized-layout"
import PaddockTalk from "@/components/pages/paddock-talk"

export default function PaddockTalkPage() {
  return (
    <MobileOptimizedLayout>
      <Navigation />
      <PaddockTalk />
      <MobileNavigation />
    </MobileOptimizedLayout>
  )
}
