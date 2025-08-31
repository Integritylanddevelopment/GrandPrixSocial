/**
 * Analytics Agent
 * Specialized agent for tracking performance, generating insights, and feeding data back for training
 */

import { BaseAgent, AgentConfig, AgentTask, AgentResult, AgentMessage } from '../base-agent'
import { performanceTracker } from '../../analytics/performance-tracker'

interface AnalyticsConfig {
  trackingEnabled: boolean
  trainingFeedback: boolean
  reportingInterval: number // minutes
  insightGeneration: boolean
  alertThresholds: {
    lowEngagement: number
    highErrorRate: number
    lowQualityScore: number
  }
}

interface PublicationEvent {
  article: any
  publications: any[]
  publishedAt: string
}

interface PerformanceMetrics {
  articleId: string
  title: string
  category: string
  qualityScore: number
  views: number
  likes: number
  comments: number
  shares: number
  timeOnPage: number
  scrollDepth: number
  engagementScore: number
  publishedAt: string
  generatedBy: string
}

interface PerformanceInsight {
  type: 'trend' | 'alert' | 'recommendation' | 'achievement'
  severity: 'low' | 'medium' | 'high'
  title: string
  description: string
  data: any
  actionRequired: boolean
  timestamp: string
}

export class AnalyticsAgent extends BaseAgent {
  private analyticsConfig: AnalyticsConfig
  private metricsCache: Map<string, PerformanceMetrics> = new Map()
  private insights: PerformanceInsight[] = []
  private reportingIntervalId: NodeJS.Timeout | null = null

  constructor(config: AgentConfig) {
    super(config)
    this.analyticsConfig = {
      trackingEnabled: config.parameters.trackingEnabled ?? true,
      trainingFeedback: config.parameters.trainingFeedback ?? true,
      reportingInterval: config.parameters.reportingInterval || 60, // 1 hour
      insightGeneration: config.parameters.insightGeneration ?? true,
      alertThresholds: {
        lowEngagement: config.parameters.alertThresholds?.lowEngagement || 3.0,
        highErrorRate: config.parameters.alertThresholds?.highErrorRate || 0.1,
        lowQualityScore: config.parameters.alertThresholds?.lowQualityScore || 6.0
      }
    }
  }

  protected async onStart(): Promise<void> {
    this.log('info', 'Analytics agent started - tracking article performance')
    
    if (this.analyticsConfig.reportingInterval > 0) {
      this.startPeriodicReporting()
    }
  }

  protected async onStop(): Promise<void> {
    if (this.reportingIntervalId) {
      clearInterval(this.reportingIntervalId)
    }
    this.log('info', 'Analytics agent stopped')
  }

  protected async executeTask(task: AgentTask): Promise<AgentResult> {
    switch (task.type) {
      case 'track-publication':
        return await this.trackPublication(task.data)
      
      case 'analyze-performance':
        return await this.analyzePerformance(task.data)
      
      case 'generate-report':
        return await this.generateReport(task.data)
      
      case 'update-metrics':
        return await this.updateMetrics(task.data)
      
      case 'generate-insights':
        return await this.generateInsights()
      
      default:
        throw new Error(`Unknown task type: ${task.type}`)
    }
  }

  protected onMessage(message: AgentMessage): void {
    switch (message.type) {
      case 'task':
        if (message.payload.taskType === 'track') {
          this.addTask({
            id: `track_${Date.now()}`,
            type: 'track-publication',
            priority: 'normal',
            data: message.payload.data,
            createdAt: new Date().toISOString(),
            maxRetries: 2,
            currentRetries: 0
          })
        }
        break
      
      case 'command':
        if (message.payload.command === 'generate-report') {
          this.addTask({
            id: `report_${Date.now()}`,
            type: 'generate-report',
            priority: 'normal',
            data: message.payload.data || {},
            createdAt: new Date().toISOString(),
            maxRetries: 1,
            currentRetries: 0
          })
        }
        break
    }
  }

  /**
   * Track publication event
   */
  private async trackPublication(publicationEvent: PublicationEvent): Promise<AgentResult> {
    try {
      if (!this.analyticsConfig.trackingEnabled) {
        return { success: true, data: { message: 'Tracking disabled' } }
      }

      const { article, publications } = publicationEvent
      
      this.log('info', `Tracking publication: ${article.title}`)
      
      // Initialize performance metrics
      const metrics: PerformanceMetrics = {
        articleId: this.generateArticleId(article),
        title: article.title,
        category: article.category || 'unknown',
        qualityScore: article.qualityScore || 0,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        timeOnPage: 0,
        scrollDepth: 0,
        engagementScore: 0,
        publishedAt: new Date().toISOString(),
        generatedBy: article.generatedBy || 'unknown'
      }
      
      this.metricsCache.set(metrics.articleId, metrics)
      
      // Track publication success rate
      const successfulPubs = publications.filter(p => p.success).length
      const successRate = successfulPubs / publications.length
      
      // Generate alerts if needed
      if (successRate < 0.5) {
        await this.generateAlert({
          type: 'alert',
          severity: 'high',
          title: 'Low Publication Success Rate',
          description: `Only ${(successRate * 100).toFixed(1)}% of publications succeeded`,
          data: { article: article.title, successRate, publications },
          actionRequired: true
        })
      }
      
      // Start tracking user engagement
      if (successfulPubs > 0) {
        this.startEngagementTracking(metrics.articleId, article)
      }
      
      return {
        success: true,
        data: {
          tracked: true,
          articleId: metrics.articleId,
          publicationSuccessRate: successRate,
          platforms: publications.length
        }
      }
      
    } catch (error) {
      this.log('error', `Publication tracking failed: ${error}`)
      throw error
    }
  }

  /**
   * Analyze article performance
   */
  private async analyzePerformance(data: { articleId?: string, category?: string, timeframe?: string }): Promise<AgentResult> {
    try {
      const { articleId, category, timeframe } = data
      
      let metricsToAnalyze: PerformanceMetrics[]
      
      if (articleId) {
        const metrics = this.metricsCache.get(articleId)
        metricsToAnalyze = metrics ? [metrics] : []
      } else {
        metricsToAnalyze = Array.from(this.metricsCache.values())
        
        if (category) {
          metricsToAnalyze = metricsToAnalyze.filter(m => m.category === category)
        }
        
        if (timeframe) {
          const cutoff = this.getTimeframeCutoff(timeframe)
          metricsToAnalyze = metricsToAnalyze.filter(m => 
            new Date(m.publishedAt) > cutoff
          )
        }
      }
      
      const analysis = this.performAnalysis(metricsToAnalyze)
      
      // Generate insights from analysis
      if (this.analyticsConfig.insightGeneration) {
        await this.generateInsightsFromAnalysis(analysis)
      }
      
      // Send feedback to training system
      if (this.analyticsConfig.trainingFeedback) {
        await this.sendTrainingFeedback(metricsToAnalyze)
      }
      
      return {
        success: true,
        data: analysis
      }
      
    } catch (error) {
      this.log('error', `Performance analysis failed: ${error}`)
      throw error
    }
  }

  /**
   * Generate performance report
   */
  private async generateReport(data: { timeframe?: string, format?: 'summary' | 'detailed' }): Promise<AgentResult> {
    const { timeframe = '24h', format = 'summary' } = data
    
    const cutoff = this.getTimeframeCutoff(timeframe)
    const recentMetrics = Array.from(this.metricsCache.values())
      .filter(m => new Date(m.publishedAt) > cutoff)
    
    const report = {
      timeframe,
      generatedAt: new Date().toISOString(),
      totalArticles: recentMetrics.length,
      summary: this.generateSummaryStats(recentMetrics),
      categoryBreakdown: this.generateCategoryBreakdown(recentMetrics),
      topPerformers: this.getTopPerformers(recentMetrics, 5),
      lowPerformers: this.getLowPerformers(recentMetrics, 5),
      insights: this.insights.slice(0, 10),
      recommendations: this.generateRecommendations(recentMetrics)
    }
    
    if (format === 'detailed') {
      report['detailedMetrics'] = recentMetrics
    }
    
    this.log('success', `Generated ${format} report for ${timeframe}: ${recentMetrics.length} articles`)
    
    return {
      success: true,
      data: report
    }
  }

  /**
   * Update metrics with new performance data
   */
  private async updateMetrics(data: { articleId: string, metrics: Partial<PerformanceMetrics> }): Promise<AgentResult> {
    const { articleId, metrics } = data
    const existing = this.metricsCache.get(articleId)
    
    if (!existing) {
      return {
        success: false,
        error: `Article not found: ${articleId}`
      }
    }
    
    // Update metrics
    const updated = { ...existing, ...metrics }
    
    // Recalculate engagement score
    updated.engagementScore = this.calculateEngagementScore(updated)
    
    this.metricsCache.set(articleId, updated)
    
    // Check for alerts
    await this.checkMetricAlerts(updated)
    
    return {
      success: true,
      data: { updated: true, engagementScore: updated.engagementScore }
    }
  }

  /**
   * Generate insights from current data
   */
  private async generateInsights(): Promise<AgentResult> {
    const metrics = Array.from(this.metricsCache.values())
    const newInsights: PerformanceInsight[] = []
    
    // Trend analysis
    const trends = this.analyzeTrends(metrics)
    newInsights.push(...trends)
    
    // Performance alerts
    const alerts = this.generatePerformanceAlerts(metrics)
    newInsights.push(...alerts)
    
    // Recommendations
    const recommendations = this.generateInsightRecommendations(metrics)
    newInsights.push(...recommendations)
    
    // Achievement detection
    const achievements = this.detectAchievements(metrics)
    newInsights.push(...achievements)
    
    this.insights.push(...newInsights)
    
    // Keep only recent insights (last 100)
    this.insights = this.insights.slice(-100)
    
    return {
      success: true,
      data: {
        newInsights: newInsights.length,
        totalInsights: this.insights.length,
        insights: newInsights
      }
    }
  }

  /**
   * Helper methods
   */
  private startEngagementTracking(articleId: string, article: any): void {
    // In a real implementation, this would:
    // 1. Set up tracking pixels/scripts
    // 2. Initialize performance tracker for the article
    // 3. Start collecting user interaction data
    
    performanceTracker.trackView(articleId, {
      category: article.category,
      generatedByAI: true
    })
  }

  private performAnalysis(metrics: PerformanceMetrics[]): any {
    if (metrics.length === 0) {
      return { message: 'No metrics available for analysis' }
    }
    
    const totalViews = metrics.reduce((sum, m) => sum + m.views, 0)
    const totalEngagement = metrics.reduce((sum, m) => sum + m.likes + m.comments + m.shares, 0)
    const avgEngagementScore = metrics.reduce((sum, m) => sum + m.engagementScore, 0) / metrics.length
    const avgQualityScore = metrics.reduce((sum, m) => sum + m.qualityScore, 0) / metrics.length
    const avgTimeOnPage = metrics.reduce((sum, m) => sum + m.timeOnPage, 0) / metrics.length
    
    return {
      totalArticles: metrics.length,
      totalViews,
      totalEngagement,
      avgEngagementScore: Number(avgEngagementScore.toFixed(2)),
      avgQualityScore: Number(avgQualityScore.toFixed(2)),
      avgTimeOnPage: Number((avgTimeOnPage / 1000).toFixed(1)), // Convert to seconds
      engagementRate: totalViews > 0 ? Number((totalEngagement / totalViews).toFixed(3)) : 0,
      categories: this.getCategoryStats(metrics)
    }
  }

  private generateSummaryStats(metrics: PerformanceMetrics[]): any {
    return this.performAnalysis(metrics)
  }

  private generateCategoryBreakdown(metrics: PerformanceMetrics[]): any {
    const categories = new Map<string, PerformanceMetrics[]>()
    
    metrics.forEach(metric => {
      if (!categories.has(metric.category)) {
        categories.set(metric.category, [])
      }
      categories.get(metric.category)!.push(metric)
    })
    
    const breakdown = {}
    for (const [category, categoryMetrics] of categories) {
      breakdown[category] = this.performAnalysis(categoryMetrics)
    }
    
    return breakdown
  }

  private getTopPerformers(metrics: PerformanceMetrics[], count: number): PerformanceMetrics[] {
    return metrics
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, count)
  }

  private getLowPerformers(metrics: PerformanceMetrics[], count: number): PerformanceMetrics[] {
    return metrics
      .sort((a, b) => a.engagementScore - b.engagementScore)
      .slice(0, count)
  }

  private generateRecommendations(metrics: PerformanceMetrics[]): string[] {
    const recommendations: string[] = []
    
    const avgEngagement = metrics.reduce((sum, m) => sum + m.engagementScore, 0) / metrics.length
    
    if (avgEngagement < 5) {
      recommendations.push('Consider improving article quality - current engagement is below average')
    }
    
    const categoryPerformance = this.getCategoryStats(metrics)
    const bestCategory = Object.entries(categoryPerformance)
      .sort(([,a], [,b]) => b.avgEngagement - a.avgEngagement)[0]
    
    if (bestCategory) {
      recommendations.push(`Focus more on ${bestCategory[0]} content - it performs best`)
    }
    
    return recommendations
  }

  private getCategoryStats(metrics: PerformanceMetrics[]): any {
    const categories = new Map<string, PerformanceMetrics[]>()
    
    metrics.forEach(metric => {
      if (!categories.has(metric.category)) {
        categories.set(metric.category, [])
      }
      categories.get(metric.category)!.push(metric)
    })
    
    const stats = {}
    for (const [category, categoryMetrics] of categories) {
      const avgEngagement = categoryMetrics.reduce((sum, m) => sum + m.engagementScore, 0) / categoryMetrics.length
      const totalViews = categoryMetrics.reduce((sum, m) => sum + m.views, 0)
      
      stats[category] = {
        count: categoryMetrics.length,
        avgEngagement: Number(avgEngagement.toFixed(2)),
        totalViews
      }
    }
    
    return stats
  }

  private calculateEngagementScore(metrics: PerformanceMetrics): number {
    // Use the same algorithm as PerformanceTracker
    let score = 0
    
    // Views contribution (base score)
    score += Math.min(2, metrics.views * 0.1)
    
    // Engagement actions (high value)
    const engagementRate = (metrics.likes + metrics.comments + metrics.shares) / Math.max(1, metrics.views)
    score += Math.min(4, engagementRate * 20)
    
    // Time on page (reading engagement)
    const timeMinutes = metrics.timeOnPage / 60000
    score += Math.min(2, timeMinutes * 0.5)
    
    // Scroll depth (content completion)
    score += Math.min(2, metrics.scrollDepth * 0.02)
    
    return Math.min(10, Math.max(0, score))
  }

  private generateArticleId(article: any): string {
    return `${article.title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)}_${Date.now()}`
  }

  private getTimeframeCutoff(timeframe: string): Date {
    const now = Date.now()
    const cutoffs = {
      '1h': now - 3600000,
      '24h': now - 86400000,
      '7d': now - 604800000,
      '30d': now - 2592000000
    }
    
    return new Date(cutoffs[timeframe] || cutoffs['24h'])
  }

  private async generateInsightsFromAnalysis(analysis: any): Promise<void> {
    // Generate insights based on analysis results
    if (analysis.avgEngagementScore > 8) {
      await this.generateInsight({
        type: 'achievement',
        severity: 'low',
        title: 'High Engagement Achievement',
        description: `Average engagement score of ${analysis.avgEngagementScore}/10 - excellent performance!`,
        data: analysis,
        actionRequired: false
      })
    }
  }

  private async sendTrainingFeedback(metrics: PerformanceMetrics[]): Promise<void> {
    // Send high-performing articles to training system
    const highPerformers = metrics.filter(m => m.engagementScore >= 8)
    
    for (const metric of highPerformers) {
      try {
        await fetch('/api/ai/training-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'performance',
            articleId: metric.articleId,
            metrics: metric
          })
        })
      } catch (error) {
        this.log('warning', `Failed to send training feedback for ${metric.articleId}`)
      }
    }
  }

  private startPeriodicReporting(): void {
    this.reportingIntervalId = setInterval(async () => {
      try {
        await this.addTask({
          id: `report_${Date.now()}`,
          type: 'generate-report',
          priority: 'low',
          data: { timeframe: '1h', format: 'summary' },
          createdAt: new Date().toISOString(),
          maxRetries: 1,
          currentRetries: 0
        })
        
        await this.addTask({
          id: `insights_${Date.now()}`,
          type: 'generate-insights',
          priority: 'low',
          data: {},
          createdAt: new Date().toISOString(),
          maxRetries: 1,
          currentRetries: 0
        })
        
      } catch (error) {
        this.log('error', `Periodic reporting failed: ${error}`)
      }
    }, this.analyticsConfig.reportingInterval * 60000)
  }

  private async generateAlert(insight: Omit<PerformanceInsight, 'timestamp'>): Promise<void> {
    const alert: PerformanceInsight = {
      ...insight,
      timestamp: new Date().toISOString()
    }
    
    this.insights.push(alert)
    this.log('warning', `Alert: ${alert.title}`)
  }

  private async generateInsight(insight: Omit<PerformanceInsight, 'timestamp'>): Promise<void> {
    const fullInsight: PerformanceInsight = {
      ...insight,
      timestamp: new Date().toISOString()
    }
    
    this.insights.push(fullInsight)
  }

  private async checkMetricAlerts(metrics: PerformanceMetrics): Promise<void> {
    if (metrics.engagementScore < this.analyticsConfig.alertThresholds.lowEngagement) {
      await this.generateAlert({
        type: 'alert',
        severity: 'medium',
        title: 'Low Engagement Alert',
        description: `Article "${metrics.title}" has low engagement score: ${metrics.engagementScore.toFixed(1)}/10`,
        data: metrics,
        actionRequired: true
      })
    }
    
    if (metrics.qualityScore < this.analyticsConfig.alertThresholds.lowQualityScore) {
      await this.generateAlert({
        type: 'alert',
        severity: 'high',
        title: 'Low Quality Alert',
        description: `Article quality score below threshold: ${metrics.qualityScore.toFixed(1)}/10`,
        data: metrics,
        actionRequired: true
      })
    }
  }

  private analyzeTrends(metrics: PerformanceMetrics[]): PerformanceInsight[] {
    // Analyze trends in the data
    return []
  }

  private generatePerformanceAlerts(metrics: PerformanceMetrics[]): PerformanceInsight[] {
    // Generate performance-based alerts
    return []
  }

  private generateInsightRecommendations(metrics: PerformanceMetrics[]): PerformanceInsight[] {
    // Generate recommendations based on data
    return []
  }

  private detectAchievements(metrics: PerformanceMetrics[]): PerformanceInsight[] {
    // Detect achievements and milestones
    return []
  }
}

export default AnalyticsAgent