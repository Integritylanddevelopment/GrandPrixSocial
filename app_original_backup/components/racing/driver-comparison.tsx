"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Trophy, Award, Target, Zap } from "lucide-react"

interface Driver {
  id: string
  firstName: string
  lastName: string
  team: string
  teamColor: string
  points: number
  wins: number
  podiums: number
  fastestLaps: number
  poles: number
  seasonStats: {
    winRate: number
    podiumRate: number
    pointsPerRace: number
  }
  averageFinish: number
}

interface DriverComparisonProps {
  drivers: Driver[]
}

export default function DriverComparison({ drivers }: DriverComparisonProps) {
  const [driver1Id, setDriver1Id] = useState<string>("")
  const [driver2Id, setDriver2Id] = useState<string>("")

  const driver1 = drivers.find((d) => d.id === driver1Id)
  const driver2 = drivers.find((d) => d.id === driver2Id)

  const ComparisonStat = ({
    label,
    value1,
    value2,
    icon,
    format = (v: number) => v.toString(),
  }: {
    label: string
    value1: number
    value2: number
    icon: React.ReactNode
    format?: (value: number) => string
  }) => {
    const max = Math.max(value1, value2)
    const percentage1 = max > 0 ? (value1 / max) * 100 : 0
    const percentage2 = max > 0 ? (value2 / max) * 100 : 0

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-white font-medium">
          {icon}
          <span>{label}</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-20 text-right text-white font-semibold">{format(value1)}</div>
            <div className="flex-1">
              <Progress value={percentage1} className="h-2" />
            </div>
            <div className="w-16 text-sm" style={{ color: driver1?.teamColor }}>
              {driver1?.firstName}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-20 text-right text-white font-semibold">{format(value2)}</div>
            <div className="flex-1">
              <Progress value={percentage2} className="h-2" />
            </div>
            <div className="w-16 text-sm" style={{ color: driver2?.teamColor }}>
              {driver2?.firstName}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Driver Comparison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Driver Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-white text-sm font-medium mb-2 block">Driver 1</label>
            <Select value={driver1Id} onValueChange={setDriver1Id}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select driver" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id} className="text-white hover:bg-gray-700">
                    {driver.firstName} {driver.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-white text-sm font-medium mb-2 block">Driver 2</label>
            <Select value={driver2Id} onValueChange={setDriver2Id}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select driver" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id} className="text-white hover:bg-gray-700">
                    {driver.firstName} {driver.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Comparison Results */}
        {driver1 && driver2 && (
          <div className="space-y-6 pt-4 border-t border-gray-800">
            <ComparisonStat
              label="Season Points"
              value1={driver1.points}
              value2={driver2.points}
              icon={<Trophy className="w-4 h-4 text-yellow-500" />}
            />

            <ComparisonStat
              label="Race Wins"
              value1={driver1.wins}
              value2={driver2.wins}
              icon={<Trophy className="w-4 h-4 text-yellow-500" />}
            />

            <ComparisonStat
              label="Podium Finishes"
              value1={driver1.podiums}
              value2={driver2.podiums}
              icon={<Award className="w-4 h-4 text-gray-400" />}
            />

            <ComparisonStat
              label="Pole Positions"
              value1={driver1.poles}
              value2={driver2.poles}
              icon={<Target className="w-4 h-4 text-red-500" />}
            />

            <ComparisonStat
              label="Win Rate"
              value1={driver1.seasonStats.winRate}
              value2={driver2.seasonStats.winRate}
              icon={<Zap className="w-4 h-4 text-purple-500" />}
              format={(v) => `${v.toFixed(1)}%`}
            />

            <ComparisonStat
              label="Points Per Race"
              value1={driver1.seasonStats.pointsPerRace}
              value2={driver2.seasonStats.pointsPerRace}
              icon={<Trophy className="w-4 h-4 text-blue-500" />}
              format={(v) => v.toFixed(1)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
