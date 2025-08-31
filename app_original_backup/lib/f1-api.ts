// F1 Data API Integration Service
// Using Ergast API for historical and current season data

const ERGAST_BASE_URL = "https://ergast.com/api/f1"
const CURRENT_SEASON = "2024"

export interface F1Driver {
  driverId: string
  permanentNumber: string
  code: string
  givenName: string
  familyName: string
  dateOfBirth: string
  nationality: string
  url: string
}

export interface F1Constructor {
  constructorId: string
  name: string
  nationality: string
  url: string
}

export interface F1Circuit {
  circuitId: string
  circuitName: string
  location: {
    lat: string
    long: string
    locality: string
    country: string
  }
  url: string
}

export interface F1Race {
  season: string
  round: string
  raceName: string
  circuit: F1Circuit
  date: string
  time?: string
  url: string
  results?: F1RaceResult[]
}

export interface F1RaceResult {
  number: string
  position: string
  positionText: string
  points: string
  driver: F1Driver
  constructor: F1Constructor
  grid: string
  laps: string
  status: string
  time?: {
    millis: string
    time: string
  }
  fastestLap?: {
    rank: string
    lap: string
    time: {
      time: string
    }
    averageSpeed: {
      units: string
      speed: string
    }
  }
}

export interface F1Standing {
  position: string
  positionText: string
  points: string
  wins: string
  driver: F1Driver
  constructors: F1Constructor[]
}

class F1ApiService {
  private async fetchFromErgast(endpoint: string): Promise<any> {
    try {
      const response = await fetch(`${ERGAST_BASE_URL}/${endpoint}.json?limit=1000`)
      if (!response.ok) {
        throw new Error(`F1 API error: ${response.status}`)
      }
      const data = await response.json()
      return data.MRData
    } catch (error) {
      console.error("F1 API fetch error:", error)
      throw error
    }
  }

  // Get current season race schedule
  async getCurrentSeasonRaces(): Promise<F1Race[]> {
    try {
      const data = await this.fetchFromErgast(`${CURRENT_SEASON}`)
      return data.RaceTable?.Races || []
    } catch (error) {
      console.error("Failed to fetch current season races:", error)
      return []
    }
  }

  // Get specific race results
  async getRaceResults(season: string = CURRENT_SEASON, round: string): Promise<F1Race | null> {
    try {
      const data = await this.fetchFromErgast(`${season}/${round}/results`)
      const races = data.RaceTable?.Races || []
      return races[0] || null
    } catch (error) {
      console.error("Failed to fetch race results:", error)
      return null
    }
  }

  // Get current driver standings
  async getDriverStandings(season: string = CURRENT_SEASON): Promise<F1Standing[]> {
    try {
      const data = await this.fetchFromErgast(`${season}/driverStandings`)
      return data.StandingsTable?.StandingsLists?.[0]?.DriverStandings || []
    } catch (error) {
      console.error("Failed to fetch driver standings:", error)
      return []
    }
  }

  // Get constructor standings
  async getConstructorStandings(season: string = CURRENT_SEASON): Promise<any[]> {
    try {
      const data = await this.fetchFromErgast(`${season}/constructorStandings`)
      return data.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || []
    } catch (error) {
      console.error("Failed to fetch constructor standings:", error)
      return []
    }
  }

  // Get qualifying results
  async getQualifyingResults(season: string = CURRENT_SEASON, round: string): Promise<any> {
    try {
      const data = await this.fetchFromErgast(`${season}/${round}/qualifying`)
      const races = data.RaceTable?.Races || []
      return races[0] || null
    } catch (error) {
      console.error("Failed to fetch qualifying results:", error)
      return null
    }
  }

  // Get driver information
  async getDrivers(season: string = CURRENT_SEASON): Promise<F1Driver[]> {
    try {
      const data = await this.fetchFromErgast(`${season}/drivers`)
      return data.DriverTable?.Drivers || []
    } catch (error) {
      console.error("Failed to fetch drivers:", error)
      return []
    }
  }

  // Get constructor information
  async getConstructors(season: string = CURRENT_SEASON): Promise<F1Constructor[]> {
    try {
      const data = await this.fetchFromErgast(`${season}/constructors`)
      return data.ConstructorTable?.Constructors || []
    } catch (error) {
      console.error("Failed to fetch constructors:", error)
      return []
    }
  }

  // Get circuits information
  async getCircuits(season: string = CURRENT_SEASON): Promise<F1Circuit[]> {
    try {
      const data = await this.fetchFromErgast(`${season}/circuits`)
      return data.CircuitTable?.Circuits || []
    } catch (error) {
      console.error("Failed to fetch circuits:", error)
      return []
    }
  }

  // Get last race results
  async getLastRaceResults(): Promise<F1Race | null> {
    try {
      const data = await this.fetchFromErgast(`${CURRENT_SEASON}/last/results`)
      const races = data.RaceTable?.Races || []
      return races[0] || null
    } catch (error) {
      console.error("Failed to fetch last race results:", error)
      return null
    }
  }

  // Get next race
  async getNextRace(): Promise<F1Race | null> {
    try {
      const races = await this.getCurrentSeasonRaces()
      const now = new Date()

      for (const race of races) {
        const raceDate = new Date(race.date + (race.time ? `T${race.time}` : "T14:00:00Z"))
        if (raceDate > now) {
          return race
        }
      }

      return null
    } catch (error) {
      console.error("Failed to fetch next race:", error)
      return null
    }
  }

  // Transform Ergast data to our internal format
  transformDriverData(ergastDriver: F1Driver, standings?: F1Standing): any {
    const standing = standings || { position: "0", points: "0", wins: "0" }

    return {
      id: ergastDriver.driverId,
      driverNumber: Number.parseInt(ergastDriver.permanentNumber || "0"),
      firstName: ergastDriver.givenName,
      lastName: ergastDriver.familyName,
      nationality: ergastDriver.nationality,
      code: ergastDriver.code,
      points: Number.parseInt(standing.points || "0"),
      wins: Number.parseInt(standing.wins || "0"),
      championshipPosition: Number.parseInt(standing.position || "0"),
      url: ergastDriver.url,
    }
  }

  transformRaceData(ergastRace: F1Race): any {
    return {
      season: ergastRace.season,
      round: Number.parseInt(ergastRace.round),
      raceName: ergastRace.raceName,
      circuitName: ergastRace.circuit.circuitName,
      location: ergastRace.circuit.location.locality,
      country: ergastRace.circuit.location.country,
      date: ergastRace.date,
      time: ergastRace.time,
      url: ergastRace.url,
      results:
        ergastRace.results?.map((result) => ({
          position: Number.parseInt(result.position),
          driver: this.transformDriverData(result.driver),
          constructor: result.constructor.name,
          points: Number.parseInt(result.points),
          grid: Number.parseInt(result.grid),
          laps: Number.parseInt(result.laps),
          status: result.status,
          time: result.time?.time,
          fastestLap: result.fastestLap?.time?.time,
        })) || [],
    }
  }
}

export const f1Api = new F1ApiService()
