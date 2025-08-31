import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { posts, users, teams } from "@/lib/schema"
import { desc, eq } from "drizzle-orm"

export async function GET() {
  try {
    // Check if database is properly configured
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("placeholder")) {
      return NextResponse.json({
        success: false,
        error: "Database not configured. Please configure DATABASE_URL in .env.local",
        details: "The database connection string is missing or invalid"
      }, { status: 500 })
    }

    const db = getDb()
    
    const postsData = await db
      .select({
        id: posts.id,
        content: posts.content,
        images: posts.images,
        likes: posts.likes,
        comments: posts.comments,
        createdAt: posts.createdAt,
        author: {
          id: users.id,
          username: users.username,
          name: users.name,
          avatar: users.avatar,
          favoriteTeam: users.favoriteTeam,
        },
        team: {
          id: teams.id,
          name: teams.name,
          color: teams.color,
          logo: teams.logo,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(teams, eq(posts.teamId, teams.id))
      .orderBy(desc(posts.createdAt))
      .limit(50)

    // Transform data to match the expected format
    const transformedPosts = postsData.map(post => ({
      id: post.id,
      content: post.content,
      images: post.images,
      likes: post.likes,
      comments: post.comments,
      createdAt: post.createdAt,
      author: post.author,
      team: post.team,
      isLiked: false, // Will be determined client-side based on user
    }))

    return NextResponse.json(transformedPosts)
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ 
      success: false,
      error: "Database connection failed: " + (error as Error).message 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Check if database is properly configured
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("placeholder")) {
      return NextResponse.json({
        success: false,
        error: "Database not configured"
      }, { status: 503 })
    }

    const { content, images, authorId, teamId } = await request.json()
    const db = getDb()

    const newPost = await db
      .insert(posts)
      .values({
        content,
        images,
        authorId,
        teamId,
      })
      .returning()

    return NextResponse.json(newPost[0])
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ 
      success: false,
      error: "Server error creating post: " + (error as Error).message 
    }, { status: 500 })
  }
}
