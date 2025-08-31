import { NextResponse } from "next/server"
import { f1Api } from "@/lib/f1-api"

// This endpoint provides "live" data by combining real F1 data with simulated live updates
export async function GET() {
  try {
    // Get the next race or current race
    const nextRace = await f1Api.getNextRace()
    const lastRace = await f1Api.getLastRaceResults()

    // Determine if we should show live data or upcoming race info
    const now = new Date()
    let isLive = false
    let raceData = null

    if (nextRace) {
      const raceDate = new Date(nextRace.date + (nextRace.time ? `T${nextRace.time}` : "T14:00:00Z"))
      const raceEndTime = new Date(raceDate.getTime() + 2 * 60 * 60 * 1000) // Race + 2 hours

      // Check if race is currently happening (within race window)
      if (now >= raceDate && now <= raceEndTime) {
        isLive = true
        raceData = f1Api.transformRaceData(nextRace)

        // Add simulated live data
        raceData.status = "race"
        raceData.currentLap = Math.min(Math.floor((now.getTime() - raceDate.getTime()) / (90 * 1000)), 57) // ~90 seconds per lap
        raceData.isLive = true
      } else {
        // Show next race info
        raceData = f1Api.transformRaceData(nextRace)
        raceData.status = "scheduled"
        raceData.isLive = false
      }
    } else if (lastRace) {
      // Show last race results if no upcoming race
      raceData = f1Api.transformRaceData(lastRace)
      raceData.status = "finished"
      raceData.isLive = false
    }

    if (!raceData) {
      return NextResponse.json({ error: "No race data available" }, { status: 404 })
    }

    // Add weather simulation for live races
    if (isLive) {
      raceData.weather = {
        temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
        condition: ["Clear", "Partly Cloudy", "Overcast"][Math.floor(Math.random() * 3)],
      }
    }

    return NextResponse.json({
      ...raceData,
      timestamp: new Date().toISOString(),
      dataSource: "ergast-api",
    })
  } catch (error) {
    console.error("F1 live API error:", error)
    return NextResponse.json({ error: "Failed to fetch live F1 data" }, { status: 500 })
  }
}
