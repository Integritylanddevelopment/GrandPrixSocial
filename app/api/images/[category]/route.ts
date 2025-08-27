import { NextResponse } from "next/server"
import { F1ImageScraper } from "@/lib/news-pipeline/f1-image-scraper"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params
    const { searchParams } = new URL(request.url)
    const minScore = Number.parseInt(searchParams.get("minScore") || "60")
    const random = searchParams.get("random") === "true"
    
    const imageScraper = new F1ImageScraper()
    
    if (random) {
      const imageUrl = await imageScraper.getRandomImageForCategory(category)
      return NextResponse.json({
        success: true,
        imageUrl
      })
    }
    
    const images = await imageScraper.getImagesByCategory(category, minScore)
    
    return NextResponse.json({
      success: true,
      category,
      minScore,
      images,
      total: images.length
    })
  } catch (error) {
    console.error("Error getting images:", error)
    
    return NextResponse.json({ 
      success: false,
      error: "Failed to get images"
    }, { status: 500 })
  }
}