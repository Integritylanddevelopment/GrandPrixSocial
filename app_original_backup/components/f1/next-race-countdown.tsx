"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Flag } from "lucide-react"

interface NextRace {
  raceName: string
  circuitName: string
  country: string
  raceDateTime: string
  round: number
}

export default function NextRaceCountdown() {
  const [nextRace, setNextRace] = useState<NextRace | null>(null)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNextRace = async () => {
      try {
        const response = await fetch("/api/f1/calendar?upcoming=true")
        const data = await response.json()
        if (data.length > 0) {
          setNextRace(data[0])
        }
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch next race:", error)
        setLoading(false)
      }
    }

    fetchNextRace()
  }, [])

  useEffect(() => {
    if (!nextRace) return

    const calculateTimeLeft = () => {
      const raceTime = new Date(nextRace.raceDateTime).getTime()
      const now = new Date().getTime()
      const difference = raceTime - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [nextRace])

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-red-600 to-red-800 border-red-700">
        <CardContent className="p-6">
          <div className="text-center text-white">Loading next race...</div>
        </CardContent>
      </Card>
    )
  }

  if (!nextRace) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">No upcoming races found</div>
        </CardContent>
      </Card>
    )
  }

  const raceDate = new Date(nextRace.raceDateTime)
  const isRaceWeekend = timeLeft.days <= 3

  return (
    <Card
      className={`${isRaceWeekend ? "bg-gradient-to-r from-red-600 to-red-800 border-red-700" : "bg-gradient-to-r from-blue-600 to-purple-600 border-blue-700"}`}
    >
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div>
            <Badge className="bg-white/20 text-white mb-2">Round {nextRace.round} • Next Race</Badge>
            <h2 className="text-2xl font-bold text-white mb-1">{nextRace.raceName}</h2>
            <div className="flex items-center justify-center gap-4 text-white/80 text-sm">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{nextRace.circuitName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Flag className="w-4 h-4" />
                <span>{nextRace.country}</span>
              </div>
            </div>
          </div>

          {/* Countdown */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hours", value: timeLeft.hours },
              { label: "Minutes", value: timeLeft.minutes },
              { label: "Seconds", value: timeLeft.seconds },
            ].map((unit) => (
              <div key={unit.label} className="text-center">
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">{unit.value.toString().padStart(2, "0")}</div>
                  <div className="text-white/60 text-xs uppercase tracking-wide">{unit.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Race Time */}
          <div className="flex items-center justify-center gap-2 text-white/80">
            <Clock className="w-4 h-4" />
            <span>
              {raceDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}{" "}
              at{" "}
              {raceDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                timeZoneName: "short",
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
