import { NextResponse } from "next/server"
import { f1Api } from "@/lib/f1-api"

// Mock challenge data
const mockChallenges = [
  {
    id: "challenge_1",
    title: "Perfect Prediction Streak",
    description: "Make 5 correct race winner predictions in a row",
    type: "prediction",
    reward: 500,
    xpReward: 200,
    badge: "Oracle Master",
    timeLeft: "6 days",
    expiresAt: "2024-12-15T23:59:59Z",
    difficulty: "hard",
    progress: { current: 2, required: 5 },
    requirements: ["Account level 5+", "Made at least 10 predictions"],
    category: "Racing",
    isDaily: false,
    completedBy: 23
  },
  {
    id: "challenge_2", 
    title: "Daily Login Bonus",
    description: "Log in every day for a week to earn bonus points",
    type: "activity",
    reward: 100,
    xpReward: 50,
    badge: "Consistent Fan",
    timeLeft: "16 hours",
    expiresAt: "2024-12-09T23:59:59Z",
    difficulty: "easy",
    progress: { current: 4, required: 7 },
    requirements: ["Active account"],
    category: "Engagement",
    isDaily: true,
    completedBy: 1247
  },
  {
    id: "challenge_3",
    title: "Fantasy Team Builder",
    description: "Create and manage 3 different fantasy teams across different leagues",
    type: "fantasy",
    reward: 750,
    xpReward: 300,
    badge: "Team Manager",
    timeLeft: "12 days", 
    expiresAt: "2024-12-20T23:59:59Z",
    difficulty: "medium",
    progress: { current: 1, required: 3 },
    requirements: ["Completed fantasy tutorial", "Minimum 50,000 fantasy budget"],
    category: "Fantasy",
    isDaily: false,
    completedBy: 156
  },
  {
    id: "challenge_4",
    title: "Social Connector",
    description: "Share 10 F1 predictions or race results on social media",
    type: "social",
    reward: 250,
    xpReward: 150,
    badge: "F1 Ambassador",
    timeLeft: "3 days",
    expiresAt: "2024-12-12T23:59:59Z", 
    difficulty: "easy",
    progress: { current: 7, required: 10 },
    requirements: ["Connected social media account"],
    category: "Social",
    isDaily: false,
    completedBy: 89
  },
  {
    id: "challenge_5",
    title: "Circuit Explorer",
    description: "Learn about 5 different F1 circuits by completing track guides",
    type: "education",
    reward: 400,
    xpReward: 250,
    badge: "Track Scholar",
    timeLeft: "8 days",
    expiresAt: "2024-12-17T23:59:59Z",
    difficulty: "medium",
    progress: { current: 2, required: 5 },
    requirements: ["Basic F1 knowledge quiz completed"],
    category: "Learning",
    isDaily: false,
    completedBy: 67
  },
  {
    id: "challenge_6",
    title: "Weekend Warrior",
    description: "Participate in all race weekend activities: qualifying predictions, race predictions, and post-race analysis",
    type: "weekend",
    reward: 300,
    xpReward: 180,
    badge: "Weekend Expert",
    timeLeft: "2 days",
    expiresAt: "2024-12-10T20:00:00Z",
    difficulty: "medium", 
    progress: { current: 1, required: 3 },
    requirements: ["Race weekend active"],
    category: "Racing",
    isDaily: false,
    completedBy: 234
  },
  {
    id: "challenge_7",
    title: "Newcomer Welcome",
    description: "Complete your profile, make first prediction, and join a fantasy league",
    type: "onboarding",
    reward: 150,
    xpReward: 100,
    badge: "F1 Rookie",
    timeLeft: "30 days",
    expiresAt: "2025-01-08T23:59:59Z",
    difficulty: "easy",
    progress: { current: 2, required: 3 },
    requirements: ["New account (under 7 days)"],
    category: "Getting Started",
    isDaily: false,
    completedBy: 2891
  },
  {
    id: "challenge_8",
    title: "Championship Points Hunter",
    description: "Earn 1000 fantasy points across all your teams this week",
    type: "fantasy",
    reward: 600,
    xpReward: 400,
    badge: "Points Master",
    timeLeft: "4 days",
    expiresAt: "2024-12-13T23:59:59Z",
    difficulty: "hard",
    progress: { current: 647, required: 1000 },
    requirements: ["Active fantasy team", "Participated in at least 3 races"],
    category: "Fantasy",
    isDaily: false,
    completedBy: 45
  }
]

// Generate dynamic challenges based on current F1 context
async function generateDynamicChallenges() {
  const dynamicChallenges = []
  
  try {
    // Get next race for race-specific challenges
    const nextRace = await f1Api.getNextRace()
    if (nextRace) {
      dynamicChallenges.push({
        id: `race_${nextRace.round}_challenge`,
        title: `${nextRace.raceName} Predictor`,
        description: `Make predictions for all sessions at ${nextRace.circuit.circuitName}`,
        type: "race_specific",
        reward: 200,
        xpReward: 100,
        badge: "Race Weekend Champion",
        timeLeft: "Until race start",
        expiresAt: nextRace.date,
        difficulty: "medium",
        progress: { current: 0, required: 3 }, // 3 sessions to predict
        requirements: ["Account verification"],
        category: "Racing",
        isDaily: false,
        completedBy: Math.floor(Math.random() * 200),
        isLive: true,
        raceDetails: {
          name: nextRace.raceName,
          circuit: nextRace.circuit.circuitName,
          location: nextRace.circuit.location.locality + ", " + nextRace.circuit.location.country,
          date: nextRace.date
        }
      })
    }

    // Get current standings for championship challenges
    const standings = await f1Api.getDriverStandings()
    if (standings.length > 0) {
      const leader = standings[0]
      dynamicChallenges.push({
        id: "championship_leader_challenge",
        title: `Beat ${leader.driver.givenName} ${leader.driver.familyName}`,
        description: `Pick a driver to outperform the current championship leader in the next race`,
        type: "prediction",
        reward: 350,
        xpReward: 200,
        badge: "Giant Slayer",
        timeLeft: "Until next race",
        expiresAt: nextRace?.date || "2024-12-31T23:59:59Z",
        difficulty: "hard",
        progress: { current: 0, required: 1 },
        requirements: ["Made at least 5 predictions"],
        category: "Racing",
        isDaily: false,
        completedBy: Math.floor(Math.random() * 100),
        isLive: true,
        championshipContext: {
          leaderName: `${leader.driver.givenName} ${leader.driver.familyName}`,
          leaderPoints: leader.points,
          leaderTeam: leader.constructors[0]?.name || "Unknown"
        }
      })
    }
  } catch (error) {
    console.log("Could not generate dynamic challenges:", error)
  }
  
  return dynamicChallenges
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // prediction, activity, fantasy, etc.
    const difficulty = searchParams.get("difficulty") // easy, medium, hard
    const category = searchParams.get("category") // Racing, Fantasy, etc.
    const activeOnly = searchParams.get("activeOnly") === "true"
    const userId = searchParams.get("userId") // For personalized challenges
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    
    let challenges = [...mockChallenges]
    
    // Add dynamic challenges
    const dynamicChallenges = await generateDynamicChallenges()
    challenges = [...dynamicChallenges, ...challenges]
    
    // Filter by type
    if (type) {
      challenges = challenges.filter(c => c.type === type)
    }
    
    // Filter by difficulty  
    if (difficulty) {
      challenges = challenges.filter(c => c.difficulty === difficulty)
    }
    
    // Filter by category
    if (category) {
      challenges = challenges.filter(c => c.category === category)
    }
    
    // Filter active only (not expired)
    if (activeOnly) {
      const now = new Date()
      challenges = challenges.filter(c => new Date(c.expiresAt) > now)
    }
    
    // Limit results
    challenges = challenges.slice(0, limit)
    
    // Add user progress if userId provided (mock for now)
    if (userId) {
      challenges = challenges.map(challenge => ({
        ...challenge,
        userParticipating: Math.random() > 0.7, // 30% chance user is participating
        userProgress: Math.random() > 0.5 ? {
          current: Math.floor(Math.random() * challenge.progress.required),
          required: challenge.progress.required,
          percentage: Math.floor(Math.random() * 100)
        } : null
      }))
    }
    
    return NextResponse.json({
      success: true,
      challenges,
      total: challenges.length,
      filters: { type, difficulty, category, activeOnly, userId, limit }
    })
  } catch (error) {
    console.error("Error fetching challenges:", error)
    return NextResponse.json({ 
      success: false,
      challenges: mockChallenges.slice(0, 8),
      error: "Failed to fetch challenges data"
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body
    
    if (action === "accept") {
      const { challengeId, userId } = body
      
      // In production, this would add the challenge to user's active challenges
      const acceptResult = {
        success: true,
        challengeId,
        userId,
        message: "Challenge accepted successfully",
        startedAt: new Date().toISOString(),
        progress: { current: 0, required: 1 }
      }
      
      return NextResponse.json(acceptResult)
    }
    
    if (action === "complete") {
      const { challengeId, userId, evidence } = body
      
      // Process challenge completion
      const completionResult = {
        success: true,
        challengeId,
        userId,
        reward: Math.floor(Math.random() * 500) + 100,
        xpGained: Math.floor(Math.random() * 200) + 50,
        badgeUnlocked: Math.random() > 0.7 ? "Challenge Master" : null,
        completedAt: new Date().toISOString(),
        message: "Challenge completed successfully!"
      }
      
      return NextResponse.json(completionResult)
    }
    
    if (action === "progress") {
      const { challengeId, userId, progressData } = body
      
      // Update challenge progress
      const progressResult = {
        success: true,
        challengeId,
        userId,
        newProgress: progressData,
        message: "Progress updated",
        updatedAt: new Date().toISOString()
      }
      
      return NextResponse.json(progressResult)
    }
    
    // Create new challenge (admin functionality)
    const newChallenge = {
      id: `challenge_${Date.now()}`,
      ...body,
      progress: { current: 0, required: body.required || 1 },
      completedBy: 0,
      createdAt: new Date().toISOString()
    }
    
    return NextResponse.json(newChallenge, { status: 201 })
  } catch (error) {
    console.error("Challenge operation error:", error)
    return NextResponse.json({ error: "Failed to perform challenge operation" }, { status: 500 })
  }
}
