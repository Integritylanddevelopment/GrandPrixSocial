"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, Clock, Flag, Trophy, Zap, CircuitBoard, Tv, Youtube, Share2, ExternalLink, Timer } from "lucide-react"
import RacesIcon from "@/components/icons/races-icon"
import { f1Schedule2025, F1Session } from "@/lib/race-schedule-data"
import { format, parseISO, isFuture, isPast, formatInTimeZone, differenceInSeconds } from "date-fns"
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz"
import { AuthButtons } from "@/components/auth/auth-buttons"

export default function SimpleRaceSchedule() {
  const [activeTab, setActiveTab] = useState("today")
  const [liveRaces, setLiveRaces] = useState(f1Schedule2025) // Fallback to static data
  const [userTimeZone, setUserTimeZone] = useState('UTC')
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Get user's timezone, update current time, and fetch live F1 calendar data
  useEffect(() => {
    // Detect user's timezone
    const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone
    setUserTimeZone(userTz)

    // Update current time every second for countdown
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    const fetchF1Calendar = async () => {
      try {
        const response = await fetch('/api/f1/calendar')
        if (response.ok) {
          const liveData = await response.json()
          // Transform API data to match your existing UI structure
          const transformedData = liveData.map((race: any) => ({
            id: race.round,
            name: race.raceName || race.name,
            date: race.raceDateTime || race.date,
            time: race.schedule?.race ? new Date(race.schedule.race).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : race.time,
            timezone: race.timezone || 'UTC',
            circuit: race.circuit?.circuitName || race.circuit,
            location: race.circuit?.location ? `${race.circuit.location.locality}, ${race.circuit.location.country}` : race.location,
            country: race.circuit?.location?.country || race.country,
            flag: race.flag || '🏁',
            season: race.season || '2024',
            sessions: race.sessions || []
          }))
          setLiveRaces(transformedData)
        }
      } catch (error) {
        console.log('Using static race data as fallback')
        // Keep existing static data as fallback
      } finally {
        setIsLoading(false)
      }
    }

    fetchF1Calendar()
    
    return () => clearInterval(timeInterval)
  }, [])

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
        return liveRaces.filter((race) => isFuture(parseISO(race.date))).slice(0, 5)
      case "sprint":
        return liveRaces.filter((race) => race.isSprint)
      case "today":
        const today = format(currentTime, 'yyyy-MM-dd')
        return liveRaces.filter((race) => race.date === today || race.sessions.some(session => session.date === today))
      default:
        return liveRaces
    }
  }

  const getNextRace = () => {
    const upcomingRaces = liveRaces.filter((race) => isFuture(parseISO(race.date)))
    return upcomingRaces.length > 0 ? upcomingRaces[0] : liveRaces[0]
  }

  const getTodaysBadgeCount = () => {
    const today = format(currentTime, 'yyyy-MM-dd')
    const todaysRaces = liveRaces.filter((race) => race.date === today || race.sessions.some(session => session.date === today))
    return todaysRaces.reduce((count, race) => {
      const todaysSessions = race.sessions.filter(session => session.date === today)
      return count + todaysSessions.length + (race.date === today ? 1 : 0)
    }, 0)
  }

  const tabs = [
    { id: "today", label: "Today", icon: Timer },
    { id: "upcoming", label: "Upcoming", icon: Calendar },
    { id: "sprint", label: "Sprint Weekends", icon: Zap },
    { id: "all", label: "Full Season", icon: CircuitBoard },
  ]

  const filteredRaces = getFilteredRaces()
  const nextRace = getNextRace()
  const sprintCount = liveRaces.filter((race) => race.isSprint).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-red-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      <div className="relative z-10 py-6">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <RacesIcon className="text-red-400 animate-pulse" width={48} height={48} />
            <h1 className="text-5xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-300 to-orange-400" style={{ 
              filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))' 
            }}>
              F1 2025 RACE SCHEDULE
            </h1>
            <RacesIcon className="text-red-400 animate-pulse" width={48} height={48} />
          </div>
          <p className="text-gray-300 font-rajdhani text-lg">Complete Formula 1 calendar with live timing and streaming</p>
          
          {/* Live Race Indicator */}
          {filteredRaces.some(race => format(currentTime, 'yyyy-MM-dd') === race.date) && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-500/50 rounded-full text-red-300 animate-pulse">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              <span className="font-rajdhani font-semibold">RACE DAY ACTIVE</span>
            </div>
          )}
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
                  {tab.id === 'today' && getTodaysBadgeCount() > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                      {getTodaysBadgeCount()}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="space-y-4 px-4">
              {filteredRaces.map((race) => {
              const raceDate = parseISO(race.date)
              const isUpcoming = isFuture(raceDate)
              const isPastRace = isPast(raceDate)
              const isToday = format(currentTime, 'yyyy-MM-dd') === race.date

              return (
                <div key={race.id} className="group">
                  {/* Main Race Card */}
                  <div className={`glass-morphism rounded-xl p-6 border backdrop-blur-xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                    isToday ? 'border-red-500 bg-gradient-to-br from-red-900/30 to-red-800/20 shadow-red-500/20' : 
                    'border-gray-700/50 bg-gradient-to-br from-gray-900/60 to-gray-800/40 hover:border-red-400/50'
                  } ${
                    isUpcoming ? 'hover:shadow-green-500/20' : isPastRace ? 'opacity-80' : ''
                  }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          isToday ? 'bg-red-500' : 'bg-red-600'
                        }`}>
                          {race.round}
                        </div>
                        <h3 className={`text-xl font-semibold ${
                          isToday ? 'text-red-300' : 'text-white'
                        }`}>{race.name}</h3>
                        <div className="flex gap-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              isToday
                                ? "bg-red-600/30 text-red-300 animate-pulse"
                                : isUpcoming
                                  ? "bg-green-600/20 text-green-400"
                                  : isPastRace
                                    ? "bg-gray-600/20 text-gray-400"
                                    : "bg-red-600/20 text-red-400"
                            }`}
                          >
                            {isToday ? "LIVE TODAY" : isUpcoming ? "upcoming" : isPastRace ? "completed" : "today"}
                          </span>
                          {race.isSprint && (
                            <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              Sprint
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Countdown for today's race */}
                      {isToday && (
                        <div className="mb-4 p-3 bg-red-900/30 rounded-lg border border-red-500/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Timer className="h-4 w-4 text-red-400" />
                            <span className="text-red-300 font-semibold font-rajdhani">Race starts in:</span>
                          </div>
                          <div className="text-2xl font-bold text-red-300 font-orbitron">
                            {getCountdown(race.date, race.time, race.timezone)}
                          </div>
                        </div>
                      )}
                      
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
                          <div className="flex flex-col">
                            <span className="text-white font-medium">
                              {formatLocalTime(race.date, race.time, race.timezone, userTimeZone)}
                            </span>
                            <span className="text-xs text-gray-500">
                              Your local time ({userTimeZone.split('/').pop()?.replace('_', ' ')})
                            </span>
                            <span className="text-xs text-gray-600">
                              Race time: {race.time} {race.timezone}
                            </span>
                          </div>
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
                  
                  {/* Sessions for today's race */}
                  {isToday && race.sessions.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-lg font-semibold text-red-300 font-rajdhani mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Weekend Schedule
                      </h4>
                      {race.sessions.map((session) => (
                        <SessionCard key={session.id} session={session} userTimeZone={userTimeZone} currentTime={currentTime} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to format race time in user's local timezone
function formatLocalTime(raceDate: string, raceTime: string, raceTimezone: string, userTimezone: string): string {
  try {
    // Create a date object from race date and time
    const raceDateObj = parseISO(raceDate)
    const [raceHours, raceMinutes] = raceTime.split(':').map(Number)
    raceDateObj.setHours(raceHours, raceMinutes, 0, 0)
    
    // Convert from race timezone to user timezone
    const userTime = utcToZonedTime(zonedTimeToUtc(raceDateObj, raceTimezone), userTimezone)
    
    // Format in user's locale and timezone
    return formatInTimeZone(userTime, userTimezone, 'h:mm a')
  } catch (error) {
    // Fallback to original time if conversion fails
    return `${raceTime} ${raceTimezone}`
  }
}

// Helper function to get countdown to race
function getCountdown(raceDate: string, raceTime: string, raceTimezone: string): string {
  try {
    // Create a date object from race date and time
    const raceDateObj = parseISO(raceDate)
    const [raceHours, raceMinutes] = raceTime.split(':').map(Number)
    raceDateObj.setHours(raceHours, raceMinutes, 0, 0)
    
    // Convert to UTC then to local time
    const raceInUTC = zonedTimeToUtc(raceDateObj, raceTimezone)
    const now = new Date()
    
    const diffInSeconds = differenceInSeconds(raceInUTC, now)
    
    if (diffInSeconds <= 0) {
      return "RACE IS LIVE!"
    }
    
    const hours = Math.floor(diffInSeconds / 3600)
    const minutes = Math.floor((diffInSeconds % 3600) / 60)
    const seconds = diffInSeconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  } catch (error) {
    return "Loading..."
  }
}

// Session Card Component
function SessionCard({ session, userTimeZone, currentTime }: { session: F1Session, userTimeZone: string, currentTime: Date }) {
  const sessionDate = parseISO(session.date)
  const isToday = format(currentTime, 'yyyy-MM-dd') === session.date
  const isPastSession = isPast(sessionDate)
  
  const getSessionColor = (type: F1Session['type']) => {
    switch (type) {
      case 'practice1':
      case 'practice2':
      case 'practice3':
        return 'border-blue-500 bg-blue-900/20 text-blue-300'
      case 'qualifying':
        return 'border-yellow-500 bg-yellow-900/20 text-yellow-300'
      case 'sprint-qualifying':
        return 'border-orange-500 bg-orange-900/20 text-orange-300'
      case 'sprint':
        return 'border-purple-500 bg-purple-900/20 text-purple-300'
      case 'race':
        return 'border-red-500 bg-red-900/20 text-red-300'
      default:
        return 'border-gray-500 bg-gray-900/20 text-gray-300'
    }
  }
  
  return (
    <div className={`p-4 rounded-lg border ${getSessionColor(session.type)} ${isPastSession ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <h5 className="font-semibold font-rajdhani">{session.name}</h5>
        <span className={`px-2 py-1 text-xs rounded-full ${
          isPastSession ? 'bg-gray-600/30 text-gray-400' : 'bg-green-600/30 text-green-400'
        }`}>
          {isPastSession ? 'Completed' : isToday ? 'Today' : 'Upcoming'}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>{formatLocalTime(session.date, session.time, session.timezone, userTimeZone)}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.open(session.liveStreamOptions.f1tv, "_blank")}
            className="flex items-center gap-1 px-2 py-1 bg-red-600/20 border border-red-600/50 text-red-400 hover:bg-red-600/30 text-xs transition-colors rounded"
          >
            <Tv className="h-3 w-3" />
            F1 TV
          </button>
          {session.liveStreamOptions.espn && (
            <button
              onClick={() => window.open(session.liveStreamOptions.espn, "_blank")}
              className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 border border-blue-600/50 text-blue-400 hover:bg-blue-600/30 text-xs transition-colors rounded"
            >
              <ExternalLink className="h-3 w-3" />
              ESPN
            </button>
          )}
          {session.liveStreamOptions.skyf1 && (
            <button
              onClick={() => window.open(session.liveStreamOptions.skyf1, "_blank")}
              className="flex items-center gap-1 px-2 py-1 bg-gray-600/20 border border-gray-600/50 text-gray-400 hover:bg-gray-600/30 text-xs transition-colors rounded"
            >
              <Tv className="h-3 w-3" />
              Sky F1
            </button>
          )}
          <button
            onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(session.name + ' live')}`, "_blank")}
            className="flex items-center gap-1 px-2 py-1 bg-red-600/20 border border-red-600/50 text-red-400 hover:bg-red-600/30 text-xs transition-colors rounded"
          >
            <Youtube className="h-3 w-3" />
            YouTube
          </button>
        </div>
      </div>
    </div>
  )
}