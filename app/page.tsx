import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Newspaper, ShoppingBag, Gamepad2, Flag, Zap, ChevronRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/f1-aerial-view.png')] bg-cover bg-center opacity-30" />
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <Flag className="h-12 w-12 text-red-500 animate-pulse" />
            <h1 className="text-7xl md:text-9xl font-f1 text-chrome">
              GRAND PRIX SOCIAL
            </h1>
            <Flag className="h-12 w-12 text-red-500 scale-x-[-1] animate-pulse" />
          </div>
          <p className="text-2xl md:text-3xl text-gray-200 mb-10 max-w-4xl mx-auto font-light">
            The ultimate social platform for Formula 1 fans. Connect, compete, and celebrate the world of racing.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Badge className="glass px-6 py-3 text-lg">
              <Zap className="h-5 w-5 mr-2 text-yellow-400" />
              Live F1 Updates
            </Badge>
            <Badge className="glass px-6 py-3 text-lg">
              <Users className="h-5 w-5 mr-2 text-blue-400" />
              Team Communities
            </Badge>
            <Badge className="glass px-6 py-3 text-lg">
              <Trophy className="h-5 w-5 mr-2 text-green-400" />
              Racing Tournaments
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Navigation Cards */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* F1 Café */}
          <Link href="/cafe">
            <Card className="glass-card group hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardContent className="p-8 text-center">
                <div className="glass rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all">
                  <Users className="h-10 w-10 text-orange-400" />
                </div>
                <h3 className="text-2xl font-f1 text-white mb-3">F1 CAFÉ</h3>
                <p className="text-gray-300 text-sm mb-4">Connect with F1 fans worldwide</p>
                <div className="flex justify-center gap-2">
                  <Badge className="glass text-xs">Social Feed</Badge>
                  <Badge className="glass text-xs">Live Chat</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* F1 News */}
          <Link href="/news">
            <Card className="glass-card group hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardContent className="p-8 text-center">
                <div className="glass rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all">
                  <Newspaper className="h-10 w-10 text-blue-400" />
                </div>
                <h3 className="text-2xl font-f1 text-white mb-3">F1 NEWS</h3>
                <p className="text-gray-300 text-sm mb-4">AI-curated racing updates</p>
                <div className="flex justify-center gap-2">
                  <Badge className="glass text-xs">Breaking</Badge>
                  <Badge className="glass text-xs">Analysis</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* F1 Merchandise */}
          <Link href="/merchandise">
            <Card className="glass-card group hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardContent className="p-8 text-center">
                <div className="glass rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all">
                  <ShoppingBag className="h-10 w-10 text-green-400" />
                </div>
                <h3 className="text-2xl font-f1 text-white mb-3">F1 MERCHANDISE</h3>
                <p className="text-gray-300 text-sm mb-4">Official team gear & collectibles</p>
                <div className="flex justify-center gap-2">
                  <Badge className="glass text-xs">Shop</Badge>
                  <Badge className="glass text-xs">Rewards</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Fantasy F1 */}
          <Link href="/fantasy">
            <Card className="glass-card group hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardContent className="p-8 text-center">
                <div className="glass rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all">
                  <Gamepad2 className="h-10 w-10 text-purple-400" />
                </div>
                <h3 className="text-2xl font-f1 text-white mb-3">FANTASY F1</h3>
                <p className="text-gray-300 text-sm mb-4">Build your championship team</p>
                <div className="flex justify-center gap-2">
                  <Badge className="glass text-xs">Leagues</Badge>
                  <Badge className="glass text-xs">Prizes</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
