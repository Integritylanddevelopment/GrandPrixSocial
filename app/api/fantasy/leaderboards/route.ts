import { NextResponse } from "next/server"

// Mock leaderboard data (in production, this would be calculated from the database)
const mockLeaderboards = {
  "grand-prix-champions": {
    leagueId: "1",
    leagueName: "Grand Prix Champions",
    lastUpdated: "2024-12-08T15:30:00Z",
    currentRound: 22,
    totalRounds: 24,
    standings: [
      {
        rank: 1,
        teamId: "team_1",
        teamName: "Speed Demons",
        owner: { username: "f1_fanatic", name: "Alex Smith", avatar: "/avatars/user1.jpg" },
        totalPoints: 892,
        lastRacePoints: 45,
        trend: "up", // up, down, stable
        trendChange: 2, // positions moved
        drivers: [
          { name: "Max Verstappen", points: 25, lastRace: "P1" },
          { name: "Charles Leclerc", points: 18, lastRace: "P2" },
          { name: "Lewis Hamilton", points: 15, lastRace: "P3" },
          { name: "Lando Norris", points: 12, lastRace: "P4" },
          { name: "George Russell", points: 10, lastRace: "P5" },
        ]
      },
      {
        rank: 2,
        teamId: "team_2",
        teamName: "Racing Legends", 
        owner: { username: "pole_position", name: "Sarah Johnson", avatar: "/avatars/user2.jpg" },
        totalPoints: 834,
        lastRacePoints: 38,
        trend: "down",
        trendChange: -1,
        drivers: [
          { name: "Charles Leclerc", points: 18, lastRace: "P2" },
          { name: "Carlos Sainz", points: 15, lastRace: "P3" },
          { name: "Oscar Piastri", points: 8, lastRace: "P6" },
          { name: "Alexander Albon", points: 6, lastRace: "P7" },
          { name: "Pierre Gasly", points: 4, lastRace: "P8" },
        ]
      },
      {
        rank: 3,
        teamId: "team_3", 
        teamName: "Podium Chasers",
        owner: { username: "apex_hunter", name: "Mike Wilson", avatar: "/avatars/user3.jpg" },
        totalPoints: 807,
        lastRacePoints: 42,
        trend: "up", 
        trendChange: 1,
        drivers: [
          { name: "Lando Norris", points: 12, lastRace: "P4" },
          { name: "George Russell", points: 10, lastRace: "P5" },
          { name: "Fernando Alonso", points: 8, lastRace: "P6" },
          { name: "Sergio Perez", points: 6, lastRace: "P7" },
          { name: "Esteban Ocon", points: 4, lastRace: "P8" },
        ]
      },
      {
        rank: 4,
        teamId: "team_4",
        teamName: "Grid Warriors",
        owner: { username: "fast_lane", name: "Emma Davis", avatar: "/avatars/user4.jpg" },
        totalPoints: 756,
        lastRacePoints: 28,
        trend: "stable",
        trendChange: 0,
        drivers: [
          { name: "Carlos Sainz", points: 15, lastRace: "P3" },
          { name: "Oscar Piastri", points: 8, lastRace: "P6" },
          { name: "Alexander Albon", points: 6, lastRace: "P7" },
          { name: "Yuki Tsunoda", points: 2, lastRace: "P9" },
          { name: "Kevin Magnussen", points: 0, lastRace: "P12" },
        ]
      },
      {
        rank: 5,
        teamId: "team_5",
        teamName: "Checkered Flags", 
        owner: { username: "turn_one", name: "David Brown", avatar: "/avatars/user5.jpg" },
        totalPoints: 689,
        lastRacePoints: 31,
        trend: "down",
        trendChange: -2,
        drivers: [
          { name: "Fernando Alonso", points: 8, lastRace: "P6" },
          { name: "Esteban Ocon", points: 4, lastRace: "P8" },
          { name: "Pierre Gasly", points: 2, lastRace: "P9" },
          { name: "Zhou Guanyu", points: 1, lastRace: "P10" },
          { name: "Logan Sargeant", points: 0, lastRace: "DNF" },
        ]
      }
    ]
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const leagueId = searchParams.get("leagueId") || "1"
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const userId = searchParams.get("userId") // Get standings for specific user
    
    // Map league ID to leaderboard data
    const leagueKeys: { [key: string]: string } = {
      "1": "grand-prix-champions",
      "grand-prix-champions": "grand-prix-champions"
    }
    
    const leagueKey = leagueKeys[leagueId] || "grand-prix-champions"
    const leaderboard = mockLeaderboards[leagueKey as keyof typeof mockLeaderboards]
    
    if (!leaderboard) {
      return NextResponse.json({ error: "Leaderboard not found" }, { status: 404 })
    }
    
    // Limit results if specified
    const standings = leaderboard.standings.slice(0, limit)
    
    // If userId provided, also include their position if not in top results
    let userStanding = null
    if (userId) {
      const userTeam = leaderboard.standings.find(team => 
        team.owner.username === userId || team.teamId === userId
      )
      if (userTeam && userTeam.rank > limit) {
        userStanding = userTeam
      }
    }
    
    const response = {
      ...leaderboard,
      standings,
      userStanding,
      totalTeams: leaderboard.standings.length,
      showingTop: Math.min(limit, leaderboard.standings.length)
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error("Fantasy leaderboard API error:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}

// Get historical leaderboard data
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { leagueId, round, season = "2024" } = body
    
    // In production, this would fetch historical standings for a specific round
    const historicalData = {
      leagueId,
      season,
      round,
      date: "2024-11-24T20:00:00Z",
      raceName: "Abu Dhabi Grand Prix",
      standings: mockLeaderboards["grand-prix-champions"].standings.map((team, index) => ({
        ...team,
        totalPoints: team.totalPoints - Math.floor(Math.random() * 100), // Simulate historical points
        rank: index + 1
      }))
    }
    
    return NextResponse.json(historicalData)
  } catch (error) {
    console.error("Historical leaderboard API error:", error)
    return NextResponse.json({ error: "Failed to fetch historical leaderboard" }, { status: 500 })
  }
}