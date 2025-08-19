import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Flag, Gamepad2, Zap, Users, Trophy } from "lucide-react"
import CafeIcon from "@/components/icons/cafe-icon"
import NewsIcon from "@/components/icons/news-icon"
import ShopIcon from "@/components/icons/shop-icon"
import RacesIcon from "@/components/icons/races-icon"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/f1-aerial-view.png')] bg-cover bg-center opacity-10" />
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Flag className="text-5xl md:text-7xl" style={{ width: '0.9em', height: '0.9em', display: 'inline-block', color: '#FF1801', filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))' }} />
            <h1 className="text-5xl md:text-7xl font-bold font-orbitron" style={{ background: 'linear-gradient(to right, #FF1801, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))' }}>
              Grand Prix Social
            </h1>
            <Flag className="text-5xl md:text-7xl" style={{ width: '0.9em', height: '0.9em', display: 'inline-block', color: '#60a5fa', filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))' }} />
          </div>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto font-rajdhani">
            The ultimate social platform for Formula 1 fans. Connect, compete, and celebrate the world of racing.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Badge variant="secondary" className="bg-red-600/20 text-red-400 border-red-500/30 text-base py-2 px-4">
              <Zap className="w-4 h-4 mr-2" />
              Fantasy Formula Community
            </Badge>
            <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-500/30 text-base py-2 px-4">
              <Users className="w-4 h-4 mr-2" />
              F1 News and Updates
            </Badge>
            <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-500/30 text-base py-2 px-4">
              <Trophy className="w-4 h-4 mr-2" />
              Race Day Times and Channels
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Navigation Cards */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {/* Social/Cafe */}
          <Link href="/cafe">
            <Card className="group hover:scale-105 transition-all duration-300 glass-yellow hover:border-yellow-400">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-yellow-400 mb-4 font-orbitron">F1 Café</h3>
                <div className="bg-yellow-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-500/30 transition-colors">
                  <CafeIcon className="text-yellow-400" width={32} height={32} />
                </div>
                <p className="text-gray-400 text-sm mb-4 font-rajdhani">Connect with F1 fans worldwide</p>
                <p className="text-xs text-gray-500 font-rajdhani">contact: social@grandprixsocial.com</p>
                <div className="flex justify-center gap-2">
                  <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                    Social Feed
                  </Badge>
                  <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                    Community
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* News/PaddockTalk */}
          <Link href="/paddock-talk">
            <Card className="group hover:scale-105 transition-all duration-300 glass-blue hover:border-blue-400">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-blue-400 mb-4 font-orbitron">Paddock Talk</h3>
                <div className="bg-blue-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/30 transition-colors">
                  <NewsIcon className="text-blue-400" width={32} height={32} />
                </div>
                <p className="text-gray-400 text-sm mb-4 font-rajdhani">Latest F1 news & AI insights</p>
                <p className="text-xs text-gray-500 font-rajdhani">contact: news@grandprixsocial.com</p>
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

          {/* Fantasy Formula */}
          <Link href="/fantasy">
            <Card className="group hover:scale-105 transition-all duration-300 glass-purple hover:border-purple-400">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-purple-400 mb-4 font-orbitron">Fantasy Formula</h3>
                <div className="bg-purple-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/30 transition-colors">
                  <Gamepad2 className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-gray-400 text-sm mb-4 font-rajdhani">Build your F1 dream team</p>
                <p className="text-xs text-gray-500 font-rajdhani">contact: fantasyformula@grandprixsocial.com</p>
                <div className="flex justify-center gap-2">
                  <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                    Leagues
                  </Badge>
                  <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                    Strategy
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Merchandise */}
          <Link href="/merchandise">
            <Card className="group hover:scale-105 transition-all duration-300 glass-green hover:border-green-400">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-green-400 mb-4 font-orbitron">Merchandise</h3>
                <div className="bg-green-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500/30 transition-colors">
                  <ShopIcon className="text-green-400" width={32} height={32} />
                </div>
                <p className="text-gray-400 text-sm mb-4 font-rajdhani">F1 gear & team collectibles</p>
                <p className="text-xs text-gray-500 font-rajdhani">contact: merch@grandprixsocial.com</p>
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

          {/* Race Schedule */}
          <Link href="/calendar">
            <Card className="group hover:scale-105 transition-all duration-300 glass-red hover:border-red-400">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-red-400 mb-4 font-orbitron">Race Schedule</h3>
                <div className="bg-red-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-red-500/30 transition-colors">
                  <RacesIcon className="text-red-400" width={32} height={32} />
                </div>
                <p className="text-gray-400 text-sm mb-4 font-rajdhani">Race calendar & schedule</p>
                <div className="flex justify-center gap-2">
                  <Badge variant="outline" className="text-xs border-red-500/30 text-red-400">
                    Schedule
                  </Badge>
                  <Badge variant="outline" className="text-xs border-red-500/30 text-red-400">
                    Results
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
