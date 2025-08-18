"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, MessageCircle, ShoppingBag, Calendar, Flag } from "lucide-react"

const mobileNavItems = [
  { name: "Café", href: "/cafe", icon: MessageCircle, color: "yellow" },
  { name: "News", href: "/paddock-talk", icon: Flag, color: "blue" },
  { name: "Shop", href: "/merchandise", icon: ShoppingBag, color: "green" },
  { name: "Teams", href: "/teams", icon: Users, color: "purple" },
  { name: "Races", href: "/calendar", icon: Calendar, color: "red" },
]

export default function MobileNavigation() {
  const pathname = usePathname()

  // Hide mobile navigation on home page
  if (pathname === "/") {
    return null
  }

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
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-red-900 via-slate-900 to-blue-700 text-white border-t-2 border-white/20 z-[9999] shadow-2xl mobile-nav-locked">
      <div className="flex justify-around items-center py-4 px-2 pb-safe">
        {mobileNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const colorClass = item.color === "red" ? "from-red-800 to-red-950" : 
                            item.color === "blue" ? "from-blue-600 to-blue-800" : 
                            item.color === "green" ? "from-green-600 to-green-800" :
                            item.color === "purple" ? "from-purple-600 to-purple-800" :
                            "from-yellow-600 to-yellow-800"

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex flex-col items-center p-3 rounded-xl min-w-0 flex-1 transition-all duration-200 transform touch-manipulation",
                isActive
                  ? item.color === "yellow" 
                    ? `bg-gradient-to-b ${colorClass} text-yellow-400 shadow-lg scale-105 border border-yellow-400/50`
                    : item.color === "blue"
                    ? `bg-gradient-to-b ${colorClass} text-blue-400 shadow-lg scale-105 border border-blue-400/50`
                    : item.color === "green"
                    ? `bg-gradient-to-b ${colorClass} text-green-400 shadow-lg scale-105 border border-green-400/50`
                    : item.color === "purple"
                    ? `bg-gradient-to-b ${colorClass} text-purple-400 shadow-lg scale-105 border border-purple-400/50`
                    : item.color === "red"
                    ? `bg-gradient-to-b ${colorClass} text-red-400 shadow-lg scale-105 border border-red-400/50`
                    : `bg-gradient-to-b ${colorClass} text-white shadow-lg scale-105 border border-white/30`
                  : item.color === "yellow" ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 active:scale-95"
                  : item.color === "blue" ? "text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 active:scale-95"
                  : item.color === "green" ? "text-green-400 hover:text-green-300 hover:bg-green-400/10 active:scale-95"
                  : item.color === "purple" ? "text-purple-400 hover:text-purple-300 hover:bg-purple-400/10 active:scale-95"
                  : item.color === "red" ? "text-red-400 hover:text-red-300 hover:bg-red-400/10 active:scale-95"
                  : "text-white/80 hover:text-white hover:bg-white/10 active:scale-95",
              )}
            >
              <Icon className={cn("mb-1 transition-all duration-200", 
                isActive ? "h-8 w-8" : "h-7 w-7",
                item.color === "yellow" ? "text-yellow-400" : 
                item.color === "blue" ? "text-blue-400" :
                item.color === "green" ? "text-green-400" :
                item.color === "purple" ? "text-purple-400" :
                item.color === "red" ? "text-red-400" : ""
              )} />
              <span
                className={cn("font-rajdhani font-medium truncate transition-all duration-200", 
                  isActive ? "text-sm" : "text-sm",
                  item.color === "yellow" ? "text-yellow-400" : 
                  item.color === "blue" ? "text-blue-400" :
                  item.color === "green" ? "text-green-400" :
                  item.color === "purple" ? "text-purple-400" :
                  item.color === "red" ? "text-red-400" : ""
                )}
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
