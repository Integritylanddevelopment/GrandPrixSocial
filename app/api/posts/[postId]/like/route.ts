import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// POST /api/posts/[postId]/like - Toggle like on a post
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { postId } = params

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // For sample posts, just return a random like state
    // In a real implementation, you'd check/toggle the like in the database
    const isLiked = Math.random() > 0.5

    return NextResponse.json({ 
      liked: isLiked,
      postId,
      userId: user.id
    })
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 })
  }
}