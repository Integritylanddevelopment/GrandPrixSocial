"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TeamBuilder from "@/components/fantasy/team-builder"
import { Trophy, Users, DollarSign, HelpCircle, BookOpen } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import AuthButtons from "@/components/auth/auth-buttons"

interface FantasyLeague {
  id: string
  name: string
  description: string
  creator: { username: string; name: string }
  maxParticipants: number
  currentParticipants: number
  entryFee: number
  prizePool: number
  budget: number
  isPublic: boolean
  season: string
}

export default function FantasyPage() {
  const [leagues, setLeagues] = useState<FantasyLeague[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await fetch("/api/fantasy/leagues")
        const data = await response.json()
        setLeagues(data)
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch leagues:", error)
        setLoading(false)
      }
    }

    fetchLeagues()
  }, [])

  const formatPrice = (price: number) => {
    if (price === 0) return "Free"
    return `${price.toLocaleString()} pts`
  }

  const formatBudget = (budget: number) => {
    return `$${(budget / 1000000).toFixed(0)}M`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-purple-400 font-orbitron text-xl">Loading Fantasy Formula...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Auth Buttons */}
        <div className="flex justify-center mb-8">
          <AuthButtons />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold font-orbitron mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-purple-400 bg-clip-text text-transparent">
              Fantasy Formula
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-rajdhani">
            Build your dream F1 team and compete with other fans in the ultimate fantasy racing experience
          </p>
          
          {/* Rules Button */}
          <div className="flex justify-center gap-4 mt-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  How to Play
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-gray-800 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-purple-400 font-orbitron">Fantasy Formula Rules</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-gray-300">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">🏎️ Team Building</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Select 2 drivers and 1 constructor within budget</li>
                      <li>• Each team has a $100M salary cap</li>
                      <li>• Driver prices based on current season performance</li>
                      <li>• Constructor prices reflect team competitiveness</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">🏆 Scoring System</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Race finish position points (25, 18, 15, 12, 10, 8, 6, 4, 2, 1)</li>
                      <li>• Fastest lap bonus: +2 points</li>
                      <li>• Pole position bonus: +3 points</li>
                      <li>• Points finish streak bonus: +5 points (3+ races)</li>
                      <li>• Constructor points based on both drivers</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">🎮 League Types</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• <strong>Season-long:</strong> Pick team once, score all season</li>
                      <li>• <strong>Race-by-race:</strong> New lineup each Grand Prix</li>
                      <li>• <strong>Head-to-head:</strong> Weekly matchups vs other players</li>
                      <li>• <strong>Public leagues:</strong> Join with anyone</li>
                      <li>• <strong>Private leagues:</strong> Invite friends only</li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Strategy Guide
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-gray-800 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-purple-400 font-orbitron">Winning Strategies</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-gray-300">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">💡 Driver Selection Tips</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Mix safe picks (consistent points) with high-risk/reward drivers</li>
                      <li>• Consider track-specific performance history</li>
                      <li>• Monitor practice session times and qualifying pace</li>
                      <li>• Factor in reliability issues and DNF history</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">🏗️ Constructor Strategy</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Top teams (Red Bull, Ferrari, Mercedes) score consistently</li>
                      <li>• Mid-field teams can offer value at specific tracks</li>
                      <li>• Consider both drivers' form, not just the star driver</li>
                      <li>• Track characteristics favor different car philosophies</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">📊 Budget Management</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Don't spend everything on two expensive drivers</li>
                      <li>• Look for mid-tier drivers outperforming their price</li>
                      <li>• Save budget for strong constructor choice</li>
                      <li>• Monitor price changes throughout the season</li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="leagues" className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="glass border-gray-800 bg-gray-900/50">
              <TabsTrigger 
                value="leagues" 
                className="text-gray-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-rajdhani"
              >
                Browse Leagues
              </TabsTrigger>
              <TabsTrigger 
                value="create-team" 
                className="text-gray-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-rajdhani"
              >
                Build Team
              </TabsTrigger>
              <TabsTrigger 
                value="my-teams" 
                className="text-gray-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-rajdhani"
              >
                My Lineups
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="leagues" className="space-y-6">
            {/* Sample Featured Leagues */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Featured League 1 */}
              <Card className="glass-purple border-purple-500 hover:border-purple-400 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-purple-400" />
                    <CardTitle className="text-white font-orbitron">Grand Prix Champions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300 font-rajdhani">The ultimate F1 fantasy league for serious fans</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 font-rajdhani">Participants</span>
                      <span className="text-white font-rajdhani">15/20</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 font-rajdhani">Entry Fee</span>
                      <span className="text-white font-rajdhani">1,000 pts</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 font-rajdhani">Prize Pool</span>
                      <span className="text-white font-rajdhani">15,000 pts</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 font-rajdhani">Budget</span>
                      <span className="text-white font-rajdhani">$100M</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-purple-400 border-purple-600 font-rajdhani">
                      2024 Season
                    </Badge>
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-rajdhani transition-all duration-200">
                    Join League
                  </Button>
                </CardContent>
              </Card>

              {/* Featured League 2 */}
              <Card className="glass-purple border-purple-500 hover:border-purple-400 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-purple-400" />
                    <CardTitle className="text-white font-orbitron">Rookie Racing</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300 font-rajdhani">Perfect league for new fantasy F1 players</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 font-rajdhani">Participants</span>
                      <span className="text-white font-rajdhani">8/12</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 font-rajdhani">Entry Fee</span>
                      <span className="text-white font-rajdhani">Free</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 font-rajdhani">Prize Pool</span>
                      <span className="text-white font-rajdhani">Glory</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 font-rajdhani">Budget</span>
                      <span className="text-white font-rajdhani">$100M</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-green-400 border-green-600 font-rajdhani">
                      Free
                    </Badge>
                    <Badge variant="outline" className="text-purple-400 border-purple-600 font-rajdhani">
                      2024 Season
                    </Badge>
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-rajdhani transition-all duration-200">
                    Join League
                  </Button>
                </CardContent>
              </Card>

              {/* Featured League 3 */}
              <Card className="glass-purple border-purple-500 hover:border-purple-400 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-purple-400" />
                    <CardTitle className="text-white font-orbitron">High Stakes Racing</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300 font-rajdhani">Big entry, bigger rewards for expert players</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 font-rajdhani">Participants</span>
                      <span className="text-white font-rajdhani">6/10</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 font-rajdhani">Entry Fee</span>
                      <span className="text-white font-rajdhani">5,000 pts</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 font-rajdhani">Prize Pool</span>
                      <span className="text-white font-rajdhani">45,000 pts</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 font-rajdhani">Budget</span>
                      <span className="text-white font-rajdhani">$100M</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-red-400 border-red-600 font-rajdhani">
                      High Stakes
                    </Badge>
                    <Badge variant="outline" className="text-purple-400 border-purple-600 font-rajdhani">
                      2024 Season
                    </Badge>
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-rajdhani transition-all duration-200">
                    Join League
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="create-team">
            <TeamBuilder />
          </TabsContent>

          <TabsContent value="my-teams">
            <Card className="glass-purple border-purple-500">
              <CardContent className="p-8 text-center">
                <div className="text-gray-300 mb-6">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-purple-400 opacity-75" />
                  <h3 className="text-xl font-semibold text-white font-orbitron mb-2">No Lineups Yet</h3>
                  <p className="font-rajdhani">You haven't created any fantasy lineups yet. Build your first team to get started!</p>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white font-rajdhani transition-all duration-200">
                  Build Your First Lineup
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
// Force rebuild: Tue, Aug 19, 2025  1:53:12 AM
