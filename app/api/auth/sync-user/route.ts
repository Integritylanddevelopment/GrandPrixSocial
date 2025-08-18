import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { users, insertUserSchema } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, email, name, username, avatar } = body

    if (!id || !email) {
      return NextResponse.json(
        { error: "User ID and email are required" },
        { status: 400 }
      )
    }

    const db = getDb()

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    if (existingUser.length > 0) {
      // User exists, optionally update their info
      await db
        .update(users)
        .set({
          email,
          name: name || existingUser[0].name,
          avatar: avatar || existingUser[0].avatar,
        })
        .where(eq(users.id, id))

      return NextResponse.json({ success: true, action: "updated" })
    } else {
      // Create new user
      const userData = insertUserSchema.parse({
        email,
        name: name || "F1 Fan",
        username: username || `user_${id.slice(0, 8)}`,
        avatar,
      })

      await db.insert(users).values({
        id,
        ...userData,
      })

      return NextResponse.json({ success: true, action: "created" })
    }
  } catch (error) {
    console.error("Error syncing user:", error)
    return NextResponse.json(
      { error: "Failed to sync user" },
      { status: 500 }
    )
  }
}