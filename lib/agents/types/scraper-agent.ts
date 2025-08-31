/**
 * Scraper Agent
 * Specialized agent for scraping F1 news from various sources
 */

import { BaseAgent, AgentConfig, AgentTask, AgentResult, AgentMessage } from '../base-agent'

interface ScraperConfig {
  sources: string[]
  categories: string[]
  maxArticlesPerRun: number
  userAgent?: string
  requestDelay?: number
  respectRobotsTxt?: boolean
}

interface ScrapedArticle {
  title: string
  content: string
  source: string
  sourceUrl: string
  category: string
  publishedAt: string
  author?: string
  imageUrl?: string
}

export class ScraperAgent extends BaseAgent {
  private scraperConfig: ScraperConfig

  constructor(config: AgentConfig) {
    super(config)
    this.scraperConfig = {
      sources: config.parameters.sources || [],
      categories: config.parameters.categories || [],
      maxArticlesPerRun: config.parameters.maxArticlesPerRun || 10,
      userAgent: config.parameters.userAgent || 'GrandPrixSocial-Bot/1.0',
      requestDelay: config.parameters.requestDelay || 1000,
      respectRobotsTxt: config.parameters.respectRobotsTxt ?? true
    }
  }

  protected async onStart(): Promise<void> {
    this.log('info', `Scraper initialized for sources: ${this.scraperConfig.sources.join(', ')}`)
    
    // Schedule immediate scraping if no interval is set
    if (!this.config.intervalMs) {
      this.addTask({
        id: `scrape_${Date.now()}`,
        type: 'scrape-all',
        priority: 'normal',
        data: { immediate: true },
        createdAt: new Date().toISOString(),
        maxRetries: this.config.retryAttempts,
        currentRetries: 0
      })
    }
  }

  protected async onStop(): Promise<void> {
    this.log('info', 'Scraper agent stopped')
  }

  protected async executeTask(task: AgentTask): Promise<AgentResult> {
    switch (task.type) {
      case 'scrape-all':
        return await this.scrapeAllSources()
      
      case 'scrape-source':
        return await this.scrapeSource(task.data.source)
      
      case 'scrape-category':
        return await this.scrapeCategory(task.data.category)
      
      default:
        throw new Error(`Unknown task type: ${task.type}`)
    }
  }

  protected onMessage(message: AgentMessage): void {
    switch (message.type) {
      case 'task':
        if (message.payload.taskType === 'scrape') {
          this.addTask({
            id: `msg_${Date.now()}`,
            type: message.payload.target || 'scrape-all',
            priority: message.payload.priority || 'normal',
            data: message.payload.data || {},
            createdAt: new Date().toISOString(),
            maxRetries: 3,
            currentRetries: 0
          })
        }
        break
      
      case 'command':
        if (message.payload.command === 'update-sources') {
          this.scraperConfig.sources = message.payload.sources || this.scraperConfig.sources
          this.log('info', `Updated sources: ${this.scraperConfig.sources.join(', ')}`)
        }
        break
    }
  }

  /**
   * Scrape all configured sources
   */
  private async scrapeAllSources(): Promise<AgentResult> {
    const results: ScrapedArticle[] = []
    const errors: string[] = []

    for (const source of this.scraperConfig.sources) {
      try {
        this.log('info', `Scraping source: ${source}`)
        const sourceResults = await this.scrapeSource(source)
        results.push(...(sourceResults.data || []))
        
        // Respect delay between requests
        if (this.scraperConfig.requestDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, this.scraperConfig.requestDelay))
        }
        
      } catch (error) {
        const errorMsg = `Failed to scrape ${source}: ${error}`
        errors.push(errorMsg)
        this.log('error', errorMsg)
      }
    }

    // Create tasks for the writer agent
    const nextTasks: AgentTask[] = results.map(article => ({
      id: `write_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: 'generate-article',
      priority: 'normal',
      data: article,
      createdAt: new Date().toISOString(),
      maxRetries: 2,
      currentRetries: 0
    }))

    return {
      success: errors.length < this.scraperConfig.sources.length,
      data: results,
      error: errors.length > 0 ? errors.join('; ') : undefined,
      nextTasks,
      metrics: {
        tasksCompleted: results.length,
        lastExecutionTime: Date.now()
      }
    }
  }

  /**
   * Scrape specific source
   */
  private async scrapeSource(source: string): Promise<AgentResult> {
    const articles: ScrapedArticle[] = []
    
    try {
      // This would be the actual scraping logic
      // For now, we'll simulate the scraping process
      const scrapedData = await this.performScraping(source)
      articles.push(...scrapedData)
      
      this.log('success', `Scraped ${articles.length} articles from ${source}`)
      
      return {
        success: true,
        data: articles
      }
      
    } catch (error) {
      throw new Error(`Scraping failed for ${source}: ${error}`)
    }
  }

  /**
   * Scrape specific category across all sources
   */
  private async scrapeCategory(category: string): Promise<AgentResult> {
    const results: ScrapedArticle[] = []
    
    for (const source of this.scraperConfig.sources) {
      try {
        const sourceResults = await this.scrapeCategoryFromSource(source, category)
        results.push(...sourceResults)
      } catch (error) {
        this.log('warning', `Failed to scrape category ${category} from ${source}`)
      }
    }
    
    return {
      success: true,
      data: results
    }
  }

  /**
   * Perform the actual scraping (simulated for now)
   */
  private async performScraping(source: string): Promise<ScrapedArticle[]> {
    // In a real implementation, this would:
    // 1. Check robots.txt if enabled
    // 2. Fetch the website content
    // 3. Parse HTML and extract article data
    // 4. Categorize articles
    // 5. Return structured data
    
    // Simulated scraping results
    const simulatedArticles: ScrapedArticle[] = [
      {
        title: `${source} F1 Breaking News - Max Verstappen Dominates Practice`,
        content: `Max Verstappen showed impressive pace during today's practice sessions at the ${this.getRandomCircuit()}. The Red Bull driver topped both FP1 and FP2 with a commanding margin over his rivals. Team principal Christian Horner expressed satisfaction with the car's performance, noting significant improvements in the aerodynamic package introduced this weekend.`,
        source,
        sourceUrl: `https://${source}/article/${Date.now()}`,
        category: this.getRandomCategory(),
        publishedAt: new Date().toISOString(),
        author: 'F1 Reporter',
        imageUrl: `https://${source}/images/verstappen-practice.jpg`
      },
      {
        title: `${source} Circuit Analysis - ${this.getRandomCircuit()} Setup Secrets`,
        content: `Engineering teams are working around the clock to optimize their setups for this weekend's challenging circuit. The combination of high-speed straights and technical corners demands a delicate balance between downforce and drag. Mercedes has introduced new front wing elements while Ferrari focuses on engine mapping improvements.`,
        source,
        sourceUrl: `https://${source}/analysis/${Date.now()}`,
        category: 'tech',
        publishedAt: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Random time within last hour
        author: 'Technical Analyst',
        imageUrl: `https://${source}/images/circuit-analysis.jpg`
      }
    ]

    // Add random delay to simulate real scraping
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500))

    return simulatedArticles.slice(0, Math.min(this.scraperConfig.maxArticlesPerRun, simulatedArticles.length))
  }

  /**
   * Scrape category from specific source
   */
  private async scrapeCategoryFromSource(source: string, category: string): Promise<ScrapedArticle[]> {
    // Simulate category-specific scraping
    const article: ScrapedArticle = {
      title: `${source} ${category} - Latest F1 Update`,
      content: `This is the latest ${category} news from ${source}. The Formula 1 world continues to evolve with exciting developments across all teams and drivers.`,
      source,
      sourceUrl: `https://${source}/${category}/${Date.now()}`,
      category,
      publishedAt: new Date().toISOString(),
      author: 'Category Reporter'
    }

    return [article]
  }

  /**
   * Utility methods
   */
  private getRandomCircuit(): string {
    const circuits = [
      'Monaco', 'Silverstone', 'Spa-Francorchamps', 'Monza', 'Suzuka', 
      'Austin', 'Interlagos', 'Singapore', 'Abu Dhabi', 'Barcelona'
    ]
    return circuits[Math.floor(Math.random() * circuits.length)]
  }

  private getRandomCategory(): string {
    const categories = ['breaking-news', 'race-analysis', 'driver-news', 'tech', 'rumors']
    return categories[Math.floor(Math.random() * categories.length)]
  }
}

export default ScraperAgent