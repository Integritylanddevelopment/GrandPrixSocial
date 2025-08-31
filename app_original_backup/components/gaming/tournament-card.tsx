"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, DollarSign, Users } from "lucide-react"

interface TournamentCardProps {
  tournament: {
    id: string
    name: string
    description?: string
    startDate: string
    endDate: string
    prizePool: number
    status: string
    maxParticipants: number
  }
  onJoin?: (tournamentId: string) => void
}

export function TournamentCard({ tournament, onJoin }: TournamentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500"
      case "active":
        return "bg-green-500"
      case "completed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{tournament.name}</CardTitle>
          <Badge className={getStatusColor(tournament.status)}>{tournament.status}</Badge>
        </div>
        {tournament.description && <p className="text-sm text-muted-foreground">{tournament.description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span>${tournament.prizePool.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>Max {tournament.maxParticipants} participants</span>
        </div>

        <Button className="w-full" onClick={() => onJoin?.(tournament.id)} disabled={tournament.status === "completed"}>
          {tournament.status === "completed" ? "Completed" : "Join Tournament"}
        </Button>
      </CardContent>
    </Card>
  )
}
