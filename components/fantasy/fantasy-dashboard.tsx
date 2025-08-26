"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, TrendingUp, TrendingDown, Users, DollarSign, Calendar, Star } from "lucide-react"

interface FantasyLeague {
  id: string
  name: string
  description: string
  currentParticipants: number
  maxParticipants: number
  entryFee: number
  prizePool: number
  isActive: boolean
}

interface LeaderboardEntry {
  rank: number
  teamName: string
  owner: { username: string; name: string }
  totalPoints: number
  lastRacePoints: number
  trend: "up" | "down" | "stable"
  trendChange: number
}

export default function FantasyDashboard() {
  const [leagues, setLeagues] = useState<FantasyLeague[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userTeams, setUserTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch fantasy leagues
        const leaguesResponse = await fetch("/api/fantasy/leagues")
        const leaguesData = await leaguesResponse.json()
        setLeagues(leaguesData)

        // Fetch leaderboard for the first league
        if (leaguesData.length > 0) {
          const leaderboardResponse = await fetch(`/api/fantasy/leaderboards?leagueId=${leaguesData[0].id}&limit=10`)
          const leaderboardData = await leaderboardResponse.json()
          setLeaderboard(leaderboardData.standings || [])
        }

        // Fetch user teams (mock for now)
        const teamsResponse = await fetch("/api/fantasy/teams?userId=current_user")
        const teamsData = await teamsResponse.json()
        setUserTeams(teamsData)

        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch fantasy data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-green-500" />
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-500" />
    return <div className="w-4 h-4" />
  }

  const getTrendText = (trend: string, change: number) => {
    if (trend === "up") return `+${change}`
    if (trend === "down") return `-${Math.abs(change)}`
    return "—"
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Card className="glass-purple border-purple-500 max-w-md">
          <CardContent className="p-6">
            <div className="text-center text-purple-400 font-orbitron">Loading fantasy dashboard...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="glass-purple border-purple-500">
        <CardHeader className="text-center">
          <CardTitle className="text-white font-orbitron text-3xl flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Fantasy F1 Dashboard
            <Trophy className="w-8 h-8 text-yellow-500" />
          </CardTitle>
          <p className="text-gray-300 font-rajdhani">Manage your teams, leagues, and track your performance</p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-900 border-purple-500 grid grid-cols-4 w-full">
          <TabsTrigger value="dashboard" className="text-white data-[state=active]:bg-purple-600">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="leagues" className="text-white data-[state=active]:bg-purple-600">
            Leagues
          </TabsTrigger>
          <TabsTrigger value="teams" className="text-white data-[state=active]:bg-purple-600">
            My Teams
          </TabsTrigger>
          <TabsTrigger value="leaderboards" className="text-white data-[state=active]:bg-purple-600">
            Leaderboards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-purple border-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-2xl font-bold text-white font-orbitron">{leagues.length}</div>
                    <div className="text-sm text-gray-300 font-rajdhani">Active Leagues</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-purple border-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold text-white font-orbitron">{userTeams.length}</div>
                    <div className="text-sm text-gray-300 font-rajdhani">My Teams</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-purple border-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold text-white font-orbitron">
                      ${leagues.reduce((sum, league) => sum + league.prizePool, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-300 font-rajdhani">Total Prize Pool</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-purple border-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold text-white font-orbitron">R22</div>
                    <div className="text-sm text-gray-300 font-rajdhani">Current Round</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Performance */}
          {leaderboard.length > 0 && (
            <Card className="glass-purple border-purple-500">
              <CardHeader>
                <CardTitle className="text-white font-orbitron">Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.slice(0, 5).map((entry) => (
                    <div
                      key={entry.rank}
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        entry.rank === 1
                          ? "bg-yellow-900/20 border-l-4 border-yellow-500"
                          : entry.rank === 2
                            ? "bg-gray-700/20 border-l-4 border-gray-400"
                            : entry.rank === 3
                              ? "bg-orange-900/20 border-l-4 border-orange-600"
                              : "bg-gray-800/50"
                      }`}
                    >
                      <div className="text-lg font-bold text-white w-8">{entry.rank}</div>
                      <div className="flex-1">
                        <div className="text-white font-semibold">{entry.teamName}</div>
                        <div className="text-gray-400 text-sm">{entry.owner.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{entry.totalPoints}</div>
                        <div className="text-gray-400 text-sm">points</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">+{entry.lastRacePoints}</div>
                        <div className="text-gray-400 text-sm">last race</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(entry.trend, entry.trendChange)}
                        <span className={`text-sm ${
                          entry.trend === "up" ? "text-green-500" : 
                          entry.trend === "down" ? "text-red-500" : "text-gray-400"
                        }`}>
                          {getTrendText(entry.trend, entry.trendChange)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leagues" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white font-orbitron">Available Leagues</h2>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-rajdhani">
              Create League
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leagues.map((league) => (
              <Card key={league.id} className="glass-purple border-purple-500 hover:border-purple-400 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white font-orbitron text-lg">{league.name}</CardTitle>
                  <p className="text-gray-300 text-sm font-rajdhani">{league.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Participants</span>
                    <span className="text-white">{league.currentParticipants}/{league.maxParticipants}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Entry Fee</span>
                    <span className="text-white">${league.entryFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Prize Pool</span>
                    <span className="text-green-400">${league.prizePool.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={league.isActive ? "default" : "secondary"}>
                      {league.isActive ? "Active" : "Completed"}
                    </Badge>
                  </div>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-rajdhani"
                    disabled={league.currentParticipants >= league.maxParticipants}
                  >
                    {league.currentParticipants >= league.maxParticipants ? "Full" : "Join League"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white font-orbitron">My Teams</h2>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-rajdhani">
              Create Team
            </Button>
          </div>

          {userTeams.length === 0 ? (
            <Card className="glass-purple border-purple-500">
              <CardContent className="p-8 text-center">
                <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <div className="text-white font-orbitron text-xl mb-2">No Teams Yet</div>
                <div className="text-gray-400 font-rajdhani mb-4">Create your first fantasy team to get started</div>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white font-rajdhani">
                  Build Your Team
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userTeams.map((team) => (
                <Card key={team.id} className="glass-purple border-purple-500">
                  <CardHeader>
                    <CardTitle className="text-white font-orbitron">{team.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge>#{team.rank}</Badge>
                      <Badge variant="outline">{team.league}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Points</span>
                      <span className="text-white font-bold">{team.totalPoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Team Value</span>
                      <span className="text-white">${(team.totalValue / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Drivers</div>
                      {team.drivers?.slice(0, 3).map((driver: any, index: number) => (
                        <div key={index} className="text-sm text-white">
                          {driver.firstName} {driver.lastName}
                        </div>
                      ))}
                      {team.drivers?.length > 3 && (
                        <div className="text-sm text-gray-400">+{team.drivers.length - 3} more</div>
                      )}
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-rajdhani">
                      Manage Team
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboards" className="space-y-6">
          <Card className="glass-purple border-purple-500">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                League Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      entry.rank === 1
                        ? "bg-yellow-900/20 border-l-4 border-yellow-500"
                        : entry.rank === 2
                          ? "bg-gray-700/20 border-l-4 border-gray-400"
                          : entry.rank === 3
                            ? "bg-orange-900/20 border-l-4 border-orange-600"
                            : "bg-gray-800/50"
                    }`}
                  >
                    <div className="text-2xl font-bold text-white w-12 text-center">{entry.rank}</div>
                    <div className="flex-1">
                      <div className="text-white font-semibold font-rajdhani">{entry.teamName}</div>
                      <div className="text-gray-400 text-sm font-rajdhani">{entry.owner.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold font-orbitron">{entry.totalPoints}</div>
                      <div className="text-gray-400 text-sm font-rajdhani">total points</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">+{entry.lastRacePoints}</div>
                      <div className="text-gray-400 text-sm font-rajdhani">last race</div>
                    </div>
                    <div className="flex items-center gap-1 w-16 justify-end">
                      {getTrendIcon(entry.trend, entry.trendChange)}
                      <span className={`text-sm ${
                        entry.trend === "up" ? "text-green-500" : 
                        entry.trend === "down" ? "text-red-500" : "text-gray-400"
                      }`}>
                        {getTrendText(entry.trend, entry.trendChange)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}