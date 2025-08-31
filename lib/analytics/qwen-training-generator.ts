/**
 * Qwen3 Training Data Generator
 * Processes user feedback and content performance to create training data
 */

import { createClient } from '@supabase/supabase-js'

// Create Supabase client lazily to avoid build-time environment issues
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing - check environment variables')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

export interface TrainingExample {
  contentId: string
  originalContent: string
  userFeedbackSummary: {
    totalInteractions: number
    avgEngagementScore: number
    topInteractionTypes: string[]
    userSentiment: 'positive' | 'negative' | 'neutral'
    bestPerformingElements: string[]
  }
  performanceMetrics: {
    views: number
    avgTimeOnPage: number
    engagementRate: number
    shareRate: number
    performanceScore: number
  }
  trainingPrompt: string
  expectedOutput: string
  trainingScore: number
}

export class QwenTrainingGenerator {
  
  /**
   * Generate training data from high-performing content
   */
  async generateTrainingData(minPerformanceScore: number = 70): Promise<TrainingExample[]> {
    console.log('🧠 Generating Qwen3 training data from user feedback...')
    
    try {
      // Get high-performing content
      const supabase = getSupabaseClient()
      const { data: highPerformingContent } = await supabase
        .from('content_performance')
        .select(`
          content_id,
          performance_score,
          views,
          avg_time_on_page,
          likes,
          comments,
          shares,
          user_feedback
        `)
        .gte('performance_score', minPerformanceScore)
        .gte('views', 10) // Minimum view threshold
        .order('performance_score', { ascending: false })
        .limit(100)

      if (!highPerformingContent?.length) {
        console.log('⚠️ No high-performing content found for training')
        return []
      }

      const trainingExamples: TrainingExample[] = []

      for (const content of highPerformingContent) {
        try {
          // Get the actual content (article or post)
          const originalContent = await this.getOriginalContent(content.content_id)
          if (!originalContent) continue

          // Get user interactions for this content
          const userFeedback = await this.getUserFeedbackSummary(content.content_id)
          
          // Generate training example
          const trainingExample = await this.createTrainingExample(
            content,
            originalContent,
            userFeedback
          )

          if (trainingExample) {
            trainingExamples.push(trainingExample)
          }

        } catch (error) {
          console.error(`Error processing content ${content.content_id}:`, error)
        }
      }

      // Store training data
      await this.storeTrainingData(trainingExamples)

      console.log(`✅ Generated ${trainingExamples.length} training examples`)
      return trainingExamples

    } catch (error) {
      console.error('Error generating training data:', error)
      throw error
    }
  }

  /**
   * Get original content from articles or posts
   */
  private async getOriginalContent(contentId: string): Promise<string | null> {
    const supabase = getSupabaseClient()
    // Try news articles first
    const { data: article } = await supabase
      .from('news_articles')
      .select('title, content, category, tags')
      .eq('id', contentId)
      .single()

    if (article) {
      return `Title: ${article.title}\nCategory: ${article.category}\nTags: ${article.tags?.join(', ')}\nContent: ${article.content}`
    }

    // Try cafe posts
    const { data: post } = await supabase
      .from('cafe_posts')
      .select('content, tags')
      .eq('id', contentId)
      .single()

    if (post) {
      return `Post Content: ${post.content}\nTags: ${post.tags?.join(', ')}`
    }

    return null
  }

  /**
   * Analyze user interactions for feedback summary
   */
  private async getUserFeedbackSummary(contentId: string) {
    const supabase = getSupabaseClient()
    const { data: interactions } = await supabase
      .from('user_interactions')
      .select('interaction_type, engagement_score, metadata')
      .eq('content_id', contentId)

    if (!interactions?.length) {
      return {
        totalInteractions: 0,
        avgEngagementScore: 0,
        topInteractionTypes: [],
        userSentiment: 'neutral' as const,
        bestPerformingElements: []
      }
    }

    // Calculate metrics
    const totalInteractions = interactions.length
    const avgEngagementScore = interactions.reduce((sum, i) => sum + (i.engagement_score || 0), 0) / totalInteractions
    
    // Count interaction types
    const typeCounts = interactions.reduce((counts, i) => {
      counts[i.interaction_type] = (counts[i.interaction_type] || 0) + 1
      return counts
    }, {} as Record<string, number>)

    const topInteractionTypes = Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type)

    // Determine sentiment
    let userSentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
    if (avgEngagementScore > 6) userSentiment = 'positive'
    else if (avgEngagementScore < 3) userSentiment = 'negative'

    // Extract best performing elements from metadata
    const bestPerformingElements = interactions
      .filter(i => i.engagement_score > 7)
      .map(i => i.metadata?.element || i.interaction_type)
      .filter(Boolean)

    return {
      totalInteractions,
      avgEngagementScore,
      topInteractionTypes,
      userSentiment,
      bestPerformingElements
    }
  }

  /**
   * Create training example from content and feedback
   */
  private async createTrainingExample(
    performanceData: any,
    originalContent: string,
    userFeedback: any
  ): Promise<TrainingExample> {

    const performanceMetrics = {
      views: performanceData.views,
      avgTimeOnPage: performanceData.avg_time_on_page,
      engagementRate: ((performanceData.likes + performanceData.comments + performanceData.shares) / Math.max(1, performanceData.views)) * 100,
      shareRate: (performanceData.shares / Math.max(1, performanceData.views)) * 100,
      performanceScore: performanceData.performance_score
    }

    // Generate training prompt based on what made this content successful
    const trainingPrompt = this.generateTrainingPrompt(originalContent, userFeedback, performanceMetrics)
    
    // Use the original content as expected output (since it performed well)
    const expectedOutput = this.extractExpectedOutput(originalContent, userFeedback)
    
    // Calculate training score (how valuable this example is)
    const trainingScore = this.calculateTrainingScore(performanceMetrics, userFeedback)

    return {
      contentId: performanceData.content_id,
      originalContent,
      userFeedbackSummary: userFeedback,
      performanceMetrics,
      trainingPrompt,
      expectedOutput,
      trainingScore
    }
  }

  /**
   * Generate training prompt that captures what made content successful
   */
  private generateTrainingPrompt(content: string, feedback: any, metrics: any): string {
    const contentType = content.includes('Title:') ? 'article' : 'post'
    const engagementLevel = feedback.avgEngagementScore > 7 ? 'highly engaging' : feedback.avgEngagementScore > 4 ? 'moderately engaging' : 'basic'
    
    let prompt = `Write a ${engagementLevel} F1 ${contentType} that will achieve:\n`
    
    // Add performance targets
    if (metrics.engagementRate > 15) {
      prompt += `- High user engagement (${metrics.engagementRate.toFixed(1)}% engagement rate)\n`
    }
    
    if (metrics.avgTimeOnPage > 60000) {
      prompt += `- Long reading time (${(metrics.avgTimeOnPage/1000/60).toFixed(1)} minutes average)\n`
    }
    
    if (metrics.shareRate > 5) {
      prompt += `- High shareability (${metrics.shareRate.toFixed(1)}% share rate)\n`
    }

    // Add interaction patterns
    if (feedback.topInteractionTypes.includes('comment')) {
      prompt += `- Should encourage user comments and discussion\n`
    }
    
    if (feedback.topInteractionTypes.includes('like')) {
      prompt += `- Should be highly likeable content\n`
    }

    // Add sentiment guidance
    prompt += `- Overall tone should be ${feedback.userSentiment}\n`

    // Add successful elements
    if (feedback.bestPerformingElements.length > 0) {
      prompt += `- Include elements like: ${feedback.bestPerformingElements.join(', ')}\n`
    }

    prompt += `\nWrite F1 content that matches these performance characteristics:`

    return prompt
  }

  /**
   * Extract the key successful elements as expected output
   */
  private extractExpectedOutput(content: string, feedback: any): string {
    // For now, use the original content
    // In future, could extract just the most engaging parts
    return content
  }

  /**
   * Calculate how valuable this training example is
   */
  private calculateTrainingScore(metrics: any, feedback: any): number {
    let score = 0

    // Performance score contribution (0-40 points)
    score += (metrics.performanceScore / 100) * 40

    // Engagement rate contribution (0-30 points)
    score += Math.min(30, metrics.engagementRate * 2)

    // View count contribution (0-20 points)
    score += Math.min(20, metrics.views * 0.1)

    // User feedback quality (0-10 points)
    score += Math.min(10, feedback.avgEngagementScore)

    return Math.min(100, score)
  }

  /**
   * Store training data in database
   */
  private async storeTrainingData(examples: TrainingExample[]): Promise<void> {
    if (examples.length === 0) return

    const trainingRecords = examples.map(example => ({
      content_id: example.contentId,
      content_type: 'article', // Determine from content
      original_content: example.originalContent,
      user_feedback_summary: example.userFeedbackSummary,
      performance_metrics: example.performanceMetrics,
      training_prompt: example.trainingPrompt,
      expected_output: example.expectedOutput,
      training_score: example.trainingScore,
      content_category: this.extractCategory(example.originalContent),
      training_batch_id: `batch_${Date.now()}`
    }))

    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('qwen_training_data')
      .insert(trainingRecords)

    if (error) {
      console.error('Error storing training data:', error)
      throw error
    }

    console.log(`✅ Stored ${trainingRecords.length} training examples`)
  }

  private extractCategory(content: string): string {
    if (content.includes('breaking') || content.includes('BREAKING')) return 'breaking-news'
    if (content.includes('technical') || content.includes('aerodynamic')) return 'tech'
    if (content.includes('transfer') || content.includes('contract')) return 'transfers'
    if (content.includes('gossip') || content.includes('rumor')) return 'gossip'
    return 'general'
  }

  /**
   * Export training data for Qwen3 fine-tuning
   */
  async exportForFineTuning(batchId?: string): Promise<string> {
    const supabase = getSupabaseClient()
    const query = supabase
      .from('qwen_training_data')
      .select('*')
      .gte('training_score', 60) // Only high-quality examples
      .order('training_score', { ascending: false })

    if (batchId) {
      query.eq('training_batch_id', batchId)
    }

    const { data: trainingData } = await query

    if (!trainingData?.length) {
      throw new Error('No training data available for export')
    }

    // Format for fine-tuning (JSON Lines format)
    const jsonl = trainingData.map(record => JSON.stringify({
      messages: [
        {
          role: "system",
          content: "You are an expert F1 journalist writing engaging content that users love."
        },
        {
          role: "user",
          content: record.training_prompt
        },
        {
          role: "assistant", 
          content: record.expected_output
        }
      ]
    })).join('\n')

    console.log(`📤 Exported ${trainingData.length} training examples for fine-tuning`)
    return jsonl
  }
}

export default QwenTrainingGenerator