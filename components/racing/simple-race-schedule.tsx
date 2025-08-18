"use client"

import { useState } from "react"
import { Calendar, MapPin, Clock, Flag, Trophy, Zap } from "lucide-react"
import { f1Schedule2025 } from "@/lib/race-schedule-data"
import { format, parseISO, isFuture, isPast } from "date-fns"

export default function SimpleRaceSchedule() {
  const [activeTab, setActiveTab] = useState("upcoming")

  const getFilteredRaces = () => {
    switch (activeTab) {
      case "upcoming":
        return f1Schedule2025.filter((race) => isFuture(parseISO(race.date))).slice(0, 5)
      case "sprint":
        return f1Schedule2025.filter((race) => race.isSprint)
      default:
        return f1Schedule2025
    }
  }

  const getNextRace = () => {
    const upcomingRaces = f1Schedule2025.filter((race) => isFuture(parseISO(race.date)))
    return upcomingRaces.length > 0 ? upcomingRaces[0] : f1Schedule2025[0]
  }

  const tabs = [
    { id: "upcoming", label: "Upcoming", icon: Calendar },
    { id: "sprint", label: "Sprint Weekends", icon: Zap },
    { id: "all", label: "Full Season", icon: Trophy },
  ]

  const filteredRaces = getFilteredRaces()
  const nextRace = getNextRace()
  const sprintCount = f1Schedule2025.filter((race) => race.isSprint).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900/20">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">F1 2025 Race Schedule</h1>
          <p className="text-gray-400">Complete Formula 1 calendar with race times and circuit information</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">24</div>
            <div className="text-sm text-gray-400">Total Races</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">{sprintCount}</div>
            <div className="text-sm text-gray-400">Sprint Weekends</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">Next</div>
            <div className="text-sm text-gray-400">{nextRace.name.replace(" Grand Prix", " GP")}</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{format(parseISO(nextRace.date), "MMM d")}</div>
            <div className="text-sm text-gray-400">Race Date</div>
          </div>
        </div>

        <div className="w-full">
          <div className="flex bg-gray-900/50 rounded-lg p-1 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
                    activeTab === tab.id ? "bg-red-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="space-y-4">
            {filteredRaces.map((race) => {
              const raceDate = parseISO(race.date)
              const isUpcoming = isFuture(raceDate)
              const isPastRace = isPast(raceDate)

              return (
                <div key={race.id} className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {race.round}
                        </div>
                        <h3 className="text-xl font-semibold text-white">{race.name}</h3>
                        <div className="flex gap-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              isUpcoming
                                ? "bg-green-600/20 text-green-400"
                                : isPastRace
                                  ? "bg-gray-600/20 text-gray-400"
                                  : "bg-red-600/20 text-red-400"
                            }`}
                          >
                            {isUpcoming ? "upcoming" : isPastRace ? "completed" : "today"}
                          </span>
                          {race.isSprint && (
                            <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              Sprint
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 text-gray-400">
                        <div className="flex items-center gap-2">
                          <Flag className="h-4 w-4" />
                          {race.circuit}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {race.location}, {race.country}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(raceDate, "EEEE, MMMM do, yyyy")}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {race.time} {race.timezone}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <button
                        onClick={() => window.open(race.liveStreamOptions.f1tv, "_blank")}
                        className="px-4 py-2 bg-transparent border border-red-600 text-red-400 hover:bg-red-600/10 hover:border-red-500 hover:text-red-300 rounded-md transition-colors"
                      >
                        Watch Live
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
