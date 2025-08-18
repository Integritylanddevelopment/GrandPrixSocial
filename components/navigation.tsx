"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { UserNav } from "@/components/auth/user-nav"

const navigationItems = [
  { name: "F1 Café", href: "/cafe" },
  { name: "Paddock Talk", href: "/paddock-talk" },
  { name: "Teams", href: "/teams" },
  { name: "Merchandise", href: "/merchandise" },
  { name: "Race Schedule", href: "/calendar" },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Centered */}
          <div className="flex-1 flex justify-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-f1 text-chrome">GRAND PRIX SOCIAL</span>
            </Link>
          </div>
          
          {/* Auth Buttons - Right */}
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <button className="glass-button text-white border-white/30">
                Sign In
              </button>
            </Link>
            <Link href="/auth/signup">
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                Join
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}