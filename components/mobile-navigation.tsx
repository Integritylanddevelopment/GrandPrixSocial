"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Trophy } from "lucide-react"
import CafeIcon from "@/components/icons/cafe-icon"
import NewsIcon from "@/components/icons/news-icon"
import ShopIcon from "@/components/icons/shop-icon"
import RacesIcon from "@/components/icons/races-icon"
import { useState } from "react"

const mobileNavItems = [
  { name: "F1 Café", href: "/cafe", icon: CafeIcon, color: "yellow" },
  { name: "F1 News", href: "/paddock-talk", icon: NewsIcon, color: "blue" },
  { name: "Fantasy F1", href: "/teams", icon: Trophy, color: "purple" },
  { name: "F1 Merch", href: "/merchandise", icon: ShopIcon, color: "green" },
  { name: "F1 Schedule", href: "/calendar", icon: RacesIcon, color: "red" },
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
    <>
      {/* Home Button - Only show on non-home pages */}
      {pathname !== "/" && (
        <Link
          href="/"
          className="fixed bottom-6 left-6 z-[9999] w-16 h-16 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl border border-white/10 hover:bg-black/30 transition-all duration-300"
          onClick={handleNavClick}
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        </Link>
      )}

      {/* Menu Toggle Button */}
      <button
        onClick={handleNavExpand}
        className="fixed bottom-6 right-6 z-[9999] w-16 h-16 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl border border-white/10 hover:bg-black/30 transition-all duration-300"
      >
        <svg className={cn("w-8 h-8 text-white transition-transform duration-300", isExpanded && "rotate-45")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {/* Navigation Icons */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-[9998] transition-all duration-500 ease-in-out",
        isExpanded ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      )}>
        <div className="flex items-end pb-6 px-2">
          {mobileNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

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
                  "flex flex-col items-center justify-center gap-2 py-3 px-1 rounded-xl transition-all duration-300 backdrop-blur-md flex-1",
                  isActive && item.color === "yellow" && "bg-yellow-500/20 text-yellow-400 shadow-lg border border-yellow-400/30 scale-110",
                  isActive && item.color === "blue" && "bg-blue-500/20 text-blue-400 shadow-lg border border-blue-400/30 scale-110", 
                  isActive && item.color === "purple" && "bg-purple-500/20 text-purple-400 shadow-lg border border-purple-400/30 scale-110",
                  isActive && item.color === "green" && "bg-green-500/20 text-green-400 shadow-lg border border-green-400/30 scale-110",
                  isActive && item.color === "red" && "bg-red-500/20 text-red-400 shadow-lg border border-red-400/30 scale-110",
                  !isActive && item.color === "yellow" && "text-yellow-400 hover:bg-yellow-400/10",
                  !isActive && item.color === "blue" && "text-blue-400 hover:bg-blue-400/10",
                  !isActive && item.color === "purple" && "text-purple-400 hover:bg-purple-400/10",
                  !isActive && item.color === "green" && "text-green-400 hover:bg-green-400/10",
                  !isActive && item.color === "red" && "text-red-400 hover:bg-red-400/10"
                )}
              >
                <Icon className="h-14 w-14" width={55} height={55} />
                <span className="text-sm font-medium whitespace-nowrap font-rajdhani">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
