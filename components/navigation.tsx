"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { UserNav } from "@/components/auth/user-nav"

const navigationItems = [
  { name: "F1 Café", href: "/cafe" },
  { name: "Paddock Talk", href: "/paddock-talk" },
  { name: "Fantasy Formula", href: "/fantasy" },
  { name: "Merchandise", href: "/merchandise" },
  { name: "Race Schedule", href: "/calendar" },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center h-16">
          {/* Empty navigation bar */}
        </div>
      </div>
    </nav>
  )
}