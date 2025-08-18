"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Trophy, Star } from "lucide-react"

interface TeamCardProps {
  team: {
    id: string
    name: string
    description?: string
    color: string
    memberCount: number
    points: number
    level: string
    captain: string
  }
  onJoin?: (teamId: string) => void
  isJoined?: boolean
}

export function TeamCard({ team, onJoin, isJoined }: TeamCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: team.color }} />
            <CardTitle className="text-lg">{team.name}</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {team.level}
          </Badge>
        </div>
        {team.description && <p className="text-sm text-muted-foreground">{team.description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{team.memberCount} members</span>
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            <span>{team.points.toLocaleString()} pts</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Star className="w-4 h-4" />
          <span>Captain: {team.captain}</span>
        </div>

        <Button
          className="w-full"
          variant={isJoined ? "secondary" : "default"}
          onClick={() => onJoin?.(team.id)}
          disabled={isJoined}
        >
          {isJoined ? "Joined" : "Join Team"}
        </Button>
      </CardContent>
    </Card>
  )
}
