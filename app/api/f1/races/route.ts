import { NextResponse } from "next/server"
import { f1Api } from "@/lib/f1-api"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const season = searchParams.get("season") || "2024"
    const round = searchParams.get("round")
    const type = searchParams.get("type") // "next", "last", "all"

    if (type === "next") {
      const nextRace = await f1Api.getNextRace()
      if (!nextRace) {
        return NextResponse.json({ error: "No upcoming races found" }, { status: 404 })
      }
      return NextResponse.json(f1Api.transformRaceData(nextRace))
    }

    if (type === "last") {
      const lastRace = await f1Api.getLastRaceResults()
      if (!lastRace) {
        return NextResponse.json({ error: "No recent race results found" }, { status: 404 })
      }
      return NextResponse.json(f1Api.transformRaceData(lastRace))
    }

    if (round) {
      const raceResults = await f1Api.getRaceResults(season, round)
      if (!raceResults) {
        return NextResponse.json({ error: "Race not found" }, { status: 404 })
      }
      return NextResponse.json(f1Api.transformRaceData(raceResults))
    }

    // Get all races for the season
    const races = await f1Api.getCurrentSeasonRaces()
    const transformedRaces = races.map((race) => f1Api.transformRaceData(race))

    return NextResponse.json(transformedRaces)
  } catch (error) {
    console.error("F1 races API error:", error)
    return NextResponse.json({ error: "Failed to fetch F1 race data" }, { status: 500 })
  }
}
