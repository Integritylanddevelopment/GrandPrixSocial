"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TeamBuilder from "@/components/fantasy/team-builder"
import { Trophy, Users, DollarSign } from "lucide-react"

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
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">Loading fantasy leagues...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Fantasy F1</h1>
          <p className="text-gray-400">Build your dream team and compete with other F1 fans</p>
        </div>

        <Tabs defaultValue="leagues" className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-800">
            <TabsTrigger value="leagues" className="text-white data-[state=active]:bg-gray-800">
              Browse Leagues
            </TabsTrigger>
            <TabsTrigger value="create-team" className="text-white data-[state=active]:bg-gray-800">
              Create Team
            </TabsTrigger>
            <TabsTrigger value="my-teams" className="text-white data-[state=active]:bg-gray-800">
              My Teams
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leagues" className="space-y-6">
            {/* Featured League */}
            <Card className="bg-gradient-to-r from-yellow-600 to-orange-600 border-yellow-700">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-white" />
                  <CardTitle className="text-white">Featured League</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-white">
                  <h3 className="text-xl font-bold mb-2">Grand Prix Champions</h3>
                  <p className="mb-4 opacity-90">The ultimate F1 fantasy league for serious fans</p>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>15/20 participants</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>1,000 pts entry</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      <span>15,000 pts prize pool</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Leagues */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leagues.map((league) => (
                <Card key={league.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-white">{league.name}</CardTitle>
                    <p className="text-gray-400 text-sm">{league.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Created by</span>
                      <span className="text-white font-medium">{league.creator.username}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Participants</span>
                        <span className="text-white">
                          {league.currentParticipants}/{league.maxParticipants}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Entry Fee</span>
                        <span className="text-white">{formatPrice(league.entryFee)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Prize Pool</span>
                        <span className="text-white">{formatPrice(league.prizePool)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Budget</span>
                        <span className="text-white">{formatBudget(league.budget)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-green-400 border-green-600">
                        {league.season} Season
                      </Badge>
                      {league.entryFee === 0 && (
                        <Badge variant="outline" className="text-blue-400 border-blue-600">
                          Free
                        </Badge>
                      )}
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Join League</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create-team">
            <TeamBuilder />
          </TabsContent>

          <TabsContent value="my-teams">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>You haven't created any fantasy teams yet.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Create Your First Team</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
