import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        images,
        likes,
        comments,
        created_at,
        author:users!posts_author_id_fkey (
          id,
          username,
          name,
          avatar,
          favorite_team
        ),
        team:teams!posts_team_id_fkey (
          id,
          name,
          color,
          logo
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error("Supabase error:", error)
      
      // Check if it's an auth error (invalid API keys)
      if (error.message.includes('Invalid API key')) {
        return NextResponse.json({ 
          success: false,
          error: "Database authentication failed. Please configure valid Supabase API keys in .env.local",
          details: "The current Supabase API keys are invalid or expired"
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: false,
        error: "Database error: " + error.message 
      }, { status: 500 })
    }

    return NextResponse.json(posts || [])
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ 
      success: false,
      error: "Server error fetching posts" 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { content, images, authorId, teamId } = await request.json()

    const { data: newPost, error } = await supabase
      .from('posts')
      .insert({
        content,
        images,
        author_id: authorId,
        team_id: teamId,
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error creating post:", error)
      return NextResponse.json({ 
        success: false,
        error: "Failed to create post: " + error.message 
      }, { status: 500 })
    }

    return NextResponse.json(newPost)
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ 
      success: false,
      error: "Server error creating post" 
    }, { status: 500 })
  }
}
