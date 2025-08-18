"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, RefreshCw } from "lucide-react"

interface DriverStanding {
  id: string
  driverNumber: number
  firstName: string
  lastName: string
  nationality: string
  points: number
  wins: number
  championshipPosition: number
  constructor: string
}

interface ConstructorStanding {
  position: string
  points: string
  wins: string
  constructor: {
    name: string
    nationality: string
  }
}

export default function RealTimeStandings() {
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([])
  const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStandings = async () => {
    try {
      setLoading(true)

      // Fetch driver standings
      const driversResponse = await fetch("/api/f1/standings?type=drivers")
      const driversData = await driversResponse.json()
      setDriverStandings(driversData)

      // Fetch constructor standings
      const constructorsResponse = await fetch("/api/f1/standings?type=constructors")
      const constructorsData = await constructorsResponse.json()
      setConstructorStandings(constructorsData)

      setLastUpdated(new Date())
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch standings:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStandings()
  }, [])

  const getPositionColor = (position: number) => {
    if (position === 1) return "text-yellow-500"
    if (position === 2) return "text-gray-400"
    if (position === 3) return "text-orange-600"
    return "text-white"
  }

  const getConstructorColor = (name: string) => {
    const colors: { [key: string]: string } = {
      "Red Bull": "#0600EF",
      Ferrari: "#DC143C",
      Mercedes: "#00D2BE",
      McLaren: "#FF8700",
      "Aston Martin": "#006F62",
      Alpine: "#0090FF",
      Williams: "#005AFF",
      AlphaTauri: "#2B4562",
      "Alfa Romeo": "#900000",
      Haas: "#FFFFFF",
    }
    return colors[name] || "#888888"
  }

  if (loading && driverStandings.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="text-center text-white">Loading real-time F1 standings...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with refresh */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-lg">2024 F1 Championship Standings</h2>
              {lastUpdated && <p className="text-gray-400 text-sm">Last updated: {lastUpdated.toLocaleTimeString()}</p>}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStandings}
              disabled={loading}
              className="border-gray-700 text-white hover:bg-gray-800 bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="drivers" className="space-y-4">
        <TabsList className="bg-gray-900 border-gray-800">
          <TabsTrigger value="drivers" className="text-white data-[state=active]:bg-gray-800">
            Driver Championship
          </TabsTrigger>
          <TabsTrigger value="constructors" className="text-white data-[state=active]:bg-gray-800">
            Constructor Championship
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drivers">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Driver Standings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {driverStandings.map((driver, index) => (
                  <div
                    key={driver.id}
                    className={`flex items-center p-4 hover:bg-gray-800 transition-colors ${
                      index === 0
                        ? "bg-yellow-900/20 border-l-4 border-yellow-500"
                        : index === 1
                          ? "bg-gray-700/20 border-l-4 border-gray-400"
                          : index === 2
                            ? "bg-orange-900/20 border-l-4 border-orange-600"
                            : "border-l-4 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Position */}
                      <div className={`text-2xl font-bold w-8 ${getPositionColor(driver.championshipPosition)}`}>
                        {driver.championshipPosition}
                      </div>

                      {/* Driver Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">
                            {driver.firstName} {driver.lastName}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: getConstructorColor(driver.constructor),
                              color: getConstructorColor(driver.constructor),
                            }}
                          >
                            #{driver.driverNumber}
                          </Badge>
                        </div>
                        <div className="text-gray-400 text-sm">
                          {driver.constructor} • {driver.nationality}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <div className="text-white font-bold text-lg">{driver.points}</div>
                        <div className="text-gray-400 text-sm">points</div>
                      </div>

                      <div className="text-right">
                        <div className="text-white font-semibold">{driver.wins}</div>
                        <div className="text-gray-400 text-sm">wins</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="constructors">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Constructor Standings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {constructorStandings.map((constructor, index) => (
                  <div
                    key={constructor.constructor.name}
                    className={`flex items-center p-4 hover:bg-gray-800 transition-colors ${
                      index === 0
                        ? "bg-yellow-900/20 border-l-4 border-yellow-500"
                        : index === 1
                          ? "bg-gray-700/20 border-l-4 border-gray-400"
                          : index === 2
                            ? "bg-orange-900/20 border-l-4 border-orange-600"
                            : "border-l-4 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Position */}
                      <div
                        className={`text-2xl font-bold w-8 ${getPositionColor(Number.parseInt(constructor.position))}`}
                      >
                        {constructor.position}
                      </div>

                      {/* Constructor Info */}
                      <div className="flex-1">
                        <div className="text-white font-semibold">{constructor.constructor.name}</div>
                        <div className="text-gray-400 text-sm">{constructor.constructor.nationality}</div>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <div className="text-white font-bold text-lg">{constructor.points}</div>
                        <div className="text-gray-400 text-sm">points</div>
                      </div>

                      <div className="text-right">
                        <div className="text-white font-semibold">{constructor.wins}</div>
                        <div className="text-gray-400 text-sm">wins</div>
                      </div>
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
