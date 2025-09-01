import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Local Dev Agent API endpoint
const LOCAL_DEV_AGENT_URL = process.env.LOCAL_DEV_AGENT_URL || 'http://localhost:8889'
const LOCAL_LLM_URL = process.env.LOCAL_LLM_URL || 'http://localhost:11434'

export async function POST(req: NextRequest) {
  try {
    const { message, userId, context } = await req.json()

    if (!message || !userId) {
      return NextResponse.json({ error: 'Message and userId required' }, { status: 400 })
    }

    // Get user context for personalized responses
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    // Get user's fantasy teams for context
    const { data: teams } = await supabase
      .from('fantasy_teams')
      .select('*')
      .eq('owner_id', userId)

    // Build context for Claude
    const systemPrompt = buildSystemPrompt(user, teams, context)
    
    // Try local dev agent first, then LLM, then fallback
    let response: string
    try {
      response = await queryLocalDevAgent(systemPrompt, message, context)
    } catch (devAgentError) {
      console.log('Dev agent unavailable, trying direct LLM...')
      try {
        response = await queryLocalLLM(systemPrompt, message)
      } catch (llmError) {
        console.error('Local LLM error:', llmError)
        response = generateFallbackResponse(message, user, teams)
      }
    }

    // Log the conversation
    await supabase.from('claude_conversations').insert({
      user_id: userId,
      message: message,
      response: response,
      context: context,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({ response })

  } catch (error) {
    console.error('Claude chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function buildSystemPrompt(user: any, teams: any[], context: any): string {
  const userName = user?.user_metadata?.name || user?.email || 'there'
  const teamCount = teams?.length || 0
  
  return `You are Claude, a helpful F1 expert and fantasy team assistant for Grand Prix Social. 

User Context:
- Name: ${userName}
- Fantasy Teams: ${teamCount}
- Current page: ${context?.page || 'unknown'}
- User type: ${context?.userType || 'fan'}

You are chatting with ${userName} who has ${teamCount} fantasy F1 team${teamCount !== 1 ? 's' : ''}. 

Your personality:
- Friendly but professional F1 expert
- Passionate about Formula 1 racing
- Great at fantasy strategy advice
- Knowledgeable about drivers, teams, and race history
- Concise but helpful responses (mobile-friendly)

Guidelines:
- Keep responses under 200 words for mobile users
- Use F1 terminology naturally
- Give specific, actionable advice
- Reference current 2025 F1 season when relevant
- Be encouraging about their fantasy performance

Available features you can help with:
- Fantasy team strategy and driver selection
- Race analysis and predictions
- F1 news and updates
- Schedule information
- Driver and team performance analysis
- Historical F1 data and statistics

Current F1 2025 context:
- We're currently in the 2025 season
- Today is August 31st - Dutch Grand Prix day at Zandvoort!
- Popular drivers include Max Verstappen, Lando Norris, Charles Leclerc, Lewis Hamilton
- Major teams: Red Bull, McLaren, Ferrari, Mercedes, Aston Martin

Respond naturally and helpfully to their message.`
}

async function queryLocalDevAgent(systemPrompt: string, userMessage: string, context: any): Promise<string> {
  const response = await fetch(`${LOCAL_DEV_AGENT_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: userMessage,
      context: {
        ...context,
        systemPrompt,
        source: 'grand_prix_social_website'
      }
    }),
    signal: AbortSignal.timeout(15000) // 15 second timeout for dev agent
  })

  if (!response.ok) {
    throw new Error(`Dev Agent API error: ${response.status}`)
  }

  const data = await response.json()
  return data.response || "I'm having trouble processing that right now."
}

async function queryLocalLLM(systemPrompt: string, userMessage: string): Promise<string> {
  const response = await fetch(`${LOCAL_LLM_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen2.5:7b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 300,
      temperature: 0.7,
      stream: false
    }),
    signal: AbortSignal.timeout(10000) // 10 second timeout
  })

  if (!response.ok) {
    throw new Error(`LLM API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || "I'm having trouble processing that right now."
}

function generateFallbackResponse(message: string, user: any, teams: any[]): string {
  const lowerMessage = message.toLowerCase()
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'there'

  // Fantasy-related responses
  if (lowerMessage.includes('fantasy') || lowerMessage.includes('team') || lowerMessage.includes('driver')) {
    if (teams && teams.length > 0) {
      return `Hi ${userName}! I see you have ${teams.length} fantasy team${teams.length !== 1 ? 's' : ''}. For strong fantasy performance this week, consider drivers with good qualifying pace at Zandvoort. Max Verstappen is expensive but reliable, while Lando Norris offers great value. What specific aspect of your fantasy strategy would you like to discuss?`
    } else {
      return `Hi ${userName}! Ready to create your first fantasy F1 team? I'd recommend starting with a balanced approach - one premium driver like Verstappen or Norris, and fill out with consistent midfield performers. The Dutch Grand Prix at Zandvoort rewards quali pace and overtaking ability. Want help building your team?`
    }
  }

  // Race-related responses  
  if (lowerMessage.includes('race') || lowerMessage.includes('zandvoort') || lowerMessage.includes('dutch')) {
    return `Today's the Dutch Grand Prix at Zandvoort! 🏁 This track is unique - banking in the corners, challenging for overtaking, and Max's home race. Expect a passionate Orange Army crowd. Qualifying position is crucial here. Are you watching the race today? Any predictions for the podium?`
  }

  // Schedule-related responses
  if (lowerMessage.includes('schedule') || lowerMessage.includes('next') || lowerMessage.includes('when')) {
    return `After today's Dutch GP, we have the Italian Grand Prix at Monza next weekend (September 7th). Monza is the "Temple of Speed" - completely different from Zandvoort with long straights and slipstream battles. Great for fantasy points from overtaking! What would you like to know about the upcoming races?`
  }

  // General greeting/help
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('help')) {
    return `Hello ${userName}! 👋 I'm here to help with all things F1 and fantasy racing. I can assist with:

• Fantasy team strategy & driver picks
• Race predictions & analysis  
• F1 schedule & race info
• Driver/team performance insights

What would you like to chat about? Today's Dutch GP is live! 🏁`
  }

  // Default response
  return `Hi ${userName}! I'm Claude, your F1 assistant. I can help with fantasy strategy, race analysis, driver insights, and F1 news. Today's Dutch Grand Prix at Zandvoort should be exciting! What would you like to discuss about Formula 1?`
}