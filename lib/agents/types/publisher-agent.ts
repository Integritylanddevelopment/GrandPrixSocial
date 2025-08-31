/**
 * Publisher Agent
 * Specialized agent for publishing articles to website and social media platforms
 */

import { BaseAgent, AgentConfig, AgentTask, AgentResult, AgentMessage } from '../base-agent'

interface PublisherConfig {
  autoPublish: boolean
  platforms: string[]
  scheduleDelay: number // Minutes between publications
  maxPublishPerHour: number
  requireApproval: boolean
  socialMediaEnabled: boolean
}

interface PublishableArticle {
  title: string
  content: string
  summary: string
  tags: string[]
  category: string
  seoTitle: string
  metaDescription: string
  qualityScore: number
  imageUrl?: string
  originalSource: string
  generatedAt: string
}

interface PublicationResult {
  platform: string
  success: boolean
  publishedUrl?: string
  error?: string
  publishedAt: string
}

export class PublisherAgent extends BaseAgent {
  private publisherConfig: PublisherConfig
  private publicationQueue: PublishableArticle[] = []
  private recentPublications: PublicationResult[] = []

  constructor(config: AgentConfig) {
    super(config)
    this.publisherConfig = {
      autoPublish: config.parameters.autoPublish ?? false,
      platforms: config.parameters.platforms || ['website'],
      scheduleDelay: config.parameters.scheduleDelay || 15, // 15 minutes
      maxPublishPerHour: config.parameters.maxPublishPerHour || 6,
      requireApproval: config.parameters.requireApproval ?? true,
      socialMediaEnabled: config.parameters.socialMediaEnabled ?? false
    }
  }

  protected async onStart(): Promise<void> {
    this.log('info', `Publisher initialized for platforms: ${this.publisherConfig.platforms.join(', ')}`)
    this.log('info', `Auto-publish: ${this.publisherConfig.autoPublish ? 'enabled' : 'disabled'}`)
    
    // Clean up old publication records
    this.cleanupOldPublications()
  }

  protected async onStop(): Promise<void> {
    this.log('info', 'Publisher agent stopped')
  }

  protected async executeTask(task: AgentTask): Promise<AgentResult> {
    switch (task.type) {
      case 'publish-article':
        return await this.publishArticle(task.data)
      
      case 'schedule-publication':
        return await this.schedulePublication(task.data)
      
      case 'publish-to-social':
        return await this.publishToSocialMedia(task.data)
      
      case 'moderate-article':
        return await this.handleModeratedArticle(task.data)
      
      default:
        throw new Error(`Unknown task type: ${task.type}`)
    }
  }

  protected onMessage(message: AgentMessage): void {
    switch (message.type) {
      case 'task':
        if (message.payload.taskType === 'publish') {
          this.addTask({
            id: `publish_${Date.now()}`,
            type: 'publish-article',
            priority: message.payload.priority || 'normal',
            data: message.payload.data,
            createdAt: new Date().toISOString(),
            maxRetries: 2,
            currentRetries: 0
          })
        }
        break
      
      case 'command':
        if (message.payload.command === 'approve-publication') {
          this.approvePublication(message.payload.articleId)
        } else if (message.payload.command === 'update-config') {
          this.updateConfig(message.payload.config)
        }
        break
    }
  }

  /**
   * Handle moderated article (comes from moderator agent)
   */
  private async handleModeratedArticle(article: PublishableArticle): Promise<AgentResult> {
    this.log('info', `Received moderated article: ${article.title}`)
    
    if (!this.publisherConfig.autoPublish && this.publisherConfig.requireApproval) {
      // Queue for manual approval
      this.publicationQueue.push(article)
      this.log('info', `Article queued for approval: ${article.title}`)
      
      return {
        success: true,
        data: { status: 'queued', article: article.title }
      }
    }
    
    // Check publication rate limits
    if (!this.canPublishNow()) {
      const scheduleTime = new Date(Date.now() + this.publisherConfig.scheduleDelay * 60000)
      
      this.addTask({
        id: `scheduled_${Date.now()}`,
        type: 'publish-article',
        priority: 'normal',
        data: article,
        createdAt: new Date().toISOString(),
        scheduledAt: scheduleTime.toISOString(),
        maxRetries: 2,
        currentRetries: 0
      })
      
      this.log('info', `Article scheduled for ${scheduleTime.toISOString()}: ${article.title}`)
      return {
        success: true,
        data: { status: 'scheduled', scheduledAt: scheduleTime.toISOString() }
      }
    }
    
    // Publish immediately
    return await this.publishArticle(article)
  }

  /**
   * Publish article to configured platforms
   */
  private async publishArticle(article: PublishableArticle): Promise<AgentResult> {
    const results: PublicationResult[] = []
    
    try {
      this.log('info', `Publishing article: ${article.title}`)
      
      for (const platform of this.publisherConfig.platforms) {
        try {
          const result = await this.publishToPlatform(article, platform)
          results.push(result)
          
          if (result.success) {
            this.log('success', `Published to ${platform}: ${result.publishedUrl}`)
          } else {
            this.log('error', `Failed to publish to ${platform}: ${result.error}`)
          }
          
        } catch (error) {
          results.push({
            platform,
            success: false,
            error: `Publication error: ${error}`,
            publishedAt: new Date().toISOString()
          })
        }
      }
      
      // Store publication records
      this.recentPublications.push(...results)
      
      // Create analytics task
      const nextTasks: AgentTask[] = [{
        id: `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type: 'track-publication',
        priority: 'normal',
        data: {
          article,
          publications: results
        },
        createdAt: new Date().toISOString(),
        maxRetries: 1,
        currentRetries: 0
      }]
      
      const successCount = results.filter(r => r.success).length
      const success = successCount > 0
      
      return {
        success,
        data: {
          publicationResults: results,
          successfulPublications: successCount,
          totalPlatforms: this.publisherConfig.platforms.length
        },
        nextTasks
      }
      
    } catch (error) {
      this.log('error', `Publication failed: ${error}`)
      throw error
    }
  }

  /**
   * Schedule publication for later
   */
  private async schedulePublication(article: PublishableArticle): Promise<AgentResult> {
    const scheduleTime = new Date(Date.now() + this.publisherConfig.scheduleDelay * 60000)
    
    this.addTask({
      id: `scheduled_${Date.now()}`,
      type: 'publish-article',
      priority: 'normal',
      data: article,
      createdAt: new Date().toISOString(),
      scheduledAt: scheduleTime.toISOString(),
      maxRetries: 2,
      currentRetries: 0
    })
    
    return {
      success: true,
      data: { scheduled: true, scheduledAt: scheduleTime.toISOString() }
    }
  }

  /**
   * Publish to specific platform
   */
  private async publishToPlatform(article: PublishableArticle, platform: string): Promise<PublicationResult> {
    switch (platform) {
      case 'website':
        return await this.publishToWebsite(article)
      
      case 'twitter':
        return await this.publishToTwitter(article)
      
      case 'facebook':
        return await this.publishToFacebook(article)
      
      case 'linkedin':
        return await this.publishToLinkedIn(article)
      
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  /**
   * Publish to website
   */
  private async publishToWebsite(article: PublishableArticle): Promise<PublicationResult> {
    try {
      // In real implementation, this would call your CMS API
      // For now, we'll simulate the publication
      
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          summary: article.summary,
          category: article.category,
          tags: article.tags,
          seoTitle: article.seoTitle,
          metaDescription: article.metaDescription,
          imageUrl: article.imageUrl,
          status: 'published',
          publishedAt: new Date().toISOString(),
          source: 'ai-generated',
          originalSource: article.originalSource
        })
      })

      if (response.ok) {
        const data = await response.json()
        return {
          platform: 'website',
          success: true,
          publishedUrl: `${process.env.NEXT_PUBLIC_APP_URL}/articles/${data.slug}`,
          publishedAt: new Date().toISOString()
        }
      } else {
        throw new Error(`Website publication failed: ${response.status}`)
      }
      
    } catch (error) {
      return {
        platform: 'website',
        success: false,
        error: `Website publication error: ${error}`,
        publishedAt: new Date().toISOString()
      }
    }
  }

  /**
   * Publish to Twitter
   */
  private async publishToTwitter(article: PublishableArticle): Promise<PublicationResult> {
    if (!this.publisherConfig.socialMediaEnabled) {
      return {
        platform: 'twitter',
        success: false,
        error: 'Social media publishing disabled',
        publishedAt: new Date().toISOString()
      }
    }

    try {
      // Create Twitter-optimized content
      const tweetText = this.createTweet(article)
      
      // In real implementation, this would use Twitter API
      // For now, simulate the tweet
      this.log('info', `Would tweet: ${tweetText}`)
      
      return {
        platform: 'twitter',
        success: true,
        publishedUrl: `https://twitter.com/grandprixsocial/status/simulation`,
        publishedAt: new Date().toISOString()
      }
      
    } catch (error) {
      return {
        platform: 'twitter',
        success: false,
        error: `Twitter error: ${error}`,
        publishedAt: new Date().toISOString()
      }
    }
  }

  /**
   * Publish to Facebook
   */
  private async publishToFacebook(article: PublishableArticle): Promise<PublicationResult> {
    if (!this.publisherConfig.socialMediaEnabled) {
      return {
        platform: 'facebook',
        success: false,
        error: 'Social media publishing disabled',
        publishedAt: new Date().toISOString()
      }
    }

    // Simulate Facebook post
    return {
      platform: 'facebook',
      success: true,
      publishedUrl: `https://facebook.com/grandprixsocial/posts/simulation`,
      publishedAt: new Date().toISOString()
    }
  }

  /**
   * Publish to LinkedIn
   */
  private async publishToLinkedIn(article: PublishableArticle): Promise<PublicationResult> {
    if (!this.publisherConfig.socialMediaEnabled) {
      return {
        platform: 'linkedin',
        success: false,
        error: 'Social media publishing disabled',
        publishedAt: new Date().toISOString()
      }
    }

    // Simulate LinkedIn post
    return {
      platform: 'linkedin',
      success: true,
      publishedUrl: `https://linkedin.com/company/grandprixsocial/posts/simulation`,
      publishedAt: new Date().toISOString()
    }
  }

  /**
   * Publish to social media platforms
   */
  private async publishToSocialMedia(data: { article: PublishableArticle, platforms?: string[] }): Promise<AgentResult> {
    const { article, platforms = ['twitter', 'facebook'] } = data
    const results: PublicationResult[] = []
    
    for (const platform of platforms) {
      if (platform !== 'website') {
        const result = await this.publishToPlatform(article, platform)
        results.push(result)
      }
    }
    
    return {
      success: results.some(r => r.success),
      data: { socialMediaResults: results }
    }
  }

  /**
   * Utility methods
   */
  private canPublishNow(): boolean {
    const oneHourAgo = new Date(Date.now() - 3600000)
    const recentPubs = this.recentPublications.filter(pub => 
      new Date(pub.publishedAt) > oneHourAgo && pub.success
    )
    
    return recentPubs.length < this.publisherConfig.maxPublishPerHour
  }

  private createTweet(article: PublishableArticle): string {
    const maxLength = 280
    let tweet = `🏎️ ${article.title}`
    
    if (tweet.length > maxLength - 30) {
      tweet = `🏎️ ${article.title.substring(0, maxLength - 50)}...`
    }
    
    // Add hashtags
    const hashtags = article.tags.slice(0, 3).map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ')
    tweet += `\n\n${hashtags}`
    
    // Add link placeholder
    tweet += '\n\n📖 Read more: [URL]'
    
    return tweet
  }

  private approvePublication(articleId: string): void {
    const article = this.publicationQueue.find(a => 
      a.title.includes(articleId) || a.seoTitle.includes(articleId)
    )
    
    if (article) {
      this.addTask({
        id: `approved_${Date.now()}`,
        type: 'publish-article',
        priority: 'high',
        data: article,
        createdAt: new Date().toISOString(),
        maxRetries: 2,
        currentRetries: 0
      })
      
      // Remove from queue
      this.publicationQueue = this.publicationQueue.filter(a => a !== article)
      this.log('info', `Approved and scheduled publication: ${article.title}`)
    }
  }

  private updateConfig(newConfig: Partial<PublisherConfig>): void {
    this.publisherConfig = { ...this.publisherConfig, ...newConfig }
    this.log('info', 'Publisher configuration updated')
  }

  private cleanupOldPublications(): void {
    const oneDayAgo = new Date(Date.now() - 86400000)
    this.recentPublications = this.recentPublications.filter(pub => 
      new Date(pub.publishedAt) > oneDayAgo
    )
  }
}

export default PublisherAgent