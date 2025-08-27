/**
 * F1 Article Generator
 * Orchestrates the pipeline from raw F1 data → semantic analysis → LLM → published articles
 */

import { SemanticAgentOrchestrator } from '../semantic-tagging/semantic-agent-orchestrator'
import QwenConnector, { SemanticAnalysisOutput, GeneratedArticle } from '../llm/qwen-connector'

export interface RawF1NewsItem {
  id: string
  title: string
  content: string
  source: string
  url?: string
  publishedAt: string
  category?: string
  priority?: 'urgent' | 'high' | 'medium' | 'low'
}

export interface ProcessedF1Article extends GeneratedArticle {
  sourceId: string
  semanticAnalysis: SemanticAnalysisOutput
  processingTimestamp: string
  qualityScore: number
  publishStatus: 'draft' | 'ready' | 'published'
}

export class F1ArticleGenerator {
  private semanticOrchestrator: SemanticAgentOrchestrator
  private llmConnector: QwenConnector
  private processingQueue: RawF1NewsItem[] = []
  private isProcessing = false

  constructor() {
    this.semanticOrchestrator = new SemanticAgentOrchestrator()
    this.llmConnector = new QwenConnector()
    console.log('🏁 F1 Article Generator initialized')
  }

  /**
   * Main pipeline: Process raw F1 news into generated articles
   */
  async processF1NewsItem(rawNews: RawF1NewsItem): Promise<ProcessedF1Article> {
    console.log(`🔄 Processing F1 news: ${rawNews.title}`)
    
    try {
      // Step 1: Semantic Analysis using existing orchestrator
      const semanticData = await this.performSemanticAnalysis(rawNews)
      
      // Step 2: Quality check - only process high-confidence content
      if (semanticData.confidence < 0.7) {
        throw new Error(`Low confidence semantic analysis: ${semanticData.confidence}`)
      }

      // Step 3: Generate article using Qwen3 LLM
      const generatedArticle = await this.llmConnector.generateF1Article(semanticData)
      
      // Step 4: Quality assessment
      const qualityScore = this.assessArticleQuality(generatedArticle, semanticData)
      
      // Step 5: Create processed article
      const processedArticle: ProcessedF1Article = {
        ...generatedArticle,
        sourceId: rawNews.id,
        semanticAnalysis: semanticData,
        processingTimestamp: new Date().toISOString(),
        qualityScore,
        publishStatus: qualityScore > 0.8 ? 'ready' : 'draft'
      }

      console.log(`✅ Generated F1 article: ${processedArticle.title} (Quality: ${qualityScore.toFixed(2)})`)
      return processedArticle

    } catch (error) {
      console.error(`❌ F1 article generation failed for ${rawNews.id}:`, error)
      throw error
    }
  }

  /**
   * Convert raw news to semantic analysis format and process
   */
  private async performSemanticAnalysis(rawNews: RawF1NewsItem): Promise<SemanticAnalysisOutput> {
    // Queue the content for semantic processing
    const contentItem = {
      id: rawNews.id,
      type: 'article' as const,
      domain: 'f1-news',
      priority: rawNews.priority || 'medium' as const,
      data: {
        title: rawNews.title,
        content: rawNews.content,
        source: rawNews.source,
        publishedAt: rawNews.publishedAt,
        metadata: {
          url: rawNews.url
        }
      }
    }

    // Use the existing semantic orchestrator
    await this.semanticOrchestrator.queueContent(contentItem)
    
    // Wait for processing (in real implementation, this would be event-driven)
    await this.waitForSemanticProcessing(rawNews.id)
    
    // Get the semantic analysis results
    const semanticResult = await this.getSemanticResults(rawNews.id)
    
    // Convert to our expected format
    return this.convertSemanticResults(semanticResult, rawNews)
  }

  /**
   * Wait for semantic processing to complete
   * In production, this would use event-driven architecture
   */
  private async waitForSemanticProcessing(contentId: string, maxWaitMs = 30000): Promise<void> {
    const startTime = Date.now()
    
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(async () => {
        try {
          const stats = this.semanticOrchestrator.getProcessingStats()
          
          // Check if processing is complete
          if (!stats.isProcessing && stats.queueLength === 0) {
            clearInterval(checkInterval)
            resolve()
            return
          }
          
          // Check timeout
          if (Date.now() - startTime > maxWaitMs) {
            clearInterval(checkInterval)
            reject(new Error(`Semantic processing timeout for ${contentId}`))
            return
          }
          
        } catch (error) {
          clearInterval(checkInterval)
          reject(error)
        }
      }, 1000) // Check every second
    })
  }

  /**
   * Get semantic analysis results
   * This would interface with the actual semantic system storage
   */
  private async getSemanticResults(contentId: string): Promise<any> {
    // In production, this would query the semantic results from storage
    // For now, return a mock structure that matches what we expect
    return {
      contentId,
      entities: [
        { text: 'verstappen', category: 'drivers', confidence: 0.9 },
        { text: 'red-bull', category: 'teams', confidence: 0.85 }
      ],
      topics: [
        { topic: 'race-performance', score: 0.8, keywords: ['race', 'performance'], confidence: 0.85 }
      ],
      sentiment: {
        overall: 'positive',
        confidence: 0.7,
        scores: { positive: 0.6, negative: 0.2, neutral: 0.2 }
      },
      relationships: [],
      confidence: 0.82
    }
  }

  /**
   * Convert semantic results to our expected format
   */
  private convertSemanticResults(semanticResult: any, rawNews: RawF1NewsItem): SemanticAnalysisOutput {
    // Determine category based on semantic analysis
    const category = this.determineArticleCategory(semanticResult, rawNews)
    
    // Determine target length based on category and priority
    const suggestedLength = this.calculateSuggestedLength(category, rawNews.priority || 'medium')
    
    return {
      contentId: rawNews.id,
      category,
      confidence: semanticResult.confidence,
      entities: semanticResult.entities,
      topics: semanticResult.topics,
      sentiment: semanticResult.sentiment,
      priority: rawNews.priority || 'medium',
      sourceData: {
        title: rawNews.title,
        content: rawNews.content,
        source: rawNews.source,
        publishedAt: rawNews.publishedAt
      },
      suggestedLength,
      targetAudience: this.determineTargetAudience(semanticResult)
    }
  }

  /**
   * Determine article category from semantic analysis
   */
  private determineArticleCategory(semanticResult: any, rawNews: RawF1NewsItem): SemanticAnalysisOutput['category'] {
    // Check for breaking news indicators
    if (rawNews.priority === 'urgent' || rawNews.title.toLowerCase().includes('breaking')) {
      return 'breaking-news'
    }
    
    // Check for technical topics
    const technicalTopics = ['technical-development', 'aerodynamics', 'engine']
    if (semanticResult.topics.some((t: any) => technicalTopics.includes(t.topic))) {
      return 'tech'
    }
    
    // Check for transfer/contract topics
    const transferKeywords = ['sign', 'join', 'contract', 'move', 'transfer']
    if (transferKeywords.some(keyword => 
      rawNews.title.toLowerCase().includes(keyword) || 
      rawNews.content.toLowerCase().includes(keyword)
    )) {
      return 'transfers'
    }
    
    // Check for gossip indicators
    const gossipKeywords = ['rumor', 'behind the scenes', 'paddock', 'sources say']
    if (gossipKeywords.some(keyword => 
      rawNews.content.toLowerCase().includes(keyword)
    )) {
      return 'gossip'
    }
    
    // Default to trending
    return 'trending'
  }

  /**
   * Calculate suggested article length
   */
  private calculateSuggestedLength(category: string, priority: string): number {
    const baseLengths = {
      'breaking-news': 300,
      'trending': 500,
      'tech': 700,
      'gossip': 400,
      'transfers': 600
    }
    
    const priorityMultipliers = {
      'urgent': 0.8,
      'high': 1.0,
      'medium': 1.2,
      'low': 1.0
    }
    
    const baseLength = baseLengths[category] || 500
    const multiplier = priorityMultipliers[priority] || 1.0
    
    return Math.round(baseLength * multiplier)
  }

  /**
   * Determine target audience from semantic analysis
   */
  private determineTargetAudience(semanticResult: any): 'general' | 'technical' | 'casual' {
    // Check for technical content
    const technicalTopics = semanticResult.topics.filter((t: any) => 
      t.topic.includes('technical') || t.topic.includes('aerodynamics')
    )
    
    if (technicalTopics.length > 0 && technicalTopics[0].confidence > 0.7) {
      return 'technical'
    }
    
    // Check for casual/entertainment content
    const casualTopics = semanticResult.topics.filter((t: any) => 
      t.topic.includes('gossip') || t.topic.includes('entertainment')
    )
    
    if (casualTopics.length > 0) {
      return 'casual'
    }
    
    return 'general'
  }

  /**
   * Assess generated article quality
   */
  private assessArticleQuality(article: GeneratedArticle, semanticData: SemanticAnalysisOutput): number {
    let score = 0.5 // Base score
    
    // Length appropriateness (±20% of target)
    const wordCount = article.content.split(/\s+/).length
    const targetLength = semanticData.suggestedLength
    const lengthDiff = Math.abs(wordCount - targetLength) / targetLength
    
    if (lengthDiff < 0.2) score += 0.2
    else if (lengthDiff < 0.4) score += 0.1
    
    // Title quality
    if (article.title.length > 10 && article.title.length < 100) score += 0.1
    
    // Content structure (paragraphs, sentences)
    const paragraphs = article.content.split('\n\n').filter(p => p.trim().length > 0)
    if (paragraphs.length >= 3) score += 0.1
    
    // F1 entity coverage
    const entityMentions = semanticData.entities.filter(entity =>
      article.content.toLowerCase().includes(entity.text.toLowerCase())
    )
    score += Math.min(0.1, entityMentions.length * 0.02)
    
    // Tag relevance
    if (article.tags.length >= 3) score += 0.05
    
    return Math.min(1.0, score)
  }

  /**
   * Process multiple F1 news items in batch
   */
  async processBatchF1News(rawNewsItems: RawF1NewsItem[]): Promise<ProcessedF1Article[]> {
    console.log(`📰 Processing batch of ${rawNewsItems.length} F1 news items`)
    
    const results: ProcessedF1Article[] = []
    const errors: string[] = []
    
    for (const newsItem of rawNewsItems) {
      try {
        const article = await this.processF1NewsItem(newsItem)
        results.push(article)
      } catch (error) {
        console.error(`Failed to process ${newsItem.id}:`, error)
        errors.push(`${newsItem.id}: ${error.message}`)
      }
    }
    
    console.log(`✅ Batch processing complete: ${results.length} success, ${errors.length} errors`)
    
    if (errors.length > 0) {
      console.warn('Batch processing errors:', errors)
    }
    
    return results
  }

  /**
   * Test the entire pipeline with sample F1 data
   */
  async testPipeline(): Promise<void> {
    console.log('🧪 Testing F1 Article Generation Pipeline')
    
    const sampleF1News: RawF1NewsItem = {
      id: 'test-001',
      title: 'Verstappen Dominates Brazil GP Practice Sessions',
      content: `Max Verstappen showed impressive pace during both practice sessions at Interlagos today. The Red Bull driver consistently topped the timing sheets, finishing 0.3 seconds ahead of Lewis Hamilton's Mercedes. The championship leader looks confident heading into qualifying tomorrow.`,
      source: 'F1 Official',
      publishedAt: new Date().toISOString(),
      priority: 'high'
    }
    
    try {
      // Test LLM connection first
      const isConnected = await this.llmConnector.testConnection()
      
      if (!isConnected) {
        console.warn('⚠️ Qwen3 LLM not available - pipeline test incomplete')
        return
      }
      
      const article = await this.processF1NewsItem(sampleF1News)
      
      console.log('🎉 Pipeline Test Results:')
      console.log(`Title: ${article.title}`)
      console.log(`Category: ${article.category}`)
      console.log(`Quality Score: ${article.qualityScore.toFixed(2)}`)
      console.log(`Read Time: ${article.estimatedReadTime} min`)
      console.log(`Status: ${article.publishStatus}`)
      
    } catch (error) {
      console.error('❌ Pipeline test failed:', error)
      throw error
    }
  }
}

export default F1ArticleGenerator