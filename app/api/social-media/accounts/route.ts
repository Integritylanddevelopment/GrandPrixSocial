import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mock connected accounts - in production, fetch from database
    const connectedAccounts = [
      {
        platform: "twitter",
        username: "@f1_fan_2024",
        isConnected: true,
        followers: 1250,
        lastPost: "2024-01-15T10:30:00Z",
      },
      {
        platform: "facebook",
        username: "F1 Racing Fan",
        isConnected: true,
        followers: 890,
        lastPost: "2024-01-14T15:45:00Z",
      },
      {
        platform: "instagram",
        username: "@grandprix_lover",
        isConnected: false,
        followers: 0,
        lastPost: null,
      },
      {
        platform: "tiktok",
        username: "@f1_highlights",
        isConnected: false,
        followers: 0,
        lastPost: null,
      },
    ]

    return NextResponse.json(connectedAccounts)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
