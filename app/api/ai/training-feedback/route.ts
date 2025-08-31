import { NextRequest, NextResponse } from 'next/server'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

interface TrainingData {
  timestamp: string
  sourceTitle: string
  sourceContent: string
  generatedContent: string
  category: string
  targetLength: string
  tone: string
  modelUsed: string
  version: string
  performanceMetrics?: {
    views?: number
    likes?: number
    comments?: number
    shares?: number
    timeOnPage?: number
    engagementScore?: number
  }
}

// In-memory storage for training data (in production, use database)
let trainingDataStore: TrainingData[] = []
let articlePerformance: Map<string, any> = new Map()

/**
 * Store training data and article performance feedback
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (data.type === 'generation') {
      // Store article generation data
      const trainingEntry: TrainingData = {
        timestamp: data.timestamp || new Date().toISOString(),
        sourceTitle: data.sourceTitle,
        sourceContent: data.sourceContent,
        generatedContent: data.generatedContent,
        category: data.category,
        targetLength: data.targetLength,
        tone: data.tone,
        modelUsed: data.modelUsed || 'qwen2.5-coder:latest',
        version: data.version || '1.0'
      }

      trainingDataStore.push(trainingEntry)
      console.log(`📊 Training data logged: ${trainingEntry.sourceTitle}`)

    } else if (data.type === 'performance') {
      // Store article performance metrics
      const articleId = data.articleId
      const metrics = data.metrics
      
      articlePerformance.set(articleId, {
        ...metrics,
        timestamp: new Date().toISOString()
      })
      
      console.log(`📈 Performance data logged for article: ${articleId}`)
      
      // Trigger training update if we have enough performance data
      await checkAndTriggerTraining(articleId)
    }

    return NextResponse.json({
      success: true,
      message: 'Training data stored successfully',
      totalEntries: trainingDataStore.length
    })

  } catch (error) {
    console.error('Training feedback storage failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Storage failed'
    }, { status: 500 })
  }
}

/**
 * Get training data and performance analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (action === 'export-training') {
      // Export training data for Qwen fine-tuning
      const trainingExamples = await generateTrainingExamples(limit)
      
      return NextResponse.json({
        success: true,
        trainingExamples,
        totalGenerated: trainingExamples.length,
        format: 'qwen-compatible'
      })

    } else if (action === 'performance-summary') {
      // Get performance analytics
      const summary = generatePerformanceSummary()
      
      return NextResponse.json({
        success: true,
        summary,
        articleCount: trainingDataStore.length,
        performanceEntries: articlePerformance.size
      })

    } else if (action === 'best-performing') {
      // Get best performing articles for training
      const bestArticles = getBestPerformingArticles(limit)
      
      return NextResponse.json({
        success: true,
        bestArticles,
        count: bestArticles.length
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Qwen Training Feedback System',
      stats: {
        totalTrainingEntries: trainingDataStore.length,
        performanceEntries: articlePerformance.size,
        lastEntry: trainingDataStore.length > 0 ? trainingDataStore[trainingDataStore.length - 1].timestamp : null
      },
      endpoints: {
        'POST /': 'Store training data or performance metrics',
        'GET /?action=export-training': 'Export Qwen training data',
        'GET /?action=performance-summary': 'Get performance analytics',
        'GET /?action=best-performing': 'Get best performing articles'
      }
    })

  } catch (error) {
    console.error('Training feedback retrieval failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Retrieval failed'
    }, { status: 500 })
  }
}

/**
 * Generate training examples for Qwen fine-tuning
 */
async function generateTrainingExamples(limit: number): Promise<any[]> {
  const recentData = trainingDataStore.slice(-limit)
  const examples = []

  for (const data of recentData) {
    // Get performance metrics if available
    const articleHash = generateArticleHash(data.sourceTitle)
    const performance = articlePerformance.get(articleHash)

    // Only include articles with good performance for training
    const engagementScore = performance?.engagementScore || 5
    if (engagementScore < 6) continue // Skip low-performing articles

    const trainingExample = {
      input: `Transform this F1 news into an engaging article:

TITLE: ${data.sourceTitle}
CATEGORY: ${data.category}
LENGTH: ${data.targetLength}
TONE: ${data.tone}

SOURCE: ${data.sourceContent}

Generate an exciting F1 article:`,
      
      output: data.generatedContent,
      
      metadata: {
        category: data.category,
        targetLength: data.targetLength,
        tone: data.tone,
        performanceScore: engagementScore,
        timestamp: data.timestamp,
        modelUsed: data.modelUsed
      }
    }

    examples.push(trainingExample)
  }

  console.log(`🎯 Generated ${examples.length} high-quality training examples`)
  return examples
}

/**
 * Generate performance summary for analytics
 */
function generatePerformanceSummary(): any {
  const categories = new Map<string, number>()
  const tones = new Map<string, number>()
  const lengths = new Map<string, number>()
  
  trainingDataStore.forEach(entry => {
    categories.set(entry.category, (categories.get(entry.category) || 0) + 1)
    tones.set(entry.tone, (tones.get(entry.tone) || 0) + 1)
    lengths.set(entry.targetLength, (lengths.get(entry.targetLength) || 0) + 1)
  })

  const avgPerformance = Array.from(articlePerformance.values())
    .reduce((sum, perf) => sum + (perf.engagementScore || 0), 0) / 
    Math.max(1, articlePerformance.size)

  return {
    totalArticles: trainingDataStore.length,
    categoriesDistribution: Object.fromEntries(categories),
    tonesDistribution: Object.fromEntries(tones),
    lengthsDistribution: Object.fromEntries(lengths),
    averageEngagementScore: avgPerformance.toFixed(1),
    performanceTrackedArticles: articlePerformance.size
  }
}

/**
 * Get best performing articles for training
 */
function getBestPerformingArticles(limit: number): any[] {
  const articlesWithPerf = trainingDataStore
    .map(article => {
      const hash = generateArticleHash(article.sourceTitle)
      const performance = articlePerformance.get(hash)
      return {
        ...article,
        performance: performance || { engagementScore: 0 }
      }
    })
    .filter(article => article.performance.engagementScore > 7)
    .sort((a, b) => b.performance.engagementScore - a.performance.engagementScore)
    .slice(0, limit)

  return articlesWithPerf
}

/**
 * Check if we should trigger training update
 */
async function checkAndTriggerTraining(articleId: string): Promise<void> {
  // Trigger training update when we have enough high-quality examples
  const highQualityCount = Array.from(articlePerformance.values())
    .filter(perf => perf.engagementScore >= 8).length

  if (highQualityCount >= 10 && highQualityCount % 10 === 0) {
    console.log(`🎓 Triggering Qwen training update with ${highQualityCount} high-quality examples`)
    
    // In a real implementation, this would:
    // 1. Export training data in Qwen format
    // 2. Create fine-tuning job
    // 3. Update the model with new examples
    
    // For now, just log the event
    try {
      await fetch('/api/ai/qwen-training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-model',
          exampleCount: highQualityCount,
          trigger: 'performance-threshold'
        })
      })
    } catch (error) {
      console.log('Training trigger failed:', error.message)
    }
  }
}

/**
 * Generate simple hash for article identification
 */
function generateArticleHash(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)
}