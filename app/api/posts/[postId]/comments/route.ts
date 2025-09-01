import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET /api/posts/[postId]/comments - Get comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { postId } = params

    // For now, return sample comments since we're using sample posts
    const sampleComments = [
      {
        id: `comment-${postId}-1`,
        content: 'Great analysis! I completely agree with your take on the race strategy.',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        author: {
          id: 'user-1',
          username: 'f1_enthusiast',
          name: 'Michael Johnson',
          avatar: null
        }
      },
      {
        id: `comment-${postId}-2`, 
        content: 'The tire strategy was definitely the key factor here. Thanks for sharing!',
        created_at: new Date(Date.now() - 1800000).toISOString(),
        author: {
          id: 'user-2',
          username: 'racing_fan',
          name: 'Emma Thompson',
          avatar: null
        }
      }
    ]

    return NextResponse.json(sampleComments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

// POST /api/posts/[postId]/comments - Add a comment to a post
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { postId } = params
    const { content } = await request.json()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    // For now, return a sample comment since we're using sample posts
    const newComment = {
      id: `comment-${postId}-${Date.now()}`,
      content: content.trim(),
      created_at: new Date().toISOString(),
      author: {
        id: user.id,
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
        name: user.user_metadata?.full_name || user.user_metadata?.name || 'F1 Fan',
        avatar: user.user_metadata?.avatar_url || null
      }
    }

    return NextResponse.json(newComment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}