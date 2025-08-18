"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { UserNav } from "@/components/auth/user-nav"

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "F1 Café", href: "/cafe" }, // renamed from "Café" to "F1 Café"
  { name: "Paddock Talk", href: "/paddock-talk" },
  { name: "Teams", href: "/teams" },
  { name: "Merchandise", href: "/merchandise" },
  { name: "Race Schedule", href: "/calendar" },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex items-center justify-between p-4 bg-gradient-to-r from-red-600 via-gray-900 to-blue-600 text-white">
      <div className="flex items-center space-x-8">
        <Link href="/" className="text-xl font-bold">
          Grand Prix Social
        </Link>
        <div className="flex space-x-6">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === item.href ? "bg-white/20 text-white" : "text-white/80 hover:text-white hover:bg-white/10",
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
      <UserNav />
    </nav>
  )
}