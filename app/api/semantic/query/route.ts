import { NextResponse } from "next/server"
import { SemanticTaggingSystem } from "@/lib/semantic-tagging/semantic-tagging-system"

const semanticSystem = new SemanticTaggingSystem()

export async function POST(request: Request) {
  try {
    const query = await request.json()
    
    const results = await semanticSystem.querySemanticProfiles(query)
    
    return NextResponse.json({
      success: true,
      results,
      total: results.length,
      query
    })
  } catch (error) {
    console.error("Error in semantic query:", error)
    
    return NextResponse.json({ 
      success: false,
      error: "Failed to execute semantic query"
    }, { status: 500 })
  }
}