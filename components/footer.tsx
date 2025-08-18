import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Flag, Twitter, Instagram, Youtube } from "lucide-react"

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
              <Twitter className="h-5 w-5 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-pink-400 cursor-pointer transition-colors" />
              <Youtube className="h-5 w-5 text-gray-400 hover:text-red-400 cursor-pointer transition-colors" />
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
              <Link href="/teams" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Teams & Gaming
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

          {/* Legal & Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Legal & Support</h4>
            <div className="space-y-2">
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
