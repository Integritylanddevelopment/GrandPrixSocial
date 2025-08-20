import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { postLikes, posts } from "@/lib/schema"
import { eq, and, sql } from "drizzle-orm"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if database is properly configured
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("placeholder")) {
      return NextResponse.json({
        success: false,
        error: "Database not configured"
      }, { status: 503 })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const postId = params.id
    const db = getDb()

    // Check if user already liked this post
    const existingLike = await db
      .select()
      .from(postLikes)
      .where(and(
        eq(postLikes.postId, postId),
        eq(postLikes.userId, user.id)
      ))
      .limit(1)

    if (existingLike.length > 0) {
      // Unlike the post
      await db
        .delete(postLikes)
        .where(and(
          eq(postLikes.postId, postId),
          eq(postLikes.userId, user.id)
        ))

      // Decrement likes count
      await db
        .update(posts)
        .set({ likes: sql`${posts.likes} - 1` })
        .where(eq(posts.id, postId))

      return NextResponse.json({ liked: false, action: "unliked" })
    } else {
      // Like the post
      await db
        .insert(postLikes)
        .values({
          postId,
          userId: user.id,
        })

      // Increment likes count
      await db
        .update(posts)
        .set({ likes: sql`${posts.likes} + 1` })
        .where(eq(posts.id, postId))

      return NextResponse.json({ liked: true, action: "liked" })
    }
  } catch (error) {
    console.error("Error toggling like:", error)
    return NextResponse.json({ 
      error: "Failed to toggle like" 
    }, { status: 500 })
  }
}