import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { f1ProcessedContent } from "@/lib/schema"
import { desc, eq } from "drizzle-orm"

export async function GET(request: Request) {
  try {
    // Check if database is properly configured
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("placeholder")) {
      return NextResponse.json({
        success: true,
        content: [],
        total: 0,
        message: "Database not configured - using placeholder data"
      })
    }

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
    return NextResponse.json({ 
      success: true,
      content: [],
      total: 0,
      error: "Database connection failed - using placeholder data" 
    }, { status: 200 })
  }
}
