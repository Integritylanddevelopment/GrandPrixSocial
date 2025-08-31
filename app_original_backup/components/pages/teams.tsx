"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Gamepad2 } from "lucide-react"
import { TeamCard } from "@/components/gaming/team-card"
import { TournamentCard } from "@/components/gaming/tournament-card"
import { ChallengeCard } from "@/components/gaming/challenge-card"
import { Leaderboard } from "@/components/gaming/leaderboard"
import { mockTeams, mockChallenges } from "@/lib/mock-data"

export function Teams() {
  const [searchTerm, setSearchTerm] = useState("")
  const [teams, setTeams] = useState(mockTeams)
  const [challenges, setChallenges] = useState(mockChallenges)
  const [tournaments, setTournaments] = useState([
    {
      id: "1",
      name: "Monaco Grand Prix Championship",
      description: "Compete in the most prestigious F1 tournament of the season",
      startDate: "2024-05-26",
      endDate: "2024-05-28",
      prizePool: 10000,
      status: "upcoming",
      maxParticipants: 64,
    },
    {
      id: "2",
      name: "Silverstone Sprint Series",
      description: "Fast-paced racing tournament with multiple sprint races",
      startDate: "2024-07-07",
      endDate: "2024-07-09",
      prizePool: 7500,
      status: "active",
      maxParticipants: 32,
    },
  ])

  const filteredTeams = teams.filter((team) => team.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleJoinTeam = (teamId: string) => {
    console.log("[v0] Joining team:", teamId)
    // TODO: Implement team joining logic
  }

  const handleJoinTournament = (tournamentId: string) => {
    console.log("[v0] Joining tournament:", tournamentId)
    // TODO: Implement tournament joining logic
  }

  const handleAcceptChallenge = (challengeId: string) => {
    console.log("[v0] Accepting challenge:", challengeId)
    // TODO: Implement challenge acceptance logic
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Gamepad2 className="w-8 h-8 text-red-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-blue-600 bg-clip-text text-transparent">
            Gaming Community
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Join teams, compete in tournaments, and take on challenges in the ultimate F1 gaming experience
        </p>
      </div>

      <Tabs defaultValue="teams" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={{
                  id: team.id,
                  name: team.name,
                  color: team.color,
                  memberCount: team.members,
                  points: team.points,
                  level: "Professional",
                  captain: "Team Captain",
                }}
                onJoin={handleJoinTeam}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tournaments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} onJoin={handleJoinTournament} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} onAccept={handleAcceptChallenge} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Leaderboard teams={teams} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
