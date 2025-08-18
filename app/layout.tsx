import type React from "react"
import type { Metadata } from "next"
import { Orbitron, Rajdhani } from "next/font/google"
import "./globals.css"
import MobileNavigation from "@/components/mobile-navigation"
import Footer from "@/components/footer"

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
})

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Grand Prix Social - F1 Fan Community",
  description: "The ultimate social platform for Formula 1 fans - news, social feeds, merchandise, and gaming",
  keywords: "Formula 1, F1, racing, social media, fantasy league, merchandise, live races, drivers, teams",
  authors: [{ name: "Grand Prix Social Team" }],
  creator: "Grand Prix Social",
  publisher: "Grand Prix Social",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://grandprixsocial.com",
    siteName: "Grand Prix Social",
    title: "Grand Prix Social - F1 Fan Community",
    description: "Connect with F1 fans worldwide. Fantasy leagues, live race tracking, news, and merchandise.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Grand Prix Social - F1 Fan Community",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grand Prix Social - F1 Fan Community",
    description: "Connect with F1 fans worldwide. Fantasy leagues, live race tracking, news, and merchandise.",
    images: ["/og-image.png"],
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#DC2626",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} ${rajdhani.variable} font-rajdhani antialiased`}>
        <div className="min-h-screen bg-black">
          <div className="pb-16 md:pb-0">{children}</div>
        </div>
        <MobileNavigation />
        <Footer />
      </body>
    </html>
  )
}
