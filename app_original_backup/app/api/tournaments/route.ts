import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { seasonTournaments } from "@/lib/schema"
import { desc } from "drizzle-orm"

export async function GET() {
  try {
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
    return NextResponse.json({ error: "Failed to fetch tournaments" }, { status: 500 })
  }
}
