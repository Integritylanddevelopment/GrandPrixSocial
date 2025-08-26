import { NextResponse } from "next/server"
import { f1Api } from "@/lib/f1-api"

// Mock tournament data
const mockTournaments = [
  {
    id: "tournament_1",
    name: "Abu Dhabi GP Prediction Challenge",
    description: "Predict race winner, podium finishers, and fastest lap for the season finale",
    type: "prediction",
    startDate: "2024-12-06T00:00:00Z",
    endDate: "2024-12-08T16:00:00Z",
    prizePool: 5000,
    status: "active",
    maxParticipants: 1000,
    currentParticipants: 847,
    entryFee: 10,
    requirements: ["Complete beginner tutorial", "Make at least 1 prediction"],
    rewards: {
      first: { prize: 2000, xp: 500, badge: "Champion Predictor" },
      second: { prize: 1000, xp: 300, badge: "Silver Oracle" },
      third: { prize: 500, xp: 200, badge: "Bronze Prophet" },
      participation: { xp: 50 }
    },
    categories: ["Race Winner", "Podium Positions", "Fastest Lap", "First Retirement"],
    difficulty: "medium"
  },
  {
    id: "tournament_2", 
    name: "Season Championship Quiz",
    description: "Test your F1 knowledge with questions about the 2024 season",
    type: "quiz",
    startDate: "2024-12-01T00:00:00Z",
    endDate: "2024-12-31T23:59:59Z",
    prizePool: 2000,
    status: "active",
    maxParticipants: 500,
    currentParticipants: 234,
    entryFee: 5,
    requirements: ["Complete F1 basics course"],
    rewards: {
      first: { prize: 800, xp: 400, badge: "F1 Expert" },
      second: { prize: 400, xp: 250, badge: "F1 Scholar" },
      third: { prize: 200, xp: 150, badge: "F1 Student" },
      participation: { xp: 25 }
    },
    categories: ["Driver Stats", "Team History", "Circuit Knowledge", "Rule Changes"],
    difficulty: "hard"
  },
  {
    id: "tournament_3",
    name: "Fantasy Draft Battle",
    description: "Draft the perfect fantasy team with limited budget constraints",
    type: "fantasy_draft", 
    startDate: "2024-12-10T18:00:00Z",
    endDate: "2024-12-15T20:00:00Z",
    prizePool: 3000,
    status: "upcoming",
    maxParticipants: 200,
    currentParticipants: 156,
    entryFee: 25,
    requirements: ["Own at least 1 fantasy team", "Completed 3+ races in fantasy league"],
    rewards: {
      first: { prize: 1200, xp: 600, badge: "Draft Master" },
      second: { prize: 800, xp: 400, badge: "Strategic Genius" },
      third: { prize: 400, xp: 250, badge: "Tactical Expert" },
      participation: { xp: 75 }
    },
    categories: ["Driver Selection", "Team Strategy", "Budget Management"],
    difficulty: "expert"
  },
  {
    id: "tournament_4",
    name: "Weekly Race Predictions",
    description: "Make predictions for every race weekend including quali and sprint",
    type: "weekly_predictions",
    startDate: "2024-03-01T00:00:00Z", 
    endDate: "2024-12-31T23:59:59Z",
    prizePool: 10000,
    status: "active",
    maxParticipants: 2000,
    currentParticipants: 1678,
    entryFee: 0,
    requirements: ["Account verification"],
    rewards: {
      first: { prize: 4000, xp: 1000, badge: "Season Oracle" },
      second: { prize: 2500, xp: 750, badge: "Prediction King" },
      third: { prize: 1500, xp: 500, badge: "Fortune Teller" },
      participation: { xp: 10 }
    },
    categories: ["Race Results", "Qualifying", "Sprint Race", "Safety Cars"],
    difficulty: "medium"
  },
  {
    id: "tournament_5",
    name: "Circuit Master Challenge",
    description: "Complete challenges specific to each F1 circuit throughout the season",
    type: "circuit_challenge",
    startDate: "2024-03-15T00:00:00Z",
    endDate: "2024-11-30T23:59:59Z", 
    prizePool: 7500,
    status: "completed",
    maxParticipants: 1500,
    currentParticipants: 1234,
    entryFee: 15,
    requirements: ["Visit at least 10 circuits", "Complete track knowledge quiz"],
    rewards: {
      first: { prize: 3000, xp: 800, badge: "Circuit Legend" },
      second: { prize: 2000, xp: 600, badge: "Track Expert" },
      third: { prize: 1000, xp: 400, badge: "Route Runner" },
      participation: { xp: 100 }
    },
    categories: ["Track Knowledge", "Historical Facts", "Lap Records", "Circuit Trivia"],
    difficulty: "hard"
  }
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") // active, upcoming, completed
    const type = searchParams.get("type") // prediction, quiz, fantasy_draft, etc.
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    
    let tournaments = mockTournaments
    
    // Filter by status
    if (status) {
      tournaments = tournaments.filter(t => t.status === status)
    }
    
    // Filter by type
    if (type) {
      tournaments = tournaments.filter(t => t.type === type)
    }
    
    // Limit results
    tournaments = tournaments.slice(0, limit)
    
    // Add real-time data context if available
    try {
      const nextRace = await f1Api.getNextRace()
      if (nextRace) {
        // Add dynamic tournament based on next race
        const dynamicTournament = {
          id: `race_${nextRace.round}_predictions`,
          name: `${nextRace.raceName} Predictions`,
          description: `Make your predictions for ${nextRace.raceName} at ${nextRace.circuit.circuitName}`,
          type: "prediction",
          startDate: new Date(Date.now() - 24*60*60*1000).toISOString(), // Started yesterday
          endDate: nextRace.date,
          prizePool: 1000,
          status: "active",
          maxParticipants: 500,
          currentParticipants: Math.floor(Math.random() * 400) + 50,
          entryFee: 5,
          requirements: ["Account verification"],
          rewards: {
            first: { prize: 400, xp: 200, badge: "Race Prophet" },
            second: { prize: 250, xp: 150, badge: "Podium Predictor" },
            third: { prize: 100, xp: 100, badge: "Grid Guesser" },
            participation: { xp: 25 }
          },
          categories: ["Race Winner", "Podium Positions", "Fastest Lap"],
          difficulty: "medium",
          isLive: true
        }
        
        tournaments.unshift(dynamicTournament)
      }
    } catch (error) {
      console.log("Could not fetch live race data for dynamic tournaments")
    }
    
    return NextResponse.json({
      success: true,
      tournaments,
      total: tournaments.length,
      filters: { status, type, limit }
    })
  } catch (error) {
    console.error("Error fetching tournaments:", error)
    return NextResponse.json({ 
      success: false,
      tournaments: mockTournaments.slice(0, 5),
      error: "Failed to fetch tournaments data"
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body
    
    if (action === "join") {
      const { tournamentId, userId } = body
      
      // In production, this would add the user to the tournament
      const joinResult = {
        success: true,
        tournamentId,
        userId,
        message: "Successfully joined tournament",
        position: Math.floor(Math.random() * 100) + 1,
        joinedAt: new Date().toISOString()
      }
      
      return NextResponse.json(joinResult)
    }
    
    if (action === "submit_entry") {
      const { tournamentId, userId, predictions, answers } = body
      
      // Process tournament entry (predictions, quiz answers, etc.)
      const submissionResult = {
        success: true,
        tournamentId,
        userId, 
        entryId: `entry_${Date.now()}`,
        predictions: predictions?.length || 0,
        answers: answers?.length || 0,
        submittedAt: new Date().toISOString(),
        message: "Entry submitted successfully"
      }
      
      return NextResponse.json(submissionResult)
    }
    
    // Create new tournament (admin functionality)
    const newTournament = {
      id: `tournament_${Date.now()}`,
      ...body,
      status: "upcoming",
      currentParticipants: 0,
      createdAt: new Date().toISOString()
    }
    
    return NextResponse.json(newTournament, { status: 201 })
  } catch (error) {
    console.error("Tournament operation error:", error)
    return NextResponse.json({ error: "Failed to perform tournament operation" }, { status: 500 })
  }
}
