"use client"

import { useState, useEffect } from "react"
import DriverStatsCard from "@/components/racing/driver-stats-card"
import DriverComparison from "@/components/racing/driver-comparison"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface Driver {
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

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("points")

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch("/api/drivers/stats")
        const data = await response.json()
        setDrivers(data)
        setFilteredDrivers(data)
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch drivers:", error)
        setLoading(false)
      }
    }

    fetchDrivers()
  }, [])

  useEffect(() => {
    const filtered = drivers.filter(
      (driver) =>
        driver.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.team.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Sort drivers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "points":
          return b.points - a.points
        case "wins":
          return b.wins - a.wins
        case "podiums":
          return b.podiums - a.podiums
        case "name":
          return a.lastName.localeCompare(b.lastName)
        default:
          return b.points - a.points
      }
    })

    setFilteredDrivers(filtered)
  }, [drivers, searchTerm, sortBy])

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">Loading driver statistics...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Driver Statistics</h1>
          <p className="text-gray-400">Comprehensive F1 driver performance analytics</p>
        </div>

        {/* Filters */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search drivers or teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="points" className="text-white hover:bg-gray-700">
                    Sort by Points
                  </SelectItem>
                  <SelectItem value="wins" className="text-white hover:bg-gray-700">
                    Sort by Wins
                  </SelectItem>
                  <SelectItem value="podiums" className="text-white hover:bg-gray-700">
                    Sort by Podiums
                  </SelectItem>
                  <SelectItem value="name" className="text-white hover:bg-gray-700">
                    Sort by Name
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Driver Comparison */}
        <DriverComparison drivers={drivers} />

        {/* Driver Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver) => (
            <DriverStatsCard key={driver.id} driver={driver} />
          ))}
        </div>
      </div>
    </div>
  )
}
