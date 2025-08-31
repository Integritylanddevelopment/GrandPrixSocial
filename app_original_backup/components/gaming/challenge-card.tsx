"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Target, Clock, Gift } from "lucide-react"

interface ChallengeCardProps {
  challenge: {
    id: string
    title: string
    description: string
    reward: number
    timeLeft: string
    type: string
  }
  onAccept?: (challengeId: string) => void
}

export function ChallengeCard({ challenge, onAccept }: ChallengeCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "prediction":
        return "bg-purple-500"
      case "recruitment":
        return "bg-blue-500"
      case "activity":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{challenge.title}</CardTitle>
          <Badge className={getTypeColor(challenge.type)}>{challenge.type}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{challenge.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{challenge.timeLeft}</span>
          </div>
          <div className="flex items-center gap-1">
            <Gift className="w-4 h-4" />
            <span>{challenge.reward} pts</span>
          </div>
        </div>

        <Button className="w-full" onClick={() => onAccept?.(challenge.id)}>
          <Target className="w-4 h-4 mr-2" />
          Accept Challenge
        </Button>
      </CardContent>
    </Card>
  )
}
