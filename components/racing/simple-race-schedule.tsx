"use client"

import { useState } from "react"
import { Calendar, MapPin, Clock, Flag, Trophy, Zap, CircuitBoard, Tv, Youtube, Share2, ExternalLink } from "lucide-react"
import RacesIcon from "@/components/icons/races-icon"
import { f1Schedule2025 } from "@/lib/race-schedule-data"
import { format, parseISO, isFuture, isPast } from "date-fns"
import { AuthButtons } from "@/components/auth/auth-buttons"

export default function SimpleRaceSchedule() {
  const [activeTab, setActiveTab] = useState("")

  const shareToSocial = (platform: string, race: any) => {
    const raceUrl = `${window.location.origin}/calendar#race-${race.id}`
    const raceText = `🏁 ${race.name} - ${format(parseISO(race.date), "MMMM do, yyyy")} at ${race.time} ${race.timezone}. ${race.circuit}, ${race.location}. #F1 #Formula1 #${race.name.replace(/\s+/g, '')}`
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(raceUrl)}&quote=${encodeURIComponent(raceText)}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(raceText)}&url=${encodeURIComponent(raceUrl)}`, '_blank')
        break
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we copy to clipboard
        navigator.clipboard.writeText(`${raceText} ${raceUrl}`)
        alert('Race info copied to clipboard! Paste it in your Instagram post or story.')
        break
      case 'tiktok':
        // TikTok doesn't support direct URL sharing, so we copy to clipboard  
        navigator.clipboard.writeText(`${raceText} ${raceUrl}`)
        alert('Race info copied to clipboard! Paste it in your TikTok post.')
        break
    }
  }

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
          <div className="flex items-center justify-center gap-4 mb-4">
            <RacesIcon className="text-red-400" width={48} height={48} />
            <h1 className="text-4xl font-bold font-orbitron text-red-400" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))' }}>F1 2025 Race Schedule</h1>
            <RacesIcon className="text-red-400" width={48} height={48} />
          </div>
          <p className="text-gray-400 font-rajdhani">Complete Formula 1 calendar with race times and circuit information</p>
        </div>

        {/* Auth Buttons */}
        <div className="mb-6">
          <AuthButtons themeColor="red" />
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
                    <div className="text-right space-y-3">
                      {/* Viewing Options */}
                      <div className="flex flex-col gap-2">
                        <div className="text-sm text-gray-400 font-rajdhani">Watch Live:</div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(race.liveStreamOptions.f1tv, "_blank")}
                            className="flex items-center gap-1 px-3 py-1 bg-red-600/20 border border-red-600/50 text-red-400 hover:bg-red-600/30 hover:border-red-500 hover:text-red-300 rounded text-xs transition-colors"
                          >
                            <Tv className="h-3 w-3" />
                            F1 TV
                          </button>
                          {race.liveStreamOptions.espn && (
                            <button
                              onClick={() => window.open(race.liveStreamOptions.espn, "_blank")}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-600/20 border border-blue-600/50 text-blue-400 hover:bg-blue-600/30 hover:border-blue-500 hover:text-blue-300 rounded text-xs transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                              ESPN
                            </button>
                          )}
                          {race.liveStreamOptions.skyf1 && (
                            <button
                              onClick={() => window.open(race.liveStreamOptions.skyf1, "_blank")}
                              className="flex items-center gap-1 px-3 py-1 bg-gray-600/20 border border-gray-600/50 text-gray-400 hover:bg-gray-600/30 hover:border-gray-500 hover:text-gray-300 rounded text-xs transition-colors"
                            >
                              <Tv className="h-3 w-3" />
                              Sky F1
                            </button>
                          )}
                          <button
                            onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(race.name + ' 2025 live')}`, "_blank")}
                            className="flex items-center gap-1 px-3 py-1 bg-red-600/20 border border-red-600/50 text-red-400 hover:bg-red-600/30 hover:border-red-500 hover:text-red-300 rounded text-xs transition-colors"
                          >
                            <Youtube className="h-3 w-3" />
                            YouTube
                          </button>
                        </div>
                      </div>
                      
                      {/* Sharing Options */}
                      <div className="flex flex-col gap-2">
                        <div className="text-sm text-gray-400 font-rajdhani">Share:</div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => shareToSocial('facebook', race)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600/20 border border-blue-600/50 text-blue-400 hover:bg-blue-600/30 hover:border-blue-500 hover:text-blue-300 rounded text-xs transition-colors"
                          >
                            <Share2 className="h-3 w-3" />
                            Facebook
                          </button>
                          <button
                            onClick={() => shareToSocial('twitter', race)}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-800/20 border border-gray-600/50 text-gray-400 hover:bg-gray-800/30 hover:border-gray-500 hover:text-gray-300 rounded text-xs transition-colors"
                          >
                            <Share2 className="h-3 w-3" />
                            X
                          </button>
                          <button
                            onClick={() => shareToSocial('instagram', race)}
                            className="flex items-center gap-1 px-3 py-1 bg-pink-600/20 border border-pink-600/50 text-pink-400 hover:bg-pink-600/30 hover:border-pink-500 hover:text-pink-300 rounded text-xs transition-colors"
                          >
                            <Share2 className="h-3 w-3" />
                            Instagram
                          </button>
                          <button
                            onClick={() => shareToSocial('tiktok', race)}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-900/20 border border-gray-700/50 text-gray-300 hover:bg-gray-900/30 hover:border-gray-600 hover:text-white rounded text-xs transition-colors"
                          >
                            <Share2 className="h-3 w-3" />
                            TikTok
                          </button>
                        </div>
                      </div>
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
