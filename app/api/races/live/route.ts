import { NextResponse } from "next/server"

// Mock live race data - in production this would connect to F1 APIs
const mockLiveRaceData = {
  race: {
    id: "1",
    raceName: "Bahrain Grand Prix",
    circuit: "Bahrain International Circuit",
    currentLap: 42,
    totalLaps: 57,
    status: "race",
    weather: { temperature: 28, condition: "Clear" },
  },
  results: [
    {
      position: 1,
      driver: { number: 1, name: "Max Verstappen", team: "Red Bull Racing", teamColor: "#0600EF" },
      gap: "Leader",
      lastLapTime: "1:32.456",
      bestLapTime: "1:31.987",
      currentTyre: "MEDIUM",
      tyreAge: 12,
      pitStops: 1,
    },
    {
      position: 2,
      driver: { number: 16, name: "Charles Leclerc", team: "Ferrari", teamColor: "#DC143C" },
      gap: "+2.341s",
      lastLapTime: "1:32.789",
      bestLapTime: "1:32.123",
      currentTyre: "HARD",
      tyreAge: 8,
      pitStops: 1,
    },
    {
      position: 3,
      driver: { number: 44, name: "Lewis Hamilton", team: "Mercedes", teamColor: "#00D2BE" },
      gap: "+8.567s",
      lastLapTime: "1:33.012",
      bestLapTime: "1:32.456",
      currentTyre: "MEDIUM",
      tyreAge: 15,
      pitStops: 2,
    },
    {
      position: 4,
      driver: { number: 55, name: "Carlos Sainz", team: "Ferrari", teamColor: "#DC143C" },
      gap: "+12.890s",
      lastLapTime: "1:33.234",
      bestLapTime: "1:32.678",
      currentTyre: "HARD",
      tyreAge: 6,
      pitStops: 1,
    },
    {
      position: 5,
      driver: { number: 63, name: "George Russell", team: "Mercedes", teamColor: "#00D2BE" },
      gap: "+18.456s",
      lastLapTime: "1:33.456",
      bestLapTime: "1:32.789",
      currentTyre: "MEDIUM",
      tyreAge: 18,
      pitStops: 2,
    },
  ],
}

export async function GET() {
  try {
    // Simulate real-time updates by slightly randomizing lap times
    const updatedResults = mockLiveRaceData.results.map((result) => ({
      ...result,
      lastLapTime: `1:${32 + Math.floor(Math.random() * 2)}.${Math.floor(Math.random() * 999)
        .toString()
        .padStart(3, "0")}`,
    }))

    return NextResponse.json({
      ...mockLiveRaceData,
      results: updatedResults,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch live race data" }, { status: 500 })
  }
}
