import { NextResponse } from "next/server"

// Mock fantasy teams (in production, this would come from the database)
const mockFantasyTeams = [
  {
    id: "team_1",
    name: "Speed Demons",
    owner: { id: "user_1", username: "f1_fanatic", name: "Alex Smith" },
    drivers: [
      { id: "verstappen", firstName: "Max", lastName: "Verstappen", points: 25 },
      { id: "leclerc", firstName: "Charles", lastName: "Leclerc", points: 18 },
      { id: "hamilton", firstName: "Lewis", lastName: "Hamilton", points: 15 },
      { id: "norris", firstName: "Lando", lastName: "Norris", points: 12 },
      { id: "russell", firstName: "George", lastName: "Russell", points: 10 },
    ],
    totalValue: 125000000,
    totalPoints: 80,
    rank: 1,
    league: "Grand Prix Champions",
    createdAt: "2024-03-01T00:00:00Z",
  },
  {
    id: "team_2", 
    name: "Racing Legends",
    owner: { id: "user_2", username: "pole_position", name: "Sarah Johnson" },
    drivers: [
      { id: "leclerc", firstName: "Charles", lastName: "Leclerc", points: 18 },
      { id: "sainz", firstName: "Carlos", lastName: "Sainz", points: 15 },
      { id: "piastri", firstName: "Oscar", lastName: "Piastri", points: 8 },
      { id: "albon", firstName: "Alexander", lastName: "Albon", points: 6 },
      { id: "gasly", firstName: "Pierre", lastName: "Gasly", points: 4 },
    ],
    totalValue: 89000000,
    totalPoints: 51,
    rank: 2,
    league: "Grand Prix Champions",
    createdAt: "2024-03-02T00:00:00Z",
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const leagueId = searchParams.get("leagueId")
    
    let teams = mockFantasyTeams
    
    // Filter by user if provided
    if (userId) {
      teams = teams.filter(team => team.owner.id === userId)
    }
    
    // Filter by league if provided
    if (leagueId) {
      teams = teams.filter(team => team.league === leagueId)
    }
    
    return NextResponse.json(teams)
  } catch (error) {
    console.error("Fantasy teams API error:", error)
    return NextResponse.json({ error: "Failed to fetch fantasy teams" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, drivers, userId, leagueId } = body
    
    // Validate team composition
    if (!name || !drivers || !Array.isArray(drivers)) {
      return NextResponse.json(
        { error: "Team name and drivers array are required" },
        { status: 400 }
      )
    }
    
    if (drivers.length !== 5) {
      return NextResponse.json(
        { error: "Team must have exactly 5 drivers" },
        { status: 400 }
      )
    }
    
    // Calculate team value (this would fetch real driver prices in production)
    const totalValue = drivers.reduce((sum: number, driver: any) => sum + (driver.price || 0), 0)
    
    // Validate budget constraint (100M default)
    const maxBudget = 100000000
    if (totalValue > maxBudget) {
      return NextResponse.json(
        { error: `Team value (${totalValue}) exceeds budget limit (${maxBudget})` },
        { status: 400 }
      )
    }
    
    // Create new team
    const newTeam = {
      id: `team_${Date.now()}`,
      name,
      owner: { id: userId, username: "unknown", name: "Unknown" }, // Would fetch from auth
      drivers,
      totalValue,
      totalPoints: 0,
      rank: 999, // Would calculate based on league standings
      league: leagueId || "default",
      createdAt: new Date().toISOString(),
    }
    
    return NextResponse.json(newTeam, { status: 201 })
  } catch (error) {
    console.error("Fantasy team creation error:", error)
    return NextResponse.json({ error: "Failed to create fantasy team" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { teamId, drivers, transferBudget } = body
    
    // In production, this would update the team in the database
    // and validate transfer rules (transfer windows, budget constraints, etc.)
    
    return NextResponse.json({ 
      success: true, 
      message: "Team updated successfully",
      teamId,
      drivers: drivers.length,
      remainingTransferBudget: transferBudget || 0
    })
  } catch (error) {
    console.error("Fantasy team update error:", error)
    return NextResponse.json({ error: "Failed to update fantasy team" }, { status: 500 })
  }
}