// Real-time RSS scraper that fetches live F1 news
export class LiveF1Scraper {
  private readonly RSS_SOURCES = [
    {
      name: "Formula 1 Official",
      url: "https://www.formula1.com/en/latest/all.xml",
      category: "official"
    },
    {
      name: "Autosport",
      url: "https://www.autosport.com/rss/f1/news/",
      category: "news"
    },
    {
      name: "Motorsport.com",
      url: "https://www.motorsport.com/rss/f1/news/",
      category: "news"
    },
    {
      name: "Planet F1",
      url: "https://www.planetf1.com/news/feed/",
      category: "gossip"
    },
    {
      name: "GPFans",
      url: "https://www.gpfans.com/rss/news/",
      category: "news"
    }
  ]

  async scrapeAllSources() {
    const allArticles = []
    
    for (const source of this.RSS_SOURCES) {
      try {
        console.log(`Scraping ${source.name}...`)
        const articles = await this.scrapeRSSFeed(source)
        allArticles.push(...articles)
        console.log(`✓ ${source.name}: ${articles.length} articles`)
      } catch (error) {
        console.error(`✗ ${source.name} failed:`, error)
      }
    }

    // Sort by publication date (newest first)
    allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    
    return allArticles
  }

  async scrapeRSSFeed(source: { name: string; url: string; category: string }) {
    try {
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'GrandPrixSocial/1.0 F1 News Aggregator',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const xmlText = await response.text()
      const items = this.parseRSSItems(xmlText)

      return items.map(item => this.transformToArticle(item, source))
    } catch (error) {
      console.error(`Failed to scrape ${source.name}:`, error)
      return []
    }
  }

  private parseRSSItems(xml: string) {
    const items = []
    
    // Find all items
    const itemMatches = xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || []
    
    for (const itemXml of itemMatches) {
      try {
        const title = this.extractXMLTag(itemXml, 'title')
        const description = this.extractXMLTag(itemXml, 'description') || this.extractXMLTag(itemXml, 'content:encoded')
        const link = this.extractXMLTag(itemXml, 'link')
        const pubDate = this.extractXMLTag(itemXml, 'pubDate') || this.extractXMLTag(itemXml, 'dc:date')
        const guid = this.extractXMLTag(itemXml, 'guid') || link
        
        if (title && description) {
          items.push({ 
            title: this.cleanText(title),
            description: this.cleanText(description),
            link,
            pubDate,
            guid
          })
        }
      } catch (error) {
        console.warn('Failed to parse RSS item:', error)
      }
    }
    
    return items.slice(0, 20) // Limit to latest 20 items per source
  }

  private extractXMLTag(xml: string, tag: string): string {
    const patterns = [
      new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'),
      new RegExp(`<${tag}[^>]*>([\\s\\S]*?)$`, 'i') // For self-closing or malformed tags
    ]
    
    for (const pattern of patterns) {
      const match = xml.match(pattern)
      if (match) {
        return this.cleanText(match[1])
      }
    }
    return ''
  }

  private cleanText(text: string): string {
    return text
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') // Remove CDATA
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
  }

  private transformToArticle(item: any, source: any) {
    const publishedDate = this.parseDate(item.pubDate)
    const views = Math.floor(Math.random() * 15000) + 5000
    const likes = Math.floor(views * (Math.random() * 0.08 + 0.02))
    const shares = Math.floor(likes * (Math.random() * 0.3 + 0.1))
    const comments = Math.floor(likes * (Math.random() * 0.4 + 0.2))

    return {
      id: this.generateId(item.guid || item.link),
      title: item.title,
      excerpt: item.description.substring(0, 200) + "...",
      content: this.generateFullArticle(item.title, item.description),
      category: this.categorizeContent(item.title, item.description),
      priority: this.determinePriority(item.title, item.description),
      tags: this.extractTags(item.title, item.description),
      author: source.name,
      publishedAt: publishedDate,
      source: source.name,
      originalUrl: item.link,
      engagement: { views, likes, shares, comments },
      readTime: Math.ceil(item.description.split(' ').length / 200),
      isLive: this.isBreaking(item.title, item.description),
      scrapedAt: new Date().toISOString()
    }
  }

  private parseDate(dateString: string): string {
    try {
      if (!dateString) return new Date().toISOString()
      
      // Handle various date formats
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return new Date().toISOString()
      }
      return date.toISOString()
    } catch {
      return new Date().toISOString()
    }
  }

  private generateId(source: string): string {
    return `rss_${source.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateFullArticle(title: string, description: string): string {
    // Create a more comprehensive article from the RSS description
    const paragraphs = description.split(/[.!?]+/).filter(p => p.trim().length > 20)
    
    let article = `${description}\n\n`
    
    // Add contextual content based on title keywords
    if (title.toLowerCase().includes('verstappen')) {
      article += `This development adds another chapter to Max Verstappen's remarkable Formula 1 journey. The Dutch driver's consistency and skill continue to set new standards in the sport.\n\n`
    }
    
    if (title.toLowerCase().includes('ferrari')) {
      article += `Ferrari's ongoing evolution remains one of Formula 1's most closely watched storylines. The Italian team's rich history and passionate fanbase ensure every development receives intense scrutiny.\n\n`
    }
    
    if (title.toLowerCase().includes('mercedes')) {
      article += `Mercedes' approach to this situation reflects their methodical philosophy that has served them well throughout the hybrid era. The team's strategic thinking continues to influence competitive dynamics.\n\n`
    }
    
    if (title.toLowerCase().includes('championship') || title.toLowerCase().includes('title')) {
      article += `Championship implications ripple through every aspect of Formula 1, affecting team strategies, driver performances, and fan engagement worldwide. These developments will likely influence the sport's trajectory in the coming races.\n\n`
    }
    
    article += `As Formula 1 continues to evolve, stories like this demonstrate why the sport remains compelling for millions of fans worldwide. The combination of technical innovation, human drama, and competitive excellence creates a unique spectacle that transcends traditional motorsport boundaries.\n\n`
    
    article += `Stay tuned to GrandPrixSocial for continued coverage of this developing story and all the latest F1 news as it unfolds.`
    
    return article
  }

  private categorizeContent(title: string, content: string): string {
    const text = `${title} ${content}`.toLowerCase()
    
    if (text.includes('breaking') || text.includes('exclusive') || text.includes('urgent')) {
      return 'breaking'
    }
    if (text.includes('technical') || text.includes('aerodynamic') || text.includes('engine') || text.includes('development')) {
      return 'technical'
    }
    if (text.includes('driver') || text.includes('transfer') || text.includes('contract') || text.includes('hamilton') || text.includes('verstappen')) {
      return 'driver-news'
    }
    if (text.includes('gossip') || text.includes('rumor') || text.includes('speculation') || text.includes('silly season')) {
      return 'gossip'
    }
    if (text.includes('team') || text.includes('ferrari') || text.includes('mercedes') || text.includes('red bull') || text.includes('mclaren')) {
      return 'team-news'
    }
    if (text.includes('championship') || text.includes('points') || text.includes('standings')) {
      return 'championship'
    }
    
    return 'general'
  }

  private determinePriority(title: string, content: string): string {
    const text = `${title} ${content}`.toLowerCase()
    
    if (text.includes('breaking') || text.includes('championship') || text.includes('exclusive') || text.includes('wins')) {
      return 'breaking'
    }
    if (text.includes('race') || text.includes('qualifying') || text.includes('practice') || text.includes('fastest')) {
      return 'high'
    }
    
    return 'regular'
  }

  private extractTags(title: string, content: string): string[] {
    const text = `${title} ${content}`.toLowerCase()
    const tags = ['F1 2024', 'Formula 1']
    
    const driverNames = ['verstappen', 'hamilton', 'leclerc', 'russell', 'norris', 'piastri', 'sainz', 'perez', 'alonso', 'stroll']
    const teamNames = ['red bull', 'mercedes', 'ferrari', 'mclaren', 'aston martin', 'alpine', 'williams', 'alphatauri', 'alfa romeo', 'haas']
    
    for (const driver of driverNames) {
      if (text.includes(driver)) {
        tags.push(driver.charAt(0).toUpperCase() + driver.slice(1))
      }
    }
    
    for (const team of teamNames) {
      if (text.includes(team)) {
        tags.push(team.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '))
      }
    }
    
    if (text.includes('championship')) tags.push('Championship')
    if (text.includes('technical')) tags.push('Technical')
    if (text.includes('qualifying')) tags.push('Qualifying')
    if (text.includes('race')) tags.push('Race Weekend')
    
    return [...new Set(tags)].slice(0, 6)
  }

  private isBreaking(title: string, content: string): boolean {
    const text = `${title} ${content}`.toLowerCase()
    return text.includes('breaking') || text.includes('urgent') || text.includes('exclusive')
  }
}