import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { challenges } from "@/lib/schema"
import { desc } from "drizzle-orm"

export async function GET() {
  try {
    // Check if database is properly configured
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("placeholder")) {
      return NextResponse.json({
        success: true,
        challenges: [],
        message: "Database not configured - using placeholder data"
      })
    }

    const db = getDb()
    const activeCharlenges = await db.select().from(challenges).orderBy(desc(challenges.createdAt))

    return NextResponse.json(activeCharlenges)
  } catch (error) {
    console.error("Error fetching challenges:", error)
    return NextResponse.json({ 
      success: true,
      challenges: [],
      error: "Database connection failed - using placeholder data" 
    }, { status: 200 })
  }
}
