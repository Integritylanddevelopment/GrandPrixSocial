/**
 * Article Automation Agent
 * Orchestrates the complete content pipeline: Scrape → Generate → Publish
 */

interface ProcessedContent {
  id: string
  title: string
  content: string
  source: string
  sourceUrl: string
  publishedAt: string
}

interface AutomationConfig {
  enabled: boolean
  scrapeInterval: number // minutes
  maxArticlesPerRun: number
  categories: string[]
  autoPublish: boolean
  qualityThreshold: number
}

export class ArticleAutomationAgent {
  private config: AutomationConfig
  private isRunning: boolean = false
  private lastRunTime: Date | null = null

  constructor(config?: Partial<AutomationConfig>) {
    this.config = {
      enabled: true,
      scrapeInterval: 60, // Every hour
      maxArticlesPerRun: 10,
      categories: ['breaking-news', 'race-analysis', 'driver-news', 'tech'],
      autoPublish: true,
      qualityThreshold: 7,
      ...config
    }
  }

  /**
   * Start the automation agent
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('🤖 Article automation agent is already running')
      return
    }

    this.isRunning = true
    console.log('🚀 Starting Article Automation Agent')
    console.log('📋 Configuration:', this.config)

    // Run immediately, then set interval
    await this.runAutomationCycle()
    
    if (this.config.enabled) {
      setInterval(() => {
        this.runAutomationCycle()
      }, this.config.scrapeInterval * 60 * 1000)
    }
  }

  /**
   * Stop the automation agent
   */
  stop(): void {
    this.isRunning = false
    console.log('⏹️ Article automation agent stopped')
  }

  /**
   * Run complete automation cycle
   */
  async runAutomationCycle(): Promise<void> {
    if (!this.config.enabled) {
      console.log('🔄 Automation disabled, skipping cycle')
      return
    }

    const startTime = Date.now()
    console.log(`\n🔄 Starting automation cycle at ${new Date().toISOString()}`)

    try {
      // Step 1: Scrape latest F1 news
      console.log('📰 Step 1: Scraping F1 news sources...')
      const scraped = await this.scrapeLatestNews()
      
      if (scraped.length === 0) {
        console.log('ℹ️ No new content found to process')
        return
      }

      console.log(`✅ Found ${scraped.length} new articles to process`)

      // Step 2: Generate AI-enhanced articles
      console.log('🤖 Step 2: Generating AI articles...')
      const generated = await this.generateArticles(scraped)
      
      const successful = generated.filter(g => g.success).length
      console.log(`✅ Successfully generated ${successful}/${scraped.length} articles`)

      // Step 3: Publish articles (if auto-publish enabled)
      if (this.config.autoPublish) {
        console.log('📝 Step 3: Publishing articles...')
        const published = await this.publishArticles(generated.filter(g => g.success))
        console.log(`✅ Published ${published.length} articles`)
      }

      const duration = (Date.now() - startTime) / 1000
      console.log(`🎉 Automation cycle completed in ${duration.toFixed(1)}s`)
      
      this.lastRunTime = new Date()

    } catch (error) {
      console.error('❌ Automation cycle failed:', error)
    }
  }

  /**
   * Scrape latest F1 news
   */
  private async scrapeLatestNews(): Promise<ProcessedContent[]> {
    try {
      const response = await fetch('/api/scrape-f1-news')
      
      if (!response.ok) {
        throw new Error(`Scraping failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Scraping failed')
      }

      // Transform scraped data to processable format
      return data.results?.map((result: any, index: number) => ({
        id: `scraped_${Date.now()}_${index}`,
        title: result.title,
        content: result.content || result.description || '',
        source: result.source,
        sourceUrl: result.link || result.url || '#',
        publishedAt: new Date().toISOString()
      })) || []

    } catch (error) {
      console.error('News scraping failed:', error)
      return []
    }
  }

  /**
   * Generate articles using AI
   */
  private async generateArticles(content: ProcessedContent[]): Promise<any[]> {
    const limitedContent = content.slice(0, this.config.maxArticlesPerRun)
    
    const articleRequests = limitedContent.map(item => ({
      title: item.title,
      sourceContent: item.content,
      source: item.source,
      sourceUrl: item.sourceUrl,
      category: this.categorizeContent(item.title, item.content),
      targetLength: this.determineTargetLength(item.content),
      tone: 'exciting'
    }))

    try {
      const response = await fetch('/api/ai/generate-article', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles: articleRequests })
      })

      if (!response.ok) {
        throw new Error(`Article generation failed: ${response.status}`)
      }

      const data = await response.json()
      return data.results || []

    } catch (error) {
      console.error('Article generation failed:', error)
      return []
    }
  }

  /**
   * Publish generated articles to database
   */
  private async publishArticles(generatedArticles: any[]): Promise<any[]> {
    const publishedArticles = []

    for (const articleResult of generatedArticles) {
      try {
        const { article } = articleResult
        
        // Quality check
        if (!this.passesQualityCheck(article)) {
          console.log(`⚠️ Article "${article.title}" failed quality check, skipping`)
          continue
        }

        // Publish to database (simulate for now)
        const published = await this.publishToDatabase(article)
        
        if (published) {
          publishedArticles.push(published)
          console.log(`✅ Published: ${article.title}`)
        }

      } catch (error) {
        console.error(`Failed to publish article:`, error)
      }
    }

    return publishedArticles
  }

  /**
   * Categorize content based on title and content
   */
  private categorizeContent(title: string, content: string): string {
    const lowerTitle = title.toLowerCase()
    const lowerContent = content.toLowerCase()
    
    if (lowerTitle.includes('breaking') || lowerTitle.includes('urgent')) {
      return 'breaking-news'
    }
    
    if (lowerTitle.includes('race') || lowerTitle.includes('grand prix') || lowerTitle.includes('qualifying')) {
      return 'race-analysis'
    }
    
    if (lowerTitle.includes('driver') || lowerContent.includes('verstappen') || lowerContent.includes('hamilton')) {
      return 'driver-news'
    }
    
    if (lowerTitle.includes('tech') || lowerContent.includes('aerodynamic') || lowerContent.includes('engine')) {
      return 'tech'
    }
    
    return 'f1-news'
  }

  /**
   * Determine target length based on content
   */
  private determineTargetLength(content: string): 'short' | 'medium' | 'long' {
    const wordCount = content.split(' ').length
    
    if (wordCount < 100) return 'short'
    if (wordCount < 300) return 'medium'
    return 'long'
  }

  /**
   * Quality check for generated articles
   */
  private passesQualityCheck(article: any): boolean {
    // Basic quality checks
    if (!article.title || article.title.length < 10) return false
    if (!article.content || article.content.length < 200) return false
    if (!article.summary || article.summary.length < 20) return false
    if (!article.tags || article.tags.length < 2) return false
    
    // Check for F1 relevance
    const f1Keywords = ['f1', 'formula', 'racing', 'driver', 'team', 'championship']
    const hasF1Content = f1Keywords.some(keyword => 
      article.title.toLowerCase().includes(keyword) || 
      article.content.toLowerCase().includes(keyword)
    )
    
    if (!hasF1Content) return false
    
    return true
  }

  /**
   * Publish article to database
   */
  private async publishToDatabase(article: any): Promise<any> {
    try {
      // TODO: Implement actual database publication
      // For now, simulate successful publication
      
      const publishedArticle = {
        id: `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: article.title,
        content: article.content,
        summary: article.summary,
        tags: article.tags,
        category: article.category,
        author: 'AI Agent',
        publishedAt: new Date().toISOString(),
        status: 'published',
        aiGenerated: true,
        estimatedReadTime: article.estimatedReadTime,
        seoTitle: article.seoTitle,
        metaDescription: article.metaDescription
      }

      // Log for development
      console.log('📰 Article ready for database:', {
        title: publishedArticle.title,
        category: publishedArticle.category,
        tags: publishedArticle.tags.slice(0, 3),
        readTime: `${publishedArticle.estimatedReadTime}min`
      })

      return publishedArticle

    } catch (error) {
      console.error('Database publication failed:', error)
      return null
    }
  }

  /**
   * Get agent status
   */
  getStatus(): any {
    return {
      isRunning: this.isRunning,
      config: this.config,
      lastRunTime: this.lastRunTime,
      uptime: this.lastRunTime ? Date.now() - this.lastRunTime.getTime() : 0
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AutomationConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.log('🔧 Agent configuration updated:', newConfig)
  }
}

export default ArticleAutomationAgent