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

    // In production, this would create a new league in the database
    const newLeague = {
      id: Math.random().toString(36).substr(2, 9),
      ...body,
      currentParticipants: 1,
      prizePool: body.entryFee || 0,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(newLeague, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create fantasy league" }, { status: 500 })
  }
}
