/**
 * Article Performance Tracker
 * Tracks user engagement and feeds data back to Qwen for training
 */

interface ArticlePerformance {
  articleId: string
  views: number
  likes: number
  comments: number
  shares: number
  timeOnPage: number
  scrollDepth: number
  engagementScore: number
  category: string
  generatedByAI: boolean
  timestamp: string
}

export class PerformanceTracker {
  private pendingMetrics: Map<string, Partial<ArticlePerformance>> = new Map()
  private flushInterval: number = 30000 // 30 seconds

  constructor() {
    // Auto-flush metrics periodically
    setInterval(() => {
      this.flushMetrics()
    }, this.flushInterval)

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flushMetrics()
      })
    }
  }

  /**
   * Track article view
   */
  trackView(articleId: string, metadata: { category: string, generatedByAI: boolean }): void {
    this.updateMetric(articleId, {
      articleId,
      views: 1,
      category: metadata.category,
      generatedByAI: metadata.generatedByAI,
      timestamp: new Date().toISOString()
    })

    console.log(`👀 Article view tracked: ${articleId}`)
  }

  /**
   * Track user engagement (like, comment, share)
   */
  trackEngagement(articleId: string, type: 'like' | 'comment' | 'share', value: number = 1): void {
    const update: Partial<ArticlePerformance> = {}
    
    switch (type) {
      case 'like':
        update.likes = (this.getMetric(articleId)?.likes || 0) + value
        break
      case 'comment':
        update.comments = (this.getMetric(articleId)?.comments || 0) + value
        break
      case 'share':
        update.shares = (this.getMetric(articleId)?.shares || 0) + value
        break
    }

    this.updateMetric(articleId, update)
    console.log(`💫 Engagement tracked: ${articleId} ${type} +${value}`)
  }

  /**
   * Track time spent reading
   */
  trackTimeOnPage(articleId: string, timeMs: number): void {
    const current = this.getMetric(articleId)?.timeOnPage || 0
    this.updateMetric(articleId, {
      timeOnPage: Math.max(current, timeMs) // Use max to handle multiple tracking calls
    })

    console.log(`⏱️ Reading time tracked: ${articleId} ${(timeMs/1000).toFixed(1)}s`)
  }

  /**
   * Track scroll depth
   */
  trackScrollDepth(articleId: string, depth: number): void {
    const current = this.getMetric(articleId)?.scrollDepth || 0
    this.updateMetric(articleId, {
      scrollDepth: Math.max(current, depth)
    })
  }

  /**
   * Calculate and track engagement score
   */
  calculateEngagementScore(articleId: string): number {
    const metrics = this.getMetric(articleId)
    if (!metrics) return 0

    // Engagement score algorithm (0-10 scale)
    let score = 0

    // Views contribution (base score)
    score += Math.min(2, (metrics.views || 0) * 0.1)

    // Engagement actions (high value)
    const engagementRate = ((metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0)) / Math.max(1, metrics.views || 1)
    score += Math.min(4, engagementRate * 20)

    // Time on page (reading engagement)
    const timeMinutes = (metrics.timeOnPage || 0) / 60000
    score += Math.min(2, timeMinutes * 0.5)

    // Scroll depth (content completion)
    score += Math.min(2, (metrics.scrollDepth || 0) * 0.02)

    const finalScore = Math.min(10, Math.max(0, score))
    
    this.updateMetric(articleId, { engagementScore: finalScore })
    return finalScore
  }

  /**
   * Update metric for an article
   */
  private updateMetric(articleId: string, update: Partial<ArticlePerformance>): void {
    const current = this.pendingMetrics.get(articleId) || {}
    this.pendingMetrics.set(articleId, { ...current, ...update })
  }

  /**
   * Get current metrics for an article
   */
  private getMetric(articleId: string): Partial<ArticlePerformance> | undefined {
    return this.pendingMetrics.get(articleId)
  }

  /**
   * Flush metrics to training system
   */
  async flushMetrics(): Promise<void> {
    if (this.pendingMetrics.size === 0) return

    console.log(`📊 Flushing ${this.pendingMetrics.size} performance metrics`)

    const metricsToFlush = Array.from(this.pendingMetrics.entries())
    this.pendingMetrics.clear()

    try {
      for (const [articleId, metrics] of metricsToFlush) {
        // Calculate final engagement score
        const engagementScore = this.calculateEngagementScore(articleId)
        
        const performanceData = {
          ...metrics,
          engagementScore,
          timestamp: new Date().toISOString()
        }

        // Send to training feedback system
        await fetch('/api/ai/training-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'performance',
            articleId,
            metrics: performanceData
          })
        })

        console.log(`✅ Performance data sent: ${articleId} (score: ${engagementScore.toFixed(1)})`)
      }
    } catch (error) {
      console.error('Failed to flush performance metrics:', error)
      
      // Re-queue metrics on failure
      for (const [articleId, metrics] of metricsToFlush) {
        this.pendingMetrics.set(articleId, metrics)
      }
    }
  }

  /**
   * Get current pending metrics (for debugging)
   */
  getPendingMetrics(): Map<string, Partial<ArticlePerformance>> {
    return this.pendingMetrics
  }

  /**
   * Force flush (for testing)
   */
  async forceFlush(): Promise<void> {
    await this.flushMetrics()
  }
}

// Global performance tracker instance
export const performanceTracker = new PerformanceTracker()

/**
 * React hook for easy performance tracking
 */
export function usePerformanceTracking(articleId: string, metadata: { category: string, generatedByAI: boolean }) {
  const trackView = () => {
    performanceTracker.trackView(articleId, metadata)
  }

  const trackLike = () => {
    performanceTracker.trackEngagement(articleId, 'like')
  }

  const trackComment = () => {
    performanceTracker.trackEngagement(articleId, 'comment')
  }

  const trackShare = () => {
    performanceTracker.trackEngagement(articleId, 'share')
  }

  const trackReadingTime = (timeMs: number) => {
    performanceTracker.trackTimeOnPage(articleId, timeMs)
  }

  const trackScroll = (depth: number) => {
    performanceTracker.trackScrollDepth(articleId, depth)
  }

  return {
    trackView,
    trackLike,
    trackComment,  
    trackShare,
    trackReadingTime,
    trackScroll
  }
}

export default PerformanceTracker