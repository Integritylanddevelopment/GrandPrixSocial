"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { TournamentCard } from "./tournament-card"
import { ChallengeCard } from "./challenge-card"
import { 
  Trophy, 
  Target, 
  Star, 
  Clock, 
  Users, 
  Gift, 
  Award, 
  TrendingUp,
  Calendar,
  Zap,
  Medal
} from "lucide-react"

interface Tournament {
  id: string
  name: string
  description: string
  type: string
  startDate: string
  endDate: string
  prizePool: number
  status: string
  maxParticipants: number
  currentParticipants: number
  difficulty: string
}

interface Challenge {
  id: string
  title: string
  description: string
  type: string
  reward: number
  xpReward: number
  badge: string
  timeLeft: string
  difficulty: string
  progress: { current: number; required: number }
  category: string
  isDaily: boolean
}

interface UserStats {
  level: number
  xp: number
  xpToNext: number
  totalPoints: number
  badges: number
  completedChallenges: number
  activeTournaments: number
  rank: number
}

export default function GamingHub() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [userStats, setUserStats] = useState<UserStats>({
    level: 12,
    xp: 2480,
    xpToNext: 520,
    totalPoints: 15670,
    badges: 23,
    completedChallenges: 47,
    activeTournaments: 3,
    rank: 156
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch tournaments
        const tournamentsResponse = await fetch("/api/tournaments?limit=10")
        const tournamentsData = await tournamentsResponse.json()
        setTournaments(tournamentsData.tournaments || [])

        // Fetch challenges
        const challengesResponse = await fetch("/api/challenges?activeOnly=true&limit=8")
        const challengesData = await challengesResponse.json()
        setChallenges(challengesData.challenges || [])

        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch gaming data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleJoinTournament = async (tournamentId: string) => {
    try {
      const response = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          tournamentId,
          userId: "current_user"
        })
      })

      const result = await response.json()
      if (result.success) {
        console.log("Joined tournament successfully")
        // Update user stats
        setUserStats(prev => ({
          ...prev,
          activeTournaments: prev.activeTournaments + 1
        }))
      }
    } catch (error) {
      console.error("Failed to join tournament:", error)
    }
  }

  const handleAcceptChallenge = async (challengeId: string) => {
    try {
      const response = await fetch("/api/challenges", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "accept",
          challengeId,
          userId: "current_user"
        })
      })

      const result = await response.json()
      if (result.success) {
        console.log("Challenge accepted successfully")
        // Refresh challenges to show updated state
      }
    } catch (error) {
      console.error("Failed to accept challenge:", error)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-400 border-green-400"
      case "medium": return "text-yellow-400 border-yellow-400"
      case "hard": return "text-red-400 border-red-400"
      case "expert": return "text-purple-400 border-purple-400"
      default: return "text-gray-400 border-gray-400"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-400"
      case "upcoming": return "text-blue-400"
      case "completed": return "text-gray-400"
      default: return "text-gray-400"
    }
  }

  const xpPercentage = (userStats.xp / (userStats.xp + userStats.xpToNext)) * 100

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Card className="glass-orange border-orange-500 max-w-md">
          <CardContent className="p-6">
            <div className="text-center text-orange-400 font-orbitron">Loading gaming hub...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="glass-orange border-orange-500">
        <CardHeader className="text-center">
          <CardTitle className="text-white font-orbitron text-3xl flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Gaming Hub
            <Target className="w-8 h-8 text-orange-500" />
          </CardTitle>
          <p className="text-gray-300 font-rajdhani">Compete, challenge, and climb the leaderboards</p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-900 border-orange-500 grid grid-cols-4 w-full">
          <TabsTrigger value="overview" className="text-white data-[state=active]:bg-orange-600">
            Overview
          </TabsTrigger>
          <TabsTrigger value="tournaments" className="text-white data-[state=active]:bg-orange-600">
            Tournaments
          </TabsTrigger>
          <TabsTrigger value="challenges" className="text-white data-[state=active]:bg-orange-600">
            Challenges
          </TabsTrigger>
          <TabsTrigger value="leaderboards" className="text-white data-[state=active]:bg-orange-600">
            Rankings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* User Progress Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-orange border-orange-500">
              <CardHeader>
                <CardTitle className="text-white font-orbitron flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Player Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-rajdhani">Level</span>
                  <span className="text-2xl font-bold text-orange-400 font-orbitron">{userStats.level}</span>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300 font-rajdhani">XP Progress</span>
                    <span className="text-white font-rajdhani">{userStats.xp} / {userStats.xp + userStats.xpToNext}</span>
                  </div>
                  <Progress value={xpPercentage} className="h-2 bg-gray-800">
                    <div className="h-full bg-gradient-to-r from-orange-600 to-yellow-500 rounded-full transition-all" style={{width: `${xpPercentage}%`}} />
                  </Progress>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white font-orbitron">{userStats.totalPoints.toLocaleString()}</div>
                    <div className="text-xs text-gray-400 font-rajdhani">Total Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white font-orbitron">#{userStats.rank}</div>
                    <div className="text-xs text-gray-400 font-rajdhani">Global Rank</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-orange border-orange-500">
              <CardHeader>
                <CardTitle className="text-white font-orbitron flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-500" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500 font-orbitron">{userStats.badges}</div>
                    <div className="text-sm text-gray-300 font-rajdhani">Badges</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500 font-orbitron">{userStats.completedChallenges}</div>
                    <div className="text-sm text-gray-300 font-rajdhani">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500 font-orbitron">{userStats.activeTournaments}</div>
                    <div className="text-sm text-gray-300 font-rajdhani">Active</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Tournaments */}
            <Card className="glass-orange border-orange-500">
              <CardHeader>
                <CardTitle className="text-white font-orbitron flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Featured Tournaments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tournaments.slice(0, 3).map((tournament) => (
                  <div key={tournament.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-white font-semibold font-rajdhani text-sm">{tournament.name}</div>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge className={getDifficultyColor(tournament.difficulty)} variant="outline">
                          {tournament.difficulty}
                        </Badge>
                        <span className={getStatusColor(tournament.status)}>{tournament.status}</span>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-green-400 font-bold">${tournament.prizePool.toLocaleString()}</div>
                      <div className="text-gray-400">{tournament.currentParticipants}/{tournament.maxParticipants}</div>
                    </div>
                  </div>
                ))}
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-rajdhani">
                  View All Tournaments
                </Button>
              </CardContent>
            </Card>

            {/* Active Challenges */}
            <Card className="glass-orange border-orange-500">
              <CardHeader>
                <CardTitle className="text-white font-orbitron flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-500" />
                  Hot Challenges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {challenges.slice(0, 3).map((challenge) => (
                  <div key={challenge.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-white font-semibold font-rajdhani text-sm">{challenge.title}</div>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge className={getDifficultyColor(challenge.difficulty)} variant="outline">
                          {challenge.difficulty}
                        </Badge>
                        <span className="text-gray-400">{challenge.category}</span>
                        {challenge.isDaily && <Zap className="w-3 h-3 text-yellow-500" />}
                      </div>
                      <Progress 
                        value={(challenge.progress.current / challenge.progress.required) * 100} 
                        className="h-1 mt-1 bg-gray-700"
                      >
                        <div className="h-full bg-gradient-to-r from-orange-600 to-yellow-500 rounded-full transition-all" />
                      </Progress>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-orange-400 font-bold">{challenge.reward} pts</div>
                      <div className="text-gray-400">{challenge.timeLeft}</div>
                    </div>
                  </div>
                ))}
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-rajdhani">
                  View All Challenges
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tournaments" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white font-orbitron">Tournaments</h2>
            <div className="flex gap-2">
              <Button variant="outline" className="border-orange-500 text-orange-400 hover:bg-orange-500/10">
                Filter
              </Button>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white font-rajdhani">
                Create Tournament
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments.map((tournament) => (
              <div key={tournament.id} className="glass-orange border-orange-500 rounded-lg p-4 hover:border-orange-400 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-semibold font-rajdhani">{tournament.name}</h3>
                    <p className="text-gray-400 text-sm font-rajdhani mt-1">{tournament.description}</p>
                  </div>
                  <Badge className={getDifficultyColor(tournament.difficulty)} variant="outline">
                    {tournament.difficulty}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Prize Pool</span>
                    <span className="text-green-400 font-bold">${tournament.prizePool.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Participants</span>
                    <span className="text-white">{tournament.currentParticipants}/{tournament.maxParticipants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className={getStatusColor(tournament.status)}>{tournament.status}</span>
                  </div>
                </div>

                <Button 
                  className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white font-rajdhani"
                  onClick={() => handleJoinTournament(tournament.id)}
                  disabled={tournament.status === "completed"}
                >
                  {tournament.status === "completed" ? "Completed" : "Join Tournament"}
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white font-orbitron">Challenges</h2>
            <div className="flex gap-2">
              <Button variant="outline" className="border-orange-500 text-orange-400 hover:bg-orange-500/10">
                Daily Only
              </Button>
              <Button variant="outline" className="border-orange-500 text-orange-400 hover:bg-orange-500/10">
                My Progress
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="glass-orange border-orange-500 rounded-lg p-4 hover:border-orange-400 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold font-rajdhani">{challenge.title}</h3>
                      {challenge.isDaily && <Zap className="w-4 h-4 text-yellow-500" />}
                    </div>
                    <p className="text-gray-400 text-sm font-rajdhani">{challenge.description}</p>
                  </div>
                  <Badge className={getDifficultyColor(challenge.difficulty)} variant="outline">
                    {challenge.difficulty}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Reward</span>
                    <div className="text-right">
                      <div className="text-orange-400 font-bold">{challenge.reward} pts</div>
                      <div className="text-purple-400 text-xs">+{challenge.xpReward} XP</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{challenge.progress.current}/{challenge.progress.required}</span>
                    </div>
                    <Progress 
                      value={(challenge.progress.current / challenge.progress.required) * 100} 
                      className="h-2 bg-gray-700"
                    >
                      <div className="h-full bg-gradient-to-r from-orange-600 to-yellow-500 rounded-full transition-all" />
                    </Progress>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Time Left</span>
                    <span className="text-white">{challenge.timeLeft}</span>
                  </div>
                </div>

                <Button 
                  className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white font-rajdhani"
                  onClick={() => handleAcceptChallenge(challenge.id)}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Accept Challenge
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboards" className="space-y-6">
          <Card className="glass-orange border-orange-500">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center gap-2">
                <Medal className="w-6 h-6 text-yellow-500" />
                Global Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-400 py-8">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-rajdhani">Leaderboards coming soon...</p>
                <p className="text-sm">Compete in tournaments and challenges to climb the rankings!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}