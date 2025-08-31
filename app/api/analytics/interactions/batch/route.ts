import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const interactions = await request.json()
    
    if (!Array.isArray(interactions) || interactions.length === 0) {
      return NextResponse.json({ error: 'Invalid interactions data' }, { status: 400 })
    }

    // Batch insert interactions
    const formattedInteractions = interactions.map(interaction => ({
      id: interaction.id,
      user_id: interaction.userId,
      session_id: interaction.sessionId,
      interaction_type: interaction.interactionType,
      content_id: interaction.contentId,
      content_type: interaction.contentType,
      metadata: interaction.metadata,
      engagement_score: interaction.engagementScore,
      created_at: new Date(interaction.timestamp).toISOString()
    }))

    const { error } = await supabase
      .from('user_interactions')
      .insert(formattedInteractions)

    if (error) {
      console.error('Error storing batch interactions:', error)
      return NextResponse.json({ error: 'Failed to store interactions' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      processed: interactions.length 
    })

  } catch (error) {
    console.error('Batch analytics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}