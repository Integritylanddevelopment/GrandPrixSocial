"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, Zap, Award } from "lucide-react"
import Image from "next/image"

interface DriverStatsCardProps {
  driver: {
    id: string
    number: number
    firstName: string
    lastName: string
    nationality: string
    team: string
    teamColor: string
    points: number
    wins: number
    podiums: number
    fastestLaps: number
    championshipPosition: number
    dnfs: number
    poles: number
    averageFinish: number
    seasonStats: {
      races: number
      pointsPerRace: number
      winRate: number
      podiumRate: number
    }
    recentForm: number[]
    imageUrl: string
  }
}

export default function DriverStatsCard({ driver }: DriverStatsCardProps) {
  const getPositionColor = (position: number) => {
    if (position === 1) return "bg-yellow-500"
    if (position === 2) return "bg-gray-400"
    if (position === 3) return "bg-orange-600"
    if (position <= 10) return "bg-green-600"
    return "bg-gray-600"
  }

  const maxPoints = 575 // Max points for progress calculation

  return (
    <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Image
              src={driver.imageUrl || "/placeholder.svg"}
              alt={`${driver.firstName} ${driver.lastName}`}
              width={60}
              height={60}
              className="rounded-full border-2"
              style={{ borderColor: driver.teamColor }}
            />
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: driver.teamColor }}
            >
              {driver.number}
            </div>
          </div>
          <div className="flex-1">
            <CardTitle className="text-white text-lg">
              {driver.firstName} {driver.lastName}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" style={{ borderColor: driver.teamColor, color: driver.teamColor }}>
                {driver.team}
              </Badge>
              <span className="text-gray-400 text-sm">{driver.nationality}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">P{driver.championshipPosition}</div>
            <div className="text-sm text-gray-400">Championship</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Points Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-medium">Season Points</span>
            <span className="text-white font-bold">{driver.points}</span>
          </div>
          <Progress value={(driver.points / maxPoints) * 100} className="h-2" />
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <div>
              <div className="text-white font-semibold">{driver.wins}</div>
              <div className="text-gray-400 text-xs">Wins</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-gray-400" />
            <div>
              <div className="text-white font-semibold">{driver.podiums}</div>
              <div className="text-gray-400 text-xs">Podiums</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-red-500" />
            <div>
              <div className="text-white font-semibold">{driver.poles}</div>
              <div className="text-gray-400 text-xs">Poles</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-500" />
            <div>
              <div className="text-white font-semibold">{driver.fastestLaps}</div>
              <div className="text-gray-400 text-xs">Fastest Laps</div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-800">
          <div>
            <div className="text-white font-semibold">{driver.seasonStats.winRate.toFixed(1)}%</div>
            <div className="text-gray-400 text-xs">Win Rate</div>
          </div>
          <div>
            <div className="text-white font-semibold">{driver.seasonStats.podiumRate.toFixed(1)}%</div>
            <div className="text-gray-400 text-xs">Podium Rate</div>
          </div>
          <div>
            <div className="text-white font-semibold">{driver.averageFinish.toFixed(1)}</div>
            <div className="text-gray-400 text-xs">Avg Finish</div>
          </div>
          <div>
            <div className="text-white font-semibold">{driver.seasonStats.pointsPerRace.toFixed(1)}</div>
            <div className="text-gray-400 text-xs">Points/Race</div>
          </div>
        </div>

        {/* Recent Form */}
        <div className="pt-2 border-t border-gray-800">
          <div className="text-white text-sm font-medium mb-2">Recent Form (Last 5 Races)</div>
          <div className="flex gap-1">
            {driver.recentForm.map((position, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold ${getPositionColor(
                  position,
                )}`}
              >
                {position}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
