import { NextResponse } from "next/server"
import { f1Api } from "@/lib/f1-api"

// Fantasy scoring rules
const SCORING_SYSTEM = {
  // Position-based points (P1 = 25, P2 = 18, etc.)
  RACE_FINISH: {
    1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1
  },
  
  // Additional fantasy bonuses
  POLE_POSITION: 5,
  FASTEST_LAP: 3,
  DNF_PENALTY: -5,
  CRASH_PENALTY: -10,
  QUALI_BONUS: { 1: 3, 2: 2, 3: 1 }, // Top 3 in qualifying
  POINTS_SCORED: 2, // Bonus for finishing in points
  RACE_COMPLETED: 1, // Bonus for completing the race
  
  // Sprint race scoring (half points)
  SPRINT_MODIFIER: 0.5,
}

interface RaceResult {
  driverId: string
  position: number
  points: number
  grid: number
  laps: number
  status: string
  fastestLap?: boolean
  time?: string
}

interface FantasyScoring {
  driverId: string
  racePoints: number
  bonusPoints: number
  penaltyPoints: number
  totalPoints: number
  breakdown: string[]
}

// Calculate fantasy points for a single driver in a race
function calculateDriverFantasyPoints(result: RaceResult, isSprint = false): FantasyScoring {
  const breakdown: string[] = []
  let racePoints = 0
  let bonusPoints = 0
  let penaltyPoints = 0
  
  // Base race points
  const position = result.position
  if (position <= 10 && position > 0) {
    racePoints = SCORING_SYSTEM.RACE_FINISH[position as keyof typeof SCORING_SYSTEM.RACE_FINISH] || 0
    breakdown.push(`P${position}: +${racePoints} pts`)
  }
  
  // Apply sprint modifier
  if (isSprint) {
    racePoints = Math.round(racePoints * SCORING_SYSTEM.SPRINT_MODIFIER)
    breakdown.push(`Sprint modifier: ${racePoints} pts`)
  }
  
  // Pole position bonus (starting P1)
  if (result.grid === 1) {
    bonusPoints += SCORING_SYSTEM.POLE_POSITION
    breakdown.push(`Pole position: +${SCORING_SYSTEM.POLE_POSITION} pts`)
  }
  
  // Fastest lap bonus
  if (result.fastestLap) {
    bonusPoints += SCORING_SYSTEM.FASTEST_LAP
    breakdown.push(`Fastest lap: +${SCORING_SYSTEM.FASTEST_LAP} pts`)
  }
  
  // Qualifying bonus (grid positions 1-3)
  if (result.grid <= 3) {
    const qualiBonus = SCORING_SYSTEM.QUALI_BONUS[result.grid as keyof typeof SCORING_SYSTEM.QUALI_BONUS] || 0
    bonusPoints += qualiBonus
    breakdown.push(`Grid P${result.grid}: +${qualiBonus} pts`)
  }
  
  // Points scored bonus (finished P1-P10)
  if (position <= 10 && position > 0) {
    bonusPoints += SCORING_SYSTEM.POINTS_SCORED
    breakdown.push(`Points finish: +${SCORING_SYSTEM.POINTS_SCORED} pts`)
  }
  
  // Race completion bonus
  if (result.status === "Finished" || result.status.includes("+")) {
    bonusPoints += SCORING_SYSTEM.RACE_COMPLETED
    breakdown.push(`Race completed: +${SCORING_SYSTEM.RACE_COMPLETED} pts`)
  }
  
  // Penalties
  if (result.status === "Retired" || result.status.includes("DNF")) {
    penaltyPoints += SCORING_SYSTEM.DNF_PENALTY
    breakdown.push(`DNF penalty: ${SCORING_SYSTEM.DNF_PENALTY} pts`)
  }
  
  if (result.status.includes("Accident") || result.status.includes("Collision")) {
    penaltyPoints += SCORING_SYSTEM.CRASH_PENALTY
    breakdown.push(`Crash penalty: ${SCORING_SYSTEM.CRASH_PENALTY} pts`)
  }
  
  const totalPoints = racePoints + bonusPoints + penaltyPoints
  
  return {
    driverId: result.driverId,
    racePoints,
    bonusPoints,
    penaltyPoints,
    totalPoints,
    breakdown
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const season = searchParams.get("season") || "2024"
    const round = searchParams.get("round") || "last"
    const driverId = searchParams.get("driverId")
    
    // Get race results
    const raceData = await f1Api.getRaceResults(season, round)
    
    if (!raceData || !raceData.results) {
      return NextResponse.json({ error: "Race data not found" }, { status: 404 })
    }
    
    const raceResults = raceData.results
    const isSprint = raceData.raceName?.toLowerCase().includes("sprint") || false
    
    // Calculate fantasy scoring for all drivers or specific driver
    const fantasyScoring = raceResults
      .filter((result: any) => !driverId || result.driver.driverId === driverId)
      .map((result: any) => {
        const raceResult: RaceResult = {
          driverId: result.driver.driverId,
          position: Number.parseInt(result.position),
          points: Number.parseInt(result.points),
          grid: Number.parseInt(result.grid),
          laps: Number.parseInt(result.laps),
          status: result.status,
          fastestLap: result.fastestLap?.rank === "1",
          time: result.time?.time
        }
        
        return calculateDriverFantasyPoints(raceResult, isSprint)
      })
    
    // Sort by fantasy points (highest first)
    fantasyScoring.sort((a, b) => b.totalPoints - a.totalPoints)
    
    const response = {
      race: {
        season: raceData.season,
        round: raceData.round,
        raceName: raceData.raceName,
        circuitName: raceData.circuit?.circuitName,
        date: raceData.date,
        isSprint
      },
      scoringSystem: SCORING_SYSTEM,
      results: fantasyScoring
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error("Fantasy scoring API error:", error)
    return NextResponse.json({ error: "Failed to calculate fantasy scoring" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { teamId, drivers } = body
    
    // Calculate total team points for the latest race
    // This would typically update the database with new scores
    
    const mockTeamScoring = {
      teamId,
      totalPoints: drivers.reduce((sum: number, driver: any) => sum + (driver.fantasyPoints || 0), 0),
      drivers: drivers.map((driver: any) => ({
        driverId: driver.id,
        name: `${driver.firstName} ${driver.lastName}`,
        fantasyPoints: driver.fantasyPoints || 0,
        racePosition: driver.position || null
      })),
      calculatedAt: new Date().toISOString()
    }
    
    return NextResponse.json(mockTeamScoring)
  } catch (error) {
    console.error("Team scoring calculation error:", error)
    return NextResponse.json({ error: "Failed to calculate team scoring" }, { status: 500 })
  }
}