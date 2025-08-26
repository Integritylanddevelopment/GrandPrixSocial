import { NextResponse } from "next/server"
import { f1Api } from "@/lib/f1-api"

// Base prices for each position in championship
const getBasePriceByPosition = (position: number): number => {
  const basePrices = [
    35000000, // P1 - $35M
    28000000, // P2 - $28M
    22000000, // P3 - $22M
    18000000, // P4 - $18M
    15000000, // P5 - $15M
    13000000, // P6 - $13M
    11000000, // P7 - $11M
    9000000,  // P8 - $9M
    7000000,  // P9 - $7M
    6000000,  // P10 - $6M
  ]
  
  if (position <= 10) {
    return basePrices[position - 1]
  }
  
  // For positions 11-20, calculate based on decreasing value
  return Math.max(3000000, 6000000 - ((position - 10) * 300000))
}

// Calculate fantasy price based on performance
const calculateFantasyPrice = (driver: any, standing: any): number => {
  const basePrice = getBasePriceByPosition(standing.championshipPosition || 20)
  const pointsMultiplier = Math.max(0.8, 1 + (standing.points / 1000))
  const winsMultiplier = Math.max(1, 1 + (standing.wins * 0.1))
  
  return Math.round(basePrice * pointsMultiplier * winsMultiplier)
}

// Generate weekly price change (mock for now, but could be based on recent performance)
const generateWeeklyChange = (currentPrice: number, recentForm: number = Math.random()): number => {
  const maxChange = currentPrice * 0.1 // Max 10% change
  const change = (recentForm - 0.5) * 2 * maxChange
  return Math.round(change)
}

// Mock fantasy driver prices (fallback if API fails)
const mockFantasyDrivers = [
  {
    id: "1",
    number: 1,
    firstName: "Max",
    lastName: "Verstappen",
    team: "Red Bull Racing",
    teamColor: "#0600EF",
    price: 32000000, // $32M
    weeklyChange: 500000, // +$0.5M
    popularity: 85, // 85% ownership
    points: 575,
    averagePoints: 26.1,
    imageUrl: "/f1-driver.png",
  },
  {
    id: "2",
    number: 16,
    firstName: "Charles",
    lastName: "Leclerc",
    team: "Ferrari",
    teamColor: "#DC143C",
    price: 24000000, // $24M
    weeklyChange: -200000, // -$0.2M
    popularity: 72,
    points: 356,
    averagePoints: 16.2,
    imageUrl: "/charles-leclerc-f1.png",
  },
  {
    id: "3",
    number: 44,
    firstName: "Lewis",
    lastName: "Hamilton",
    team: "Mercedes",
    teamColor: "#00D2BE",
    price: 20000000, // $20M
    weeklyChange: -800000, // -$0.8M
    popularity: 68,
    points: 234,
    averagePoints: 10.6,
    imageUrl: "/lewis-hamilton-f1.png",
  },
  {
    id: "4",
    number: 55,
    firstName: "Carlos",
    lastName: "Sainz",
    team: "Ferrari",
    teamColor: "#DC143C",
    price: 18000000, // $18M
    weeklyChange: 300000, // +$0.3M
    popularity: 45,
    points: 290,
    averagePoints: 13.2,
    imageUrl: "/carlos-sainz-f1.png",
  },
  {
    id: "5",
    number: 63,
    firstName: "George",
    lastName: "Russell",
    team: "Mercedes",
    teamColor: "#00D2BE",
    price: 15000000, // $15M
    weeklyChange: 100000, // +$0.1M
    popularity: 38,
    points: 175,
    averagePoints: 8.0,
    imageUrl: "/george-russell-f1.png",
  },
  {
    id: "6",
    number: 4,
    firstName: "Lando",
    lastName: "Norris",
    team: "McLaren",
    teamColor: "#FF8700",
    price: 16000000, // $16M
    weeklyChange: 400000, // +$0.4M
    popularity: 52,
    points: 205,
    averagePoints: 9.3,
    imageUrl: "/placeholder.svg?key=lando",
  },
  {
    id: "7",
    number: 81,
    firstName: "Oscar",
    lastName: "Piastri",
    team: "McLaren",
    teamColor: "#FF8700",
    price: 12000000, // $12M
    weeklyChange: 600000, // +$0.6M
    popularity: 35,
    points: 97,
    averagePoints: 4.4,
    imageUrl: "/placeholder.svg?key=oscar",
  },
  {
    id: "8",
    number: 11,
    firstName: "Sergio",
    lastName: "Perez",
    team: "Red Bull Racing",
    teamColor: "#0600EF",
    price: 14000000, // $14M
    weeklyChange: -1000000, // -$1.0M
    popularity: 28,
    points: 152,
    averagePoints: 6.9,
    imageUrl: "/placeholder.svg?key=perez",
  },
]

export async function GET() {
  try {
    // Try to fetch live F1 data
    const [driverStandings, constructorData] = await Promise.all([
      f1Api.getDriverStandings(),
      f1Api.getConstructors(),
    ])

    if (driverStandings.length === 0) {
      // Fallback to mock data if live data is unavailable
      return NextResponse.json(mockFantasyDrivers)
    }

    // Map constructor data for easy lookup
    const constructors = constructorData.reduce((acc: any, constructor: any) => {
      acc[constructor.constructorId] = constructor
      return acc
    }, {})

    // Generate fantasy drivers from live data
    const fantasyDrivers = driverStandings.map((standing: any, index: number) => {
      const driver = standing.driver
      const constructorId = standing.constructors?.[0]?.constructorId
      const constructor = constructors[constructorId]
      
      // Team color mapping (could be enhanced with more teams)
      const teamColors: { [key: string]: string } = {
        "red_bull": "#0600EF",
        "ferrari": "#DC143C", 
        "mercedes": "#00D2BE",
        "mclaren": "#FF8700",
        "aston_martin": "#006F62",
        "alpine": "#0090FF",
        "williams": "#005AFF",
        "alphatauri": "#2B4562",
        "alfa": "#900000",
        "haas": "#FFFFFF",
        "racing_point": "#F596C8",
        "renault": "#FFF500"
      }

      const fantasyPrice = calculateFantasyPrice(driver, standing)
      const weeklyChange = generateWeeklyChange(fantasyPrice)
      
      return {
        id: driver.driverId,
        number: Number.parseInt(driver.permanentNumber || "0"),
        firstName: driver.givenName,
        lastName: driver.familyName,
        team: constructor?.name || standing.constructors?.[0]?.name || "Unknown",
        teamColor: teamColors[constructorId] || "#888888",
        price: fantasyPrice,
        weeklyChange: weeklyChange,
        popularity: Math.floor(Math.random() * 40) + 20, // Mock popularity 20-60%
        points: Number.parseInt(standing.points || "0"),
        wins: Number.parseInt(standing.wins || "0"),
        averagePoints: Number.parseInt(standing.points || "0") / Math.max(1, index + 1),
        championshipPosition: Number.parseInt(standing.position || "0"),
        imageUrl: `/f1-drivers/${driver.driverId}.jpg`, // Could be enhanced with actual images
      }
    })

    return NextResponse.json(fantasyDrivers)
  } catch (error) {
    console.error("Fantasy drivers API error:", error)
    // Return mock data as fallback
    return NextResponse.json(mockFantasyDrivers)
  }
}
