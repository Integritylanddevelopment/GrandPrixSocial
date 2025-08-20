import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { platform, postId, content, author, url } = await request.json()

    // Generate platform-specific sharing text
    const shareText = generateShareText(platform, content, author)
    const shareUrl = url || `${process.env.NEXT_PUBLIC_SITE_URL}/cafe#post-${postId}`

    // Return platform-specific sharing URLs
    const sharingUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      instagram: null, // Instagram doesn't support URL sharing - will copy to clipboard
      tiktok: null, // TikTok doesn't support URL sharing - will copy to clipboard
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    }

    const response = {
      platform,
      shareUrl: sharingUrls[platform as keyof typeof sharingUrls],
      shareText,
      clipboardText: `${shareText} ${shareUrl}` // For platforms that need clipboard copy
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error generating share URL:", error)
    return NextResponse.json({ 
      error: "Failed to generate share URL" 
    }, { status: 500 })
  }
}

function generateShareText(platform: string, content: string, author: string): string {
  const baseText = content.length > 100 ? content.substring(0, 100) + "..." : content
  
  switch (platform) {
    case 'twitter':
      return `🏁 "${baseText}" - ${author} on Grand Prix Social #F1 #Formula1 #GrandPrixSocial`
    case 'facebook':
      return `Check out this F1 discussion from ${author}: "${baseText}"`
    case 'instagram':
      return `🏎️ "${baseText}" - ${author} #F1 #Formula1 #GrandPrixSocial`
    case 'tiktok':
      return `🏁 F1 Discussion: "${baseText}" - ${author} #F1 #Formula1`
    case 'linkedin':
      return `Interesting F1 discussion from ${author}: "${baseText}"`
    case 'reddit':
      return `[F1] ${baseText} - Discussion from Grand Prix Social`
    case 'whatsapp':
      return `🏁 F1 Chat: "${baseText}" - ${author}`
    case 'telegram':
      return `🏎️ F1: "${baseText}" - ${author}`
    default:
      return `"${baseText}" - ${author} on Grand Prix Social`
  }
}