"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"

interface LeaderboardProps {
  teams: Array<{
    id: string
    name: string
    points: number
    color: string
    memberCount: number
  }>
}

export function Leaderboard({ teams }: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">{rank}</span>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Team Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {teams.map((team, index) => (
          <div key={team.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {getRankIcon(index + 1)}
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
                <span className="font-medium">{team.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{team.memberCount} members</Badge>
              <span className="font-bold">{team.points.toLocaleString()} pts</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
