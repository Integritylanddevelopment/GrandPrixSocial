import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { f1ProcessedContent } from "@/lib/schema"
import { desc, eq, and, or, ilike, sql } from "drizzle-orm"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const category = searchParams.get("category")
    const priority = searchParams.get("priority")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const whereConditions = [eq(f1ProcessedContent.isActive, true)]

    // Add search query
    if (query) {
      whereConditions.push(
        or(
          ilike(f1ProcessedContent.title, `%${query}%`),
          ilike(f1ProcessedContent.content, `%${query}%`),
          sql`${f1ProcessedContent.tags} && ARRAY[${query}]`,
        ),
      )
    }

    // Add category filter
    if (category) {
      whereConditions.push(eq(f1ProcessedContent.category, category))
    }

    // Add priority filter
    if (priority) {
      whereConditions.push(eq(f1ProcessedContent.priority, priority))
    }

    const results = await db
      .select()
      .from(f1ProcessedContent)
      .where(and(...whereConditions))
      .orderBy(desc(f1ProcessedContent.publishedAt))
      .limit(limit)

    return NextResponse.json({
      success: true,
      results,
      query,
      filters: { category, priority },
      total: results.length,
    })
  } catch (error) {
    console.error("Error searching news:", error)
    return NextResponse.json({ error: "Failed to search news" }, { status: 500 })
  }
}
