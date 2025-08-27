import { NextResponse } from "next/server"
import fs from 'fs/promises'
import path from 'path'

const commentsDir = path.join(process.cwd(), 'data', 'comments')

async function ensureCommentsDir() {
  try {
    await fs.mkdir(commentsDir, { recursive: true })
  } catch (error) {
    // Directory might already exist
  }
}

async function getCommentsFile(articleId: string) {
  await ensureCommentsDir()
  return path.join(commentsDir, `${articleId}.json`)
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const { articleId } = await params
    const commentsFile = await getCommentsFile(articleId)
    
    try {
      const data = await fs.readFile(commentsFile, 'utf-8')
      const comments = JSON.parse(data)
      
      return NextResponse.json({
        success: true,
        comments: comments.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      })
    } catch {
      // No comments file exists yet
      return NextResponse.json({
        success: true,
        comments: []
      })
    }
  } catch (error) {
    console.error('Failed to get comments:', error)
    return NextResponse.json({
      success: false,
      comments: []
    }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const { articleId } = await params
    const newComment = await request.json()
    const commentsFile = await getCommentsFile(articleId)
    
    let comments = []
    try {
      const data = await fs.readFile(commentsFile, 'utf-8')
      comments = JSON.parse(data)
    } catch {
      // No existing comments
    }
    
    // Add new comment
    const comment = {
      ...newComment,
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      likes: 0
    }
    
    comments.unshift(comment)
    
    // Keep only latest 100 comments per article
    comments = comments.slice(0, 100)
    
    await fs.writeFile(commentsFile, JSON.stringify(comments, null, 2))
    
    return NextResponse.json({
      success: true,
      comment
    })
  } catch (error) {
    console.error('Failed to post comment:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to post comment'
    }, { status: 500 })
  }
}