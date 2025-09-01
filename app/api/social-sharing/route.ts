import { NextRequest, NextResponse } from 'next/server'

// POST /api/social-sharing - Handle social media sharing
export async function POST(request: NextRequest) {
  try {
    const { platform, postId, content, author, url } = await request.json()

    // Create share URLs based on platform
    const shareUrls: { [key: string]: string } = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(`${content}\n\n- Shared from Grand Prix Social by ${author}`)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${content}\n\n- Shared from @GrandPrixSocial by ${author}`)}&url=${encodeURIComponent(url)}`,
      instagram: '', // Instagram doesn't support URL sharing
      tiktok: '' // TikTok doesn't support URL sharing
    }

    if (platform === 'instagram' || platform === 'tiktok') {
      // Copy content to clipboard for platforms that don't support URL sharing
      const shareText = `${content}\n\nShared from Grand Prix Social by ${author}\n${url}`
      
      return NextResponse.json({
        success: true,
        copyToClipboard: true,
        text: shareText,
        message: `Content copied! Paste in your ${platform === 'instagram' ? 'Instagram story or post' : 'TikTok video description'}.`
      })
    }

    const shareUrl = shareUrls[platform]
    if (!shareUrl) {
      return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true,
      shareUrl,
      platform 
    })
  } catch (error) {
    console.error('Error handling social share:', error)
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
  }
}