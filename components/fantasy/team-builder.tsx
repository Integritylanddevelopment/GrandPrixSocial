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
      <div className="flex justify-center py-12">
        <Card className="glass-purple border-purple-500 max-w-md">
          <CardContent className="p-6">
            <div className="text-center text-purple-400 font-orbitron">Loading drivers...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Team Summary */}
      <Card className="glass-purple border-purple-500">
        <CardHeader className="text-center">
          <CardTitle className="text-white font-orbitron text-2xl">Build Your Fantasy Team</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-md mx-auto">
            <Input
              placeholder="Enter team name..."
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="bg-gray-800 border-purple-500 text-white placeholder:text-gray-400 font-rajdhani text-center"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-white text-center">
            <div>
              <div className="text-sm text-gray-300 font-rajdhani">Drivers Selected</div>
              <div className="text-2xl font-bold text-purple-400 font-orbitron">
                {selectedDrivers.length}/{maxDrivers}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-300 font-rajdhani">Remaining Budget</div>
              <div className="text-2xl font-bold text-purple-400 font-orbitron">{formatBudget(remainingBudget)}</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-white text-sm mb-2 font-rajdhani">
              <span>Budget Used</span>
              <span>{budgetUsed.toFixed(1)}%</span>
            </div>
            <Progress value={budgetUsed} className="h-2 bg-gray-800">
              <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all" style={{width: `${budgetUsed}%`}} />
            </Progress>
          </div>
        </CardContent>
      </Card>

      {/* Selected Drivers */}
      {selectedDrivers.length > 0 && (
        <Card className="glass-purple border-purple-500">
          <CardHeader className="text-center">
            <CardTitle className="text-white font-orbitron">Your Selected Drivers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedDrivers.map((driver) => (
              <div
                key={driver.id}
                className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg border border-purple-500/30"
              >
                <Image
                  src={driver.imageUrl || "/placeholder.svg"}
                  alt={`${driver.firstName} ${driver.lastName}`}
                  width={50}
                  height={50}
                  className="rounded-full border-2 border-purple-400"
                />
                <div className="flex-1">
                  <div className="text-white font-semibold font-rajdhani">
                    {driver.firstName} {driver.lastName}
                  </div>
                  <div className="text-gray-400 text-sm font-rajdhani">{driver.team}</div>
                </div>
                <div className="text-purple-400 font-bold font-orbitron">{formatPrice(driver.price)}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeDriver(driver)}
                  className="border-red-500 text-red-400 hover:bg-red-500/10 hover:border-red-400"
                >
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Available Drivers */}
      <Card className="glass-purple border-purple-500">
        <CardHeader className="text-center">
          <CardTitle className="text-white font-orbitron">Available Drivers</CardTitle>
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
                    <span className="text-white font-semibold font-rajdhani">
                      {driver.firstName} {driver.lastName}
                    </span>
                    <Badge variant="outline" style={{ borderColor: driver.teamColor, color: driver.teamColor }}>
                      #{driver.number}
                    </Badge>
                  </div>
                  <div className="text-gray-400 text-sm font-rajdhani">{driver.team}</div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-gray-300 text-sm font-rajdhani">{driver.points} pts</span>
                    <span className="text-gray-300 text-sm font-rajdhani">{driver.popularity}% owned</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-purple-400 font-bold font-orbitron">{formatPrice(driver.price)}</div>
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
        <Card className="glass-purple border-purple-500">
          <CardContent className="p-4">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-rajdhani transition-all duration-200">
              Save Team: {teamName}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
