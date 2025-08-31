/**
 * User Feedback Collection System
 * Captures all user interactions for Qwen3 fine-tuning
 */

export interface UserInteraction {
  id: string
  userId?: string
  sessionId: string
  timestamp: Date
  interactionType: 'view' | 'click' | 'like' | 'comment' | 'share' | 'scroll' | 'search' | 'navigation'
  contentId?: string
  contentType: 'article' | 'post' | 'comment' | 'page' | 'element'
  metadata: {
    title?: string
    category?: string
    tags?: string[]
    duration?: number
    scrollDepth?: number
    clickPosition?: { x: number, y: number }
    referrer?: string
    deviceType?: 'mobile' | 'desktop' | 'tablet'
    userAgent?: string
  }
  engagementScore: number // 0-10 calculated score
}

export interface ContentPerformance {
  contentId: string
  contentType: 'article' | 'post'
  title: string
  publishedAt: Date
  metrics: {
    views: number
    uniqueViews: number
    avgTimeOnPage: number
    bounceRate: number
    scrollDepth: number
    likes: number
    comments: number
    shares: number
    clickThroughRate: number
  }
  performanceScore: number // 0-100 overall score
  userFeedback: {
    positive: number
    negative: number
    neutral: number
  }
}

export interface UserPreference {
  userId: string
  preferences: {
    favoriteTopics: string[]
    preferredContentLength: 'short' | 'medium' | 'long'
    engagementPatterns: {
      bestTimeToRead: string[]
      preferredCategories: string[]
      interactionStyle: 'reader' | 'commenter' | 'sharer' | 'lurker'
    }
    f1Interests: {
      favoriteDrivers: string[]
      favoriteTeams: string[]
      techInterest: number // 0-10
      gossipInterest: number // 0-10
      newsInterest: number // 0-10
    }
  }
  calculatedAt: Date
}

export class UserFeedbackCollector {
  private baseUrl: string
  private sessionId: string
  private userId?: string

  constructor() {
    this.baseUrl = '/api/analytics'
    this.sessionId = this.generateSessionId()
    this.userId = this.getUserId()
    this.initializeTracking()
  }

  /**
   * Track article/post views
   */
  trackContentView(contentId: string, contentType: 'article' | 'post', metadata: any) {
    const interaction: Partial<UserInteraction> = {
      interactionType: 'view',
      contentId,
      contentType,
      metadata: {
        title: metadata.title,
        category: metadata.category,
        tags: metadata.tags,
        referrer: document.referrer,
        deviceType: this.getDeviceType(),
        userAgent: navigator.userAgent
      },
      engagementScore: 1 // Base view score
    }

    this.recordInteraction(interaction)
    this.startViewTracking(contentId, contentType)
  }

  /**
   * Track user clicks on elements
   */
  trackClick(element: HTMLElement, contentId?: string) {
    const rect = element.getBoundingClientRect()
    const interaction: Partial<UserInteraction> = {
      interactionType: 'click',
      contentId,
      contentType: 'element',
      metadata: {
        clickPosition: {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        },
        deviceType: this.getDeviceType()
      },
      engagementScore: 2 // Click engagement
    }

    this.recordInteraction(interaction)
  }

  /**
   * Track likes/reactions
   */
  trackLike(contentId: string, contentType: 'article' | 'post' | 'comment', liked: boolean) {
    const interaction: Partial<UserInteraction> = {
      interactionType: 'like',
      contentId,
      contentType,
      metadata: {
        liked: liked,
        deviceType: this.getDeviceType()
      },
      engagementScore: liked ? 5 : -2 // Strong positive or mild negative
    }

    this.recordInteraction(interaction)
  }

  /**
   * Track comments
   */
  trackComment(contentId: string, commentLength: number, sentiment?: 'positive' | 'negative' | 'neutral') {
    const interaction: Partial<UserInteraction> = {
      interactionType: 'comment',
      contentId,
      contentType: 'comment',
      metadata: {
        commentLength,
        sentiment,
        deviceType: this.getDeviceType()
      },
      engagementScore: Math.min(10, 3 + Math.floor(commentLength / 50)) // Length-based scoring
    }

    this.recordInteraction(interaction)
  }

  /**
   * Track shares
   */
  trackShare(contentId: string, platform: string) {
    const interaction: Partial<UserInteraction> = {
      interactionType: 'share',
      contentId,
      contentType: 'article',
      metadata: {
        platform,
        deviceType: this.getDeviceType()
      },
      engagementScore: 8 // High engagement action
    }

    this.recordInteraction(interaction)
  }

  /**
   * Track search queries
   */
  trackSearch(query: string, resultsCount: number, clickedResult?: string) {
    const interaction: Partial<UserInteraction> = {
      interactionType: 'search',
      contentType: 'page',
      metadata: {
        query: query.toLowerCase(),
        resultsCount,
        clickedResult,
        deviceType: this.getDeviceType()
      },
      engagementScore: clickedResult ? 4 : 1 // Higher if clicked result
    }

    this.recordInteraction(interaction)
  }

  /**
   * Track scroll depth and time on page
   */
  private startViewTracking(contentId: string, contentType: 'article' | 'post') {
    const startTime = Date.now()
    let maxScroll = 0
    let scrollSamples = 0

    const trackScroll = () => {
      const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
      maxScroll = Math.max(maxScroll, scrollDepth)
      scrollSamples++
    }

    const trackingInterval = setInterval(trackScroll, 1000) // Every second
    window.addEventListener('scroll', trackScroll, { passive: true })

    // Send tracking data when user leaves
    const sendTrackingData = () => {
      const duration = Date.now() - startTime
      const avgScrollDepth = maxScroll

      const interaction: Partial<UserInteraction> = {
        interactionType: 'scroll',
        contentId,
        contentType,
        metadata: {
          duration,
          scrollDepth: avgScrollDepth,
          samples: scrollSamples,
          deviceType: this.getDeviceType()
        },
        engagementScore: this.calculateEngagementScore(duration, avgScrollDepth)
      }

      this.recordInteraction(interaction)
      
      clearInterval(trackingInterval)
      window.removeEventListener('scroll', trackScroll)
      window.removeEventListener('beforeunload', sendTrackingData)
      window.removeEventListener('visibilitychange', sendTrackingData)
    }

    window.addEventListener('beforeunload', sendTrackingData)
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        sendTrackingData()
      }
    })
  }

  /**
   * Calculate engagement score based on behavior
   */
  private calculateEngagementScore(duration: number, scrollDepth: number): number {
    // Base scoring algorithm
    let score = 0

    // Time-based scoring (up to 5 points)
    if (duration > 30000) score += 5      // 30+ seconds
    else if (duration > 15000) score += 3 // 15+ seconds  
    else if (duration > 5000) score += 1  // 5+ seconds

    // Scroll-based scoring (up to 5 points)
    if (scrollDepth > 80) score += 5       // Read most of content
    else if (scrollDepth > 50) score += 3  // Read half
    else if (scrollDepth > 20) score += 1  // Some engagement

    return Math.min(10, score)
  }

  /**
   * Record interaction to backend
   */
  private async recordInteraction(interaction: Partial<UserInteraction>) {
    const fullInteraction: UserInteraction = {
      id: crypto.randomUUID(),
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date(),
      engagementScore: 0,
      ...interaction
    } as UserInteraction

    try {
      // Send to backend (batch multiple interactions)
      await fetch(`${this.baseUrl}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullInteraction)
      })
    } catch (error) {
      console.error('Failed to record interaction:', error)
      // Store locally as fallback
      this.storeLocally(fullInteraction)
    }
  }

  /**
   * Store interaction locally if backend fails
   */
  private storeLocally(interaction: UserInteraction) {
    const stored = JSON.parse(localStorage.getItem('pendingInteractions') || '[]')
    stored.push(interaction)
    
    // Keep only last 100 interactions to prevent storage bloat
    if (stored.length > 100) {
      stored.splice(0, stored.length - 100)
    }
    
    localStorage.setItem('pendingInteractions', JSON.stringify(stored))
  }

  /**
   * Initialize tracking
   */
  private initializeTracking() {
    // Track page navigation
    window.addEventListener('popstate', () => {
      this.trackNavigation(window.location.pathname)
    })

    // Track clicks globally
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      
      // Track specific elements
      if (target.closest('[data-track]')) {
        const contentId = target.closest('[data-content-id]')?.getAttribute('data-content-id')
        this.trackClick(target, contentId)
      }
    }, { passive: true })

    // Send any pending stored interactions
    this.sendPendingInteractions()
  }

  private trackNavigation(path: string) {
    const interaction: Partial<UserInteraction> = {
      interactionType: 'navigation',
      contentType: 'page',
      metadata: {
        path,
        referrer: document.referrer,
        deviceType: this.getDeviceType()
      },
      engagementScore: 1
    }

    this.recordInteraction(interaction)
  }

  private async sendPendingInteractions() {
    const pending = JSON.parse(localStorage.getItem('pendingInteractions') || '[]')
    
    if (pending.length > 0) {
      try {
        await fetch(`${this.baseUrl}/interactions/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pending)
        })
        
        localStorage.removeItem('pendingInteractions')
      } catch (error) {
        console.error('Failed to send pending interactions:', error)
      }
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getUserId(): string | undefined {
    // Get from auth context or localStorage
    return localStorage.getItem('userId') || undefined
  }

  private getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }
}

// Global instance
export const feedbackCollector = new UserFeedbackCollector()