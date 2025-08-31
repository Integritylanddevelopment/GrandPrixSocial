import { NextResponse } from "next/server"

// Mock fantasy driver prices
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
    return NextResponse.json(mockFantasyDrivers)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch fantasy drivers" }, { status: 500 })
  }
}
