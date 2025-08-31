import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navigation from "@/components/navigation"
import MobileNavigation from "@/components/mobile-navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Grand Prix Social - F1 Fan Community",
  description: "The ultimate social platform for Formula 1 fans - news, social feeds, merchandise, and gaming",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <div className="min-h-screen bg-black">
          <div className="pb-16 md:pb-0">{children}</div>
        </div>
        <MobileNavigation />
      </body>
    </html>
  )
}
