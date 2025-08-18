"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Plus, Minus, TrendingUp, TrendingDown } from "lucide-react"
import Image from "next/image"

interface FantasyDriver {
  id: string
  number: number
  firstName: string
  lastName: string
  team: string
  teamColor: string
  price: number
  weeklyChange: number
  popularity: number
  points: number
  averagePoints: number
  imageUrl: string
}

interface TeamBuilderProps {
  budget?: number
  maxDrivers?: number
}

export default function TeamBuilder({ budget = 100000000, maxDrivers = 5 }: TeamBuilderProps) {
  const [drivers, setDrivers] = useState<FantasyDriver[]>([])
  const [selectedDrivers, setSelectedDrivers] = useState<FantasyDriver[]>([])
  const [remainingBudget, setRemainingBudget] = useState(budget)
  const [teamName, setTeamName] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch("/api/fantasy/drivers")
        const data = await response.json()
        setDrivers(data)
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch drivers:", error)
        setLoading(false)
      }
    }

    fetchDrivers()
  }, [])

  const formatPrice = (price: number) => {
    return `$${(price / 1000000).toFixed(1)}M`
  }

  const formatBudget = (amount: number) => {
    return `$${(amount / 1000000).toFixed(1)}M`
  }

  const canAddDriver = (driver: FantasyDriver) => {
    return (
      selectedDrivers.length < maxDrivers &&
      !selectedDrivers.find((d) => d.id === driver.id) &&
      remainingBudget >= driver.price
    )
  }

  const addDriver = (driver: FantasyDriver) => {
    if (canAddDriver(driver)) {
      setSelectedDrivers([...selectedDrivers, driver])
      setRemainingBudget(remainingBudget - driver.price)
    }
  }

  const removeDriver = (driver: FantasyDriver) => {
    setSelectedDrivers(selectedDrivers.filter((d) => d.id !== driver.id))
    setRemainingBudget(remainingBudget + driver.price)
  }

  const totalTeamValue = selectedDrivers.reduce((sum, driver) => sum + driver.price, 0)
  const budgetUsed = ((budget - remainingBudget) / budget) * 100

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="text-center text-white">Loading drivers...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Team Summary */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-blue-700">
        <CardHeader>
          <CardTitle className="text-white">Your Fantasy Team</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              placeholder="Enter team name..."
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-white">
            <div>
              <div className="text-sm opacity-80">Drivers Selected</div>
              <div className="text-2xl font-bold">
                {selectedDrivers.length}/{maxDrivers}
              </div>
            </div>
            <div>
              <div className="text-sm opacity-80">Remaining Budget</div>
              <div className="text-2xl font-bold">{formatBudget(remainingBudget)}</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-white text-sm mb-2">
              <span>Budget Used</span>
              <span>{budgetUsed.toFixed(1)}%</span>
            </div>
            <Progress value={budgetUsed} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Selected Drivers */}
      {selectedDrivers.length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Selected Drivers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedDrivers.map((driver) => (
              <div
                key={driver.id}
                className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg border-l-4"
                style={{ borderLeftColor: driver.teamColor }}
              >
                <Image
                  src={driver.imageUrl || "/placeholder.svg"}
                  alt={`${driver.firstName} ${driver.lastName}`}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <div className="text-white font-semibold">
                    {driver.firstName} {driver.lastName}
                  </div>
                  <div className="text-gray-400 text-sm">{driver.team}</div>
                </div>
                <div className="text-white font-mono">{formatPrice(driver.price)}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeDriver(driver)}
                  className="bg-transparent border border-red-600 text-red-400 hover:bg-red-600/10 hover:border-red-500 hover:text-red-300 transition-all duration-200"
                >
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Available Drivers */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Available Drivers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {drivers.map((driver) => {
            const isSelected = selectedDrivers.find((d) => d.id === driver.id)
            const canAdd = canAddDriver(driver)

            return (
              <div
                key={driver.id}
                className={`flex items-center gap-4 p-4 rounded-lg border-l-4 transition-colors ${
                  isSelected
                    ? "bg-green-900/20 border-green-500"
                    : canAdd
                      ? "bg-gray-800 hover:bg-gray-750 border-gray-600"
                      : "bg-gray-800/50 border-gray-700 opacity-50"
                }`}
                style={{ borderLeftColor: isSelected ? "#10b981" : driver.teamColor }}
              >
                <Image
                  src={driver.imageUrl || "/placeholder.svg"}
                  alt={`${driver.firstName} ${driver.lastName}`}
                  width={50}
                  height={50}
                  className="rounded-full"
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">
                      {driver.firstName} {driver.lastName}
                    </span>
                    <Badge variant="outline" style={{ borderColor: driver.teamColor, color: driver.teamColor }}>
                      #{driver.number}
                    </Badge>
                  </div>
                  <div className="text-gray-400 text-sm">{driver.team}</div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-gray-300 text-sm">{driver.points} pts</span>
                    <span className="text-gray-300 text-sm">{driver.popularity}% owned</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-white font-bold font-mono">{formatPrice(driver.price)}</div>
                  <div className="flex items-center gap-1 text-sm">
                    {driver.weeklyChange > 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    <span className={driver.weeklyChange > 0 ? "text-green-500" : "text-red-500"}>
                      {formatPrice(Math.abs(driver.weeklyChange))}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (isSelected ? removeDriver(driver) : addDriver(driver))}
                  disabled={!isSelected && !canAdd}
                  className={
                    isSelected
                      ? "bg-transparent border border-red-600 text-red-400 hover:bg-red-600/10 hover:border-red-500 hover:text-red-300 transition-all duration-200"
                      : "bg-transparent border border-green-600 text-green-400 hover:bg-green-600/10 hover:border-green-500 hover:text-green-300 transition-all duration-200"
                  }
                >
                  {isSelected ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </Button>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Save Team Button */}
      {selectedDrivers.length === maxDrivers && teamName.trim() && (
        <Card className="bg-green-900 border-green-700">
          <CardContent className="p-4">
            <Button className="w-full bg-transparent border border-green-600 text-green-400 hover:bg-green-600/10 hover:border-green-500 hover:text-green-300 transition-all duration-200">
              Save Team: {teamName}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
