"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, MessageCircle, ShoppingBag, Calendar, Flag } from "lucide-react"

const mobileNavItems = [
  { name: "Café", href: "/cafe", icon: MessageCircle, color: "red" },
  { name: "News", href: "/paddock-talk", icon: Flag, color: "blue" },
  { name: "Teams", href: "/teams", icon: Users, color: "red" },
  { name: "Shop", href: "/merchandise", icon: ShoppingBag, color: "blue" },
  { name: "Races", href: "/calendar", icon: Calendar, color: "red" },
]

export default function MobileNavigation() {
  const pathname = usePathname()

  const handleNavClick = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    // Force blur all input elements to prevent keyboard popup
    const inputs = document.querySelectorAll("input, textarea, select")
    inputs.forEach((input) => {
      if (input instanceof HTMLElement) {
        input.blur()
      }
    })
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-red-600 via-slate-900 to-blue-600 text-white border-t-2 border-white/20 z-[9999] shadow-2xl mobile-nav-locked">
      <div className="flex justify-around items-center py-3 px-2 pb-safe">
        {mobileNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const colorClass = item.color === "red" ? "from-red-500 to-red-700" : "from-blue-500 to-blue-700"

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex flex-col items-center p-3 rounded-xl min-w-0 flex-1 transition-all duration-200 transform touch-manipulation",
                isActive
                  ? `bg-gradient-to-b ${colorClass} text-white shadow-lg scale-105 border border-white/30`
                  : "text-white/80 hover:text-white hover:bg-white/10 active:scale-95",
              )}
            >
              <Icon className={cn("mb-1 transition-all duration-200", isActive ? "h-6 w-6" : "h-5 w-5")} />
              <span
                className={cn("font-semibold truncate transition-all duration-200", isActive ? "text-xs" : "text-xs")}
              >
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
