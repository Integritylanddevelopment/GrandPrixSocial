"use client"

import type { ReactNode } from "react"

interface MobileOptimizedLayoutProps {
  children: ReactNode
}

export default function MobileOptimizedLayout({ children }: MobileOptimizedLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pb-16 md:pb-0">{children}</div>
    </div>
  )
}
