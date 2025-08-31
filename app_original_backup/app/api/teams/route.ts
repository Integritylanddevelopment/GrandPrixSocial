import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { teams, teamMembers, users } from "@/lib/schema"
import { eq, desc, count } from "drizzle-orm"

export async function GET() {
  try {
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
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
  }
}
