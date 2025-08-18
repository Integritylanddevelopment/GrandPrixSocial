import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { f1ProcessedContent } from "@/lib/schema"
import { desc, eq, and, sql } from "drizzle-orm"

export async function GET() {
  try {
    // Get categorized news with AI processing stats
    const categorizedNews = await db
      .select({
        category: f1ProcessedContent.category,
        priority: f1ProcessedContent.priority,
        count: sql<number>`count(*)`,
        latestUpdate: sql<string>`max(${f1ProcessedContent.publishedAt})`,
        totalViews: sql<number>`sum(${f1ProcessedContent.engagement}->>'views')::int`,
        totalEngagement: sql<number>`sum((${f1ProcessedContent.engagement}->>'likes')::int + (${f1ProcessedContent.engagement}->>'shares')::int + (${f1ProcessedContent.engagement}->>'comments')::int)`,
      })
      .from(f1ProcessedContent)
      .where(eq(f1ProcessedContent.isActive, true))
      .groupBy(f1ProcessedContent.category, f1ProcessedContent.priority)
      .orderBy(desc(sql`count(*)`))

    // Get recent breaking news
    const breakingNews = await db
      .select()
      .from(f1ProcessedContent)
      .where(and(eq(f1ProcessedContent.isActive, true), eq(f1ProcessedContent.priority, "breaking")))
      .orderBy(desc(f1ProcessedContent.publishedAt))
      .limit(5)

    // Get trending stories
    const trendingNews = await db
      .select()
      .from(f1ProcessedContent)
      .where(and(eq(f1ProcessedContent.isActive, true), eq(f1ProcessedContent.category, "trending")))
      .orderBy(desc(sql`${f1ProcessedContent.engagement}->>'views'`))
      .limit(8)

    return NextResponse.json({
      success: true,
      categories: categorizedNews,
      breaking: breakingNews,
      trending: trendingNews,
      aiProcessingStats: {
        totalArticles: categorizedNews.reduce((sum, cat) => sum + cat.count, 0),
        lastProcessed: new Date().toISOString(),
        processingEngine: "OpenAI GPT-4",
        contentMix: "70% News, 30% Gossip",
      },
    })
  } catch (error) {
    console.error("Error fetching news categories:", error)
    return NextResponse.json({ error: "Failed to fetch news categories" }, { status: 500 })
  }
}
