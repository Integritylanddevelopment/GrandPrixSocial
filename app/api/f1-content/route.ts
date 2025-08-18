import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { f1ProcessedContent } from "@/lib/schema"
import { desc, eq } from "drizzle-orm"

export async function GET(request: Request) {
  try {
    const db = getDb()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    let query = db
      .select()
      .from(f1ProcessedContent)
      .where(eq(f1ProcessedContent.isActive, true))
      .orderBy(desc(f1ProcessedContent.publishedAt))
      .limit(limit)

    if (category) {
      query = query.where(eq(f1ProcessedContent.category, category))
    }

    const content = await query

    return NextResponse.json({
      success: true,
      content,
      total: content.length,
    })
  } catch (error) {
    console.error("Error fetching F1 content:", error)
    return NextResponse.json({ error: "Failed to fetch F1 content" }, { status: 500 })
  }
}
