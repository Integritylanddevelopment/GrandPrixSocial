import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const interaction = await request.json()
    
    // Store interaction in database
    const { error } = await supabase
      .from('user_interactions')
      .insert([{
        id: interaction.id,
        user_id: interaction.userId,
        session_id: interaction.sessionId,
        interaction_type: interaction.interactionType,
        content_id: interaction.contentId,
        content_type: interaction.contentType,
        metadata: interaction.metadata,
        engagement_score: interaction.engagementScore,
        created_at: new Date(interaction.timestamp).toISOString()
      }])

    if (error) {
      console.error('Error storing interaction:', error)
      return NextResponse.json({ error: 'Failed to store interaction' }, { status: 500 })
    }

    // Update content performance metrics
    if (interaction.contentId && interaction.interactionType !== 'navigation') {
      await updateContentPerformance(interaction.contentId, interaction.interactionType, interaction.engagementScore)
    }

    // Update user preferences if user is logged in
    if (interaction.userId) {
      await updateUserPreferences(interaction.userId, interaction)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function updateContentPerformance(contentId: string, interactionType: string, engagementScore: number) {
  try {
    // Check if performance record exists
    const supabase = getSupabaseClient()
    const { data: existing } = await supabase
      .from('content_performance')
      .select('*')
      .eq('content_id', contentId)
      .single()

    if (existing) {
      // Update existing record
      const updates: any = {}
      
      switch (interactionType) {
        case 'view':
          updates.views = (existing.views || 0) + 1
          break
        case 'like':
          updates.likes = (existing.likes || 0) + (engagementScore > 0 ? 1 : -1)
          break
        case 'comment':
          updates.comments = (existing.comments || 0) + 1
          break
        case 'share':
          updates.shares = (existing.shares || 0) + 1
          break
        case 'scroll':
          // Update time spent and scroll depth
          const currentAvgTime = existing.avg_time_on_page || 0
          const currentViews = existing.views || 1
          const newTime = engagementScore * 1000 // Convert engagement to milliseconds estimate
          updates.avg_time_on_page = ((currentAvgTime * currentViews) + newTime) / (currentViews + 1)
          break
      }

      // Recalculate performance score
      const newMetrics = { ...existing, ...updates }
      updates.performance_score = calculatePerformanceScore(newMetrics)
      updates.updated_at = new Date().toISOString()

      await supabase
        .from('content_performance')
        .update(updates)
        .eq('content_id', contentId)

    } else {
      // Create new performance record
      const initialMetrics = {
        content_id: contentId,
        views: interactionType === 'view' ? 1 : 0,
        likes: interactionType === 'like' ? (engagementScore > 0 ? 1 : 0) : 0,
        comments: interactionType === 'comment' ? 1 : 0,
        shares: interactionType === 'share' ? 1 : 0,
        avg_time_on_page: interactionType === 'scroll' ? engagementScore * 1000 : 0,
        bounce_rate: 0,
        performance_score: engagementScore * 10, // Initial score
        created_at: new Date().toISOString()
      }

      await supabase
        .from('content_performance')
        .insert([initialMetrics])
    }

  } catch (error) {
    console.error('Error updating content performance:', error)
  }
}

async function updateUserPreferences(userId: string, interaction: any) {
  try {
    // Get current preferences
    const supabase = getSupabaseClient()
    const { data: existing } = await supabase
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', userId)
      .single()

    let preferences = existing?.preferences || {
      favoriteTopics: [],
      preferredContentLength: 'medium',
      engagementPatterns: {
        bestTimeToRead: [],
        preferredCategories: [],
        interactionStyle: 'reader'
      },
      f1Interests: {
        favoriteDrivers: [],
        favoriteTeams: [],
        techInterest: 5,
        gossipInterest: 5,
        newsInterest: 5
      }
    }

    // Update preferences based on interaction
    if (interaction.metadata?.category) {
      const category = interaction.metadata.category
      const categories = preferences.engagementPatterns.preferredCategories
      const index = categories.findIndex(c => c.name === category)
      
      if (index >= 0) {
        categories[index].score += interaction.engagementScore
      } else {
        categories.push({ name: category, score: interaction.engagementScore })
      }
    }

    // Update interaction style
    if (interaction.interactionType === 'comment') {
      preferences.engagementPatterns.interactionStyle = 'commenter'
    } else if (interaction.interactionType === 'share') {
      preferences.engagementPatterns.interactionStyle = 'sharer'
    }

    // Update best time to read
    const hour = new Date().getHours()
    const timeSlot = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
    if (!preferences.engagementPatterns.bestTimeToRead.includes(timeSlot)) {
      preferences.engagementPatterns.bestTimeToRead.push(timeSlot)
    }

    // Upsert preferences
    await supabase
      .from('user_preferences')
      .upsert([{
        user_id: userId,
        preferences,
        updated_at: new Date().toISOString()
      }])

  } catch (error) {
    console.error('Error updating user preferences:', error)
  }
}

function calculatePerformanceScore(metrics: any): number {
  let score = 0

  // Views contribution (0-20 points)
  score += Math.min(20, (metrics.views || 0) * 0.1)

  // Engagement contribution (0-40 points)
  const engagementRate = ((metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0)) / Math.max(1, metrics.views || 1)
  score += Math.min(40, engagementRate * 100)

  // Time on page contribution (0-30 points)
  const avgTimeMinutes = (metrics.avg_time_on_page || 0) / 60000
  score += Math.min(30, avgTimeMinutes * 2)

  // Bounce rate penalty (0-10 points deduction)
  score -= Math.min(10, (metrics.bounce_rate || 0) * 10)

  return Math.max(0, Math.min(100, score))
}