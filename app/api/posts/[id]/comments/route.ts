import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { postComments, posts, users } from "@/lib/schema"
import { eq, desc, sql, and } from "drizzle-orm"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if database is properly configured
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("placeholder")) {
      return NextResponse.json({
        success: true,
        comments: [],
        message: "Database not configured - using placeholder data"
      })
    }

    const postId = params.id
    const db = getDb()

    const comments = await db
      .select({
        id: postComments.id,
        content: postComments.content,
        likes: postComments.likes,
        createdAt: postComments.createdAt,
        parentCommentId: postComments.parentCommentId,
        author: {
          id: users.id,
          username: users.username,
          name: users.name,
          avatar: users.avatar,
        },
      })
      .from(postComments)
      .leftJoin(users, eq(postComments.userId, users.id))
      .where(eq(postComments.postId, postId))
      .orderBy(desc(postComments.createdAt))

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ 
      success: true,
      comments: [],
      error: "Database connection failed - using placeholder data" 
    }, { status: 200 })
  }
}

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

    const { content, parentCommentId } = await request.json()
    const postId = params.id
    const db = getDb()

    // Create the comment
    const newComment = await db
      .insert(postComments)
      .values({
        content,
        postId,
        userId: user.id,
        parentCommentId,
      })
      .returning()

    // Increment comments count on post
    await db
      .update(posts)
      .set({ comments: sql`${posts.comments} + 1` })
      .where(eq(posts.id, postId))

    // Get the comment with author info
    const commentWithAuthor = await db
      .select({
        id: postComments.id,
        content: postComments.content,
        likes: postComments.likes,
        createdAt: postComments.createdAt,
        parentCommentId: postComments.parentCommentId,
        author: {
          id: users.id,
          username: users.username,
          name: users.name,
          avatar: users.avatar,
        },
      })
      .from(postComments)
      .leftJoin(users, eq(postComments.userId, users.id))
      .where(eq(postComments.id, newComment[0].id))
      .limit(1)

    return NextResponse.json(commentWithAuthor[0])
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ 
      error: "Failed to create comment" 
    }, { status: 500 })
  }
}