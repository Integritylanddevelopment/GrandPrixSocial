"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Users, MessageCircle, Trophy, ShoppingBag } from "lucide-react"

const mobileNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Café", href: "/cafe", icon: MessageCircle },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "News", href: "/paddock-talk", icon: Trophy },
  { name: "Shop", href: "/merchandise", icon: ShoppingBag },
]

export default function MobileNavigation() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-red-600 via-gray-900 to-blue-600 text-white border-t border-white/20">
      <div className="flex justify-around items-center py-2">
        {mobileNavItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-colors",
                pathname === item.href ? "bg-white/20 text-white" : "text-white/80 hover:text-white hover:bg-white/10",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
