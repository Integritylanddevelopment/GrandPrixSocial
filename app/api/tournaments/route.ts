import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { seasonTournaments } from "@/lib/schema"
import { desc } from "drizzle-orm"

export async function GET() {
  try {
    // Check if database is properly configured
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("placeholder")) {
      return NextResponse.json({
        success: true,
        tournaments: [],
        message: "Database not configured - using placeholder data"
      })
    }

    const db = getDb()
    const tournaments = await db
      .select({
        id: seasonTournaments.id,
        name: seasonTournaments.name,
        description: seasonTournaments.description,
        startDate: seasonTournaments.startDate,
        endDate: seasonTournaments.endDate,
        prizePool: seasonTournaments.prizePool,
        status: seasonTournaments.status,
        maxParticipants: seasonTournaments.maxParticipants,
      })
      .from(seasonTournaments)
      .orderBy(desc(seasonTournaments.startDate))

    return NextResponse.json(tournaments)
  } catch (error) {
    console.error("Error fetching tournaments:", error)
    return NextResponse.json({ 
      success: true,
      tournaments: [],
      error: "Database connection failed - using placeholder data" 
    }, { status: 200 })
  }
}
