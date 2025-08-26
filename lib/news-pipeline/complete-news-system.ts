import fs from 'fs/promises'
import path from 'path'

// Complete F1 News System - Real RSS scraping + AI processing
export class CompleteF1NewsSystem {
  private readonly RSS_SOURCES = [
    {
      name: "Formula 1 Official",
      url: "https://www.formula1.com/en/latest/all.xml",
      category: "official",
      priority: 5
    },
    {
      name: "Autosport",
      url: "https://www.autosport.com/rss/f1/news/",
      category: "news",
      priority: 4
    },
    {
      name: "Motorsport.com", 
      url: "https://www.motorsport.com/rss/f1/news/",
      category: "news",
      priority: 4
    },
    {
      name: "Planet F1",
      url: "https://www.planetf1.com/news/feed/",
      category: "gossip",
      priority: 3
    },
    {
      name: "GPFans",
      url: "https://www.gpfans.com/rss/news/f1/",
      category: "news",
      priority: 3
    },
    {
      name: "The Race",
      url: "https://the-race.com/formula-1/feed/",
      category: "analysis",
      priority: 3
    }
  ]

  private readonly dataDir = path.join(process.cwd(), 'data', 'news')
  private readonly scrapedFile = path.join(this.dataDir, 'scraped-posts.json')
  private readonly processedFile = path.join(this.dataDir, 'processed-articles.json')

  constructor() {
    this.ensureDataDirectory()
  }

  private async ensureDataDirectory() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true })
    } catch (error) {
      console.error('Failed to create data directory:', error)
    }
  }

  // STEP 1: SCRAPE ALL RSS FEEDS
  async scrapeAllRSSFeeds() {
    console.log('🕷️ Starting complete RSS scraping of F1 sources...')
    
    const allScrapedPosts = []
    
    for (const source of this.RSS_SOURCES) {
      try {
        console.log(`📡 Scraping ${source.name}...`)
        const posts = await this.scrapeRSSFeed(source)
        allScrapedPosts.push(...posts)
        console.log(`✅ ${source.name}: ${posts.length} articles scraped`)
      } catch (error) {
        console.error(`❌ ${source.name} failed:`, error.message)
      }
    }

    // Save scraped data
    await this.saveScrapedPosts(allScrapedPosts)
    console.log(`🎉 Total scraped: ${allScrapedPosts.length} posts from ${this.RSS_SOURCES.length} sources`)
    
    return allScrapedPosts
  }

  private async scrapeRSSFeed(source: any) {
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'GrandPrixSocial/1.0 F1 News Aggregator',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      },
      signal: AbortSignal.timeout(30000) // 30 second timeout
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const xmlText = await response.text()
    const items = this.parseRSSXML(xmlText)

    return items.map(item => ({
      id: `${source.name.toLowerCase().replace(/\s/g, '_')}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalPostId: item.guid || item.link || `${source.name}_${Date.now()}`,
      title: item.title,
      content: item.description,
      link: item.link,
      publishedAt: this.parseDate(item.pubDate),
      scrapedAt: new Date().toISOString(),
      source: source.name,
      category: this.categorizeContent(item.title, item.description),
      priority: this.determinePriority(item.title, item.description),
      processed: false
    }))
  }

  private parseRSSXML(xml: string) {
    const items = []
    const itemMatches = xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || []
    
    for (const itemXml of itemMatches) {
      try {
        const title = this.extractXMLTag(itemXml, 'title')
        const description = this.extractXMLTag(itemXml, 'description') || 
                           this.extractXMLTag(itemXml, 'content:encoded') ||
                           this.extractXMLTag(itemXml, 'summary')
        const link = this.extractXMLTag(itemXml, 'link')
        const pubDate = this.extractXMLTag(itemXml, 'pubDate') || 
                        this.extractXMLTag(itemXml, 'dc:date') ||
                        this.extractXMLTag(itemXml, 'published')
        const guid = this.extractXMLTag(itemXml, 'guid')
        
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
    
    return items.slice(0, 25) // Latest 25 items per source
  }

  private extractXMLTag(xml: string, tag: string): string {
    const patterns = [
      new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'),
      new RegExp(`<${tag}[^>]*\\s*/>`, 'i'),
      new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i')
    ]
    
    for (const pattern of patterns) {
      const match = xml.match(pattern)
      if (match && match[1]) {
        return this.cleanText(match[1])
      }
    }
    return ''
  }

  private cleanText(text: string): string {
    return text
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      .replace(/<[^>]*>/g, '')
      .replace(/&[^;]+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private parseDate(dateString: string): string {
    try {
      if (!dateString) return new Date().toISOString()
      const date = new Date(dateString)
      return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
    } catch {
      return new Date().toISOString()
    }
  }

  private categorizeContent(title: string, content: string): string {
    const text = `${title} ${content}`.toLowerCase()
    
    if (text.includes('breaking') || text.includes('exclusive')) return 'breaking'
    if (text.includes('verstappen') || text.includes('hamilton') || text.includes('driver')) return 'driver-news'
    if (text.includes('ferrari') || text.includes('mercedes') || text.includes('red bull') || text.includes('team')) return 'team-news'
    if (text.includes('technical') || text.includes('aerodynamic') || text.includes('development')) return 'technical'
    if (text.includes('championship') || text.includes('points') || text.includes('standings')) return 'championship'
    if (text.includes('gossip') || text.includes('rumor') || text.includes('speculation')) return 'gossip'
    
    return 'general'
  }

  private determinePriority(title: string, content: string): string {
    const text = `${title} ${content}`.toLowerCase()
    
    if (text.includes('breaking') || text.includes('championship') || text.includes('exclusive')) return 'breaking'
    if (text.includes('race') || text.includes('qualifying') || text.includes('win')) return 'high'
    return 'regular'
  }

  // STEP 2: AI PROCESSING WITH OPENAI
  async processAllContent() {
    console.log('🤖 Starting AI content processing...')
    
    const scrapedPosts = await this.loadScrapedPosts()
    const unprocessed = scrapedPosts.filter(post => !post.processed)
    
    if (unprocessed.length === 0) {
      console.log('✅ No unprocessed content found')
      return []
    }

    console.log(`📝 Processing ${unprocessed.length} articles with AI...`)
    
    const processedArticles = []
    
    // Process in groups by category for better AI context
    const grouped = this.groupByCategory(unprocessed)
    
    for (const [category, posts] of Object.entries(grouped)) {
      console.log(`🔄 Processing ${posts.length} ${category} articles...`)
      
      for (const post of posts) {
        try {
          const article = await this.processWithAI(post)
          processedArticles.push(article)
          
          // Mark as processed
          post.processed = true
          
          // Small delay to respect API limits
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          console.error(`Failed to process article: ${post.title}`, error)
        }
      }
    }

    // Save processed articles and update scraped posts
    await this.saveProcessedArticles(processedArticles)
    await this.saveScrapedPosts(scrapedPosts)
    
    console.log(`🎉 AI processing complete: ${processedArticles.length} articles generated`)
    return processedArticles
  }

  private groupByCategory(posts: any[]) {
    return posts.reduce((groups, post) => {
      const category = post.category
      if (!groups[category]) groups[category] = []
      groups[category].push(post)
      return groups
    }, {})
  }

  private async processWithAI(post: any) {
    const openaiKey = process.env.OPENAI_API_KEY
    
    if (!openaiKey || openaiKey === 'your_openai_key_here') {
      // Fallback to advanced content generation without OpenAI
      return this.generateAdvancedArticle(post)
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a seasoned Formula 1 journalist writing for GrandPrixSocial, the premier F1 social platform. Your writing style should be:

- Dynamic and engaging, using vivid motorsport terminology
- Rich in detail with specific F1 context and background
- Written for passionate F1 fans who want depth and analysis
- Include quotes, statistics, and technical insights when relevant
- Create compelling narratives that capture the drama and excitement of F1
- Use active voice and dynamic language
- Build suspense and emotion appropriate to the story
- Connect current events to broader F1 history and championship implications

Always write 4-6 substantial paragraphs (minimum 800 words) with proper journalistic structure. Include relevant context about teams, drivers, championship standings, or technical regulations when applicable.`
            },
            {
              role: 'user',
              content: `Transform this F1 news into a comprehensive, engaging article:\n\nOriginal Title: ${post.title}\nOriginal Content: ${post.content}\nCategory: ${post.category}\nSource: ${post.source}\n\nCreate:\n1. An attention-grabbing headline that captures the drama\n2. A comprehensive article (4-6 paragraphs, 800+ words)\n3. Rich F1 context, analysis, and implications\n4. Engaging narrative that brings the story to life\n\nMake this a must-read article for F1 enthusiasts.`
            }
          ],
          max_tokens: 2000,
          temperature: 0.75
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API failed: ${response.status}`)
      }

      const data = await response.json()
      const generatedContent = data.choices[0]?.message?.content

      if (!generatedContent) {
        throw new Error('No content generated')
      }

      return this.parseAIResponse(generatedContent, post)
    } catch (error) {
      console.log(`OpenAI failed for "${post.title}", using fallback generator`)
      return this.generateAdvancedArticle(post)
    }
  }

  private parseAIResponse(content: string, originalPost: any) {
    const lines = content.split('\n').filter(line => line.trim())
    const title = lines[0].replace(/^(Title:|Headline:)?\s*/, '').replace(/^["']|["']$/g, '')
    const bodyLines = lines.slice(1).filter(line => !line.match(/^(Title:|Headline:|Content:)/i))
    const body = bodyLines.join('\n\n')

    return this.createArticleObject(title || originalPost.title, body, originalPost)
  }

  private generateAdvancedArticle(post: any) {
    const enhancedTitle = this.enhanceTitle(post.title)
    const expandedContent = this.generateExpandedContent(post.title, post.content, post.category)
    
    return this.createArticleObject(enhancedTitle, expandedContent, post)
  }

  private enhanceTitle(originalTitle: string): string {
    let enhanced = originalTitle

    // Dynamic word replacements for more engaging headlines
    const enhancements = [
      { pattern: /wins?/i, replacement: Math.random() > 0.5 ? 'Dominates' : 'Conquers' },
      { pattern: /says?/i, replacement: Math.random() > 0.6 ? 'Reveals' : Math.random() > 0.3 ? 'Declares' : 'Admits' },
      { pattern: /announces?/i, replacement: Math.random() > 0.5 ? 'Unveils' : 'Confirms' },
      { pattern: /plans?/i, replacement: Math.random() > 0.5 ? 'Plots' : 'Schemes' },
      { pattern: /leads?/i, replacement: 'Spearheads' },
      { pattern: /joins?/i, replacement: 'Signs With' },
      { pattern: /leaves?/i, replacement: 'Departs' },
      { pattern: /crashes?/i, replacement: 'Suffers Dramatic Crash' },
      { pattern: /fastest/i, replacement: 'Lightning-Fast' },
      { pattern: /new/i, replacement: 'Revolutionary' },
      { pattern: /updates?/i, replacement: 'Game-Changing Updates' },
      { pattern: /changes?/i, replacement: 'Transforms' }
    ]

    for (const { pattern, replacement } of enhancements) {
      enhanced = enhanced.replace(pattern, replacement)
    }

    // Add drama indicators for certain keywords
    const dramaKeywords = [
      { pattern: /controversy/i, prefix: 'EXPLOSIVE: ' },
      { pattern: /crash/i, prefix: 'BREAKING: ' },
      { pattern: /retirement/i, prefix: 'SHOCKING: ' },
      { pattern: /championship/i, prefix: 'TITLE FIGHT: ' },
      { pattern: /record/i, prefix: 'HISTORIC: ' },
      { pattern: /exclusive/i, prefix: 'EXCLUSIVE: ' }
    ]

    for (const { pattern, prefix } of dramaKeywords) {
      if (pattern.test(enhanced) && !enhanced.includes(':')) {
        enhanced = `${prefix}${enhanced}`
        break
      }
    }

    // Ensure driver names are impactful
    enhanced = enhanced
      .replace(/Max Verstappen/gi, 'Verstappen')
      .replace(/Lewis Hamilton/gi, 'Hamilton')
      .replace(/Charles Leclerc/gi, 'Leclerc')
      .replace(/Lando Norris/gi, 'Norris')
      .replace(/Oscar Piastri/gi, 'Piastri')

    return enhanced
  }

  private generateExpandedContent(title: string, originalContent: string, category: string): string {
    const baseContent = originalContent || `Breaking developments in Formula 1 as ${title.toLowerCase()}.`
    
    // Create rich, engaging content based on category
    let expanded = this.createEngagingOpeningParagraph(title, baseContent, category)
    expanded += '\n\n'
    
    // Add detailed analysis paragraph
    expanded += this.generateAnalysisParagraph(title, category)
    expanded += '\n\n'
    
    // Add context and implications
    expanded += this.generateContextParagraph(title, category)
    expanded += '\n\n'
    
    // Add championship/season implications if relevant
    if (this.isChampionshipRelevant(title, baseContent)) {
      expanded += this.generateChampionshipImplications(title, category)
      expanded += '\n\n'
    }
    
    // Add forward-looking conclusion
    expanded += this.generateConcludingParagraph(title, category)
    
    return expanded
  }

  private createEngagingOpeningParagraph(title: string, content: string, category: string): string {
    const dynamicOpeners = {
      'driver-news': [
        'The paddock is buzzing with speculation as',
        'In a development that has sent shockwaves through the F1 community,',
        'The latest twist in Formula 1\'s ever-evolving driver market sees'
      ],
      'team-news': [
        'Behind the scenes at one of F1\'s most influential teams,',
        'The chess match of Formula 1 team dynamics takes another dramatic turn as',
        'In the high-stakes world of Formula 1 team management,'
      ],
      'technical': [
        'The relentless pursuit of aerodynamic perfection in Formula 1 has taken another leap forward as',
        'In the cutting-edge laboratories where F1 championships are truly won,',
        'The technical battleground of Formula 1 intensifies as'
      ],
      'breaking': [
        'BREAKING: The Formula 1 world was left stunned today as',
        'In an unprecedented development that rocks the F1 establishment,',
        'The motorsport world erupted in reaction to news that'
      ]
    }
    
    const openers = dynamicOpeners[category] || dynamicOpeners['breaking']
    const opener = openers[Math.floor(Math.random() * openers.length)]
    
    return `${opener} ${content}. This development represents far more than just another headline in the sport's daily news cycle – it's a pivotal moment that could reshape the competitive landscape of the world's premier motorsport series.`
  }

  private generateAnalysisParagraph(title: string, category: string): string {
    const analysisFrameworks = {
      'driver-news': `The implications of this move extend far beyond the immediate parties involved. In Formula 1's intricate ecosystem, driver decisions create ripple effects throughout the grid, influencing team dynamics, sponsorship arrangements, and strategic partnerships. With the current regulations emphasizing driver skill over pure machinery advantage, every seat change carries the potential to alter the championship balance. The timing of this development is particularly significant, coming at a moment when teams are finalizing their long-term strategies and evaluating their technical direction for the upcoming seasons.`,
      
      'team-news': `This strategic maneuver highlights the chess-like nature of Formula 1 team management, where every decision must be calculated against multiple variables including technical regulations, financial constraints, and competitive positioning. The modern F1 landscape demands that teams operate with the precision of a Swiss timepiece while maintaining the adaptability to pivot when opportunities arise. Such organizational changes often signal broader shifts in philosophy, resources allocation, and competitive ambitions that can define a team's trajectory for seasons to come.`,
      
      'technical': `The technical arms race in Formula 1 never sleeps, and developments like this underscore the relentless innovation that defines the sport. Every marginal gain, whether measured in thousandths of a second or subtle aerodynamic improvements, can be the difference between championship glory and midfield anonymity. The complexity of modern F1 cars, with their intricate power units, sophisticated aerodynamics, and advanced materials, means that technical breakthroughs often come from unexpected angles and require months or even years of development to fully realize their potential.`,
      
      'breaking': `The reverberations from this announcement will be felt across every level of the Formula 1 hierarchy. In a sport where information is power and timing is everything, such developments often trigger a cascade of decisions that reshape the competitive order. The stakeholders involved – from team principals and drivers to sponsors and broadcast partners – must now recalibrate their strategies and expectations based on this new reality.`
    }
    
    return analysisFrameworks[category] || analysisFrameworks['breaking']
  }

  private generateContextParagraph(title: string, category: string): string {
    const contextNarrative = `Formula 1's rich tapestry of competition has always been defined by moments of transformation – from legendary driver moves that changed the sport's trajectory to technical innovations that revolutionized performance. This latest development adds another chapter to that storied history, connecting past precedents with future possibilities. The sport's evolution from its early days to the current era of hybrid power units, budget caps, and global expansion has created a unique environment where tradition meets cutting-edge innovation.`
    
    const seasonalContext = `As the current season unfolds, every decision carries amplified significance. The championship fight, points standings, and competitive balance all factor into how this development will play out across the remaining races and beyond. Teams are simultaneously fighting for immediate results while laying the groundwork for future campaigns, creating a delicate balance between short-term tactics and long-term strategy.`
    
    return `${contextNarrative} ${seasonalContext}`
  }

  private isChampionshipRelevant(title: string, content: string): boolean {
    const championshipKeywords = ['championship', 'points', 'standings', 'title', 'winner', 'race', 'victory', 'verstappen', 'hamilton', 'leclerc', 'norris']
    const text = `${title} ${content}`.toLowerCase()
    return championshipKeywords.some(keyword => text.includes(keyword))
  }

  private generateChampionshipImplications(title: string, category: string): string {
    return `The championship implications of this development cannot be overstated. In Formula 1's unforgiving points system, where consistency often trumps occasional brilliance, every advantage – whether technical, strategic, or personnel-related – can prove decisive over the course of a season. With the current field more competitive than it has been in years, marginal gains become magnified in importance. Teams understand that championships are won through the accumulation of small advantages across multiple dimensions: car performance, strategic acumen, driver skill, and operational excellence. This development potentially shifts the equilibrium in ways that may not be immediately apparent but could prove crucial as the season reaches its climax.`
  }

  private generateConcludingParagraph(title: string, category: string): string {
    const conclusions = [
      `As the Formula 1 circus prepares for its next chapter, all eyes will be on how this development influences the sport's trajectory. The beauty of Formula 1 lies in its unpredictability – just when the competitive order seems established, new variables emerge to shake up the established hierarchy. For fans, media, and stakeholders alike, this story represents the kind of compelling narrative that makes Formula 1 the world's most watched motorsport series.`,
      
      `The ripple effects from this news will continue to unfold in the days and weeks ahead, as teams, drivers, and the broader F1 community adapt to this new reality. In a sport where milliseconds determine race outcomes and strategic decisions can make or break championships, every development carries the potential for far-reaching consequences. The Formula 1 paddock thrives on such moments of intrigue and speculation.`,
      
      `This development serves as a reminder of why Formula 1 continues to captivate audiences worldwide. Beyond the on-track action, the sport's off-track dynamics create a year-round spectacle of strategy, negotiation, and high-stakes decision-making. As this story continues to evolve, it will undoubtedly add another layer to the rich narrative tapestry that makes Formula 1 the ultimate fusion of sport, technology, and human drama.`
    ]
    
    const conclusion = conclusions[Math.floor(Math.random() * conclusions.length)]
    return `${conclusion}\n\nStay connected with GrandPrixSocial for comprehensive coverage and expert analysis as this story develops and shapes the future of Formula 1.`
  }

  private createArticleObject(title: string, content: string, originalPost: any) {
    // Real engagement metrics - start at zero and track actual usage
    const views = 0  // Will be incremented when users actually view the article
    const likes = 0  // Will be incremented when users actually like
    const shares = 0 // Will be incremented when users actually share  
    const comments = 0 // Will be incremented when users actually comment

    // Generate a more compelling excerpt
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20)
    const firstSentence = sentences[0]?.trim() + '.'
    const secondSentence = sentences[1]?.trim()
    let excerpt = firstSentence
    
    if (secondSentence && (excerpt.length + secondSentence.length) < 180) {
      excerpt += ' ' + secondSentence + '.'
    }
    
    if (excerpt.length < 150 && sentences[2]) {
      const thirdSentence = sentences[2].trim()
      if ((excerpt.length + thirdSentence.length) < 200) {
        excerpt += ' ' + thirdSentence + '.'
      }
    }
    
    excerpt = excerpt.length > 200 ? excerpt.substring(0, 197) + '...' : excerpt + '...'

    return {
      id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      content,
      excerpt,
      summary: excerpt, // For compatibility
      category: originalPost.category,
      priority: originalPost.priority,
      tags: this.generateTags(title, content),
      author: this.generateAuthorName(originalPost.category),
      publishedAt: originalPost.publishedAt,
      source: 'GrandPrixSocial',
      originalSource: originalPost.source,
      originalUrl: originalPost.link,
      engagement: { views, likes, shares, comments },
      readTime: Math.ceil(content.split(' ').length / 200),
      isLive: originalPost.priority === 'breaking',
      processedAt: new Date().toISOString(),
      sourcePost: originalPost.id,
      sentiment: this.generateSentiment(title, content),
      imageUrl: this.generatePlaceholderImage(originalPost.category)
    }
  }

  private generateAuthorName(category: string): string {
    const authors = {
      'breaking': ['Alex Martinez', 'Sarah Thompson', 'Marcus Rodriguez'],
      'driver-news': ['James Mitchell', 'Emma Clarke', 'David Foster'],
      'team-news': ['Rachel Green', 'Tom Wilson', 'Lisa Chen'],
      'technical': ['Dr. Michael Stewart', 'Elena Petrov', 'Prof. James Hart'],
      'championship': ['Chris Anderson', 'Maria Santos', 'Robert Taylor']
    }
    
    const categoryAuthors = authors[category] || authors['breaking']
    return categoryAuthors[Math.floor(Math.random() * categoryAuthors.length)]
  }

  private generateSentiment(title: string, content: string): string {
    const text = `${title} ${content}`.toLowerCase()
    
    const positiveKeywords = ['win', 'victory', 'success', 'record', 'achievement', 'dominant', 'excellent']
    const negativeKeywords = ['crash', 'failure', 'problem', 'issue', 'disappointing', 'struggle', 'penalty']
    const emotionalKeywords = ['dramatic', 'shocking', 'surprising', 'incredible', 'amazing', 'unbelievable']
    
    const positiveCount = positiveKeywords.filter(keyword => text.includes(keyword)).length
    const negativeCount = negativeKeywords.filter(keyword => text.includes(keyword)).length
    const emotionalCount = emotionalKeywords.filter(keyword => text.includes(keyword)).length
    
    if (emotionalCount > 1) return 'emotional'
    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  private generatePlaceholderImage(category: string): string {
    // F1-specific images from Unsplash with proper search terms
    const f1ImageMap = {
      'breaking': 'https://images.unsplash.com/photo-1583900985737-6d0495555783?w=800&h=400&fit=crop&q=80', // F1 car racing
      'driver-news': 'https://images.unsplash.com/photo-1599950755346-a3e58f84ca63?w=800&h=400&fit=crop&q=80', // F1 driver helmet
      'team-news': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop&q=80', // F1 garage/pit
      'technical': 'https://images.unsplash.com/photo-1558957497-0b934b4f2e79?w=800&h=400&fit=crop&q=80', // F1 car closeup
      'championship': 'https://images.unsplash.com/photo-1564422137569-85d939e22263?w=800&h=400&fit=crop&q=80', // F1 podium/celebration
      'general': 'https://images.unsplash.com/photo-1583900985737-6d0495555783?w=800&h=400&fit=crop&q=80' // F1 racing action
    }
    
    return f1ImageMap[category] || f1ImageMap['general']
  }

  private generateTags(title: string, content: string): string[] {
    const text = `${title} ${content}`.toLowerCase()
    const tags = ['F1 2025', 'Formula 1']
    
    // Comprehensive driver list
    const drivers = [
      'verstappen', 'hamilton', 'leclerc', 'russell', 'norris', 'piastri', 
      'sainz', 'perez', 'alonso', 'stroll', 'gasly', 'ocon', 'tsunoda', 
      'ricciardo', 'lawson', 'albon', 'colapinto', 'bearman', 'zhou', 'bottas'
    ]
    
    // All F1 teams
    const teams = [
      'red bull', 'mercedes', 'ferrari', 'mclaren', 'aston martin', 'alpine',
      'williams', 'rb', 'racing bulls', 'sauber', 'kick sauber', 'haas', 'cadillac'
    ]
    
    // Add driver tags
    drivers.forEach(driver => {
      if (text.includes(driver)) {
        tags.push(driver.charAt(0).toUpperCase() + driver.slice(1))
      }
    })
    
    // Add team tags
    teams.forEach(team => {
      if (text.includes(team)) {
        const formattedTeam = team.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
        tags.push(formattedTeam)
      }
    })
    
    // Topic-based tags
    const topicTags = [
      { keywords: ['championship', 'title', 'standings'], tag: 'Championship' },
      { keywords: ['race', 'grand prix', 'qualifying', 'sprint'], tag: 'Race Weekend' },
      { keywords: ['technical', 'aerodynamics', 'engine', 'hybrid'], tag: 'Technical' },
      { keywords: ['transfer', 'move', 'signing', 'contract'], tag: 'Driver Market' },
      { keywords: ['breaking', 'exclusive', 'urgent'], tag: 'Breaking News' },
      { keywords: ['crash', 'accident', 'incident'], tag: 'Race Incident' },
      { keywords: ['record', 'fastest', 'historic'], tag: 'Records' },
      { keywords: ['regulation', 'rule', 'fia'], tag: 'Regulations' },
      { keywords: ['strategy', 'pit stop', 'tactical'], tag: 'Strategy' },
      { keywords: ['monaco', 'silverstone', 'monza', 'spa', 'interlagos'], tag: 'Classic Circuits' }
    ]
    
    topicTags.forEach(({ keywords, tag }) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        tags.push(tag)
      }
    })
    
    // Season-specific tags
    if (text.includes('2025')) tags.push('2025 Season')
    if (text.includes('rookie') || text.includes('debut')) tags.push('Rising Stars')
    if (text.includes('retirement') || text.includes('farewell')) tags.push('End of Era')
    
    return [...new Set(tags)].slice(0, 8)
  }

  // DATA PERSISTENCE
  private async saveScrapedPosts(posts: any[]) {
    try {
      // Load existing posts and merge to prevent duplicates
      const existing = await this.loadScrapedPosts()
      const merged = [...posts]
      
      // Add existing posts that aren't duplicates
      for (const existingPost of existing) {
        const isDuplicate = merged.some(newPost => 
          newPost.originalPostId === existingPost.originalPostId
        )
        if (!isDuplicate) {
          merged.push(existingPost)
        }
      }
      
      // Sort by scraped date (newest first) and limit
      const sorted = merged
        .sort((a, b) => new Date(b.scrapedAt).getTime() - new Date(a.scrapedAt).getTime())
        .slice(0, 200) // Keep latest 200 scraped posts
      
      await fs.writeFile(this.scrapedFile, JSON.stringify(sorted, null, 2))
    } catch (error) {
      console.error('Failed to save scraped posts:', error)
    }
  }

  private async loadScrapedPosts(): Promise<any[]> {
    try {
      const data = await fs.readFile(this.scrapedFile, 'utf-8')
      return JSON.parse(data)
    } catch {
      return []
    }
  }

  private async saveProcessedArticles(articles: any[]) {
    try {
      // Load existing articles and merge
      const existing = await this.loadProcessedArticles()
      const merged = [...articles]
      
      // Add existing articles that aren't duplicates
      for (const existingArticle of existing) {
        const isDuplicate = merged.some(newArticle => 
          newArticle.sourcePost === existingArticle.sourcePost
        )
        if (!isDuplicate) {
          merged.push(existingArticle)
        }
      }
      
      // Sort by published date (newest first) and limit to latest 200
      const sorted = merged
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 200)
      
      await fs.writeFile(this.processedFile, JSON.stringify(sorted, null, 2))
    } catch (error) {
      console.error('Failed to save processed articles:', error)
    }
  }

  async loadProcessedArticles(): Promise<any[]> {
    try {
      const data = await fs.readFile(this.processedFile, 'utf-8')
      return JSON.parse(data)
    } catch {
      return []
    }
  }

  // MAIN PIPELINE EXECUTION
  async runCompleteNewsPipeline() {
    console.log('🚀 Starting complete F1 news pipeline...')
    
    try {
      // Step 1: Scrape all RSS feeds
      await this.scrapeAllRSSFeeds()
      
      // Step 2: Process with AI
      await this.processAllContent()
      
      // Step 3: Return latest articles
      const articles = await this.loadProcessedArticles()
      
      console.log(`✅ Pipeline complete! Generated ${articles.length} total articles`)
      return articles
      
    } catch (error) {
      console.error('❌ Pipeline failed:', error)
      throw error
    }
  }

  // GET ARTICLES FOR API
  async getArticles(options: {
    category?: string
    priority?: string
    limit?: number
  } = {}) {
    const articles = await this.loadProcessedArticles()
    console.log(`📊 getArticles: Found ${articles.length} total articles`)
    
    let filtered = articles

    if (options.category) {
      filtered = filtered.filter(article => article.category === options.category)
      console.log(`📊 After category filter (${options.category}): ${filtered.length} articles`)
    }

    if (options.priority) {
      filtered = filtered.filter(article => article.priority === options.priority)
      console.log(`📊 After priority filter (${options.priority}): ${filtered.length} articles`)
    }

    const result = filtered.slice(0, options.limit || 20)
    console.log(`📊 Final result: ${result.length} articles`)
    return result
  }
}