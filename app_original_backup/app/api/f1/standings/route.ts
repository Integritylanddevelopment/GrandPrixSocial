import { NextResponse } from "next/server"
import { f1Api } from "@/lib/f1-api"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const season = searchParams.get("season") || "2024"
    const type = searchParams.get("type") || "drivers" // "drivers" or "constructors"

    if (type === "constructors") {
      const standings = await f1Api.getConstructorStandings(season)
      return NextResponse.json(standings)
    }

    // Get driver standings
    const driverStandings = await f1Api.getDriverStandings(season)
    const drivers = await f1Api.getDrivers(season)

    // Combine standings with driver info
    const enrichedStandings = driverStandings.map((standing) => {
      const driver = drivers.find((d) => d.driverId === standing.driver.driverId)
      return {
        ...f1Api.transformDriverData(standing.driver, standing),
        constructor: standing.constructors[0]?.name || "Unknown",
      }
    })

    return NextResponse.json(enrichedStandings)
  } catch (error) {
    console.error("F1 standings API error:", error)
    return NextResponse.json({ error: "Failed to fetch F1 standings data" }, { status: 500 })
  }
}
