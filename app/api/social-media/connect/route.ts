import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { platform, accessToken, refreshToken } = await request.json()
    const supabase = createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Store social media credentials securely
    // In production, encrypt these tokens
    const { error } = await supabase.from("user_social_accounts").upsert({
      user_id: user.id,
      platform,
      access_token: accessToken,
      refresh_token: refreshToken,
      connected_at: new Date().toISOString(),
      is_active: true,
    })

    if (error) {
      return NextResponse.json({ error: "Failed to connect account" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: `${platform} connected successfully` })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
