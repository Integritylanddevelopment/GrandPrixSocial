import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { challenges } from "@/lib/schema"
import { desc } from "drizzle-orm"

export async function GET() {
  try {
    const activeCharlenges = await db.select().from(challenges).orderBy(desc(challenges.createdAt))

    return NextResponse.json(activeCharlenges)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 })
  }
}
