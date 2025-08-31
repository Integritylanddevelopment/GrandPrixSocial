import { NextRequest, NextResponse } from 'next/server'
import F1ArticleGenerator from '@/lib/ai/article-generator'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

/**
 * AI Article Generation API
 * Processes scraped content and generates engaging F1 articles
 */
export async function POST(request: NextRequest) {
  try {
    const {
      title,
      sourceContent,
      source,
      sourceUrl,
      category = 'f1-news',
      targetLength = 'medium',
      tone = 'exciting'
    } = await request.json()

    if (!title || !sourceContent) {
      return NextResponse.json({
        success: false,
        error: 'Title and source content are required'
      }, { status: 400 })
    }

    console.log('🤖 Generating F1 article:', title)

    const generator = new F1ArticleGenerator()
    const article = await generator.generateArticle({
      title,
      sourceContent,
      source: source || 'F1 News',
      sourceUrl: sourceUrl || '#',
      category,
      targetLength,
      tone
    })

    console.log('✅ Article generated:', article.title)

    return NextResponse.json({
      success: true,
      article,
      stats: {
        originalLength: sourceContent.length,
        generatedLength: article.content.length,
        estimatedReadTime: article.estimatedReadTime,
        tags: article.tags.length
      }
    })

  } catch (error) {
    console.error('Article generation failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Article generation failed'
    }, { status: 500 })
  }
}

/**
 * Batch process multiple articles
 */
export async function PUT(request: NextRequest) {
  try {
    const { articles } = await request.json()

    if (!Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Articles array is required'
      }, { status: 400 })
    }

    console.log(`🤖 Processing ${articles.length} articles for generation...`)

    const generator = new F1ArticleGenerator()
    const results = []

    for (let i = 0; i < articles.length; i++) {
      const articleRequest = articles[i]
      
      try {
        console.log(`Processing article ${i + 1}/${articles.length}: ${articleRequest.title}`)
        
        const article = await generator.generateArticle(articleRequest)
        results.push({
          success: true,
          article,
          originalIndex: i
        })

        // Add small delay to avoid rate limits
        if (i < articles.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

      } catch (error) {
        console.error(`Failed to generate article ${i + 1}:`, error)
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Generation failed',
          originalIndex: i,
          originalTitle: articleRequest.title
        })
      }
    }

    const successful = results.filter(r => r.success).length
    console.log(`✅ Generated ${successful}/${articles.length} articles`)

    return NextResponse.json({
      success: true,
      results,
      stats: {
        total: articles.length,
        successful,
        failed: articles.length - successful
      }
    })

  } catch (error) {
    console.error('Batch article generation failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Batch generation failed'
    }, { status: 500 })
  }
}

/**
 * Get article generation status/stats
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const test = searchParams.get('test')

    if (test === 'true') {
      // Test the article generator
      const generator = new F1ArticleGenerator()
      const testArticle = await generator.generateArticle({
        title: 'Max Verstappen Wins Belgian Grand Prix',
        sourceContent: 'Max Verstappen secured victory at the Belgian Grand Prix after a dominant performance. The Red Bull driver led from start to finish, showing excellent pace throughout the race. This victory extends his championship lead.',
        source: 'Test Source',
        sourceUrl: '#',
        category: 'race-analysis',
        targetLength: 'short'
      })

      return NextResponse.json({
        success: true,
        message: 'Article generator test successful',
        testArticle: {
          title: testArticle.title,
          summary: testArticle.summary,
          tags: testArticle.tags,
          estimatedReadTime: testArticle.estimatedReadTime
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'F1 AI Article Generator API',
      endpoints: {
        'POST /': 'Generate single article',
        'PUT /': 'Batch process multiple articles',
        'GET /?test=true': 'Test article generation'
      },
      features: [
        'AI-powered article enhancement',
        'Fallback to enhanced source content',
        'F1-specific context and terminology',
        'SEO optimization',
        'Batch processing capability'
      ]
    })

  } catch (error) {
    console.error('Article generator status error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Status check failed'
    }, { status: 500 })
  }
}