import { f1Api } from "@/lib/f1-api"
import { getDb } from "@/lib/db"

const db = getDb()
import { socialMediaPosts, monitoredAccounts } from "@/lib/schema"
import { eq } from "drizzle-orm"

// F1 News Sources to scrape
const F1_NEWS_SOURCES = [
  {
    platform: "rss",
    handle: "formula1.com",
    accountType: "news",
    priority: 5,
    url: "https://www.formula1.com/en/latest/all.xml"
  },
  {
    platform: "rss", 
    handle: "autosport.com",
    accountType: "news",
    priority: 4,
    url: "https://www.autosport.com/rss/f1/news/"
  },
  {
    platform: "rss",
    handle: "motorsport.com",
    accountType: "news", 
    priority: 4,
    url: "https://www.motorsport.com/rss/f1/news/"
  },
  {
    platform: "rss",
    handle: "planetf1.com",
    accountType: "gossip",
    priority: 3,
    url: "https://www.planetf1.com/news/feed/"
  }
]

// Social Media Accounts to monitor (placeholder structure)
const SOCIAL_ACCOUNTS = [
  { platform: "twitter", handle: "F1", accountType: "news", priority: 5 },
  { platform: "twitter", handle: "SkySportsF1", accountType: "news", priority: 4 },
  { platform: "twitter", handle: "F1insider", accountType: "gossip", priority: 3 },
  { platform: "twitter", handle: "ScuderiaFerrari", accountType: "team", priority: 4 },
  { platform: "twitter", handle: "redbullracing", accountType: "team", priority: 4 },
  { platform: "twitter", handle: "MercedesAMGF1", accountType: "team", priority: 4 },
]

export class F1NewsScraper {
  async scrapeRSSFeed(source: typeof F1_NEWS_SOURCES[0]) {
    try {
      console.log(`Scraping RSS: ${source.handle}`)
      
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'GrandPrixSocial/1.0 F1 News Aggregator'
        }
      })
      
      if (!response.ok) {
        throw new Error(`RSS fetch failed: ${response.status}`)
      }
      
      const xmlText = await response.text()
      
      // Parse RSS XML (simple extraction)
      const items = this.parseRSSItems(xmlText)
      
      // Store in database
      for (const item of items) {
        await this.storeScrapedPost({
          platform: source.platform,
          accountHandle: source.handle,
          accountType: source.accountType,
          originalPostId: item.guid || item.link,
          content: item.description,
          authorName: source.handle,
          publishedAt: new Date(item.pubDate),
          category: this.categorizeContent(item.title, item.description),
          priority: this.determinePriority(item.title, item.description)
        })
      }
      
      return items.length
    } catch (error) {
      console.error(`RSS scraping failed for ${source.handle}:`, error)
      return 0
    }
  }

  private parseRSSItems(xml: string) {
    const items = []
    
    // Simple RSS parsing (in production, use a proper XML parser)
    const itemMatches = xml.match(/<item[^>]*>[\s\S]*?<\/item>/g) || []
    
    for (const itemXml of itemMatches) {
      const title = this.extractXMLTag(itemXml, 'title')
      const description = this.extractXMLTag(itemXml, 'description')
      const link = this.extractXMLTag(itemXml, 'link')
      const pubDate = this.extractXMLTag(itemXml, 'pubDate')
      const guid = this.extractXMLTag(itemXml, 'guid')
      
      if (title && description) {
        items.push({ title, description, link, pubDate, guid })
      }
    }
    
    return items
  }
  
  private extractXMLTag(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
    const match = xml.match(regex)
    return match ? match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : ''
  }

  async scrapeF1API() {
    try {
      console.log('Scraping F1 API data...')
      
      // Get latest race results for news generation
      const standings = await f1Api.getDriverStandings()
      const nextRace = await f1Api.getNextRace()
      const lastRace = await f1Api.getLastRaceResults()
      
      const apiData = []
      
      // Championship updates
      if (standings.length > 1) {
        const leader = standings[0]
        const secondPlace = standings[1]
        const pointsGap = parseInt(leader.points) - parseInt(secondPlace.points)
        
        apiData.push({
          type: 'championship_update',
          title: `Championship Standings Update: ${leader.driver.givenName} ${leader.driver.familyName} Leads`,
          content: `${leader.driver.givenName} ${leader.driver.familyName} maintains championship lead with ${leader.points} points, ${pointsGap} points ahead of ${secondPlace.driver.givenName} ${secondPlace.driver.familyName}`,
          category: 'championship',
          priority: pointsGap < 30 ? 'breaking' : 'regular'
        })
      }
      
      // Next race preview
      if (nextRace) {
        apiData.push({
          type: 'race_preview',
          title: `${nextRace.raceName} Preview: Key Information`,
          content: `Formula 1 heads to ${nextRace.circuit.location.locality} for the ${nextRace.raceName} at ${nextRace.circuit.circuitName}`,
          category: 'race-preview', 
          priority: 'regular'
        })
      }
      
      // Last race results
      if (lastRace && lastRace.Results) {
        const winner = lastRace.Results[0]
        apiData.push({
          type: 'race_result',
          title: `${lastRace.raceName} Results: ${winner.Driver.givenName} ${winner.Driver.familyName} Takes Victory`,
          content: `${winner.Driver.givenName} ${winner.Driver.familyName} wins the ${lastRace.raceName} for ${winner.Constructor.name}`,
          category: 'race-results',
          priority: 'breaking'
        })
      }
      
      // Store API-sourced content
      for (const data of apiData) {
        await this.storeScrapedPost({
          platform: "f1-api",
          accountHandle: "ergast-api", 
          accountType: "news",
          originalPostId: `f1api-${data.type}-${Date.now()}`,
          content: data.content,
          authorName: "F1 Official API",
          publishedAt: new Date(),
          category: data.category,
          priority: data.priority
        })
      }
      
      return apiData.length
    } catch (error) {
      console.error('F1 API scraping failed:', error)
      return 0
    }
  }

  async storeScrapedPost(postData: {
    platform: string
    accountHandle: string
    accountType: string
    originalPostId: string
    content: string
    authorName: string
    publishedAt: Date
    category: string
    priority: string
  }) {
    try {
      // Check if already exists
      const existing = await db.select()
        .from(socialMediaPosts)
        .where(eq(socialMediaPosts.originalPostId, postData.originalPostId))
        .limit(1)
      
      if (existing.length > 0) {
        return // Already scraped
      }
      
      await db.insert(socialMediaPosts).values({
        platform: postData.platform,
        accountHandle: postData.accountHandle,
        accountType: postData.accountType,
        originalPostId: postData.originalPostId,
        content: postData.content,
        authorName: postData.authorName,
        publishedAt: postData.publishedAt,
        category: postData.category,
        priority: postData.priority,
        processed: false
      })
      
      console.log(`Stored scraped post: ${postData.originalPostId}`)
    } catch (error) {
      console.error('Failed to store scraped post:', error)
    }
  }

  private categorizeContent(title: string, content: string): string {
    const text = `${title} ${content}`.toLowerCase()
    
    if (text.includes('breaking') || text.includes('urgent') || text.includes('exclusive')) {
      return 'breaking'
    }
    if (text.includes('technical') || text.includes('aerodynamic') || text.includes('engine')) {
      return 'technical'
    }
    if (text.includes('transfer') || text.includes('driver') || text.includes('contract')) {
      return 'transfers'
    }
    if (text.includes('gossip') || text.includes('rumor') || text.includes('speculation')) {
      return 'gossip'
    }
    
    return 'general'
  }
  
  private determinePriority(title: string, content: string): string {
    const text = `${title} ${content}`.toLowerCase()
    
    if (text.includes('breaking') || text.includes('championship') || text.includes('crash')) {
      return 'breaking'
    }
    if (text.includes('race') || text.includes('qualifying') || text.includes('practice')) {
      return 'trending'
    }
    
    return 'regular'
  }

  async runFullScrape() {
    console.log('Starting full F1 news scrape...')
    
    let totalScraped = 0
    
    // Scrape RSS feeds
    for (const source of F1_NEWS_SOURCES) {
      const count = await this.scrapeRSSFeed(source)
      totalScraped += count
    }
    
    // Scrape F1 API
    const apiCount = await this.scrapeF1API()
    totalScraped += apiCount
    
    console.log(`Full scrape completed: ${totalScraped} new posts`)
    return totalScraped
  }
}

// Initialize and seed monitored accounts
export async function initializeMonitoredAccounts() {
  try {
    for (const account of SOCIAL_ACCOUNTS) {
      const existing = await db.select()
        .from(monitoredAccounts)
        .where(eq(monitoredAccounts.handle, account.handle))
        .limit(1)
        
      if (existing.length === 0) {
        await db.insert(monitoredAccounts).values({
          platform: account.platform,
          handle: account.handle,
          displayName: account.handle,
          accountType: account.accountType,
          priority: account.priority,
          isActive: true,
          scrapeFrequency: 60 // Every hour
        })
      }
    }
    console.log('Monitored accounts initialized')
  } catch (error) {
    console.error('Failed to initialize monitored accounts:', error)
  }
}