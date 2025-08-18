import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Newspaper, ShoppingBag, Gamepad2, Flag, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/f1-aerial-view.png')] bg-cover bg-center opacity-10" />
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Flag className="h-8 w-8 text-red-500" />
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-red-500 via-white to-red-500 bg-clip-text text-transparent">
              Grand Prix Social
            </h1>
            <Flag className="h-8 w-8 text-red-500 scale-x-[-1]" />
          </div>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            The ultimate social platform for Formula 1 fans. Connect, compete, and celebrate the world of racing.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Badge variant="secondary" className="bg-red-600/20 text-red-400 border-red-500/30">
              <Zap className="h-4 w-4 mr-1" />
              Live F1 Updates
            </Badge>
            <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-500/30">
              <Users className="h-4 w-4 mr-1" />
              Team Communities
            </Badge>
            <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-500/30">
              <Trophy className="h-4 w-4 mr-1" />
              Racing Tournaments
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Navigation Cards */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Social/Cafe */}
          <Link href="/cafe">
            <Card className="group hover:scale-105 transition-all duration-300 bg-gradient-to-br from-orange-600/10 to-red-600/10 border-orange-500/30 hover:border-orange-400">
              <CardContent className="p-6 text-center">
                <div className="bg-orange-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-500/30 transition-colors">
                  <Users className="h-8 w-8 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">F1 Café</h3> {/* renamed from "Café" to "F1 Café" */}
                <p className="text-gray-400 text-sm mb-4">Connect with F1 fans worldwide</p>
                <div className="flex justify-center gap-2">
                  <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-400">
                    Social Feed
                  </Badge>
                  <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-400">
                    Community
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* News/PaddockTalk */}
          <Link href="/paddock-talk">
            <Card className="group hover:scale-105 transition-all duration-300 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border-blue-500/30 hover:border-blue-400">
              <CardContent className="p-6 text-center">
                <div className="bg-blue-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/30 transition-colors">
                  <Newspaper className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Paddock Talk</h3>
                <p className="text-gray-400 text-sm mb-4">Latest F1 news & AI insights</p>
                <div className="flex justify-center gap-2">
                  <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                    Breaking News
                  </Badge>
                  <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                    AI Analysis
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Merchandise */}
          <Link href="/merchandise">
            <Card className="group hover:scale-105 transition-all duration-300 bg-gradient-to-br from-green-600/10 to-emerald-600/10 border-green-500/30 hover:border-green-400">
              <CardContent className="p-6 text-center">
                <div className="bg-green-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500/30 transition-colors">
                  <ShoppingBag className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Merchandise</h3>
                <p className="text-gray-400 text-sm mb-4">F1 gear & team collectibles</p>
                <div className="flex justify-center gap-2">
                  <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                    Team Gear
                  </Badge>
                  <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                    Affiliates
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Gaming/Teams */}
          <Link href="/teams">
            <Card className="group hover:scale-105 transition-all duration-300 bg-gradient-to-br from-purple-600/10 to-pink-600/10 border-purple-500/30 hover:border-purple-400">
              <CardContent className="p-6 text-center">
                <div className="bg-purple-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/30 transition-colors">
                  <Gamepad2 className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Teams</h3>
                <p className="text-gray-400 text-sm mb-4">Join teams & compete</p>
                <div className="flex justify-center gap-2">
                  <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                    Tournaments
                  </Badge>
                  <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                    Challenges
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">24</div>
            <div className="text-sm text-gray-400">Active Races</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">10</div>
            <div className="text-sm text-gray-400">F1 Teams</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">500+</div>
            <div className="text-sm text-gray-400">Community Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">50+</div>
            <div className="text-sm text-gray-400">Active Tournaments</div>
          </div>
        </div>
      </div>
    </div>
  )
}
