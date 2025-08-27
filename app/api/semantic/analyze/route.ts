import { NextResponse } from "next/server"
import { SemanticAgentOrchestrator } from "@/lib/semantic-tagging/semantic-agent-orchestrator"

const orchestrator = new SemanticAgentOrchestrator()

export async function POST(request: Request) {
  try {
    const { content, priority = 'medium' } = await request.json()
    
    if (!content || !content.id || !content.type) {
      return NextResponse.json({
        success: false,
        error: 'Content must have id and type'
      }, { status: 400 })
    }

    // Queue content for semantic analysis
    await orchestrator.queueContent({
      ...content,
      priority,
      domain: content.domain || 'general'
    })

    return NextResponse.json({
      success: true,
      message: `Content queued for semantic analysis`,
      contentId: content.id,
      priority
    })
  } catch (error) {
    console.error("Error in semantic analysis:", error)
    
    return NextResponse.json({ 
      success: false,
      error: "Failed to queue semantic analysis"
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const stats = orchestrator.getProcessingStats()
    
    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error("Error getting semantic stats:", error)
    
    return NextResponse.json({ 
      success: false,
      error: "Failed to get processing stats"
    }, { status: 500 })
  }
}