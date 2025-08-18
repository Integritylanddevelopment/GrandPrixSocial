"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Trophy, MessageCircle, ShoppingBag, Calendar, Flag } from "lucide-react"
import { useState } from "react"

const mobileNavItems = [
  { name: "F1 Café", href: "/cafe", icon: MessageCircle, color: "yellow" },
  { name: "News", href: "/paddock-talk", icon: Flag, color: "blue" },
  { name: "Fantasy F1", href: "/teams", icon: Trophy, color: "purple" },
  { name: "Shop", href: "/merchandise", icon: ShoppingBag, color: "green" },
  { name: "Races", href: "/calendar", icon: Calendar, color: "red" },
]

export default function MobileNavigation() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)

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

  const handleNavExpand = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsExpanded(!isExpanded)
  }

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 bg-gradient-to-r from-red-900 via-slate-900 to-blue-700 text-white border-t-2 border-white/20 z-[9999] shadow-2xl mobile-nav-locked transition-all duration-300 cursor-pointer",
      isExpanded ? "h-auto" : "h-4"
    )} onClick={handleNavExpand}>
      <div className={cn(
        "flex justify-around items-center px-2 pb-safe transition-all duration-300",
        isExpanded ? "py-4" : "py-1"
      )}>
        {mobileNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const colorClass = item.color === "red" ? "from-red-800 to-red-950" : 
                            item.color === "blue" ? "from-blue-600 to-blue-800" : 
                            item.color === "green" ? "from-green-600 to-green-800" :
                            item.color === "purple" ? "from-purple-600 to-purple-800" :
                            "from-yellow-600 to-yellow-800"

          const handleItemClick = (e: React.MouseEvent) => {
            e.stopPropagation()
            handleNavClick()
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleItemClick}
              className={cn(
                "flex flex-col items-center rounded-xl min-w-0 flex-1 transition-all duration-300 transform touch-manipulation",
                isExpanded ? "p-3" : "p-1",
                isActive
                  ? item.color === "yellow" 
                    ? `glass-yellow text-yellow-400 shadow-lg scale-105 border border-yellow-400/50 backdrop-blur-sm`
                    : item.color === "blue"
                    ? `glass-blue text-blue-400 shadow-lg scale-105 border border-blue-400/50 backdrop-blur-sm`
                    : item.color === "green"
                    ? `glass-green text-green-400 shadow-lg scale-105 border border-green-400/50 backdrop-blur-sm`
                    : item.color === "purple"
                    ? `glass-purple text-purple-400 shadow-lg scale-105 border border-purple-400/50 backdrop-blur-sm`
                    : item.color === "red"
                    ? `glass-red text-red-400 shadow-lg scale-105 border border-red-400/50 backdrop-blur-sm`
                    : `glass-yellow text-white shadow-lg scale-105 border border-white/30 backdrop-blur-sm`
                  : item.color === "yellow" ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 active:scale-95"
                  : item.color === "blue" ? "text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 active:scale-95"
                  : item.color === "green" ? "text-green-400 hover:text-green-300 hover:bg-green-400/10 active:scale-95"
                  : item.color === "purple" ? "text-purple-400 hover:text-purple-300 hover:bg-purple-400/10 active:scale-95"
                  : item.color === "red" ? "text-red-400 hover:text-red-300 hover:bg-red-400/10 active:scale-95"
                  : "text-white/80 hover:text-white hover:bg-white/10 active:scale-95",
              )}
            >
              <Icon className={cn("transition-all duration-300", 
                isExpanded ? (isActive ? "h-8 w-8 mb-1" : "h-7 w-7 mb-1") : "h-3 w-3 mb-0",
                item.color === "yellow" ? "text-yellow-400" : 
                item.color === "blue" ? "text-blue-400" :
                item.color === "green" ? "text-green-400" :
                item.color === "purple" ? "text-purple-400" :
                item.color === "red" ? "text-red-400" : ""
              )} />
              <span
                className={cn("font-rajdhani font-medium truncate transition-all duration-300", 
                  isExpanded ? "text-sm opacity-100" : "text-xs opacity-0 h-0 overflow-hidden",
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
