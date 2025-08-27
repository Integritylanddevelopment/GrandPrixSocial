import { NextResponse } from "next/server"
import { F1ImageScraper } from "@/lib/news-pipeline/f1-image-scraper"

export async function GET() {
  try {
    const imageScraper = new F1ImageScraper()
    const stats = await imageScraper.getImageStats()
    
    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error("Error getting image stats:", error)
    
    return NextResponse.json({ 
      success: false,
      error: "Failed to get image statistics"
    }, { status: 500 })
  }
}