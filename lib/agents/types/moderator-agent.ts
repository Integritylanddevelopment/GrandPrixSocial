/**
 * Moderator Agent
 * Specialized agent for content moderation, quality control, and compliance checking
 */

import { BaseAgent, AgentConfig, AgentTask, AgentResult, AgentMessage } from '../base-agent'

interface ModeratorConfig {
  qualityThreshold: number
  checkPlagiarism: boolean
  checkFactAccuracy: boolean
  enableSentimentAnalysis: boolean
  autoApproveHighQuality: boolean
  requireHumanReview: boolean
  moderationRules: ModerationRule[]
}

interface ModerationRule {
  id: string
  name: string
  type: 'keyword' | 'pattern' | 'sentiment' | 'quality' | 'length'
  condition: any
  action: 'approve' | 'reject' | 'flag' | 'modify'
  severity: 'low' | 'medium' | 'high'
}

interface ArticleForModeration {
  title: string
  content: string
  summary: string
  tags: string[]
  category: string
  qualityScore: number
  originalSource: string
  generatedAt: string
  generatedBy: string
}

interface ModerationResult {
  approved: boolean
  score: number
  flags: ModerationFlag[]
  modifications: string[]
  reason?: string
  requiresHumanReview: boolean
}

interface ModerationFlag {
  type: string
  severity: 'low' | 'medium' | 'high'
  message: string
  suggestion?: string
}

export class ModeratorAgent extends BaseAgent {
  private moderatorConfig: ModeratorConfig
  private bannedKeywords: Set<string> = new Set()
  private approvedArticles: string[] = []
  private rejectedArticles: string[] = []

  constructor(config: AgentConfig) {
    super(config)
    this.moderatorConfig = {
      qualityThreshold: config.parameters.qualityThreshold || 7.5,
      checkPlagiarism: config.parameters.checkPlagiarism ?? true,
      checkFactAccuracy: config.parameters.checkFactAccuracy ?? false,
      enableSentimentAnalysis: config.parameters.enableSentimentAnalysis ?? true,
      autoApproveHighQuality: config.parameters.autoApproveHighQuality ?? true,
      requireHumanReview: config.parameters.requireHumanReview ?? false,
      moderationRules: config.parameters.moderationRules || []
    }
    
    this.initializeModerationRules()
    this.loadBannedKeywords()
  }

  protected async onStart(): Promise<void> {
    this.log('info', `Moderator initialized with ${this.moderatorConfig.moderationRules.length} rules`)
    this.log('info', `Quality threshold: ${this.moderatorConfig.qualityThreshold}/10`)
  }

  protected async onStop(): Promise<void> {
    this.log('info', 'Moderator agent stopped')
  }

  protected async executeTask(task: AgentTask): Promise<AgentResult> {
    switch (task.type) {
      case 'moderate-article':
        return await this.moderateArticle(task.data)
      
      case 'bulk-moderate':
        return await this.bulkModerate(task.data.articles)
      
      case 'review-flagged':
        return await this.reviewFlaggedContent(task.data)
      
      default:
        throw new Error(`Unknown task type: ${task.type}`)
    }
  }

  protected onMessage(message: AgentMessage): void {
    switch (message.type) {
      case 'task':
        if (message.payload.taskType === 'moderate') {
          this.addTask({
            id: `moderate_${Date.now()}`,
            type: 'moderate-article',
            priority: message.payload.priority || 'normal',
            data: message.payload.data,
            createdAt: new Date().toISOString(),
            maxRetries: 1,
            currentRetries: 0
          })
        }
        break
      
      case 'command':
        if (message.payload.command === 'update-rules') {
          this.updateModerationRules(message.payload.rules)
        }
        break
    }
  }

  /**
   * Moderate article content
   */
  private async moderateArticle(article: ArticleForModeration): Promise<AgentResult> {
    try {
      this.log('info', `Moderating article: ${article.title.substring(0, 50)}...`)
      
      const moderationResult = await this.performModeration(article)
      
      if (moderationResult.approved) {
        this.approvedArticles.push(article.title)
        
        // Create task for publisher agent
        const nextTasks: AgentTask[] = [{
          id: `publish_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'moderate-article', // Publisher agent expects this task type
          priority: moderationResult.score >= 9 ? 'high' : 'normal',
          data: {
            ...article,
            moderationResult,
            moderatedAt: new Date().toISOString(),
            moderatedBy: this.config.id
          },
          createdAt: new Date().toISOString(),
          maxRetries: 2,
          currentRetries: 0
        }]
        
        this.log('success', `Article approved: ${article.title} (Score: ${moderationResult.score.toFixed(1)}/10)`)
        
        return {
          success: true,
          data: {
            status: 'approved',
            article: article.title,
            moderationResult
          },
          nextTasks
        }
        
      } else {
        this.rejectedArticles.push(article.title)
        
        if (moderationResult.requiresHumanReview) {
          this.log('warning', `Article flagged for human review: ${article.title}`)
          
          // Create task for human review queue
          const nextTasks: AgentTask[] = [{
            id: `review_${Date.now()}`,
            type: 'review-flagged',
            priority: 'high',
            data: {
              article,
              moderationResult,
              flaggedAt: new Date().toISOString()
            },
            createdAt: new Date().toISOString(),
            maxRetries: 0, // Human review doesn't retry
            currentRetries: 0
          }]
          
          return {
            success: true,
            data: {
              status: 'flagged',
              article: article.title,
              moderationResult
            },
            nextTasks
          }
          
        } else {
          this.log('error', `Article rejected: ${article.title} - ${moderationResult.reason}`)
          
          return {
            success: false,
            data: {
              status: 'rejected',
              article: article.title,
              moderationResult
            },
            error: moderationResult.reason
          }
        }
      }
      
    } catch (error) {
      this.log('error', `Moderation failed: ${error}`)
      throw error
    }
  }

  /**
   * Perform comprehensive moderation
   */
  private async performModeration(article: ArticleForModeration): Promise<ModerationResult> {
    const flags: ModerationFlag[] = []
    const modifications: string[] = []
    let score = article.qualityScore || 5.0

    // Quality check
    if (article.qualityScore < this.moderatorConfig.qualityThreshold) {
      flags.push({
        type: 'quality',
        severity: 'medium',
        message: `Quality score ${article.qualityScore.toFixed(1)} below threshold ${this.moderatorConfig.qualityThreshold}`,
        suggestion: 'Consider regenerating with different parameters'
      })
      score -= 1.0
    }

    // Content length check
    const wordCount = article.content.split(' ').length
    if (wordCount < 200) {
      flags.push({
        type: 'length',
        severity: 'medium',
        message: 'Article too short',
        suggestion: 'Expand content to at least 200 words'
      })
      score -= 0.5
    } else if (wordCount > 3000) {
      flags.push({
        type: 'length',
        severity: 'low',
        message: 'Article very long',
        suggestion: 'Consider breaking into multiple parts'
      })
      score -= 0.2
    }

    // Keyword moderation
    const keywordFlags = await this.checkBannedKeywords(article)
    flags.push(...keywordFlags)
    score -= keywordFlags.length * 0.5

    // Title and content coherence
    if (!this.checkTitleContentAlignment(article)) {
      flags.push({
        type: 'coherence',
        severity: 'medium',
        message: 'Title and content may not be well aligned',
        suggestion: 'Review title-content relationship'
      })
      score -= 0.3
    }

    // F1 relevance check
    if (!this.checkF1Relevance(article)) {
      flags.push({
        type: 'relevance',
        severity: 'high',
        message: 'Content may not be sufficiently F1-related',
        suggestion: 'Ensure content focuses on Formula 1'
      })
      score -= 1.0
    }

    // Sentiment analysis
    if (this.moderatorConfig.enableSentimentAnalysis) {
      const sentimentScore = await this.analyzeSentiment(article)
      if (sentimentScore < -0.5) {
        flags.push({
          type: 'sentiment',
          severity: 'medium',
          message: 'Content has very negative sentiment',
          suggestion: 'Consider more balanced tone'
        })
        score -= 0.3
      }
    }

    // Apply moderation rules
    for (const rule of this.moderatorConfig.moderationRules) {
      const ruleResult = this.applyModerationRule(article, rule)
      if (ruleResult.triggered) {
        flags.push(ruleResult.flag!)
        if (rule.action === 'reject') {
          score -= 2.0
        } else if (rule.action === 'flag') {
          score -= 0.5
        }
      }
    }

    // Plagiarism check (simplified)
    if (this.moderatorConfig.checkPlagiarism) {
      const plagiarismScore = await this.checkPlagiarism(article)
      if (plagiarismScore > 0.3) {
        flags.push({
          type: 'plagiarism',
          severity: 'high',
          message: `High similarity detected (${(plagiarismScore * 100).toFixed(1)}%)`,
          suggestion: 'Verify originality and rewrite if necessary'
        })
        score -= 2.0
      }
    }

    // Final score calculation
    const finalScore = Math.max(0, Math.min(10, score))
    
    // Determine approval
    const highSeverityFlags = flags.filter(f => f.severity === 'high')
    const requiresHumanReview = highSeverityFlags.length > 0 || 
                               (flags.length > 3 && finalScore < 6) ||
                               this.moderatorConfig.requireHumanReview

    const approved = finalScore >= this.moderatorConfig.qualityThreshold && 
                    highSeverityFlags.length === 0 &&
                    (!requiresHumanReview || this.moderatorConfig.autoApproveHighQuality)

    return {
      approved,
      score: finalScore,
      flags,
      modifications,
      reason: !approved ? this.generateRejectionReason(flags) : undefined,
      requiresHumanReview
    }
  }

  /**
   * Check for banned keywords
   */
  private async checkBannedKeywords(article: ArticleForModeration): Promise<ModerationFlag[]> {
    const flags: ModerationFlag[] = []
    const content = (article.title + ' ' + article.content).toLowerCase()
    
    for (const keyword of this.bannedKeywords) {
      if (content.includes(keyword)) {
        flags.push({
          type: 'banned-keyword',
          severity: 'high',
          message: `Contains banned keyword: ${keyword}`,
          suggestion: `Remove or replace "${keyword}"`
        })
      }
    }
    
    return flags
  }

  /**
   * Check title-content alignment
   */
  private checkTitleContentAlignment(article: ArticleForModeration): boolean {
    const titleWords = article.title.toLowerCase().split(' ')
      .filter(word => word.length > 3)
    
    const contentWords = article.content.toLowerCase().split(' ')
    
    const matches = titleWords.filter(word => 
      contentWords.some(contentWord => contentWord.includes(word))
    )
    
    return matches.length / titleWords.length > 0.5
  }

  /**
   * Check F1 relevance
   */
  private checkF1Relevance(article: ArticleForModeration): boolean {
    const f1Keywords = [
      'formula', 'f1', 'grand prix', 'driver', 'team', 'race', 'qualifying',
      'circuit', 'championship', 'season', 'mercedes', 'ferrari', 'red bull',
      'mclaren', 'alpine', 'aston martin', 'haas', 'williams', 'alphatauri'
    ]
    
    const content = (article.title + ' ' + article.content).toLowerCase()
    const matches = f1Keywords.filter(keyword => content.includes(keyword))
    
    return matches.length >= 2
  }

  /**
   * Analyze sentiment (simplified)
   */
  private async analyzeSentiment(article: ArticleForModeration): Promise<number> {
    const positiveWords = ['win', 'victory', 'success', 'brilliant', 'excellent', 'amazing', 'outstanding']
    const negativeWords = ['crash', 'failure', 'disaster', 'terrible', 'awful', 'disappointing', 'struggling']
    
    const content = article.content.toLowerCase()
    const positiveCount = positiveWords.filter(word => content.includes(word)).length
    const negativeCount = negativeWords.filter(word => content.includes(word)).length
    
    const totalWords = content.split(' ').length
    const sentimentScore = (positiveCount - negativeCount) / Math.max(1, totalWords * 0.01)
    
    return Math.max(-1, Math.min(1, sentimentScore))
  }

  /**
   * Check for plagiarism (simplified)
   */
  private async checkPlagiarism(article: ArticleForModeration): Promise<number> {
    // In a real implementation, this would:
    // 1. Compare against existing articles in database
    // 2. Use external plagiarism detection APIs
    // 3. Check against the original source content
    
    // For now, simulate plagiarism check
    const similarity = Math.random() * 0.2 // 0-20% similarity
    return similarity
  }

  /**
   * Apply moderation rule
   */
  private applyModerationRule(article: ArticleForModeration, rule: ModerationRule): { triggered: boolean, flag?: ModerationFlag } {
    let triggered = false
    
    switch (rule.type) {
      case 'keyword':
        triggered = this.checkKeywordRule(article, rule.condition)
        break
      case 'length':
        triggered = this.checkLengthRule(article, rule.condition)
        break
      case 'quality':
        triggered = this.checkQualityRule(article, rule.condition)
        break
    }
    
    if (triggered) {
      return {
        triggered: true,
        flag: {
          type: rule.type,
          severity: rule.severity,
          message: `Rule triggered: ${rule.name}`,
          suggestion: `Action required: ${rule.action}`
        }
      }
    }
    
    return { triggered: false }
  }

  /**
   * Utility methods for rule checking
   */
  private checkKeywordRule(article: ArticleForModeration, condition: any): boolean {
    const content = (article.title + ' ' + article.content).toLowerCase()
    return condition.keywords?.some((keyword: string) => content.includes(keyword.toLowerCase()))
  }

  private checkLengthRule(article: ArticleForModeration, condition: any): boolean {
    const wordCount = article.content.split(' ').length
    return wordCount < condition.min || wordCount > condition.max
  }

  private checkQualityRule(article: ArticleForModeration, condition: any): boolean {
    return article.qualityScore < condition.threshold
  }

  /**
   * Review flagged content (human review simulation)
   */
  private async reviewFlaggedContent(data: any): Promise<AgentResult> {
    const { article, moderationResult } = data
    
    this.log('info', `Flagged content under review: ${article.title}`)
    
    // In a real implementation, this would queue for human review
    // For now, simulate human review decision
    const humanApproval = Math.random() > 0.3 // 70% approval rate
    
    if (humanApproval) {
      this.log('info', `Human reviewer approved: ${article.title}`)
      return {
        success: true,
        data: { status: 'approved-by-human', article: article.title }
      }
    } else {
      this.log('warning', `Human reviewer rejected: ${article.title}`)
      return {
        success: false,
        data: { status: 'rejected-by-human', article: article.title },
        error: 'Rejected by human reviewer'
      }
    }
  }

  /**
   * Bulk moderate multiple articles
   */
  private async bulkModerate(articles: ArticleForModeration[]): Promise<AgentResult> {
    const results = []
    
    for (const article of articles) {
      try {
        const result = await this.moderateArticle(article)
        results.push(result)
        
        // Small delay between moderations
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        results.push({
          success: false,
          error: `Moderation failed: ${error}`,
          data: { article: article.title }
        })
      }
    }
    
    const successCount = results.filter(r => r.success).length
    
    return {
      success: successCount > 0,
      data: {
        processed: results.length,
        approved: successCount,
        rejected: results.length - successCount,
        results
      }
    }
  }

  /**
   * Utility and configuration methods
   */
  private initializeModerationRules(): void {
    if (this.moderatorConfig.moderationRules.length === 0) {
      this.moderatorConfig.moderationRules = [
        {
          id: 'quality-check',
          name: 'Minimum Quality Standard',
          type: 'quality',
          condition: { threshold: 5.0 },
          action: 'flag',
          severity: 'medium'
        },
        {
          id: 'length-check',
          name: 'Article Length Validation',
          type: 'length',
          condition: { min: 150, max: 5000 },
          action: 'flag',
          severity: 'low'
        }
      ]
    }
  }

  private loadBannedKeywords(): void {
    // Load banned keywords (in production, this would come from a database)
    const defaultBanned = [
      'spam', 'scam', 'fake news', 'clickbait', 'hate speech'
    ]
    
    defaultBanned.forEach(keyword => this.bannedKeywords.add(keyword))
  }

  private updateModerationRules(newRules: ModerationRule[]): void {
    this.moderatorConfig.moderationRules = newRules
    this.log('info', `Updated moderation rules: ${newRules.length} rules active`)
  }

  private generateRejectionReason(flags: ModerationFlag[]): string {
    const highFlags = flags.filter(f => f.severity === 'high')
    if (highFlags.length > 0) {
      return `Critical issues: ${highFlags.map(f => f.message).join(', ')}`
    }
    
    const mediumFlags = flags.filter(f => f.severity === 'medium')
    if (mediumFlags.length >= 2) {
      return `Multiple issues: ${mediumFlags.map(f => f.message).join(', ')}`
    }
    
    return `Quality standards not met: ${flags.map(f => f.message).join(', ')}`
  }
}

export default ModeratorAgent