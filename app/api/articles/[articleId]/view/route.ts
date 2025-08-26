import { NextResponse } from "next/server"
import fs from 'fs/promises'
import path from 'path'

const viewsDir = path.join(process.cwd(), 'data', 'views')

async function ensureViewsDir() {
  try {
    await fs.mkdir(viewsDir, { recursive: true })
  } catch (error) {
    // Directory might already exist
  }
}

async function getViewsFile(articleId: string) {
  await ensureViewsDir()
  return path.join(viewsDir, `${articleId}.json`)
}

export async function POST(
  request: Request,
  { params }: { params: { articleId: string } }
) {
  try {
    const viewsFile = await getViewsFile(params.articleId)
    
    let viewData = { views: 0, lastViewed: new Date().toISOString() }
    
    try {
      const data = await fs.readFile(viewsFile, 'utf-8')
      viewData = JSON.parse(data)
    } catch {
      // No existing views file
    }
    
    // Increment view count
    viewData.views += 1
    viewData.lastViewed = new Date().toISOString()
    
    await fs.writeFile(viewsFile, JSON.stringify(viewData, null, 2))
    
    return NextResponse.json({
      success: true,
      views: viewData.views
    })
  } catch (error) {
    console.error('Failed to track view:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to track view'
    }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { articleId: string } }
) {
  try {
    const viewsFile = await getViewsFile(params.articleId)
    
    try {
      const data = await fs.readFile(viewsFile, 'utf-8')
      const viewData = JSON.parse(data)
      
      return NextResponse.json({
        success: true,
        views: viewData.views || 0
      })
    } catch {
      // No views file exists yet
      return NextResponse.json({
        success: true,
        views: 0
      })
    }
  } catch (error) {
    console.error('Failed to get views:', error)
    return NextResponse.json({
      success: false,
      views: 0
    }, { status: 500 })
  }
}