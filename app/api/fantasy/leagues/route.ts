import { NextResponse } from "next/server"

// Mock fantasy league data
const mockFantasyLeagues = [
  {
    id: "1",
    name: "Grand Prix Champions",
    description: "The ultimate F1 fantasy league for serious fans",
    creator: { id: "1", username: "f1_master", name: "John Smith" },
    maxParticipants: 20,
    currentParticipants: 15,
    entryFee: 1000,
    prizePool: 15000,
    budget: 100000000,
    isPublic: true,
    isActive: true,
    season: "2024",
    startDate: "2024-03-01T00:00:00Z",
    endDate: "2024-12-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Rookie Racers",
    description: "Perfect for F1 fantasy beginners",
    creator: { id: "2", username: "newbie_racer", name: "Sarah Johnson" },
    maxParticipants: 50,
    currentParticipants: 32,
    entryFee: 0,
    prizePool: 0,
    budget: 100000000,
    isPublic: true,
    isActive: true,
    season: "2024",
    startDate: "2024-03-01T00:00:00Z",
    endDate: "2024-12-01T00:00:00Z",
  },
  {
    id: "3",
    name: "High Stakes Racing",
    description: "Big budgets, bigger rewards",
    creator: { id: "3", username: "whale_racer", name: "Mike Wilson" },
    maxParticipants: 10,
    currentParticipants: 8,
    entryFee: 5000,
    prizePool: 40000,
    budget: 150000000,
    isPublic: true,
    isActive: true,
    season: "2024",
    startDate: "2024-03-01T00:00:00Z",
    endDate: "2024-12-01T00:00:00Z",
  },
]

export async function GET() {
  try {
    return NextResponse.json(mockFantasyLeagues)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch fantasy leagues" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === "join") {
      // Join an existing league
      const { leagueId, userId, teamId } = body
      
      // In production, this would add the user to the league in the database
      const joinResult = {
        success: true,
        leagueId,
        userId,
        teamId,
        message: "Successfully joined league",
        joinedAt: new Date().toISOString(),
      }
      
      return NextResponse.json(joinResult)
    }
    
    if (action === "leave") {
      // Leave a league
      const { leagueId, userId } = body
      
      const leaveResult = {
        success: true,
        leagueId,
        userId,
        message: "Successfully left league",
        leftAt: new Date().toISOString(),
      }
      
      return NextResponse.json(leaveResult)
    }

    // Create a new league (default behavior)
    const newLeague = {
      id: Math.random().toString(36).substr(2, 9),
      ...body,
      currentParticipants: 1,
      prizePool: body.entryFee * 1 || 0,
      createdAt: new Date().toISOString(),
      status: "active",
      transfersEnabled: true,
      transferBudget: body.budget * 0.1 || 10000000, // 10% of total budget for transfers
    }

    return NextResponse.json(newLeague, { status: 201 })
  } catch (error) {
    console.error("Fantasy league operation error:", error)
    return NextResponse.json({ error: "Failed to perform league operation" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { leagueId, settings, action } = body
    
    if (action === "update_settings") {
      // Update league settings (admin only in production)
      const updatedSettings = {
        leagueId,
        settings,
        updatedAt: new Date().toISOString(),
        message: "League settings updated successfully"
      }
      
      return NextResponse.json(updatedSettings)
    }
    
    if (action === "start_season") {
      // Start the fantasy season
      const seasonStart = {
        leagueId,
        status: "active",
        seasonStarted: true,
        startedAt: new Date().toISOString(),
        message: "Fantasy season started"
      }
      
      return NextResponse.json(seasonStart)
    }
    
    if (action === "end_season") {
      // End the fantasy season and calculate final standings
      const seasonEnd = {
        leagueId,
        status: "completed",
        seasonEnded: true,
        endedAt: new Date().toISOString(),
        finalStandingsCalculated: true,
        message: "Fantasy season ended and final standings calculated"
      }
      
      return NextResponse.json(seasonEnd)
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Fantasy league update error:", error)
    return NextResponse.json({ error: "Failed to update league" }, { status: 500 })
  }
}
