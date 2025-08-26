import { NextResponse } from "next/server"
import { F1NewsScraper, initializeMonitoredAccounts } from "@/lib/news-pipeline/f1-scrapers"
import { F1ContentProcessor } from "@/lib/news-pipeline/ai-content-processor"

export async function POST() {
  try {
    console.log("Initializing F1 news pipeline...")
    
    // Step 1: Initialize monitored accounts in database
    await initializeMonitoredAccounts()
    
    // Step 2: Run initial scraping
    const scraper = new F1NewsScraper()
    const scrapedCount = await scraper.runFullScrape()
    console.log(`Initial scrape completed: ${scrapedCount} posts`)
    
    // Step 3: Process scraped content
    const processor = new F1ContentProcessor()
    const processedCount = await processor.processUnprocessedContent()
    console.log(`Initial processing completed: ${processedCount} articles`)
    
    // Step 4: Get sample of processed content
    const sampleContent = await processor.getProcessedContent({ limit: 5 })
    
    return NextResponse.json({
      success: true,
      message: "F1 news pipeline initialized successfully",
      results: {
        scrapedPosts: scrapedCount,
        processedArticles: processedCount,
        sampleContent: sampleContent.map(article => ({
          id: article.id,
          title: article.title,
          category: article.category,
          priority: article.priority,
          publishedAt: article.publishedAt
        }))
      },
      pipeline: {
        status: "initialized",
        totalArticles: sampleContent.length,
        lastProcessed: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("Pipeline initialization failed:", error)
    
    return NextResponse.json({
      success: false,
      error: "Pipeline initialization failed: " + (error instanceof Error ? error.message : "Unknown error"),
      pipeline: {
        status: "failed",
        lastProcessed: new Date().toISOString()
      }
    }, { status: 500 })
  }
}