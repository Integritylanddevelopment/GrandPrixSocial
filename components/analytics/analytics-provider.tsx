"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { feedbackCollector } from '@/lib/analytics/user-feedback-collector'

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname()

  useEffect(() => {
    // Track page navigation
    const metadata = {
      path: pathname,
      title: document.title,
      deviceType: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
    }

    // Track initial page view
    feedbackCollector.trackContentView(`page-${pathname}`, 'page', metadata)

    // Track when user leaves page (visibility change)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // User left the page, record final engagement
        feedbackCollector.trackContentView(`page-exit-${pathname}`, 'page', {
          ...metadata,
          action: 'exit',
          timeOnPage: performance.now()
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [pathname])

  return <>{children}</>
}

// Global click tracking wrapper
export function GlobalClickTracker({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      // Track clicks on specific elements
      if (target.dataset.track) {
        const contentId = target.closest('[data-content-id]')?.getAttribute('data-content-id')
        feedbackCollector.trackClick(target, contentId)
      }

      // Track link clicks
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.closest('a') as HTMLAnchorElement
        feedbackCollector.trackClick(target, `link-${link.href}`)
      }

      // Track button clicks
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.closest('button') as HTMLButtonElement
        feedbackCollector.trackClick(target, `button-${button.textContent?.trim()}`)
      }
    }

    document.addEventListener('click', handleGlobalClick, { passive: true })

    return () => {
      document.removeEventListener('click', handleGlobalClick)
    }
  }, [])

  return <>{children}</>
}

// Combine both providers
export function CompleteAnalyticsProvider({ children }: AnalyticsProviderProps) {
  return (
    <AnalyticsProvider>
      <GlobalClickTracker>
        {children}
      </GlobalClickTracker>
    </AnalyticsProvider>
  )
}