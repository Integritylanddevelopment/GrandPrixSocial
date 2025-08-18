import { NextResponse } from "next/server"

// Mock driver statistics data - in production this would come from your database
const mockDriverStats = [
  {
    id: "1",
    number: 1,
    firstName: "Max",
    lastName: "Verstappen",
    nationality: "Dutch",
    team: "Red Bull Racing",
    teamColor: "#0600EF",
    points: 575,
    wins: 19,
    podiums: 21,
    fastestLaps: 5,
    championshipPosition: 1,
    dnfs: 1,
    poles: 12,
    averageFinish: 1.8,
    seasonStats: {
      races: 22,
      pointsPerRace: 26.1,
      winRate: 86.4,
      podiumRate: 95.5,
    },
    recentForm: [1, 1, 1, 2, 1], // Last 5 race positions
    careerStats: {
      seasons: 9,
      totalRaces: 182,
      totalWins: 54,
      totalPodiums: 98,
      totalPoints: 2586,
      championships: 3,
    },
    imageUrl: "/f1-driver.png",
  },
  {
    id: "2",
    number: 16,
    firstName: "Charles",
    lastName: "Leclerc",
    nationality: "Monégasque",
    team: "Ferrari",
    teamColor: "#DC143C",
    points: 356,
    wins: 3,
    podiums: 11,
    fastestLaps: 3,
    championshipPosition: 2,
    dnfs: 3,
    poles: 8,
    averageFinish: 4.2,
    seasonStats: {
      races: 22,
      pointsPerRace: 16.2,
      winRate: 13.6,
      podiumRate: 50.0,
    },
    recentForm: [2, 3, 4, 1, 2],
    careerStats: {
      seasons: 7,
      totalRaces: 138,
      totalWins: 7,
      totalPodiums: 35,
      totalPoints: 1267,
      championships: 0,
    },
    imageUrl: "/charles-leclerc-f1.png",
  },
  {
    id: "3",
    number: 44,
    firstName: "Lewis",
    lastName: "Hamilton",
    nationality: "British",
    team: "Mercedes",
    teamColor: "#00D2BE",
    points: 234,
    wins: 0,
    podiums: 8,
    fastestLaps: 1,
    championshipPosition: 3,
    dnfs: 2,
    poles: 1,
    averageFinish: 5.8,
    seasonStats: {
      races: 22,
      pointsPerRace: 10.6,
      winRate: 0.0,
      podiumRate: 36.4,
    },
    recentForm: [3, 5, 6, 3, 4],
    careerStats: {
      seasons: 18,
      totalRaces: 334,
      totalWins: 103,
      totalPodiums: 197,
      totalPoints: 4405,
      championships: 7,
    },
    imageUrl: "/lewis-hamilton-f1.png",
  },
  {
    id: "4",
    number: 55,
    firstName: "Carlos",
    lastName: "Sainz",
    nationality: "Spanish",
    team: "Ferrari",
    teamColor: "#DC143C",
    points: 290,
    wins: 2,
    podiums: 9,
    fastestLaps: 2,
    championshipPosition: 4,
    dnfs: 1,
    poles: 3,
    averageFinish: 5.1,
    seasonStats: {
      races: 22,
      pointsPerRace: 13.2,
      winRate: 9.1,
      podiumRate: 40.9,
    },
    recentForm: [4, 2, 3, 5, 3],
    careerStats: {
      seasons: 10,
      totalRaces: 196,
      totalWins: 4,
      totalPodiums: 23,
      totalPoints: 1162,
      championships: 0,
    },
    imageUrl: "/carlos-sainz-f1.png",
  },
  {
    id: "5",
    number: 63,
    firstName: "George",
    lastName: "Russell",
    nationality: "British",
    team: "Mercedes",
    teamColor: "#00D2BE",
    points: 175,
    wins: 1,
    podiums: 5,
    fastestLaps: 0,
    championshipPosition: 5,
    dnfs: 1,
    poles: 2,
    averageFinish: 7.3,
    seasonStats: {
      races: 22,
      pointsPerRace: 8.0,
      winRate: 4.5,
      podiumRate: 22.7,
    },
    recentForm: [5, 4, 7, 6, 5],
    careerStats: {
      seasons: 6,
      totalRaces: 118,
      totalWins: 1,
      totalPodiums: 12,
      totalPoints: 376,
      championships: 0,
    },
    imageUrl: "/george-russell-f1.png",
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const driverId = searchParams.get("driverId")
    const compare = searchParams.get("compare")

    if (driverId) {
      const driver = mockDriverStats.find((d) => d.id === driverId)
      if (!driver) {
        return NextResponse.json({ error: "Driver not found" }, { status: 404 })
      }
      return NextResponse.json(driver)
    }

    if (compare) {
      const driverIds = compare.split(",")
      const drivers = mockDriverStats.filter((d) => driverIds.includes(d.id))
      return NextResponse.json(drivers)
    }

    return NextResponse.json(mockDriverStats)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch driver statistics" }, { status: 500 })
  }
}
