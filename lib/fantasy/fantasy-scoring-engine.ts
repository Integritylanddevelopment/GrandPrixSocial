/**
 * Fantasy Formula Scoring Engine
 * Calculates points based on real F1 race results and driver performance
 */

export interface Driver {
  id: string
  firstName: string
  lastName: string
  team: string
  number: number
  price: number // In millions (e.g., 25.5 = $25.5M)
  status: 'active' | 'injured' | 'suspended'
}

export interface RaceResult {
  raceId: string
  raceName: string
  raceDate: string
  driverResults: DriverResult[]
  fastestLap?: {
    driverId: string
    time: string
  }
  polePosition?: string // driverId
  weather: 'dry' | 'wet' | 'mixed'
}

export interface DriverResult {
  driverId: string
  position: number // Final position (1-20, or 0 if DNF)
  startingPosition: number
  pointsEarned: number // Official F1 points
  dnf: boolean
  fastestLap: boolean
  lapsCompleted: number
  totalLaps: number
}

export interface FantasyTeam {
  id: string
  name: string
  ownerId: string
  drivers: string[] // Array of driver IDs (max 5-6 drivers)
  totalValue: number
  budget: number // Remaining budget in millions
  captain: string // Driver ID for captain (2x points)
  viceCaptain: string // Driver ID for vice captain (1.5x points)
}

export interface FantasyScoring {
  driverId: string
  raceId: string
  basePoints: number
  bonusPoints: number
  penaltyPoints: number
  totalPoints: number
  multiplier: number // 1.0, 1.5, or 2.0 for captain/vice-captain
  breakdown: {
    positionPoints: number
    overtakePoints: number
    fastestLapBonus: number
    polePositionBonus: number
    finishBonus: number
    dnfPenalty: number
  }
}

export class FantasyFormulaEngine {
  // Scoring system configuration
  private readonly POSITION_POINTS = {
    1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
    6: 8, 7: 6, 8: 4, 9: 2, 10: 1
  }

  private readonly BONUS_POINTS = {
    FASTEST_LAP: 5,
    POLE_POSITION: 3,
    FINISH_RACE: 2, // Bonus for completing the race
    OVERTAKE: 1, // Per position gained from start
    TOP_3_FINISH: 5, // Additional bonus for podium
    POINTS_FINISH: 2, // Bonus for finishing in points (top 10)
  }

  private readonly PENALTY_POINTS = {
    DNF: -5,
    LAST_PLACE: -2,
    CRASH: -3, // If driver causes collision
    PENALTY: -1 // Per penalty point received
  }

  /**
   * Calculate fantasy points for a driver in a specific race
   */
  calculateDriverPoints(
    driver: Driver,
    raceResult: RaceResult,
    teamConfig?: { isCaptain?: boolean; isViceCaptain?: boolean }
  ): FantasyScoring {
    const driverResult = raceResult.driverResults.find(r => r.driverId === driver.id)
    if (!driverResult) {
      throw new Error(`No race result found for driver ${driver.id}`)
    }

    const breakdown = {
      positionPoints: this.getPositionPoints(driverResult.position),
      overtakePoints: this.getOvertakePoints(driverResult.startingPosition, driverResult.position),
      fastestLapBonus: driverResult.fastestLap ? this.BONUS_POINTS.FASTEST_LAP : 0,
      polePositionBonus: raceResult.polePosition === driver.id ? this.BONUS_POINTS.POLE_POSITION : 0,
      finishBonus: this.getFinishBonus(driverResult),
      dnfPenalty: driverResult.dnf ? this.PENALTY_POINTS.DNF : 0,
    }

    const basePoints = breakdown.positionPoints
    const bonusPoints = breakdown.overtakePoints + breakdown.fastestLapBonus + 
                      breakdown.polePositionBonus + breakdown.finishBonus
    const penaltyPoints = breakdown.dnfPenalty

    const totalBeforeMultiplier = basePoints + bonusPoints + penaltyPoints
    
    // Apply captain/vice-captain multiplier
    let multiplier = 1.0
    if (teamConfig?.isCaptain) multiplier = 2.0
    else if (teamConfig?.isViceCaptain) multiplier = 1.5

    const totalPoints = Math.round(totalBeforeMultiplier * multiplier)

    return {
      driverId: driver.id,
      raceId: raceResult.raceId,
      basePoints,
      bonusPoints,
      penaltyPoints,
      totalPoints,
      multiplier,
      breakdown
    }
  }

  /**
   * Calculate total points for a fantasy team in a race
   */
  calculateTeamPoints(
    team: FantasyTeam,
    drivers: Driver[],
    raceResult: RaceResult
  ): {
    teamId: string
    raceId: string
    totalPoints: number
    driverScores: FantasyScoring[]
    breakdown: {
      captainPoints: number
      viceCaptainPoints: number
      regularPoints: number
    }
  } {
    const driverScores: FantasyScoring[] = []
    let captainPoints = 0
    let viceCaptainPoints = 0
    let regularPoints = 0

    for (const driverId of team.drivers) {
      const driver = drivers.find(d => d.id === driverId)
      if (!driver) continue

      const teamConfig = {
        isCaptain: driverId === team.captain,
        isViceCaptain: driverId === team.viceCaptain
      }

      try {
        const scoring = this.calculateDriverPoints(driver, raceResult, teamConfig)
        driverScores.push(scoring)

        if (teamConfig.isCaptain) {
          captainPoints += scoring.totalPoints
        } else if (teamConfig.isViceCaptain) {
          viceCaptainPoints += scoring.totalPoints
        } else {
          regularPoints += scoring.totalPoints
        }
      } catch (error) {
        console.warn(`Failed to calculate points for driver ${driverId}:`, error)
      }
    }

    const totalPoints = captainPoints + viceCaptainPoints + regularPoints

    return {
      teamId: team.id,
      raceId: raceResult.raceId,
      totalPoints,
      driverScores,
      breakdown: {
        captainPoints,
        viceCaptainPoints,
        regularPoints
      }
    }
  }

  /**
   * Get points based on finishing position
   */
  private getPositionPoints(position: number): number {
    if (position <= 0) return 0 // DNF
    return this.POSITION_POINTS[position as keyof typeof this.POSITION_POINTS] || 0
  }

  /**
   * Calculate overtake bonus (points for positions gained)
   */
  private getOvertakePoints(startPos: number, finishPos: number): number {
    if (finishPos <= 0) return 0 // DNF
    
    const positionsGained = Math.max(0, startPos - finishPos)
    return positionsGained * this.BONUS_POINTS.OVERTAKE
  }

  /**
   * Calculate finish bonus points
   */
  private getFinishBonus(driverResult: DriverResult): number {
    let bonus = 0

    // Bonus for completing the race
    if (!driverResult.dnf) {
      bonus += this.BONUS_POINTS.FINISH_RACE
    }

    // Bonus for top 3 finish
    if (driverResult.position <= 3 && driverResult.position > 0) {
      bonus += this.BONUS_POINTS.TOP_3_FINISH
    }

    // Bonus for points finish (top 10)
    if (driverResult.position <= 10 && driverResult.position > 0) {
      bonus += this.BONUS_POINTS.POINTS_FINISH
    }

    return bonus
  }

  /**
   * Calculate season-long standings for a league
   */
  calculateSeasonStandings(
    teams: FantasyTeam[],
    drivers: Driver[],
    raceResults: RaceResult[]
  ): {
    teamId: string
    teamName: string
    totalPoints: number
    raceScores: { raceId: string; points: number }[]
    rank: number
  }[] {
    const teamStandings = teams.map(team => {
      const raceScores: { raceId: string; points: number }[] = []
      let totalPoints = 0

      for (const raceResult of raceResults) {
        const teamScore = this.calculateTeamPoints(team, drivers, raceResult)
        raceScores.push({
          raceId: raceResult.raceId,
          points: teamScore.totalPoints
        })
        totalPoints += teamScore.totalPoints
      }

      return {
        teamId: team.id,
        teamName: team.name,
        totalPoints,
        raceScores
      }
    })

    // Sort by total points (descending) and assign ranks
    teamStandings.sort((a, b) => b.totalPoints - a.totalPoints)
    
    return teamStandings.map((team, index) => ({
      ...team,
      rank: index + 1
    }))
  }

  /**
   * Validate team composition and budget
   */
  validateTeam(team: FantasyTeam, drivers: Driver[]): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    // Check driver count
    if (team.drivers.length < 5) {
      errors.push('Team must have at least 5 drivers')
    }
    if (team.drivers.length > 6) {
      errors.push('Team cannot have more than 6 drivers')
    }

    // Check budget
    const totalValue = team.drivers.reduce((sum, driverId) => {
      const driver = drivers.find(d => d.id === driverId)
      return sum + (driver?.price || 0)
    }, 0)

    if (totalValue > 100) { // $100M budget
      errors.push(`Team value (${totalValue.toFixed(1)}M) exceeds budget limit (100M)`)
    }

    // Check captain and vice-captain
    if (!team.drivers.includes(team.captain)) {
      errors.push('Captain must be one of the selected drivers')
    }
    if (!team.drivers.includes(team.viceCaptain)) {
      errors.push('Vice-captain must be one of the selected drivers')
    }
    if (team.captain === team.viceCaptain) {
      errors.push('Captain and vice-captain must be different drivers')
    }

    // Check for duplicate drivers
    const uniqueDrivers = new Set(team.drivers)
    if (uniqueDrivers.size !== team.drivers.length) {
      errors.push('Team cannot have duplicate drivers')
    }

    // Check driver status
    team.drivers.forEach(driverId => {
      const driver = drivers.find(d => d.id === driverId)
      if (driver?.status !== 'active') {
        warnings.push(`Driver ${driver?.firstName} ${driver?.lastName} is not active`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Generate AI recommendations for team selection
   */
  generateTeamRecommendations(
    drivers: Driver[],
    recentRaceResults: RaceResult[],
    budget: number = 100
  ): {
    recommendedTeam: string[] // Driver IDs
    reasoning: string[]
    expectedPoints: number
    confidence: number
  } {
    const activeDrivers = drivers.filter(d => d.status === 'active')
    
    // Calculate average performance over recent races
    const driverPerformance = activeDrivers.map(driver => {
      const recentPoints = recentRaceResults.map(race => {
        try {
          const scoring = this.calculateDriverPoints(driver, race)
          return scoring.totalPoints
        } catch {
          return 0
        }
      })
      
      const avgPoints = recentPoints.reduce((a, b) => a + b, 0) / Math.max(1, recentPoints.length)
      const consistency = 1 - (this.calculateStandardDeviation(recentPoints) / Math.max(1, avgPoints))
      const valueRatio = avgPoints / driver.price // Points per million spent
      
      return {
        driver,
        avgPoints,
        consistency: Math.max(0, consistency),
        valueRatio,
        score: avgPoints * 0.4 + consistency * 0.3 + valueRatio * 0.3
      }
    })

    // Sort by performance score
    driverPerformance.sort((a, b) => b.score - a.score)

    // Select team using greedy algorithm with budget constraint
    const selectedDrivers: string[] = []
    let remainingBudget = budget
    const reasoning: string[] = []

    for (const perf of driverPerformance) {
      if (selectedDrivers.length >= 6) break
      if (perf.driver.price <= remainingBudget) {
        selectedDrivers.push(perf.driver.id)
        remainingBudget -= perf.driver.price
        reasoning.push(
          `${perf.driver.firstName} ${perf.driver.lastName}: Avg ${perf.avgPoints.toFixed(1)} pts, ${(perf.valueRatio).toFixed(2)} pts/$M`
        )
      }
    }

    // Fill remaining slots with affordable drivers if needed
    while (selectedDrivers.length < 5 && remainingBudget > 0) {
      const affordableDriver = activeDrivers.find(d => 
        !selectedDrivers.includes(d.id) && d.price <= remainingBudget
      )
      if (affordableDriver) {
        selectedDrivers.push(affordableDriver.id)
        remainingBudget -= affordableDriver.price
        reasoning.push(`${affordableDriver.firstName} ${affordableDriver.lastName}: Budget filler`)
      } else {
        break
      }
    }

    // Estimate expected points
    const expectedPoints = selectedDrivers.reduce((sum, driverId) => {
      const perf = driverPerformance.find(p => p.driver.id === driverId)
      return sum + (perf?.avgPoints || 0)
    }, 0)

    // Calculate confidence based on team completeness and budget usage
    const confidence = Math.min(1, 
      (selectedDrivers.length / 5) * 0.6 + 
      ((budget - remainingBudget) / budget) * 0.4
    )

    return {
      recommendedTeam: selectedDrivers,
      reasoning,
      expectedPoints: Math.round(expectedPoints),
      confidence: Math.round(confidence * 100) / 100
    }
  }

  /**
   * Helper function to calculate standard deviation
   */
  private calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const squaredDiffs = values.map(value => Math.pow(value - avg, 2))
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length
    return Math.sqrt(avgSquaredDiff)
  }
}

export default FantasyFormulaEngine