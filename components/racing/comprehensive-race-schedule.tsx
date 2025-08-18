"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, ExternalLink, Play, Tv, Globe, CheckCircle, Zap, Share2 } from "lucide-react"
import { f1Schedule2025, type F1Race } from "@/lib/race-schedule-data"
import { format, parseISO, isFuture, isPast, isToday } from "date-fns"
import { useMobile } from "@/hooks/use-mobile"

export default function RaceSchedulePage() {
  const { isMobile, deviceType } = useMobile()
  const [selectedFilter, setSelectedFilter] = useState<"all" | "upcoming" | "past" | "sprint">("all")

  const getFilteredRaces = () => {
    const now = new Date()

    switch (selectedFilter) {
      case "upcoming":
        return f1Schedule2025.filter((race) => isFuture(parseISO(race.date)))
      case "past":
        return f1Schedule2025.filter((race) => isPast(parseISO(race.date)) && !isToday(parseISO(race.date)))
      case "sprint":
        return f1Schedule2025.filter((race) => race.isSprint)
      default:
        return f1Schedule2025
    }
  }

  const getRaceStatus = (race: F1Race) => {
    const raceDate = parseISO(race.date)
    if (isToday(raceDate)) return "today"
    if (isFuture(raceDate)) return "upcoming"
    return "past"
  }

  const getStatusBadge = (status: string, isSprint: boolean) => {
    switch (status) {
      case "today":
        return <Badge className="bg-red-600 text-white">🔴 LIVE TODAY</Badge>
      case "upcoming":
        return <Badge className="bg-green-600 text-white">📅 Upcoming</Badge>
      case "past":
        return <Badge className="bg-slate-500 text-white">✅ Completed</Badge>
      default:
        return null
    }
  }

  const openStream = (url: string) => {
    window.open(url, "_blank")
  }

  const getF1YouTubeLink = (raceName: string, raceDate: string) => {
    // Generate proper F1 YouTube search URLs for specific races
    const raceYear = new Date(raceDate).getFullYear()
    const searchQuery = `${raceName} ${raceYear} F1 highlights`
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`
  }

  const [showRaceShare, setShowRaceShare] = useState<string | null>(null)

  const shareRace = (race: F1Race, platform?: string) => {
    const raceDate = parseISO(race.date)
    const formattedDate = format(raceDate, "MMMM do, yyyy")

    const shareText = `🏎️ ${race.name} - ${formattedDate}
📍 ${race.location}, ${race.country}
⏰ ${race.time} ${race.timezone}
🏁 ${race.circuit}

Watch live on F1 TV, ESPN, or YouTube! #F1 #${race.country?.replace(/\s+/g, "") || "F1"}GP #Formula1`

    if (platform) {
      const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`,
        instagram: shareText,
        tiktok: shareText,
      }

      if (platform === "instagram" || platform === "tiktok") {
        navigator.clipboard.writeText(shareUrls[platform as keyof typeof shareUrls]).then(() => {
          alert(
            `Race details copied! Paste in ${platform === "instagram" ? "Instagram Stories or post" : "your TikTok video description"}.`,
          )
        })
      } else {
        window.open(shareUrls[platform as keyof typeof shareUrls], "_blank")
      }
      setShowRaceShare(null)
      return
    }

    // Legacy function - use new share menu instead
    setShowRaceShare(showRaceShare === race.id ? null : race.id)
  }

  const filteredRaces = getFilteredRaces()

  if (isMobile) {
    return (
      <div className="min-h-screen mobile-optimized">
        {/* Mobile Header */}
        <div className="mobile-card f1-tile">
          <div className="text-center p-4">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="p-2 bg-racing-red/20 rounded-full">
                <Calendar className="w-6 h-6 text-racing-red" />
              </div>
              <h1 className="hero-title">Race Schedule</h1>
            </div>
            <p className="text-base-plus mb-2">Complete F1 2025 calendar with streaming links</p>
            <div className="text-sm text-gray-500">24 Grand Prix • 6 Sprint weekends • 75th F1 Season</div>
          </div>
        </div>

        {/* Mobile Filter Navigation */}
        <div className="px-3 mb-4">
          <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
            {[
              { key: "all", label: "All Races", icon: Calendar },
              { key: "upcoming", label: "Upcoming", icon: Clock },
              { key: "past", label: "Completed", icon: CheckCircle },
              { key: "sprint", label: "Sprint Weekends", icon: Zap },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedFilter(key as any)}
                className={`flex-shrink-0 flex items-center space-x-2 px-3 py-2 rounded-full border transition-colors touch-manipulation ${
                  selectedFilter === key
                    ? "bg-racing-red border-racing-red text-white"
                    : "bg-gray-800 border-gray-700 text-gray-300"
                }`}
                data-testid={`filter-${key}`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Race Cards */}
        <div className="space-y-3 px-3">
          {filteredRaces.length === 0 ? (
            <div className="mobile-card f1-tile text-center">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <h3 className="subheading text-gray-400 mb-2">No races found</h3>
              <p className="text-base-plus text-gray-500">Try adjusting your filter selection</p>
            </div>
          ) : (
            filteredRaces.map((race) => {
              const raceStatus = getRaceStatus(race)
              const raceDate = parseISO(race.date)

              return (
                <div key={race.id} className="mobile-card f1-tile" data-testid={`race-card-${race.id}`}>
                  <div className="space-y-3">
                    {/* Mobile Race Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(raceStatus, race.isSprint)}
                        {race.isSprint && <Badge className="bg-yellow-600 text-black text-xs">⚡ Sprint</Badge>}
                      </div>
                      <div className="text-xs text-gray-400">Round {race.round}</div>
                    </div>

                    {/* Mobile Race Title */}
                    <div>
                      <h3 className="subheading font-bold text-white leading-tight">{race.name}</h3>
                      <p className="text-base text-gray-400">🏁 {race.circuit}</p>
                    </div>

                    {/* Mobile Race Details */}
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin className="w-4 h-4 text-racing-red" />
                        <span>
                          {race.location}, {race.country}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Clock className="w-4 h-4 text-racing-red" />
                        <span>
                          {format(raceDate, "MMMM do, yyyy")} • {race.time} {race.timezone}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Streaming Options */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-white">Watch Live:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => openStream(race.liveStreamOptions.f1tv)}
                          className="mobile-btn bg-blue-900 text-blue-200 border border-blue-700 text-xs p-2"
                          data-testid={`stream-f1tv-${race.id}`}
                        >
                          <Tv className="w-3 h-3 mr-1" />
                          F1 TV
                        </button>
                        {race.liveStreamOptions.espn && (
                          <button
                            onClick={() => openStream(race.liveStreamOptions.espn!)}
                            className="mobile-btn bg-red-900 text-red-200 border border-red-700 text-xs p-2"
                            data-testid={`stream-espn-${race.id}`}
                          >
                            <Tv className="w-3 h-3 mr-1" />
                            ESPN
                          </button>
                        )}
                        {race.liveStreamOptions.skyf1 && (
                          <button
                            onClick={() => openStream(race.liveStreamOptions.skyf1!)}
                            className="mobile-btn bg-purple-900 text-purple-200 border border-purple-700 text-xs p-2"
                            data-testid={`stream-skyf1-${race.id}`}
                          >
                            <Tv className="w-3 h-3 mr-1" />
                            Sky F1
                          </button>
                        )}
                        <button
                          onClick={() => openStream(getF1YouTubeLink(race.name, race.date))}
                          className="mobile-btn bg-red-900 text-red-200 border border-red-700 text-xs p-2"
                          data-testid={`youtube-${race.id}`}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          YouTube
                        </button>
                      </div>
                    </div>

                    {/* Mobile Share & Free Options */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                      {race.liveStreamOptions.free && race.liveStreamOptions.free.length > 0 && (
                        <div className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                          🆓 Free options available
                        </div>
                      )}

                      <div className="relative">
                        <button
                          onClick={() => shareRace(race)}
                          className="p-2 text-gray-400 hover:text-racing-red touch-manipulation"
                          data-testid={`share-${race.id}`}
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        {showRaceShare === race.id && (
                          <div className="absolute bottom-full mb-2 right-0 bg-gray-800 border border-gray-700 rounded-lg p-2 z-10 min-w-48">
                            <div className="space-y-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-blue-400 hover:bg-blue-600/20"
                                onClick={() => shareRace(race, "twitter")}
                                data-testid={`share-twitter-${race.id}`}
                              >
                                Twitter
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-blue-600 hover:bg-blue-600/20"
                                onClick={() => shareRace(race, "facebook")}
                                data-testid={`share-facebook-${race.id}`}
                              >
                                Facebook
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-pink-400 hover:bg-pink-600/20"
                                onClick={() => shareRace(race, "instagram")}
                                data-testid={`share-instagram-${race.id}`}
                              >
                                Instagram
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-purple-400 hover:bg-purple-600/20"
                                onClick={() => shareRace(race, "tiktok")}
                                data-testid={`share-tiktok-${race.id}`}
                              >
                                TikTok
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  // Desktop version
  return (
    <div className="min-h-screen bg-slate-900 p-4 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🏎️ F1 2025 Race Schedule</h1>
          <p className="text-slate-400 text-lg">Complete Formula 1 calendar with live streaming links</p>
          <div className="text-sm text-slate-500 mt-2">
            24 Grand Prix races • 6 Sprint weekends • 75th F1 Anniversary Season
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[
            { key: "all", label: "All Races", icon: Calendar },
            { key: "upcoming", label: "Upcoming", icon: Clock },
            { key: "past", label: "Completed", icon: CheckCircle },
            { key: "sprint", label: "Sprint Weekends", icon: Zap },
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              onClick={() => setSelectedFilter(key as any)}
              variant={selectedFilter === key ? "default" : "outline"}
              className={`${
                selectedFilter === key
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "border-slate-600 text-slate-300 hover:bg-slate-800"
              }`}
              data-testid={`filter-${key}`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>

        {/* Race Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredRaces.map((race) => {
            const status = getRaceStatus(race)
            const raceDate = parseISO(race.date)

            return (
              <Card
                key={race.id}
                className={`f1-tile border-slate-700 min-h-[400px] ${
                  status === "today" ? "ring-2 ring-red-500 ring-opacity-50" : ""
                }`}
                data-testid={`race-card-${race.id}`}
              >
                <CardHeader className="pb-6 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Badge variant="outline" className="text-red-400 border-red-400 text-sm px-3 py-1">
                          Round {race.round}
                        </Badge>
                        {race.isSprint && (
                          <Badge className="bg-yellow-600 text-black font-bold text-sm px-3 py-1">SPRINT</Badge>
                        )}
                        {getStatusBadge(status, race.isSprint)}
                      </div>
                      <CardTitle className="text-white text-xl font-bold leading-tight mb-4">{race.name}</CardTitle>
                    </div>
                  </div>

                  <div className="space-y-3 text-base">
                    <div className="flex items-center text-slate-300">
                      <MapPin className="w-5 h-5 mr-3 text-red-400" />
                      <span className="font-medium">
                        {race.location}, {race.country}
                      </span>
                    </div>
                    <div className="flex items-center text-slate-300">
                      <Calendar className="w-5 h-5 mr-3 text-red-400" />
                      <span className="font-medium">{format(raceDate, "EEEE, MMMM do, yyyy")}</span>
                    </div>
                    <div className="flex items-center text-slate-300">
                      <Clock className="w-5 h-5 mr-3 text-red-400" />
                      <span className="font-medium">
                        {race.time} {race.timezone}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 p-6">
                  <div className="text-sm text-slate-400 mb-6 font-medium bg-slate-800/50 p-3 rounded-lg">
                    🏁 {race.circuit}
                  </div>

                  {/* Streaming Options */}
                  <div className="space-y-4">
                    <div className="text-base font-bold text-white mb-4 flex items-center">
                      <Tv className="w-5 h-5 mr-2 text-red-400" />
                      Watch Options:
                    </div>

                    {/* Primary YouTube Link */}
                    <Button
                      onClick={() => openStream(getF1YouTubeLink(race.name || "F1 Grand Prix", race.date))}
                      className="w-full bg-red-600 hover:bg-red-700 text-white justify-between py-3 text-base font-semibold transition-colors duration-200"
                      data-testid={`watch-youtube-${race.id}`}
                    >
                      <div className="flex items-center">
                        <Play className="w-5 h-5 mr-3" />
                        F1 YouTube Highlights
                      </div>
                      <ExternalLink className="w-5 h-5" />
                    </Button>

                    {/* Official Streaming */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => openStream(race.liveStreamOptions.f1tv)}
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-800 py-3 font-medium transition-colors duration-200"
                        data-testid={`watch-f1tv-${race.id}`}
                      >
                        <Tv className="w-4 h-4 mr-2" />
                        F1 TV
                      </Button>

                      {race.liveStreamOptions.espn && (
                        <Button
                          onClick={() => openStream(race.liveStreamOptions.espn!)}
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-800 py-3 font-medium transition-colors duration-200"
                          data-testid={`watch-espn-${race.id}`}
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          ESPN
                        </Button>
                      )}
                    </div>

                    {/* Share Race Menu */}
                    <div className="relative">
                      <Button
                        onClick={() => shareRace(race)}
                        variant="outline"
                        className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 py-3 font-medium transition-colors duration-200"
                        data-testid={`share-race-${race.id}`}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Race Schedule
                      </Button>

                      {showRaceShare === race.id && (
                        <div className="absolute bottom-full mb-2 left-0 bg-gray-800 border border-gray-700 rounded-lg p-2 z-10 min-w-48">
                          <div className="space-y-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-blue-400 hover:bg-blue-600/20"
                              onClick={() => shareRace(race, "twitter")}
                              data-testid={`share-twitter-${race.id}`}
                            >
                              Twitter
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-blue-600 hover:bg-blue-600/20"
                              onClick={() => shareRace(race, "facebook")}
                              data-testid={`share-facebook-${race.id}`}
                            >
                              Facebook
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-pink-400 hover:bg-pink-600/20"
                              onClick={() => shareRace(race, "instagram")}
                              data-testid={`share-instagram-${race.id}`}
                            >
                              Instagram
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-purple-400 hover:bg-purple-600/20"
                              onClick={() => shareRace(race, "tiktok")}
                              data-testid={`share-tiktok-${race.id}`}
                            >
                              TikTok
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Free Options */}
                    {race.liveStreamOptions.free && race.liveStreamOptions.free.length > 0 && (
                      <div className="text-sm text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                        🆓 Free: {race.liveStreamOptions.free.join(", ")}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredRaces.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No races found</h3>
            <p className="text-slate-500">Try adjusting your filter to see more races.</p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-12 p-6 bg-slate-800 rounded-lg border border-slate-700">
          <h3 className="text-white font-semibold mb-4">📺 Streaming Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
              <h4 className="font-semibold text-red-400 mb-2">Official Platforms:</h4>
              <ul className="space-y-1">
                <li>
                  • <strong>F1 TV:</strong> Official live streams ($129.99/year)
                </li>
                <li>
                  • <strong>ESPN:</strong> USA live coverage
                </li>
                <li>
                  • <strong>Sky F1:</strong> UK premium coverage
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-400 mb-2">Free Options:</h4>
              <ul className="space-y-1">
                <li>
                  • <strong>Channel 4:</strong> UK highlights + British GP live
                </li>
                <li>
                  • <strong>RTBF:</strong> Belgium live streams
                </li>
                <li>
                  • <strong>YouTube:</strong> Official highlights after races
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500">
            Note: Live streaming availability varies by region due to broadcast rights. YouTube links lead to official
            F1 highlights and content.
          </div>
        </div>
      </div>
    </div>
  )
}
