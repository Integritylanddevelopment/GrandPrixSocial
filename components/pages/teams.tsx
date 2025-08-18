"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  Plus,
  Trophy,
  TrendingUp,
  Crown,
  Target,
  HelpCircle,
  BookOpen,
  Zap,
  Timer,
  CloudRain,
  Mic,
  Flag,
  Users,
  Star,
  Settings,
  Wrench,
  Fuel,
  Shield,
} from "lucide-react"

export function Teams() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showHowToPlay, setShowHowToPlay] = useState(false)
  const [showRules, setShowRules] = useState(false)

  const [availableDrivers] = useState([
    // Red Bull Racing
    { name: "Max Verstappen", team: "Red Bull", price: 32000000, points: 575, form: "excellent", engine: "Honda" },
    { name: "Yuki Tsunoda", team: "Red Bull", price: 18000000, points: 152, form: "good", engine: "Honda" },

    // Ferrari
    { name: "Charles Leclerc", team: "Ferrari", price: 28000000, points: 356, form: "excellent", engine: "Ferrari" },
    { name: "Lewis Hamilton", team: "Ferrari", price: 30000000, points: 223, form: "good", engine: "Ferrari" },

    // McLaren
    { name: "Lando Norris", team: "McLaren", price: 26000000, points: 374, form: "excellent", engine: "Mercedes" },
    { name: "Oscar Piastri", team: "McLaren", price: 22000000, points: 292, form: "excellent", engine: "Mercedes" },

    // Mercedes
    { name: "George Russell", team: "Mercedes", price: 20000000, points: 245, form: "good", engine: "Mercedes" },
    { name: "Kimi Antonelli", team: "Mercedes", price: 15000000, points: 89, form: "average", engine: "Mercedes" },

    // Aston Martin
    { name: "Fernando Alonso", team: "Aston Martin", price: 24000000, points: 156, form: "good", engine: "Mercedes" },
    { name: "Lance Stroll", team: "Aston Martin", price: 12000000, points: 67, form: "average", engine: "Mercedes" },

    // Alpine
    { name: "Pierre Gasly", team: "Alpine", price: 16000000, points: 134, form: "good", engine: "Renault" },
    { name: "Franco Colapinto", team: "Alpine", price: 10000000, points: 45, form: "average", engine: "Renault" },

    // Williams
    { name: "Alex Albon", team: "Williams", price: 14000000, points: 98, form: "good", engine: "Mercedes" },
    { name: "Carlos Sainz", team: "Williams", price: 22000000, points: 290, form: "good", engine: "Mercedes" },

    // Racing Bulls
    { name: "Liam Lawson", team: "Racing Bulls", price: 12000000, points: 76, form: "average", engine: "Honda" },
    { name: "Isack Hadjar", team: "Racing Bulls", price: 8000000, points: 34, form: "average", engine: "Honda" },

    // Haas
    { name: "Oliver Bearman", team: "Haas", price: 10000000, points: 56, form: "average", engine: "Ferrari" },
    { name: "Esteban Ocon", team: "Haas", price: 14000000, points: 87, form: "good", engine: "Ferrari" },

    // Sauber
    { name: "Nico Hülkenberg", team: "Sauber", price: 16000000, points: 112, form: "good", engine: "Ferrari" },
    { name: "Gabriel Bortoleto", team: "Sauber", price: 8000000, points: 23, form: "average", engine: "Ferrari" },
  ])

  const [constructors] = useState([
    {
      name: "Red Bull Racing",
      price: 20000000,
      points: 860,
      form: "excellent",
      engine: "Honda",
      drivers: ["Max Verstappen", "Yuki Tsunoda"],
    },
    {
      name: "Ferrari",
      price: 18000000,
      points: 652,
      form: "excellent",
      engine: "Ferrari",
      drivers: ["Charles Leclerc", "Lewis Hamilton"],
    },
    {
      name: "McLaren",
      price: 19000000,
      points: 666,
      form: "excellent",
      engine: "Mercedes",
      drivers: ["Lando Norris", "Oscar Piastri"],
    },
    {
      name: "Mercedes",
      price: 16000000,
      points: 468,
      form: "good",
      engine: "Mercedes",
      drivers: ["George Russell", "Kimi Antonelli"],
    },
    {
      name: "Aston Martin",
      price: 12000000,
      points: 94,
      form: "average",
      engine: "Mercedes",
      drivers: ["Fernando Alonso", "Lance Stroll"],
    },
    {
      name: "Alpine",
      price: 10000000,
      points: 89,
      form: "average",
      engine: "Renault",
      drivers: ["Pierre Gasly", "Franco Colapinto"],
    },
    {
      name: "Williams",
      price: 11000000,
      points: 156,
      form: "good",
      engine: "Mercedes",
      drivers: ["Alex Albon", "Carlos Sainz"],
    },
    {
      name: "Racing Bulls",
      price: 8000000,
      points: 67,
      form: "average",
      engine: "Honda",
      drivers: ["Liam Lawson", "Isack Hadjar"],
    },
    {
      name: "Haas",
      price: 9000000,
      points: 78,
      form: "average",
      engine: "Ferrari",
      drivers: ["Oliver Bearman", "Esteban Ocon"],
    },
    {
      name: "Sauber",
      price: 7000000,
      points: 45,
      form: "poor",
      engine: "Ferrari",
      drivers: ["Nico Hülkenberg", "Gabriel Bortoleto"],
    },
  ])

  const [teamPrincipals] = useState([
    { name: "Christian Horner", team: "Red Bull", price: 5000000, points: 45, specialty: "Strategy" },
    { name: "Fred Vasseur", team: "Ferrari", price: 4500000, points: 38, specialty: "Technical" },
    { name: "Andrea Stella", team: "McLaren", price: 4200000, points: 42, specialty: "Operations" },
    { name: "Toto Wolff", team: "Mercedes", price: 4800000, points: 35, specialty: "Leadership" },
    { name: "Mike Krack", team: "Aston Martin", price: 3200000, points: 28, specialty: "Development" },
    { name: "Oliver Oakes", team: "Alpine", price: 3000000, points: 25, specialty: "Innovation" },
    { name: "James Vowles", team: "Williams", price: 3500000, points: 32, specialty: "Engineering" },
    { name: "Laurent Mekies", team: "Racing Bulls", price: 2800000, points: 22, specialty: "Technical" },
    { name: "Ayao Komatsu", team: "Haas", price: 2500000, points: 20, specialty: "Operations" },
    { name: "Alessandro Alunni Bravi", team: "Sauber", price: 2200000, points: 18, specialty: "Management" },
  ])

  const [engineers] = useState([
    { name: "Adrian Newey", team: "Aston Martin", price: 8000000, points: 65, specialty: "Aerodynamics" },
    { name: "James Allison", team: "Mercedes", price: 6500000, points: 58, specialty: "Technical Director" },
    { name: "Enrico Cardile", team: "Ferrari", price: 6200000, points: 55, specialty: "Chassis" },
    { name: "Peter Prodromou", team: "McLaren", price: 5800000, points: 52, specialty: "Aerodynamics" },
    { name: "Pierre Waché", team: "Red Bull", price: 7200000, points: 62, specialty: "Technical Director" },
    { name: "Pat Fry", team: "Alpine", price: 4500000, points: 38, specialty: "Engineering" },
    { name: "Dave Robson", team: "Williams", price: 4200000, points: 35, specialty: "Vehicle Performance" },
    { name: "Jody Egginton", team: "Racing Bulls", price: 3800000, points: 32, specialty: "Technical Director" },
    { name: "Simone Resta", team: "Haas", price: 3500000, points: 28, specialty: "Technical Director" },
    { name: "Jan Monchaux", team: "Sauber", price: 3200000, points: 25, specialty: "Technical Director" },
  ])

  const [engines] = useState([
    { name: "Mercedes-AMG F1 M15", manufacturer: "Mercedes", price: 3500000, points: 45, power: 1000, reliability: 92 },
    { name: "Ferrari 067/11", manufacturer: "Ferrari", price: 3800000, points: 48, power: 1005, reliability: 89 },
    { name: "Honda RBPT H25", manufacturer: "Honda", price: 3600000, points: 52, power: 1010, reliability: 94 },
    { name: "Renault E-Tech RE25", manufacturer: "Renault", price: 3200000, points: 35, power: 995, reliability: 87 },
  ])

  const [tireStrategies] = useState([
    { name: "Aggressive", description: "Soft-Medium-Hard", price: 500000, points: 12, risk: "High", reward: "High" },
    {
      name: "Conservative",
      description: "Hard-Medium-Medium",
      price: 300000,
      points: 8,
      risk: "Low",
      reward: "Medium",
    },
    { name: "Balanced", description: "Medium-Hard-Soft", price: 400000, points: 10, risk: "Medium", reward: "Medium" },
    {
      name: "Gambler",
      description: "Soft-Soft-Medium",
      price: 600000,
      points: 15,
      risk: "Very High",
      reward: "Very High",
    },
    { name: "Endurance", description: "Hard-Hard-Medium", price: 250000, points: 6, risk: "Very Low", reward: "Low" },
  ])

  const [pitCrews] = useState([
    { name: "Red Bull Pit Crew", team: "Red Bull", price: 2500000, avgTime: 2.3, points: 28, specialty: "Speed" },
    { name: "Ferrari Pit Crew", team: "Ferrari", price: 2400000, avgTime: 2.4, points: 26, specialty: "Precision" },
    { name: "McLaren Pit Crew", team: "McLaren", price: 2300000, avgTime: 2.5, points: 25, specialty: "Consistency" },
    { name: "Mercedes Pit Crew", team: "Mercedes", price: 2200000, avgTime: 2.6, points: 22, specialty: "Reliability" },
    {
      name: "Aston Martin Pit Crew",
      team: "Aston Martin",
      price: 1800000,
      avgTime: 2.8,
      points: 18,
      specialty: "Strategy",
    },
    { name: "Alpine Pit Crew", team: "Alpine", price: 1600000, avgTime: 2.9, points: 16, specialty: "Adaptability" },
    { name: "Williams Pit Crew", team: "Williams", price: 1500000, avgTime: 3.0, points: 15, specialty: "Improvement" },
    {
      name: "Racing Bulls Pit Crew",
      team: "Racing Bulls",
      price: 1400000,
      avgTime: 3.1,
      points: 14,
      specialty: "Learning",
    },
    { name: "Haas Pit Crew", team: "Haas", price: 1300000, avgTime: 3.2, points: 12, specialty: "Efficiency" },
    { name: "Sauber Pit Crew", team: "Sauber", price: 1200000, avgTime: 3.3, points: 10, specialty: "Development" },
  ])

  const [myTeam, setMyTeam] = useState({
    name: "Red Lightning Racing",
    budget: 100000000, // $100M budget
    drivers: [
      { name: "Max Verstappen", team: "Red Bull", price: 32000000, points: 575 },
      { name: "Lando Norris", team: "McLaren", price: 28000000, points: 374 },
    ],
    constructor: { name: "Red Bull", price: 15000000, points: 860 },
    totalPoints: 1809,
    rank: 1247,
  })

  const [leaderboard] = useState([
    { rank: 1, name: "F1_Master_2025", team: "Speed Demons", points: 2156, change: 0 },
    { rank: 2, name: "RacingLegend", team: "Velocity Kings", points: 2089, change: 1 },
    { rank: 3, name: "TurboCharged", team: "Lightning Bolts", points: 2034, change: -1 },
    { rank: 4, name: "PolePosition", team: "Track Warriors", points: 1998, change: 2 },
    { rank: 5, name: "SpeedDemon", team: "Racing Royals", points: 1967, change: -1 },
  ])

  const filteredDrivers = availableDrivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.team.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatCurrency = (amount: number) => {
    return `$${(amount / 1000000).toFixed(1)}M`
  }

  const getFormColor = (form: string) => {
    switch (form) {
      case "excellent":
        return "text-green-500"
      case "good":
        return "text-blue-500"
      case "average":
        return "text-yellow-500"
      case "poor":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getFormBadge = (form: string) => {
    switch (form) {
      case "excellent":
        return "bg-green-100 text-green-800"
      case "good":
        return "bg-blue-100 text-blue-800"
      case "average":
        return "bg-yellow-100 text-yellow-800"
      case "poor":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-blue-950">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-blue-600/20" />
        <div className="relative container mx-auto px-4 py-8 space-y-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 bg-gradient-to-r from-red-500 to-blue-600 rounded-full">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-red-400 via-white to-blue-400 bg-clip-text text-transparent">
                Fantasy F1 League
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Build your complete F1 empire with drivers, teams, engineers, pit crews, and strategic choices across
              every aspect of Formula 1 racing
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Dialog open={showHowToPlay} onOpenChange={setShowHowToPlay}>
                <DialogTrigger asChild>
                  <Button className="bg-transparent border-2 border-red-500 text-red-400 hover:bg-red-500/10 hover:border-red-400 hover:text-red-300 px-8 py-4 text-lg font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
                    <HelpCircle className="w-6 h-6 mr-3" />
                    How We Play
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-red-950/50 to-blue-950/50 border-2 border-red-500/30 backdrop-blur-sm">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
                      How to Play Fantasy F1
                    </DialogTitle>
                    <DialogDescription className="text-lg text-gray-300">
                      Master the art of F1 prediction and team building
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Card className="team-card border-red-500/30">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-red-400">
                            <Users className="w-5 h-5" />
                            Team Building
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-gray-300">
                          <p>• Select 2 drivers and 1 constructor within your $100M budget</p>
                          <p>• Driver prices fluctuate based on performance</p>
                          <p>• Make transfers between races (limited per season)</p>
                          <p>• Balance star drivers with budget constraints</p>
                        </CardContent>
                      </Card>

                      <Card className="team-card border-blue-500/30">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-blue-400">
                            <Target className="w-5 h-5" />
                            Technical KPIs (70% of Points)
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-gray-300">
                          <p>
                            • <strong className="text-white">Race Position:</strong> 25pts for P1, 18pts for P2, etc.
                          </p>
                          <p>
                            • <strong className="text-white">Qualifying:</strong> 5pts for pole, 3pts for front row
                          </p>
                          <p>
                            • <strong className="text-white">Fastest Lap:</strong> 3pts bonus
                          </p>
                          <p>
                            • <strong className="text-white">Points Finish:</strong> 2pts for top 10
                          </p>
                          <p>
                            • <strong className="text-white">Constructor Points:</strong> Team total × 0.1
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="team-card border-green-500/30">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-green-400">
                            <Zap className="w-5 h-5" />
                            Bonus Challenges (30% of Points)
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-gray-300">
                          <p>
                            • <strong className="text-white">Rain Prediction:</strong> Will it rain? (5pts yes/no)
                          </p>
                          <p>
                            • <strong className="text-white">Safety Car Count:</strong> Over/under 2 (3pts, lose all if
                            wrong)
                          </p>
                          <p>
                            • <strong className="text-white">Commentator Bingo:</strong> "Brilliant!" count (1pt per
                            mention)
                          </p>
                          <p>
                            • <strong className="text-white">Red Flag:</strong> Will there be one? (8pts)
                          </p>
                          <p>
                            • <strong className="text-white">Pit Stop Drama:</strong> Sub-3 second stop (4pts)
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="team-card border-purple-500/30">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-purple-400">
                            <Star className="w-5 h-5" />
                            Custom Predictions
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-gray-300">
                          <p>• Create your own wacky predictions</p>
                          <p>• "How many times will Crofty say 'Lights out'?"</p>
                          <p>• "Will someone mention the weather in Monaco?"</p>
                          <p>• "Driver radio complaints about tires"</p>
                          <p>• Points awarded based on creativity and accuracy</p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="team-card border-yellow-500/30 bg-gradient-to-r from-yellow-900/20 to-orange-900/20">
                      <CardHeader>
                        <CardTitle className="text-yellow-400">Scoring System</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-semibold text-green-400">Gain Points For:</h4>
                            <ul className="text-sm space-y-1 mt-2 text-gray-300">
                              <li>• High race finishes</li>
                              <li>• Pole positions</li>
                              <li>• Fastest laps</li>
                              <li>• Correct predictions</li>
                              <li>• Bonus challenges</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-red-400">Lose Points For:</h4>
                            <ul className="text-sm space-y-1 mt-2 text-gray-300">
                              <li>• DNFs (-5pts)</li>
                              <li>• Penalties (-2pts)</li>
                              <li>• Wrong over/under bets</li>
                              <li>• Last place finish (-3pts)</li>
                              <li>• Crashes (-4pts)</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-blue-400">Special Rules:</h4>
                            <ul className="text-sm space-y-1 mt-2 text-gray-300">
                              <li>• Double points for home races</li>
                              <li>• Sprint weekend bonuses</li>
                              <li>• Weather multipliers</li>
                              <li>• Rookie driver bonuses</li>
                              <li>• Championship finale 2x</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showRules} onOpenChange={setShowRules}>
                <DialogTrigger asChild>
                  <Button className="bg-transparent border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 hover:text-blue-300 px-8 py-4 text-lg font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
                    <BookOpen className="w-6 h-6 mr-3" />
                    Rules & Regulations
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-950/50 to-red-950/50 border-2 border-blue-500/30 backdrop-blur-sm">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                      Official F1 Fantasy Rules
                    </DialogTitle>
                    <DialogDescription className="text-gray-300">
                      The sacred laws of our racing universe
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <Card className="team-card border-red-500/30 bg-gradient-to-r from-red-900/20 to-red-800/20">
                      <CardHeader>
                        <CardTitle className="text-red-400 flex items-center gap-2">
                          <Flag className="w-5 h-5" />
                          The Golden Rules
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-gray-300">
                        <p>
                          <Flag className="w-4 h-4 inline mr-2 text-red-400" />
                          <strong className="text-white">Rule #1:</strong> No crying when your driver bins it in Turn 1
                        </p>
                        <p>
                          <CloudRain className="w-4 h-4 inline mr-2 text-blue-400" />
                          <strong className="text-white">Rule #2:</strong> Rain predictions must be made before FP1
                          starts
                        </p>
                        <p>
                          <Mic className="w-4 h-4 inline mr-2 text-green-400" />
                          <strong className="text-white">Rule #3:</strong> Commentator word counts are final (no arguing
                          with the AI)
                        </p>
                        <p>
                          <Star className="w-4 h-4 inline mr-2 text-yellow-400" />
                          <strong className="text-white">Rule #4:</strong> Budget violations result in immediate
                          disqualification
                        </p>
                        <p>
                          <Trophy className="w-4 h-4 inline mr-2 text-purple-400" />
                          <strong className="text-white">Rule #5:</strong> Championship winner gets bragging rights
                          until next season
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="team-card border-yellow-500/30 bg-gradient-to-r from-yellow-900/20 to-orange-900/20">
                      <CardHeader>
                        <CardTitle className="text-yellow-400 flex items-center gap-2">
                          <Timer className="w-5 h-5" />
                          Timing Rules
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-gray-300">
                        <p>⏰ Team changes lock 1 hour before FP1</p>
                        <p>🎯 Predictions must be submitted before qualifying</p>
                        <p>🔄 Maximum 3 transfers per race weekend</p>
                        <p>📱 Late submissions are automatically set to "chaos mode"</p>
                        <p>🚨 Emergency transfers allowed only for driver illness/injury</p>
                      </CardContent>
                    </Card>

                    <Card className="team-card border-green-500/30 bg-gradient-to-r from-green-900/20 to-emerald-900/20">
                      <CardHeader>
                        <CardTitle className="text-green-400 flex items-center gap-2">
                          <CloudRain className="w-5 h-5" />
                          Weather & Chaos Rules
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-gray-300">
                        <p>🌦️ Rain = 1.5x multiplier on all points</p>
                        <p>🚩 Red flags void all over/under bets (refund points)</p>
                        <p>🔥 Safety car appearances double commentator word points</p>
                        <p>❄️ Snow/extreme weather = 2x multiplier (if race happens)</p>
                        <p>🌪️ "Act of God" clause: Meteors void all bets</p>
                      </CardContent>
                    </Card>

                    <Card className="team-card border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
                      <CardHeader>
                        <CardTitle className="text-purple-400 flex items-center gap-2">
                          <Mic className="w-5 h-5" />
                          Commentator Bingo Rules
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-gray-300">
                        <p>🎤 "Brilliant!" = 1pt per mention (Crofty only)</p>
                        <p>🏎️ "Lights out and away we go!" = 5pts (race start only)</p>
                        <p>🔥 "That's a big one!" = 3pts per crash</p>
                        <p>🎯 "Bono, my tires are gone" = 4pts (Lewis only)</p>
                        <p>📊 Weather mentions = 0.5pts each (max 20 per race)</p>
                        <p>🤖 AI monitors all commentary automatically</p>
                      </CardContent>
                    </Card>

                    <Card className="team-card border-orange-500/30 bg-gradient-to-r from-orange-900/20 to-red-900/20">
                      <CardHeader>
                        <CardTitle className="text-orange-400">Penalty System</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-gray-300">
                        <p>⚠️ Unsporting predictions: -10pts</p>
                        <p>🚫 Offensive custom bets: Season ban</p>
                        <p>💰 Budget cheating: -50pts + public shame</p>
                        <p>🤖 Attempting to hack the AI: Lifetime ban</p>
                        <p>😭 Excessive complaining: Mandatory optimism training</p>
                      </CardContent>
                    </Card>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card className="bg-gradient-to-r from-red-900/50 to-blue-900/50 border-2 border-red-500/30 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Crown className="w-6 h-6 text-yellow-400" />
                    {myTeam.name}
                  </CardTitle>
                  <CardDescription className="text-gray-300">Your Fantasy F1 Team</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                    {myTeam.totalPoints} pts
                  </div>
                  <div className="text-sm text-gray-400">Rank #{myTeam.rank.toLocaleString()}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Drivers
                  </h4>
                  {myTeam.drivers.map((driver, index) => (
                    <div key={index} className="flex justify-between text-sm bg-white/10 p-2 rounded">
                      <span className="text-gray-200">{driver.name}</span>
                      <span className="font-medium text-green-300">{driver.points} pts</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Constructor
                  </h4>
                  <div className="flex justify-between text-sm bg-white/10 p-2 rounded">
                    <span className="text-gray-200">{myTeam.constructor.name}</span>
                    <span className="font-medium text-green-300">{myTeam.constructor.points} pts</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Budget Remaining
                  </h4>
                  <div className="text-2xl font-bold text-green-300">
                    {formatCurrency(
                      myTeam.budget - myTeam.drivers.reduce((sum, d) => sum + d.price, 0) - myTeam.constructor.price,
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="drivers" className="space-y-6">
            <TabsList className="grid w-full grid-cols-8 bg-black/50 border border-red-500/30">
              <TabsTrigger
                value="drivers"
                className="text-gray-300 data-[state=active]:bg-transparent data-[state=active]:border-2 data-[state=active]:border-red-500 data-[state=active]:text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
              >
                Drivers
              </TabsTrigger>
              <TabsTrigger
                value="constructors"
                className="text-gray-300 data-[state=active]:bg-transparent data-[state=active]:border-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-all duration-200"
              >
                Teams
              </TabsTrigger>
              <TabsTrigger
                value="principals"
                className="text-gray-300 data-[state=active]:bg-transparent data-[state=active]:border-2 data-[state=active]:border-purple-500 data-[state=active]:text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-all duration-200"
              >
                Principals
              </TabsTrigger>
              <TabsTrigger
                value="engineers"
                className="text-gray-300 data-[state=active]:bg-transparent data-[state=active]:border-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-400 hover:bg-orange-500/10 hover:text-orange-300 transition-all duration-200"
              >
                Engineers
              </TabsTrigger>
              <TabsTrigger
                value="engines"
                className="text-gray-300 data-[state=active]:bg-transparent data-[state=active]:border-2 data-[state=active]:border-yellow-500 data-[state=active]:text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300 transition-all duration-200"
              >
                Engines
              </TabsTrigger>
              <TabsTrigger
                value="pit-crews"
                className="text-gray-300 data-[state=active]:bg-transparent data-[state=active]:border-2 data-[state=active]:border-green-500 data-[state=active]:text-green-400 hover:bg-green-500/10 hover:text-green-300 transition-all duration-200"
              >
                Pit Crews
              </TabsTrigger>
              <TabsTrigger
                value="tires"
                className="text-gray-300 data-[state=active]:bg-transparent data-[state=active]:border-2 data-[state=active]:border-pink-500 data-[state=active]:text-pink-400 hover:bg-pink-500/10 hover:text-pink-300 transition-all duration-200"
              >
                Tires
              </TabsTrigger>
              <TabsTrigger
                value="my-team"
                className="text-gray-300 data-[state=active]:bg-transparent data-[state=active]:border-2 data-[state=active]:border-cyan-500 data-[state=active]:text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all duration-200"
              >
                My Team
              </TabsTrigger>
            </TabsList>

            <TabsContent value="drivers" className="space-y-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search all 20 F1 drivers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-black/50 border-red-500/30 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredDrivers.map((driver, index) => (
                  <Card
                    key={index}
                    className="bg-black/50 border-red-500/30 hover:border-red-500/50 transition-all hover:shadow-lg hover:shadow-red-500/20"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-white">{driver.name}</CardTitle>
                          <CardDescription className="text-gray-300">{driver.team}</CardDescription>
                          <Badge variant="outline" className="mt-1 text-xs text-blue-400 border-blue-400">
                            {driver.engine}
                          </Badge>
                        </div>
                        <Badge className={getFormBadge(driver.form)}>{driver.form}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Price:</span>
                          <span className="font-semibold text-white">{formatCurrency(driver.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Points:</span>
                          <span className="font-semibold text-green-300">{driver.points}</span>
                        </div>
                        <Button
                          className="w-full mt-3 bg-transparent border-2 border-red-500 text-red-400 hover:bg-red-500/10 hover:border-red-400 hover:text-red-300"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Driver
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="constructors" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {constructors.map((constructor, index) => (
                  <Card
                    key={index}
                    className="bg-black/50 border-blue-500/30 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/20"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-white">{constructor.name}</CardTitle>
                          <CardDescription className="text-gray-300">{constructor.engine} Engine</CardDescription>
                          <div className="mt-2 space-y-1">
                            {constructor.drivers.map((driver, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs text-gray-400 border-gray-400 mr-1">
                                {driver}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Badge className={getFormBadge(constructor.form)}>{constructor.form}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Price:</span>
                          <span className="font-semibold text-white">{formatCurrency(constructor.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Points:</span>
                          <span className="font-semibold text-green-300">{constructor.points}</span>
                        </div>
                        <Button
                          className="w-full mt-3 bg-transparent border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 hover:text-blue-300"
                          size="sm"
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Select Team
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="principals" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamPrincipals.map((principal, index) => (
                  <Card
                    key={index}
                    className="bg-black/50 border-purple-500/30 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/20"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-white">{principal.name}</CardTitle>
                          <CardDescription className="text-gray-300">{principal.team}</CardDescription>
                          <Badge variant="outline" className="mt-1 text-xs text-purple-400 border-purple-400">
                            {principal.specialty}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Price:</span>
                          <span className="font-semibold text-white">{formatCurrency(principal.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Leadership:</span>
                          <span className="font-semibold text-green-300">{principal.points} pts</span>
                        </div>
                        <Button
                          className="w-full mt-3 bg-transparent border-2 border-purple-500 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400 hover:text-purple-300"
                          size="sm"
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          Hire Principal
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="engineers" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {engineers.map((engineer, index) => (
                  <Card
                    key={index}
                    className="bg-black/50 border-orange-500/30 hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/20"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-white">{engineer.name}</CardTitle>
                          <CardDescription className="text-gray-300">{engineer.team}</CardDescription>
                          <Badge variant="outline" className="mt-1 text-xs text-orange-400 border-orange-400">
                            {engineer.specialty}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Price:</span>
                          <span className="font-semibold text-white">{formatCurrency(engineer.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Innovation:</span>
                          <span className="font-semibold text-green-300">{engineer.points} pts</span>
                        </div>
                        <Button
                          className="w-full mt-3 bg-transparent border-2 border-orange-500 text-orange-400 hover:bg-orange-500/10 hover:border-orange-400 hover:text-orange-300"
                          size="sm"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Hire Engineer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="engines" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {engines.map((engine, index) => (
                  <Card
                    key={index}
                    className="bg-black/50 border-yellow-500/30 hover:border-yellow-500/50 transition-all hover:shadow-lg hover:shadow-yellow-500/20"
                  >
                    <CardHeader className="pb-3">
                      <div>
                        <CardTitle className="text-lg text-white">{engine.name}</CardTitle>
                        <CardDescription className="text-gray-300">{engine.manufacturer}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Price:</span>
                          <span className="font-semibold text-white">{formatCurrency(engine.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Power:</span>
                          <span className="font-semibold text-red-300">{engine.power}hp</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Reliability:</span>
                          <span className="font-semibold text-green-300">{engine.reliability}%</span>
                        </div>
                        <Button
                          className="w-full mt-3 bg-transparent border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400 hover:text-yellow-300"
                          size="sm"
                        >
                          <Fuel className="w-4 h-4 mr-2" />
                          Select Engine
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pit-crews" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pitCrews.map((crew, index) => (
                  <Card
                    key={index}
                    className="bg-black/50 border-green-500/30 hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/20"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-white">{crew.name}</CardTitle>
                          <CardDescription className="text-gray-300">{crew.team}</CardDescription>
                          <Badge variant="outline" className="mt-1 text-xs text-green-400 border-green-400">
                            {crew.specialty}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Price:</span>
                          <span className="font-semibold text-white">{formatCurrency(crew.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Avg Time:</span>
                          <span className="font-semibold text-blue-300">{crew.avgTime}s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Performance:</span>
                          <span className="font-semibold text-green-300">{crew.points} pts</span>
                        </div>
                        <Button
                          className="w-full mt-3 bg-transparent border-2 border-green-500 text-green-400 hover:bg-green-500/10 hover:border-green-400 hover:text-green-300"
                          size="sm"
                        >
                          <Wrench className="w-4 h-4 mr-2" />
                          Hire Pit Crew
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tires" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tireStrategies.map((strategy, index) => (
                  <Card
                    key={index}
                    className="bg-black/50 border-pink-500/30 hover:border-pink-500/50 transition-all hover:shadow-lg hover:shadow-pink-500/20"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-white">{strategy.name}</CardTitle>
                          <CardDescription className="text-gray-300">{strategy.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs text-red-400 border-red-400 mb-1">
                            {strategy.risk} Risk
                          </Badge>
                          <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                            {strategy.reward} Reward
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Price:</span>
                          <span className="font-semibold text-white">{formatCurrency(strategy.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Strategy Bonus:</span>
                          <span className="font-semibold text-green-300">{strategy.points} pts</span>
                        </div>
                        <Button
                          className="w-full mt-3 bg-transparent border-2 border-pink-500 text-pink-400 hover:bg-pink-500/10 hover:border-pink-400 hover:text-pink-300"
                          size="sm"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Choose Strategy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="my-team" className="space-y-6">
              <Card className="bg-black/50 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Team Management</CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage your fantasy F1 team lineup and strategy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-white">Current Lineup</h3>
                      <div className="space-y-3">
                        {myTeam.drivers.map((driver, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-red-900/30 rounded-lg border border-red-500/30"
                          >
                            <div>
                              <div className="font-medium text-white">{driver.name}</div>
                              <div className="text-sm text-gray-300">{driver.team}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-green-300">{driver.points} pts</div>
                              <div className="text-sm text-gray-400">{formatCurrency(driver.price)}</div>
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center justify-between p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
                          <div>
                            <div className="font-medium text-white">{myTeam.constructor.name}</div>
                            <div className="text-sm text-gray-300">Constructor</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-300">{myTeam.constructor.points} pts</div>
                            <div className="text-sm text-gray-400">{formatCurrency(myTeam.constructor.price)}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-900/30 rounded-lg border border-green-500/30">
                        <div className="text-sm text-gray-400">Total Points</div>
                        <div className="text-2xl font-bold text-green-300">{myTeam.totalPoints}</div>
                      </div>
                      <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                        <div className="text-sm text-gray-400">Global Rank</div>
                        <div className="text-2xl font-bold text-blue-300">#{myTeam.rank.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-6">
              <Card className="bg-black/50 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Global Leaderboard
                  </CardTitle>
                  <CardDescription className="text-gray-300">Top fantasy F1 managers worldwide</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.map((entry) => (
                      <div
                        key={entry.rank}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              entry.rank === 1
                                ? "bg-yellow-500 text-black"
                                : entry.rank === 2
                                  ? "bg-gray-300 text-black"
                                  : entry.rank === 3
                                    ? "bg-orange-500 text-white"
                                    : "bg-blue-500 text-white"
                            }`}
                          >
                            {entry.rank}
                          </div>
                          <div>
                            <div className="font-medium text-white">{entry.name}</div>
                            <div className="text-sm text-gray-400">{entry.team}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-white">{entry.points.toLocaleString()} pts</div>
                          <div
                            className={`text-sm flex items-center gap-1 ${
                              entry.change > 0 ? "text-green-400" : entry.change < 0 ? "text-red-400" : "text-gray-500"
                            }`}
                          >
                            <TrendingUp className="w-3 h-3" />
                            {entry.change > 0 ? "+" : ""}
                            {entry.change}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
