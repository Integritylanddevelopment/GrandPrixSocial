import { NextResponse } from "next/server"
import { CompleteF1NewsSystem } from "@/lib/news-pipeline/complete-news-system"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const priority = searchParams.get("priority")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const refresh = searchParams.get("refresh") === "true"

    const newsSystem = new CompleteF1NewsSystem()

    // Get articles - don't refresh unless explicitly requested
    const results = await newsSystem.getArticles({
      category: category || undefined,
      priority: priority || undefined,
      limit
    })

    // Only run pipeline if no articles exist at all (first time)
    if (results.length === 0) {
      console.log("📰 No articles found - running initial pipeline once...")
      await newsSystem.runCompleteNewsPipeline()
      const newResults = await newsSystem.getArticles({
        category: category || undefined,
        priority: priority || undefined,
        limit
      })
      
      return NextResponse.json({
        success: true,
        results: newResults,
        query: searchParams.get("q"),
        filters: { category, priority },
        total: newResults.length,
        pipeline: {
          status: "initialized",
          totalArticles: newResults.length,
          lastProcessed: new Date().toISOString(),
          message: "Initial content generated from live F1 sources"
        }
      })
    }

    // Calculate engagement statistics
    const totalViews = results.reduce((sum, article) => sum + (article.engagement?.views || 0), 0)
    const totalEngagement = results.reduce((sum, article) => 
      sum + (article.engagement?.likes || 0) + (article.engagement?.shares || 0) + (article.engagement?.comments || 0), 0
    )

    return NextResponse.json({
      success: true,
      results,
      query: searchParams.get("q"),
      filters: { category, priority },
      total: results.length,
      statistics: {
        totalViews,
        totalEngagement,
        averageViews: Math.round(totalViews / Math.max(1, results.length)),
        topCategories: [...new Set(results.map(r => r.category))].slice(0, 5)
      },
      pipeline: {
        status: "active",
        totalArticles: results.length,
        lastProcessed: new Date().toISOString(),
        sources: ["Formula 1 Official", "Autosport", "Motorsport.com", "Planet F1", "GPFans", "The Race"],
        processing: "Real RSS + AI Content Generation"
      }
    })
  } catch (error) {
    console.error("Error in complete news system:", error)
    
    return NextResponse.json({ 
      success: false,
      results: [],
      total: 0,
      error: "F1 news system error: " + (error instanceof Error ? error.message : "Unknown error"),
      pipeline: {
        status: "error",
        lastProcessed: new Date().toISOString(),
        message: "Complete F1 news pipeline encountered an error"
      }
    }, { status: 500 })
  }
}