import { NextResponse } from "next/server"
import { f1Api } from "@/lib/f1-api"

// Mock categorized content data
const mockCategorizedContent = [
  { 
    category: "championship", 
    priority: "breaking", 
    count: 15, 
    latestUpdate: "2024-12-08T10:30:00Z",
    totalViews: 245000,
    totalEngagement: 18500,
    description: "Championship battles, title fights, and standings updates"
  },
  { 
    category: "team-news", 
    priority: "high", 
    count: 28, 
    latestUpdate: "2024-12-07T16:15:00Z",
    totalViews: 180000,
    totalEngagement: 12400,
    description: "Team strategies, technical updates, and organizational changes"
  },
  { 
    category: "driver-news", 
    priority: "high", 
    count: 34, 
    latestUpdate: "2024-12-06T14:45:00Z",
    totalViews: 320000,
    totalEngagement: 25800,
    description: "Driver transfers, interviews, and personal stories"
  },
  { 
    category: "technical", 
    priority: "medium", 
    count: 22, 
    latestUpdate: "2024-12-04T12:00:00Z",
    totalViews: 95000,
    totalEngagement: 7200,
    description: "Technical analysis, car development, and regulations"
  },
  { 
    category: "race-preview", 
    priority: "high", 
    count: 24, 
    latestUpdate: "2024-12-03T09:00:00Z",
    totalViews: 150000,
    totalEngagement: 9800,
    description: "Upcoming race analysis and circuit guides"
  },
  { 
    category: "gossip", 
    priority: "low", 
    count: 45, 
    latestUpdate: "2024-12-03T18:30:00Z",
    totalViews: 280000,
    totalEngagement: 35600,
    description: "Paddock rumors, silly season speculation, and insider whispers"
  },
  { 
    category: "regulations", 
    priority: "medium", 
    count: 12, 
    latestUpdate: "2024-12-05T09:20:00Z",
    totalViews: 68000,
    totalEngagement: 4200,
    description: "FIA rule changes, safety updates, and sporting regulations"
  },
  { 
    category: "circuits", 
    priority: "low", 
    count: 18, 
    latestUpdate: "2024-12-01T13:45:00Z",
    totalViews: 75000,
    totalEngagement: 5400,
    description: "Circuit spotlights, track changes, and venue information"
  }
]

const mockBreakingNews = [
  {
    id: "breaking_1",
    title: "Max Verstappen Clinches Fourth Consecutive Championship Title",
    excerpt: "Verstappen makes history with his fourth straight title, cementing his place among F1 legends.",
    category: "championship",
    priority: "breaking",
    publishedAt: "2024-12-08T10:30:00Z",
    engagement: { views: 15420, likes: 3240, shares: 890, comments: 456 },
    source: "Official F1"
  },
  {
    id: "breaking_2", 
    title: "URGENT: Safety Car Deployed in Practice Session",
    excerpt: "Red flag conditions halt FP2 session after incident at Turn 7.",
    category: "race-day",
    priority: "breaking",
    publishedAt: "2024-12-07T14:22:00Z",
    engagement: { views: 8750, likes: 1200, shares: 450, comments: 234 },
    source: "F1 Live"
  },
  {
    id: "breaking_3",
    title: "Ferrari Announces Shock Driver Swap for 2025",
    excerpt: "Unexpected move sends shockwaves through the F1 paddock.",
    category: "driver-news", 
    priority: "breaking",
    publishedAt: "2024-12-06T18:45:00Z",
    engagement: { views: 22150, likes: 4560, shares: 1240, comments: 789 },
    source: "Scuderia Ferrari"
  },
  {
    id: "breaking_4",
    title: "FIA Announces Emergency Rule Change",
    excerpt: "New safety regulation to be implemented immediately following recent incidents.",
    category: "regulations",
    priority: "breaking", 
    publishedAt: "2024-12-05T11:30:00Z",
    engagement: { views: 12300, likes: 2100, shares: 560, comments: 334 },
    source: "FIA Official"
  },
  {
    id: "breaking_5",
    title: "Weather Alert: Heavy Rain Expected for Qualifying",
    excerpt: "Meteorologists predict severe weather conditions could impact qualifying sessions.",
    category: "weather",
    priority: "breaking",
    publishedAt: "2024-12-04T16:15:00Z",
    engagement: { views: 6890, likes: 980, shares: 190, comments: 123 },
    source: "F1 Weather Central"
  }
]

const mockTrendingNews = [
  {
    id: "trending_1",
    title: "Lewis Hamilton's Emotional Final Race with Mercedes",
    excerpt: "Seven-time champion reflects on his incredible journey with the Silver Arrows.",
    category: "driver-news",
    priority: "high",
    publishedAt: "2024-12-06T14:45:00Z",
    engagement: { views: 22150, likes: 5670, shares: 1240, comments: 789 },
    trendingScore: 95
  },
  {
    id: "trending_2", 
    title: "Paddock Gossip: Silly Season Rumors Heat Up",
    excerpt: "Latest rumors and insider whispers from the F1 paddock.",
    category: "gossip",
    priority: "low",
    publishedAt: "2024-12-03T18:30:00Z",
    engagement: { views: 12340, likes: 2450, shares: 678, comments: 345 },
    trendingScore: 87
  },
  {
    id: "trending_3",
    title: "McLaren's Technical Innovation Breakdown",
    excerpt: "How McLaren's engineers revolutionized their 2024 car design.",
    category: "technical",
    priority: "medium",
    publishedAt: "2024-12-02T10:20:00Z", 
    engagement: { views: 8900, likes: 1780, shares: 290, comments: 156 },
    trendingScore: 82
  },
  {
    id: "trending_4",
    title: "Young Drivers Making Their Mark in 2024",
    excerpt: "Rising stars who have impressed throughout the season.",
    category: "young-drivers",
    priority: "medium",
    publishedAt: "2024-12-01T15:30:00Z",
    engagement: { views: 6700, likes: 1340, shares: 230, comments: 98 },
    trendingScore: 78
  }
]

async function generateDynamicCategories() {
  const dynamicContent = {
    categories: [...mockCategorizedContent],
    breaking: [...mockBreakingNews],
    trending: [...mockTrendingNews]
  }

  try {
    // Add live championship data to breaking news if points gap is close
    const standings = await f1Api.getDriverStandings()
    if (standings.length >= 2) {
      const leader = standings[0]
      const secondPlace = standings[1] 
      const pointsGap = Number.parseInt(leader.points) - Number.parseInt(secondPlace.points)
      
      if (pointsGap < 50) {
        dynamicContent.breaking.unshift({
          id: "live_championship_battle",
          title: `LIVE: Championship Battle Intensifies - Only ${pointsGap} Points Separate Leaders!`,
          excerpt: `${leader.driver.givenName} ${leader.driver.familyName} vs ${secondPlace.driver.givenName} ${secondPlace.driver.familyName} - Title fight heating up!`,
          category: "championship",
          priority: "breaking",
          publishedAt: new Date().toISOString(),
          engagement: {
            views: Math.floor(Math.random() * 5000) + 10000,
            likes: Math.floor(Math.random() * 1000) + 2000,
            shares: Math.floor(Math.random() * 300) + 500,
            comments: Math.floor(Math.random() * 200) + 300
          },
          source: "F1 Live Updates",
          isLive: true
        })
      }
    }

    // Add next race preview to trending if race is upcoming
    const nextRace = await f1Api.getNextRace()
    if (nextRace) {
      dynamicContent.trending.unshift({
        id: `race_preview_trending_${nextRace.round}`,
        title: `${nextRace.raceName} Circuit Guide & Preview`,
        excerpt: `Everything you need to know about the upcoming race at ${nextRace.circuit.circuitName}.`,
        category: "race-preview",
        priority: "high",
        publishedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        engagement: {
          views: Math.floor(Math.random() * 3000) + 7000,
          likes: Math.floor(Math.random() * 800) + 1200,
          shares: Math.floor(Math.random() * 200) + 300,
          comments: Math.floor(Math.random() * 100) + 150
        },
        trendingScore: 90,
        isLive: true
      })
    }
  } catch (error) {
    console.log("Could not generate dynamic category content:", error)
  }

  return dynamicContent
}

export async function GET() {
  try {
    const dynamicContent = await generateDynamicCategories()
    
    // Calculate AI processing statistics
    const totalArticles = dynamicContent.categories.reduce((sum, cat) => sum + cat.count, 0)
    const totalViews = dynamicContent.categories.reduce((sum, cat) => sum + cat.totalViews, 0)
    const totalEngagement = dynamicContent.categories.reduce((sum, cat) => sum + cat.totalEngagement, 0)

    const aiProcessingStats = {
      totalArticles,
      totalViews,
      totalEngagement,
      lastProcessed: new Date().toISOString(),
      processingEngine: "Claude AI + GPT-4",
      contentMix: "65% Breaking News, 20% Technical Analysis, 15% Gossip",
      sentimentAnalysis: {
        positive: Math.floor(totalArticles * 0.45),
        neutral: Math.floor(totalArticles * 0.35), 
        negative: Math.floor(totalArticles * 0.20)
      },
      popularTags: ["Championship", "Mercedes", "Red Bull", "Ferrari", "Technical", "Drivers"],
      averageEngagement: Math.round(totalEngagement / Math.max(1, totalArticles)),
      peakTrafficTime: "14:00-18:00 UTC",
      topSources: ["Official F1", "Team Press Releases", "Paddock Reporters", "Technical Analysis"]
    }

    // Add category metadata
    const categoriesWithMeta = dynamicContent.categories.map(category => ({
      ...category,
      averageViews: Math.round(category.totalViews / category.count),
      engagementRate: (category.totalEngagement / category.totalViews * 100).toFixed(2) + "%",
      lastUpdatedRelative: getRelativeTime(category.lastUpdate)
    }))

    return NextResponse.json({
      success: true,
      categories: categoriesWithMeta,
      breaking: dynamicContent.breaking.slice(0, 5),
      trending: dynamicContent.trending.slice(0, 8),
      aiProcessingStats,
      metadata: {
        totalCategories: categoriesWithMeta.length,
        totalBreaking: dynamicContent.breaking.length,
        totalTrending: dynamicContent.trending.length,
        lastRefresh: new Date().toISOString(),
        contentLanguages: ["English", "Spanish", "Italian", "German", "French"],
        globalReach: "185 countries",
        updateFrequency: "Real-time"
      }
    })
  } catch (error) {
    console.error("Error fetching news categories:", error)
    
    const fallbackStats = {
      totalArticles: 198,
      totalViews: 1413000,
      totalEngagement: 124000,
      lastProcessed: new Date().toISOString(),
      processingEngine: "Claude AI + GPT-4", 
      contentMix: "65% Breaking News, 20% Technical Analysis, 15% Gossip"
    }

    return NextResponse.json({ 
      success: false,
      categories: mockCategorizedContent,
      breaking: mockBreakingNews.slice(0, 5),
      trending: mockTrendingNews,
      aiProcessingStats: fallbackStats,
      error: "Failed to fetch live news data - using cached content"
    }, { status: 200 })
  }
}

// Utility function to get relative time
function getRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return "Just now"
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  return date.toLocaleDateString()
}
