import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { teams, teamMembers, users } from "@/lib/schema"
import { eq, desc, count } from "drizzle-orm"

export async function GET() {
  try {
    // Check if database is properly configured
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("placeholder")) {
      return NextResponse.json({
        success: true,
        teams: [],
        message: "Database not configured - using placeholder data"
      })
    }

    const db = getDb()
    const teamsWithStats = await db
      .select({
        id: teams.id,
        name: teams.name,
        description: teams.description,
        color: teams.color,
        logo: teams.logo,
        points: teams.points,
        level: teams.level,
        memberCount: count(teamMembers.userId),
        captain: users.username,
      })
      .from(teams)
      .leftJoin(teamMembers, eq(teams.id, teamMembers.teamId))
      .leftJoin(users, eq(teams.captainId, users.id))
      .groupBy(teams.id, users.username)
      .orderBy(desc(teams.points))

    return NextResponse.json(teamsWithStats)
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ 
      success: true,
      teams: [],
      error: "Database connection failed - using placeholder data" 
    }, { status: 200 })
  }
}
