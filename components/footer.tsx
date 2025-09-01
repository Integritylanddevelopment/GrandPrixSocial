import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Flag, Twitter, Instagram, Facebook } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-t border-gray-800 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Flag className="h-6 w-6 text-red-500" />
              <h3 className="text-xl font-bold text-white">Grand Prix Social</h3>
            </div>
            <p className="text-gray-400 text-sm">
              The ultimate social platform for Formula 1 fans. Connect, compete, and celebrate the world of racing.
            </p>
            <div className="flex gap-4">
              <a href="https://facebook.com/grandprixsocial" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-5 w-5 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
              </a>
              <a href="https://instagram.com/grandprixsocial" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-5 w-5 text-gray-400 hover:text-pink-400 cursor-pointer transition-colors" />
              </a>
              <a href="https://tiktok.com/@grandprixsocial" target="_blank" rel="noopener noreferrer">
                <svg className="h-5 w-5 text-gray-400 hover:text-black cursor-pointer transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a href="https://x.com/grandprixsocial" target="_blank" rel="noopener noreferrer">
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-200 cursor-pointer transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Platform</h4>
            <div className="space-y-2">
              <Link href="/cafe" className="block text-gray-400 hover:text-white transition-colors text-sm">
                F1 Café
              </Link>
              <Link href="/paddock-talk" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Paddock Talk
              </Link>
              <Link href="/fantasy" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Fantasy Formula
              </Link>
              <Link href="/merchandise" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Merchandise
              </Link>
              <Link href="/calendar" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Race Schedule
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Features</h4>
            <div className="space-y-2">
              <Link href="/fantasy" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Fantasy Leagues
              </Link>
              <Link href="/live-race" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Live Race Tracking
              </Link>
              <Link href="/drivers" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Driver Statistics
              </Link>
              <Link href="/standings" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Championship Standings
              </Link>
            </div>
          </div>

          {/* Team Owners & Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Team Owners & Support</h4>
            <div className="space-y-2">
              {/* Team Owner Interface */}
              <Link 
                href="/claude-interface" 
                className="block text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium flex items-center gap-2 group"
              >
                <svg className="w-4 h-4 group-hover:animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Team Owner
              </Link>
              <Link href="/legal/privacy" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="/legal/terms" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </Link>
              <a
                href="mailto:support@grandprixsocial.com"
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Contact Support
              </a>
              <a
                href="mailto:legal@grandprixsocial.com"
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Legal Inquiries
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Grand Prix Social. All rights reserved.</p>
          <p className="text-gray-500 text-xs">
            Not affiliated with Formula 1, FIA, or any F1 teams. For entertainment purposes only.
          </p>
        </div>
      </div>
    </footer>
  )
}
