"use client"

import { useEffect } from 'react'
import { feedbackCollector } from '@/lib/analytics/user-feedback-collector'

interface FeedbackTrackingProps {
  contentId?: string
  contentType: 'article' | 'post' | 'page'
  metadata?: {
    title?: string
    category?: string
    tags?: string[]
  }
}

export function FeedbackTracking({ contentId, contentType, metadata }: FeedbackTrackingProps) {
  useEffect(() => {
    // Track page/content view
    if (contentId) {
      feedbackCollector.trackContentView(contentId, contentType, metadata || {})
    }
  }, [contentId, contentType, metadata])

  return null // This is an invisible tracking component
}

interface TrackingWrapperProps {
  children: React.ReactNode
  contentId?: string
  trackClicks?: boolean
  className?: string
}

export function TrackingWrapper({ children, contentId, trackClicks = true, className }: TrackingWrapperProps) {
  const handleClick = (event: React.MouseEvent) => {
    if (trackClicks) {
      const target = event.target as HTMLElement
      feedbackCollector.trackClick(target, contentId)
    }
  }

  return (
    <div 
      className={className} 
      data-track="true"
      data-content-id={contentId}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}

interface LikeButtonProps {
  contentId: string
  contentType: 'article' | 'post' | 'comment'
  initialLiked?: boolean
  onLikeChange?: (liked: boolean) => void
  children: React.ReactNode
}

export function TrackableLikeButton({ contentId, contentType, initialLiked = false, onLikeChange, children }: LikeButtonProps) {
  const handleLike = () => {
    const newLiked = !initialLiked
    feedbackCollector.trackLike(contentId, contentType, newLiked)
    onLikeChange?.(newLiked)
  }

  return (
    <button onClick={handleLike} data-track="like">
      {children}
    </button>
  )
}

interface CommentFormProps {
  contentId: string
  onComment?: (comment: string) => void
  placeholder?: string
}

export function TrackableCommentForm({ contentId, onComment, placeholder = "Add a comment..." }: CommentFormProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const comment = formData.get('comment') as string
    
    if (comment.trim()) {
      feedbackCollector.trackComment(contentId, comment.length, 'neutral') // Could add sentiment analysis
      onComment?.(comment)
      
      // Clear form
      const form = event.currentTarget
      form.reset()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        name="comment"
        placeholder={placeholder}
        className="w-full p-2 border rounded-md resize-none"
        rows={3}
        data-track="comment-input"
      />
      <button 
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        data-track="comment-submit"
      >
        Post Comment
      </button>
    </form>
  )
}

interface ShareButtonProps {
  contentId: string
  platform: string
  shareUrl?: string
  children: React.ReactNode
}

export function TrackableShareButton({ contentId, platform, shareUrl, children }: ShareButtonProps) {
  const handleShare = () => {
    feedbackCollector.trackShare(contentId, platform)
    
    if (shareUrl) {
      // Open share URL
      if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, '_blank')
      } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
      } else if (platform === 'copy') {
        navigator.clipboard.writeText(shareUrl)
      }
    }
  }

  return (
    <button onClick={handleShare} data-track="share">
      {children}
    </button>
  )
}

interface SearchInputProps {
  onSearch?: (query: string, results: any[]) => void
  placeholder?: string
  className?: string
}

export function TrackableSearchInput({ onSearch, placeholder = "Search F1 content...", className }: SearchInputProps) {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const query = formData.get('search') as string
    
    if (query.trim()) {
      // Perform search (this would call your search API)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const results = await response.json()
        
        feedbackCollector.trackSearch(query, results.length)
        onSearch?.(query, results)
        
      } catch (error) {
        feedbackCollector.trackSearch(query, 0)
        console.error('Search failed:', error)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <input
        name="search"
        type="text"
        placeholder={placeholder}
        className="flex-1 px-3 py-2 border rounded-md"
        data-track="search-input"
      />
      <button 
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        data-track="search-submit"
      >
        Search
      </button>
    </form>
  )
}

// Hook for manual tracking
export function useTracking() {
  return {
    trackClick: (element: HTMLElement, contentId?: string) => 
      feedbackCollector.trackClick(element, contentId),
    trackLike: (contentId: string, contentType: 'article' | 'post' | 'comment', liked: boolean) =>
      feedbackCollector.trackLike(contentId, contentType, liked),
    trackComment: (contentId: string, commentLength: number) =>
      feedbackCollector.trackComment(contentId, commentLength),
    trackShare: (contentId: string, platform: string) =>
      feedbackCollector.trackShare(contentId, platform),
    trackSearch: (query: string, resultsCount: number) =>
      feedbackCollector.trackSearch(query, resultsCount),
    trackView: (contentId: string, contentType: 'article' | 'post', metadata: any) =>
      feedbackCollector.trackContentView(contentId, contentType, metadata)
  }
}