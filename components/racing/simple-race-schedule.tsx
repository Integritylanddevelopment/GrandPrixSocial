"use client"

import { useState } from "react"
import { Calendar, MapPin, Clock, Flag, Trophy, Zap, CircuitBoard } from "lucide-react"
import { f1Schedule2025 } from "@/lib/race-schedule-data"
import { format, parseISO, isFuture, isPast } from "date-fns"

export default function SimpleRaceSchedule() {
  const [activeTab, setActiveTab] = useState("")

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
    { id: "all", label: "Full Season", icon: CircuitBoard },
  ]

  const filteredRaces = getFilteredRaces()
  const nextRace = getNextRace()
  const sprintCount = f1Schedule2025.filter((race) => race.isSprint).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-red-950">
      <div className="py-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 font-orbitron text-red-400" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))' }}>F1 2025 Race Schedule</h1>
          <p className="text-gray-400 font-rajdhani">Complete Formula 1 calendar with race times and circuit information</p>
        </div>

        <div className="w-full">
          <div className="flex rounded-lg p-1 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200 font-rajdhani font-medium ${
                    activeTab === tab.id ? "glass-red text-red-300 shadow-lg scale-105 border border-red-400/50" : "text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab && (
            <div className="space-y-4 px-4">
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
          )}
        </div>
      </div>
    </div>
  )
}
