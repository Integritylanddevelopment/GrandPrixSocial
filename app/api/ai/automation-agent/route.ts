import { NextRequest, NextResponse } from 'next/server'
import ArticleAutomationAgent from '@/lib/agents/article-automation-agent'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

// Global agent instance (in production, this would be managed differently)
let globalAgent: ArticleAutomationAgent | null = null

/**
 * Control the Article Automation Agent
 */
export async function POST(request: NextRequest) {
  try {
    const { action, config } = await request.json()

    switch (action) {
      case 'start':
        if (globalAgent?.getStatus().isRunning) {
          return NextResponse.json({
            success: false,
            message: 'Agent is already running'
          })
        }

        globalAgent = new ArticleAutomationAgent(config)
        await globalAgent.start()

        return NextResponse.json({
          success: true,
          message: 'Article automation agent started',
          status: globalAgent.getStatus()
        })

      case 'stop':
        if (!globalAgent) {
          return NextResponse.json({
            success: false,
            message: 'No agent instance found'
          })
        }

        globalAgent.stop()
        globalAgent = null

        return NextResponse.json({
          success: true,
          message: 'Article automation agent stopped'
        })

      case 'run-cycle':
        if (!globalAgent) {
          // Create temporary agent for one-time run
          globalAgent = new ArticleAutomationAgent(config)
        }

        console.log('🔄 Manual automation cycle triggered')
        await globalAgent.runAutomationCycle()

        return NextResponse.json({
          success: true,
          message: 'Automation cycle completed',
          status: globalAgent.getStatus()
        })

      case 'update-config':
        if (!globalAgent) {
          return NextResponse.json({
            success: false,
            message: 'No agent running to update'
          })
        }

        globalAgent.updateConfig(config)

        return NextResponse.json({
          success: true,
          message: 'Agent configuration updated',
          status: globalAgent.getStatus()
        })

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action. Use: start, stop, run-cycle, update-config'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Agent control error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Agent control failed'
    }, { status: 500 })
  }
}

/**
 * Get agent status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const demo = searchParams.get('demo')

    if (demo === 'true') {
      // Demo mode - show what the agent would do
      return NextResponse.json({
        success: true,
        message: 'Article Automation Agent Demo',
        demoFlow: {
          step1: 'Scrape latest F1 news from RSS feeds',
          step2: 'Generate enhanced articles using AI',
          step3: 'Apply quality checks and filtering',
          step4: 'Publish approved articles to database',
          step5: 'Schedule next automation cycle'
        },
        features: [
          'Automated F1 news scraping',
          'AI-powered article enhancement',
          'Quality control and filtering',
          'Automated publishing pipeline',
          'Configurable intervals and limits',
          'Manual trigger capability'
        ],
        defaultConfig: {
          enabled: true,
          scrapeInterval: 60, // minutes
          maxArticlesPerRun: 10,
          categories: ['breaking-news', 'race-analysis', 'driver-news', 'tech'],
          autoPublish: true,
          qualityThreshold: 7
        }
      })
    }

    const status = globalAgent ? globalAgent.getStatus() : {
      isRunning: false,
      config: null,
      lastRunTime: null,
      uptime: 0
    }

    return NextResponse.json({
      success: true,
      agent: {
        status,
        instanceExists: !!globalAgent
      },
      endpoints: {
        'POST /': 'Control agent (start, stop, run-cycle, update-config)',
        'GET /': 'Get agent status',
        'GET /?demo=true': 'View agent demo and features'
      }
    })

  } catch (error) {
    console.error('Agent status error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Status check failed'
    }, { status: 500 })
  }
}

/**
 * Agent configuration and management
 */
export async function PUT(request: NextRequest) {
  try {
    const config = await request.json()

    if (!globalAgent) {
      return NextResponse.json({
        success: false,
        message: 'No agent running to configure'
      }, { status: 400 })
    }

    globalAgent.updateConfig(config)

    return NextResponse.json({
      success: true,
      message: 'Agent configuration updated successfully',
      status: globalAgent.getStatus()
    })

  } catch (error) {
    console.error('Agent configuration error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Configuration update failed'
    }, { status: 500 })
  }
}

/**
 * Delete/reset agent
 */
export async function DELETE() {
  try {
    if (globalAgent) {
      globalAgent.stop()
      globalAgent = null
    }

    return NextResponse.json({
      success: true,
      message: 'Agent stopped and instance cleared'
    })

  } catch (error) {
    console.error('Agent deletion error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Agent deletion failed'
    }, { status: 500 })
  }
}