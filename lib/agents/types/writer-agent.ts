/**
 * Writer Agent
 * Specialized agent for transforming scraped content into engaging F1 articles using Qwen
 */

import { BaseAgent, AgentConfig, AgentTask, AgentResult, AgentMessage } from '../base-agent'
import { F1ArticleGenerator, ArticleGenerationRequest, GeneratedArticle } from '../../ai/article-generator'

interface WriterConfig {
  qwenUrl: string
  defaultLength: 'short' | 'medium' | 'long'
  defaultTone: 'neutral' | 'exciting' | 'analytical'
  qualityThreshold: number
  maxWordsPerArticle: number
  enableTrainingFeedback: boolean
}

interface WritingTask {
  title: string
  content: string
  source: string
  sourceUrl: string
  category: string
  publishedAt: string
  author?: string
  imageUrl?: string
  customLength?: 'short' | 'medium' | 'long'
  customTone?: 'neutral' | 'exciting' | 'analytical'
}

export class WriterAgent extends BaseAgent {
  private writerConfig: WriterConfig
  private articleGenerator: F1ArticleGenerator

  constructor(config: AgentConfig) {
    super(config)
    this.writerConfig = {
      qwenUrl: config.parameters.qwenUrl || 'http://localhost:11434',
      defaultLength: config.parameters.defaultLength || 'medium',
      defaultTone: config.parameters.defaultTone || 'exciting',
      qualityThreshold: config.parameters.qualityThreshold || 7.0,
      maxWordsPerArticle: config.parameters.maxWordsPerArticle || 2000,
      enableTrainingFeedback: config.parameters.enableTrainingFeedback ?? true
    }

    this.articleGenerator = new F1ArticleGenerator({
      useLocal: true,
      qwenUrl: this.writerConfig.qwenUrl
    })
  }

  protected async onStart(): Promise<void> {
    this.log('info', `Writer agent initialized with Qwen at ${this.writerConfig.qwenUrl}`)
    
    // Test Qwen connection
    try {
      const response = await fetch(`${this.writerConfig.qwenUrl}/api/tags`)
      if (response.ok) {
        this.log('success', 'Qwen connection established')
      } else {
        this.log('warning', 'Qwen connection test failed, will use fallback generation')
      }
    } catch (error) {
      this.log('warning', `Qwen not accessible: ${error}. Using fallback generation.`)
    }
  }

  protected async onStop(): Promise<void> {
    this.log('info', 'Writer agent stopped')
  }

  protected async executeTask(task: AgentTask): Promise<AgentResult> {
    switch (task.type) {
      case 'generate-article':
        return await this.generateArticle(task.data)
      
      case 'rewrite-article':
        return await this.rewriteArticle(task.data)
      
      case 'batch-generate':
        return await this.batchGenerate(task.data.articles)
      
      default:
        throw new Error(`Unknown task type: ${task.type}`)
    }
  }

  protected onMessage(message: AgentMessage): void {
    switch (message.type) {
      case 'task':
        if (message.payload.taskType === 'write') {
          this.addTask({
            id: `write_${Date.now()}`,
            type: 'generate-article',
            priority: message.payload.priority || 'normal',
            data: message.payload.data,
            createdAt: new Date().toISOString(),
            maxRetries: 2,
            currentRetries: 0
          })
        }
        break
      
      case 'command':
        if (message.payload.command === 'update-config') {
          this.updateConfig(message.payload.config)
        }
        break
    }
  }

  /**
   * Generate article from scraped content
   */
  private async generateArticle(writingTask: WritingTask): Promise<AgentResult> {
    try {
      this.log('info', `Generating article: ${writingTask.title.substring(0, 50)}...`)

      const generationRequest: ArticleGenerationRequest = {
        title: writingTask.title,
        sourceContent: writingTask.content,
        source: writingTask.source,
        sourceUrl: writingTask.sourceUrl,
        category: this.categorizeContent(writingTask.category),
        targetLength: writingTask.customLength || this.writerConfig.defaultLength,
        tone: writingTask.customTone || this.writerConfig.defaultTone
      }

      const generatedArticle = await this.articleGenerator.generateArticle(generationRequest)

      // Quality check
      const qualityScore = await this.assessArticleQuality(generatedArticle)
      
      if (qualityScore < this.writerConfig.qualityThreshold) {
        this.log('warning', `Article quality below threshold (${qualityScore}), regenerating...`)
        // Try again with different parameters
        generationRequest.tone = 'analytical'
        const retryArticle = await this.articleGenerator.generateArticle(generationRequest)
        const retryScore = await this.assessArticleQuality(retryArticle)
        
        if (retryScore > qualityScore) {
          return this.formatArticleResult(retryArticle, writingTask, retryScore)
        }
      }

      return this.formatArticleResult(generatedArticle, writingTask, qualityScore)

    } catch (error) {
      this.log('error', `Article generation failed: ${error}`)
      throw error
    }
  }

  /**
   * Rewrite existing article with different parameters
   */
  private async rewriteArticle(data: WritingTask & { currentArticle: GeneratedArticle }): Promise<AgentResult> {
    const { currentArticle, ...writingTask } = data
    
    this.log('info', `Rewriting article: ${currentArticle.title}`)
    
    // Use current article as source content for rewriting
    const rewriteRequest: ArticleGenerationRequest = {
      title: writingTask.title,
      sourceContent: currentArticle.content,
      source: writingTask.source,
      sourceUrl: writingTask.sourceUrl,
      category: this.categorizeContent(writingTask.category),
      targetLength: writingTask.customLength || this.writerConfig.defaultLength,
      tone: writingTask.customTone || this.writerConfig.defaultTone
    }

    const rewrittenArticle = await this.articleGenerator.generateArticle(rewriteRequest)
    const qualityScore = await this.assessArticleQuality(rewrittenArticle)

    return this.formatArticleResult(rewrittenArticle, writingTask, qualityScore)
  }

  /**
   * Batch generate multiple articles
   */
  private async batchGenerate(articles: WritingTask[]): Promise<AgentResult> {
    const results: any[] = []
    const errors: string[] = []

    for (const article of articles) {
      try {
        const result = await this.generateArticle(article)
        if (result.success) {
          results.push(result.data)
        } else {
          errors.push(`Failed to generate: ${article.title}`)
        }
        
        // Small delay between generations
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        errors.push(`Error generating ${article.title}: ${error}`)
      }
    }

    return {
      success: errors.length < articles.length,
      data: results,
      error: errors.length > 0 ? errors.join('; ') : undefined
    }
  }

  /**
   * Assess article quality
   */
  private async assessArticleQuality(article: GeneratedArticle): Promise<number> {
    let score = 5.0 // Base score

    // Word count check
    const wordCount = article.content.split(' ').length
    if (wordCount >= 300 && wordCount <= this.writerConfig.maxWordsPerArticle) {
      score += 1.0
    }

    // Content structure check
    if (article.content.includes('##') || article.content.includes('###')) {
      score += 0.5 // Has headings
    }

    if (article.content.includes('*') || article.content.includes('**')) {
      score += 0.5 // Has formatting
    }

    // SEO elements
    if (article.seoTitle && article.seoTitle.length <= 60) {
      score += 0.5
    }

    if (article.metaDescription && article.metaDescription.length <= 160) {
      score += 0.5
    }

    // Tags quality
    if (article.tags && article.tags.length >= 3) {
      score += 0.5
    }

    // F1-specific content check
    const f1Keywords = ['formula', 'f1', 'grand prix', 'driver', 'team', 'circuit', 'race']
    const hasF1Content = f1Keywords.some(keyword => 
      article.content.toLowerCase().includes(keyword)
    )
    if (hasF1Content) {
      score += 1.0
    }

    // Engagement potential
    if (article.title.length >= 40 && article.title.length <= 70) {
      score += 0.5 // Good title length
    }

    return Math.min(10.0, Math.max(0.0, score))
  }

  /**
   * Categorize content for generation
   */
  private categorizeContent(category: string): 'breaking-news' | 'race-analysis' | 'driver-news' | 'tech' | 'rumors' {
    const categoryMap: Record<string, 'breaking-news' | 'race-analysis' | 'driver-news' | 'tech' | 'rumors'> = {
      'breaking-news': 'breaking-news',
      'race-analysis': 'race-analysis',
      'driver-news': 'driver-news',
      'tech': 'tech',
      'rumors': 'rumors',
      'technical': 'tech',
      'analysis': 'race-analysis',
      'news': 'breaking-news',
      'driver': 'driver-news'
    }

    return categoryMap[category.toLowerCase()] || 'breaking-news'
  }

  /**
   * Format article result for next agents
   */
  private formatArticleResult(
    article: GeneratedArticle, 
    originalTask: WritingTask, 
    qualityScore: number
  ): AgentResult {
    const enrichedArticle = {
      ...article,
      originalSource: originalTask.source,
      originalUrl: originalTask.sourceUrl,
      originalPublishedAt: originalTask.publishedAt,
      originalAuthor: originalTask.author,
      imageUrl: originalTask.imageUrl,
      qualityScore,
      generatedAt: new Date().toISOString(),
      generatedBy: this.config.id
    }

    // Create task for moderator agent
    const nextTasks: AgentTask[] = [{
      id: `moderate_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: 'moderate-article',
      priority: qualityScore >= 8 ? 'high' : 'normal',
      data: enrichedArticle,
      createdAt: new Date().toISOString(),
      maxRetries: 1,
      currentRetries: 0
    }]

    this.log('success', `Generated article: ${article.title} (Quality: ${qualityScore.toFixed(1)}/10)`)

    return {
      success: true,
      data: enrichedArticle,
      nextTasks,
      metrics: {
        qualityScore,
        wordCount: article.content.split(' ').length
      }
    }
  }

  /**
   * Update configuration
   */
  private updateConfig(newConfig: Partial<WriterConfig>): void {
    this.writerConfig = { ...this.writerConfig, ...newConfig }
    
    if (newConfig.qwenUrl) {
      this.articleGenerator = new F1ArticleGenerator({
        useLocal: true,
        qwenUrl: newConfig.qwenUrl
      })
    }
    
    this.log('info', 'Writer configuration updated')
  }
}

export default WriterAgent