import { NextResponse } from "next/server"
import { f1Api } from "@/lib/f1-api"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const season = searchParams.get("season") || "2024"
    const upcoming = searchParams.get("upcoming") === "true"

    // Get all races for the season
    const races = await f1Api.getCurrentSeasonRaces()

    if (!races || races.length === 0) {
      return NextResponse.json({ error: "No races found for season" }, { status: 404 })
    }

    // Transform race data and add additional info
    const transformedRaces = races.map((race) => {
      const raceDateTime = new Date(race.date + (race.time ? `T${race.time}` : "T14:00:00Z"))
      const now = new Date()

      return {
        ...f1Api.transformRaceData(race),
        raceDateTime: raceDateTime.toISOString(),
        isPast: raceDateTime < now,
        isToday: raceDateTime.toDateString() === now.toDateString(),
        isThisWeek: Math.abs(raceDateTime.getTime() - now.getTime()) < 7 * 24 * 60 * 60 * 1000,
        daysUntilRace: Math.ceil((raceDateTime.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
        // Add practice and qualifying schedule (typical F1 weekend)
        schedule: {
          practice1: new Date(raceDateTime.getTime() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // Friday +2h
          practice2: new Date(raceDateTime.getTime() - 2 * 24 * 60 * 60 * 1000 + 5.5 * 60 * 60 * 1000).toISOString(), // Friday +5.5h
          practice3: new Date(raceDateTime.getTime() - 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // Saturday +2h
          qualifying: new Date(raceDateTime.getTime() - 1 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(), // Saturday +5h
          race: raceDateTime.toISOString(),
        },
      }
    })

    // Filter for upcoming races if requested
    if (upcoming) {
      const upcomingRaces = transformedRaces.filter((race) => !race.isPast).slice(0, 5)
      return NextResponse.json(upcomingRaces)
    }

    return NextResponse.json(transformedRaces)
  } catch (error) {
    console.error("F1 calendar API error:", error)
    return NextResponse.json({ error: "Failed to fetch F1 calendar data" }, { status: 500 })
  }
}
