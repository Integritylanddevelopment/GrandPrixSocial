import { getDb } from "@/lib/db"

const db = getDb()
import { socialMediaPosts, f1ProcessedContent } from "@/lib/schema"
import { eq, and } from "drizzle-orm"

export class F1ContentProcessor {
  private openAIApiKey = process.env.OPENAI_API_KEY

  async processUnprocessedContent() {
    try {
      console.log('Starting AI content processing...')
      
      // Get unprocessed social media posts
      const unprocessedPosts = await db.select()
        .from(socialMediaPosts)
        .where(eq(socialMediaPosts.processed, false))
        .limit(20) // Process in batches
      
      if (unprocessedPosts.length === 0) {
        console.log('No unprocessed content found')
        return 0
      }
      
      console.log(`Found ${unprocessedPosts.length} unprocessed posts`)
      let processedCount = 0
      
      // Group posts by category for batch processing
      const groupedPosts = this.groupPostsByCategory(unprocessedPosts)
      
      for (const [category, posts] of Object.entries(groupedPosts)) {
        try {
          const processedArticle = await this.generateArticleFromPosts(category, posts)
          if (processedArticle) {
            await this.storeProcessedContent(processedArticle, posts)
            processedCount++
            
            // Mark source posts as processed
            for (const post of posts) {
              await db.update(socialMediaPosts)
                .set({ processed: true })
                .where(eq(socialMediaPosts.id, post.id))
            }
          }
        } catch (error) {
          console.error(`Failed to process ${category} posts:`, error)
        }
      }
      
      console.log(`AI processing completed: ${processedCount} articles generated`)
      return processedCount
    } catch (error) {
      console.error('AI content processing failed:', error)
      return 0
    }
  }

  private groupPostsByCategory(posts: any[]) {
    const groups: { [key: string]: any[] } = {}
    
    for (const post of posts) {
      const category = post.category || 'general'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(post)
    }
    
    return groups
  }

  async generateArticleFromPosts(category: string, posts: any[]) {
    try {
      if (!this.openAIApiKey) {
        console.log('OpenAI API key not found, using fallback content generation')
        return this.generateFallbackArticle(category, posts)
      }
      
      const sourceMaterial = posts.map(post => ({
        source: post.authorName,
        content: post.content,
        platform: post.platform,
        publishedAt: post.publishedAt
      }))
      
      const prompt = this.buildContentPrompt(category, sourceMaterial)
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openAIApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a professional F1 journalist writing for GrandPrixSocial. Create engaging, original articles that blend news facts with community-friendly tone. Always maintain accuracy while making content exciting for F1 fans.`
            },
            {
              role: 'user', 
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
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
      
      return this.parseGeneratedContent(generatedContent, category, posts)
    } catch (error) {
      console.error('OpenAI generation failed, using fallback:', error)
      return this.generateFallbackArticle(category, posts)
    }
  }

  private buildContentPrompt(category: string, sourceMaterial: any[]) {
    return `
Create an original F1 news article based on these source materials:

Category: ${category}
Sources: ${sourceMaterial.length} posts from various F1 news outlets

Source Material:
${sourceMaterial.map((source, i) => `
${i + 1}. ${source.source} (${source.platform}):
"${source.content}"
Published: ${source.publishedAt}
`).join('\n')}

Requirements:
- Write a compelling headline that captures the main story
- Create 2-3 paragraphs of original content (not just rewording)
- Blend facts from multiple sources into a cohesive narrative
- Use an engaging tone suitable for F1 enthusiasts
- Include relevant context and implications
- Estimate read time in minutes
- Suggest 3-5 relevant tags

Format your response as:
TITLE: [Article Title]
CONTENT: [Article paragraphs]
TAGS: [comma-separated tags]
READ_TIME: [number]
`
  }

  private parseGeneratedContent(content: string, category: string, sourcePosts: any[]) {
    const lines = content.split('\n')
    let title = ''
    let articleContent = ''
    let tags: string[] = []
    let readTime = 3
    
    let currentSection = ''
    for (const line of lines) {
      if (line.startsWith('TITLE:')) {
        title = line.replace('TITLE:', '').trim()
        currentSection = 'title'
      } else if (line.startsWith('CONTENT:')) {
        currentSection = 'content'
        articleContent = line.replace('CONTENT:', '').trim()
      } else if (line.startsWith('TAGS:')) {
        tags = line.replace('TAGS:', '').split(',').map(t => t.trim())
        currentSection = 'tags'
      } else if (line.startsWith('READ_time:')) {
        readTime = parseInt(line.replace('READ_TIME:', '').trim()) || 3
        currentSection = 'readtime'
      } else if (currentSection === 'content' && line.trim()) {
        articleContent += '\n' + line
      }
    }
    
    // Fallback values
    if (!title) {
      title = this.generateFallbackTitle(category, sourcePosts)
    }
    if (!articleContent) {
      articleContent = this.generateFallbackContent(category, sourcePosts)
    }
    if (tags.length === 0) {
      tags = this.generateFallbackTags(category)
    }
    
    return {
      title,
      content: articleContent,
      category,
      tags,
      readTime,
      priority: this.determinePriority(sourcePosts),
      newsPercentage: category === 'gossip' ? 40 : 80,
      gossipPercentage: category === 'gossip' ? 60 : 20
    }
  }

  private generateFallbackArticle(category: string, posts: any[]) {
    return {
      title: this.generateFallbackTitle(category, posts),
      content: this.generateFallbackContent(category, posts),
      category,
      tags: this.generateFallbackTags(category),
      readTime: 3,
      priority: this.determinePriority(posts),
      newsPercentage: category === 'gossip' ? 40 : 80,
      gossipPercentage: category === 'gossip' ? 60 : 20
    }
  }

  private generateFallbackTitle(category: string, posts: any[]): string {
    const templates = {
      breaking: [
        'F1 Breaking: Major Developments in the Paddock',
        'URGENT: Significant Changes Shake Formula 1',
        'Breaking F1 News: Latest Updates from the Circuit'
      ],
      technical: [
        'Technical Deep Dive: F1 Innovation Continues',
        'Engineering Focus: Latest F1 Technical Advances',
        'Tech Analysis: Behind the F1 Development Race'
      ],
      gossip: [
        'Paddock Whispers: Latest F1 Rumors and Speculation',
        'F1 Insider: What We\'re Hearing Behind the Scenes',
        'Silly Season Update: Transfer Talks Heat Up'
      ],
      championship: [
        'Championship Battle: Title Fight Intensifies',
        'Points Race Update: Current Championship Standings',
        'Title Chase: Latest from the Championship Fight'
      ]
    }
    
    const categoryTemplates = templates[category as keyof typeof templates] || [
      'F1 News Update: Latest from the World of Formula 1',
      'Grand Prix Update: F1 News Round-Up',
      'Formula 1 Report: Latest Developments'
    ]
    
    return categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)]
  }

  private generateFallbackContent(category: string, posts: any[]): string {
    const latestPost = posts[0]
    
    return `Formula 1 continues to generate excitement with the latest developments from ${latestPost?.authorName || 'the paddock'}. 

${category === 'gossip' 
  ? 'Sources close to the teams suggest significant changes could be on the horizon, with speculation mounting about potential moves in the coming weeks.'
  : 'Recent reports indicate important developments that could impact the championship battle and team strategies moving forward.'
}

As the F1 community processes these updates, fans can expect more details to emerge in the coming days. The implications for the current season and beyond remain to be fully understood, but early reactions suggest this could be a significant moment in the sport's ongoing evolution.

Stay tuned to GrandPrixSocial for continued coverage of this developing story and all the latest F1 news.`
  }

  private generateFallbackTags(category: string): string[] {
    const baseTags = ['F1 2024', 'Formula 1', 'Grand Prix']
    
    const categoryTags = {
      breaking: ['Breaking News', 'Live Updates'],
      technical: ['Technical Analysis', 'F1 Tech'],
      gossip: ['Paddock Gossip', 'Silly Season'],
      championship: ['Championship Battle', 'Title Fight'],
      transfers: ['Driver News', 'Team Changes']
    }
    
    return [...baseTags, ...(categoryTags[category as keyof typeof categoryTags] || [])]
  }

  private determinePriority(posts: any[]): string {
    const hasBreaking = posts.some(p => p.priority === 'breaking')
    const hasTrending = posts.some(p => p.priority === 'trending')
    
    if (hasBreaking) return 'breaking'
    if (hasTrending) return 'trending' 
    return 'regular'
  }

  async storeProcessedContent(article: any, sourcePosts: any[]) {
    try {
      const sourcePostIds = sourcePosts.map(p => p.id)
      
      await db.insert(f1ProcessedContent).values({
        title: article.title,
        content: article.content,
        newsPercentage: article.newsPercentage,
        gossipPercentage: article.gossipPercentage,
        sourcePosts: sourcePostIds,
        category: article.category,
        priority: article.priority,
        tags: article.tags,
        readTime: article.readTime,
        engagement: { views: 0, likes: 0, shares: 0, comments: 0 },
        processedBy: 'openai',
        isActive: true
      })
      
      console.log(`Stored processed article: ${article.title}`)
    } catch (error) {
      console.error('Failed to store processed content:', error)
    }
  }

  async getProcessedContent(options: {
    category?: string
    limit?: number
    priority?: string
  } = {}) {
    try {
      let query = db.select().from(f1ProcessedContent)
        .where(eq(f1ProcessedContent.isActive, true))
      
      if (options.category) {
        query = query.where(eq(f1ProcessedContent.category, options.category))
      }
      
      if (options.priority) {
        query = query.where(eq(f1ProcessedContent.priority, options.priority))
      }
      
      const results = await query
        .orderBy(f1ProcessedContent.publishedAt)
        .limit(options.limit || 20)
      
      return results
    } catch (error) {
      console.error('Failed to get processed content:', error)
      return []
    }
  }
}