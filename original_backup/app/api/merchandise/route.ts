import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { teamMerchandise, teams, sponsors } from "@/lib/schema"
import { desc, eq, and, or, ilike } from "drizzle-orm"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const teamId = searchParams.get("teamId")
    const search = searchParams.get("search")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    let query = db
      .select({
        id: teamMerchandise.id,
        teamId: teamMerchandise.teamId,
        itemName: teamMerchandise.itemName,
        itemType: teamMerchandise.itemType,
        price: teamMerchandise.price,
        imageUrl: teamMerchandise.imageUrl,
        description: teamMerchandise.description,
        inStock: teamMerchandise.inStock,
        sponsorDiscount: teamMerchandise.sponsorDiscount,
        cafeExclusive: teamMerchandise.cafeExclusive,
        createdAt: teamMerchandise.createdAt,
        team: {
          id: teams.id,
          name: teams.name,
          color: teams.color,
          logo: teams.logo,
        },
        sponsor: {
          id: sponsors.id,
          name: sponsors.name,
          logo: sponsors.logo,
          merchandiseDiscount: sponsors.merchandiseDiscount,
        },
      })
      .from(teamMerchandise)
      .leftJoin(teams, eq(teamMerchandise.teamId, teams.id))
      .leftJoin(sponsors, eq(teams.sponsorId, sponsors.id))
      .where(eq(teamMerchandise.inStock, true))
      .orderBy(desc(teamMerchandise.createdAt))
      .limit(limit)

    // Add filters
    const whereConditions = [eq(teamMerchandise.inStock, true)]

    if (category) {
      whereConditions.push(eq(teamMerchandise.itemType, category))
    }

    if (teamId) {
      whereConditions.push(eq(teamMerchandise.teamId, teamId))
    }

    if (search) {
      whereConditions.push(
        or(ilike(teamMerchandise.itemName, `%${search}%`), ilike(teamMerchandise.description, `%${search}%`)),
      )
    }

    if (whereConditions.length > 1) {
      query = query.where(and(...whereConditions))
    }

    const merchandise = await query

    return NextResponse.json({
      success: true,
      merchandise,
      total: merchandise.length,
    })
  } catch (error) {
    console.error("Error fetching merchandise:", error)
    return NextResponse.json({ error: "Failed to fetch merchandise" }, { status: 500 })
  }
}
