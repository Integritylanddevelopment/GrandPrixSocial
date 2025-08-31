"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"

interface LiveRaceData {
  race: {
    id: string
    raceName: string
    circuit: string
    currentLap: number
    totalLaps: number
    status: string
    weather: { temperature: number; condition: string }
  }
  results: Array<{
    position: number
    driver: {
      number: number
      name: string
      team: string
      teamColor: string
    }
    gap: string
    lastLapTime: string
    bestLapTime: string
    currentTyre: string
    tyreAge: number
    pitStops: number
  }>
  timestamp: string
}

export default function LiveRaceTracker() {
  const [raceData, setRaceData] = useState<LiveRaceData | null>(null)
  const [isLive, setIsLive] = useState(true)
  const [loading, setLoading] = useState(true)

  const fetchLiveData = async () => {
    try {
      const response = await fetch("/api/races/live")
      const data = await response.json()
      setRaceData(data)
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch live race data:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveData()

    let interval: NodeJS.Timeout
    if (isLive) {
      interval = setInterval(fetchLiveData, 3000) // Update every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isLive])

  const getTyreColor = (tyre: string) => {
    switch (tyre) {
      case "SOFT":
        return "bg-red-500"
      case "MEDIUM":
        return "bg-yellow-500"
      case "HARD":
        return "bg-gray-300"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="text-center text-white">Loading live race data...</div>
        </CardContent>
      </Card>
    )
  }

  if (!raceData) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="text-center text-white">No live race data available</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Race Header */}
      <Card className="bg-gradient-to-r from-red-600 to-red-800 border-red-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl font-bold">🏁 {raceData.race.raceName}</CardTitle>
              <p className="text-red-100">{raceData.race.circuit}</p>
            </div>
            <div className="text-right text-white">
              <div className="text-2xl font-bold">
                Lap {raceData.race.currentLap}/{raceData.race.totalLaps}
              </div>
              <div className="text-sm text-red-100">
                {raceData.race.weather.temperature}°C • {raceData.race.weather.condition}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Live Controls */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isLive ? "bg-red-500 animate-pulse" : "bg-gray-500"}`} />
              <span className="text-white font-medium">{isLive ? "LIVE" : "PAUSED"}</span>
              <span className="text-gray-400 text-sm">
                Last update: {new Date(raceData.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLive(!isLive)}
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLiveData}
                className="border-gray-700 text-white hover:bg-gray-800 bg-transparent"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Race Results */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Live Race Positions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1">
            {raceData.results.map((result, index) => (
              <div
                key={result.driver.number}
                className={`flex items-center p-4 border-l-4 hover:bg-gray-800 transition-colors ${
                  index === 0
                    ? "bg-yellow-900/20 border-yellow-500"
                    : index === 1
                      ? "bg-gray-700/20 border-gray-400"
                      : index === 2
                        ? "bg-orange-900/20 border-orange-600"
                        : "border-gray-700"
                }`}
                style={{ borderLeftColor: result.driver.teamColor }}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Position */}
                  <div className="text-2xl font-bold text-white w-8">{result.position}</div>

                  {/* Driver Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{result.driver.name}</span>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{ borderColor: result.driver.teamColor, color: result.driver.teamColor }}
                      >
                        {result.driver.team}
                      </Badge>
                    </div>
                    <div className="text-gray-400 text-sm">#{result.driver.number}</div>
                  </div>

                  {/* Gap */}
                  <div className="text-white font-mono text-sm">{result.gap}</div>

                  {/* Last Lap */}
                  <div className="text-gray-300 font-mono text-sm">{result.lastLapTime}</div>

                  {/* Tyre Info */}
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${getTyreColor(result.currentTyre)}`} />
                    <span className="text-gray-300 text-sm">{result.tyreAge}</span>
                  </div>

                  {/* Pit Stops */}
                  <div className="text-gray-300 text-sm">{result.pitStops} stops</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
