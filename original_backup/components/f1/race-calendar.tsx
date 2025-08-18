"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Flag, RefreshCw } from "lucide-react"

interface RaceEvent {
  season: string
  round: number
  raceName: string
  circuitName: string
  location: string
  country: string
  date: string
  time?: string
  raceDateTime: string
  isPast: boolean
  isToday: boolean
  isThisWeek: boolean
  daysUntilRace: number
  schedule: {
    practice1: string
    practice2: string
    practice3: string
    qualifying: string
    race: string
  }
  results?: any[]
}

export default function RaceCalendar() {
  const [races, setRaces] = useState<RaceEvent[]>([])
  const [upcomingRaces, setUpcomingRaces] = useState<RaceEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchCalendar = async () => {
    try {
      setLoading(true)

      // Fetch all races
      const allRacesResponse = await fetch("/api/f1/calendar")
      const allRacesData = await allRacesResponse.json()
      setRaces(allRacesData)

      // Fetch upcoming races
      const upcomingResponse = await fetch("/api/f1/calendar?upcoming=true")
      const upcomingData = await upcomingResponse.json()
      setUpcomingRaces(upcomingData)

      setLastUpdated(new Date())
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch calendar:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCalendar()

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchCalendar, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      }),
    }
  }

  const getCountdownText = (daysUntil: number) => {
    if (daysUntil < 0) return "Finished"
    if (daysUntil === 0) return "Today!"
    if (daysUntil === 1) return "Tomorrow"
    if (daysUntil <= 7) return `In ${daysUntil} days`
    return `${Math.ceil(daysUntil / 7)} weeks away`
  }

  const getRaceStatus = (race: RaceEvent) => {
    if (race.isPast) return { text: "Completed", color: "bg-gray-600" }
    if (race.isToday) return { text: "Race Day", color: "bg-red-600 animate-pulse" }
    if (race.isThisWeek) return { text: "This Week", color: "bg-orange-600" }
    return { text: "Upcoming", color: "bg-blue-600" }
  }

  if (loading && races.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="text-center text-white">Loading F1 race calendar...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                2024 F1 Race Calendar
              </h2>
              {lastUpdated && <p className="text-gray-400 text-sm">Last updated: {lastUpdated.toLocaleTimeString()}</p>}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCalendar}
              disabled={loading}
              className="border-gray-700 text-white hover:bg-gray-800 bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="bg-gray-900 border-gray-800">
          <TabsTrigger value="upcoming" className="text-white data-[state=active]:bg-gray-800">
            Upcoming Races
          </TabsTrigger>
          <TabsTrigger value="full-calendar" className="text-white data-[state=active]:bg-gray-800">
            Full Calendar
          </TabsTrigger>
          <TabsTrigger value="schedule" className="text-white data-[state=active]:bg-gray-800">
            Race Weekend
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <div className="space-y-4">
            {upcomingRaces.map((race) => {
              const status = getRaceStatus(race)
              const raceTime = formatDateTime(race.raceDateTime)

              return (
                <Card key={race.round} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={`${status.color} text-white`}>{status.text}</Badge>
                          <span className="text-gray-400 text-sm">Round {race.round}</span>
                        </div>

                        <h3 className="text-white font-bold text-xl mb-1">{race.raceName}</h3>

                        <div className="flex items-center gap-4 text-gray-300 text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {race.circuitName}, {race.country}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {raceTime.date} at {raceTime.time}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-white mb-1">{getCountdownText(race.daysUntilRace)}</div>
                        {!race.isPast && (
                          <div className="text-gray-400 text-sm">
                            {race.daysUntilRace > 0 ? `${race.daysUntilRace} days` : "Race Day!"}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="full-calendar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {races.map((race) => {
              const status = getRaceStatus(race)
              const raceTime = formatDateTime(race.raceDateTime)

              return (
                <Card
                  key={race.round}
                  className={`bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors ${race.isToday ? "ring-2 ring-red-500" : ""}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge className={`${status.color} text-white text-xs`}>Round {race.round}</Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${race.isPast ? "text-gray-500 border-gray-600" : "text-white border-gray-600"}`}
                      >
                        {status.text}
                      </Badge>
                    </div>
                    <CardTitle className={`text-lg ${race.isPast ? "text-gray-400" : "text-white"}`}>
                      {race.raceName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {race.location}, {race.country}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{raceTime.date}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <Flag className="w-4 h-4" />
                      <span>{raceTime.time}</span>
                    </div>

                    {!race.isPast && (
                      <div className="pt-2 border-t border-gray-800">
                        <div className="text-white font-semibold">{getCountdownText(race.daysUntilRace)}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          {upcomingRaces.length > 0 && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Next Race Weekend: {upcomingRaces[0].raceName}</CardTitle>
                <p className="text-gray-400">
                  {upcomingRaces[0].circuitName}, {upcomingRaces[0].country}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Practice 1", time: upcomingRaces[0].schedule.practice1, duration: "90 min" },
                  { name: "Practice 2", time: upcomingRaces[0].schedule.practice2, duration: "90 min" },
                  { name: "Practice 3", time: upcomingRaces[0].schedule.practice3, duration: "60 min" },
                  { name: "Qualifying", time: upcomingRaces[0].schedule.qualifying, duration: "60 min" },
                  { name: "Race", time: upcomingRaces[0].schedule.race, duration: "2 hours" },
                ].map((session, index) => {
                  const sessionTime = formatDateTime(session.time)
                  const isRace = session.name === "Race"

                  return (
                    <div
                      key={session.name}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        isRace ? "bg-red-900/20 border border-red-800" : "bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isRace ? "bg-red-500" : "bg-blue-500"}`} />
                        <div>
                          <div className={`font-semibold ${isRace ? "text-red-400" : "text-white"}`}>
                            {session.name}
                          </div>
                          <div className="text-gray-400 text-sm">{session.duration}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-mono">{sessionTime.time}</div>
                        <div className="text-gray-400 text-sm">{sessionTime.date}</div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
