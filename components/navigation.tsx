"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Flag } from "lucide-react"
import { usePathname } from "next/navigation"

export function Navigation() {
  const pathname = usePathname()
  
  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Centered */}
          <div className="flex-1 flex justify-center">
            <Link href="/" className="flex items-center gap-2">
              <Flag className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-f1 text-chrome">GRAND PRIX SOCIAL</span>
              <Flag className="h-8 w-8 text-red-500 scale-x-[-1]" />
            </Link>
          </div>
          
          {/* Auth Buttons - Right */}
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="outline" className="glass-button text-white border-white/30">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Join
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
