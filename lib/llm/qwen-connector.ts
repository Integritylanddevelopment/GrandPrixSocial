/**
 * Qwen3 Docker LLM Connector
 * Connects Grand Prix Social semantic analysis to local Qwen3 LLM
 */

export interface F1Entity {
  text: string
  category: 'drivers' | 'teams' | 'circuits' | 'technical' | 'events'
  confidence: number
}

export interface TopicAnalysis {
  topic: string
  score: number
  keywords: string[]
  confidence: number
}

export interface SentimentAnalysis {
  overall: 'positive' | 'negative' | 'neutral'
  confidence: number
  scores: {
    positive: number
    negative: number  
    neutral: number
  }
}

export interface SemanticAnalysisOutput {
  contentId: string
  category: 'breaking-news' | 'trending' | 'tech' | 'gossip' | 'transfers'
  confidence: number
  entities: F1Entity[]
  topics: TopicAnalysis[]
  sentiment: SentimentAnalysis
  priority: 'urgent' | 'high' | 'medium' | 'low'
  sourceData: {
    title: string
    content: string
    source: string
    publishedAt: string
  }
  suggestedLength: number
  targetAudience: 'general' | 'technical' | 'casual'
}

export interface GeneratedArticle {
  title: string
  content: string
  category: string
  tags: string[]
  estimatedReadTime: number
  seoMetadata: {
    description: string
    keywords: string[]
  }
}

export class QwenConnector {
  private readonly endpoint = 'http://localhost:12434/engines/llama.cpp/v1/chat/completions'
  private readonly model = 'ai/qwen3:latest'
  
  constructor() {
    console.log('🧠 Qwen3 LLM Connector initialized for F1 content generation')
  }

  /**
   * Generate F1 article using semantic analysis and Qwen3
   */
  async generateF1Article(semanticData: SemanticAnalysisOutput): Promise<GeneratedArticle> {
    console.log(`📝 Generating ${semanticData.category} article: ${semanticData.contentId}`)
    
    try {
      const prompt = this.buildF1Prompt(semanticData)
      const response = await this.callQwen3(prompt)
      const article = this.parseArticleResponse(response, semanticData)
      
      console.log(`✅ Generated ${article.estimatedReadTime}min F1 article`)
      return article
      
    } catch (error) {
      console.error(`❌ F1 article generation failed:`, error)
      throw new Error(`Failed to generate F1 article: ${error.message}`)
    }
  }

  /**
   * Build F1-specific prompts based on semantic analysis
   */
  private buildF1Prompt(semanticData: SemanticAnalysisOutput): string {
    const { category, entities, topics, sentiment, sourceData, targetAudience, suggestedLength } = semanticData
    
    // Extract F1-specific entities
    const drivers = entities.filter(e => e.category === 'drivers').map(e => e.text)
    const teams = entities.filter(e => e.category === 'teams').map(e => e.text)
    const circuits = entities.filter(e => e.category === 'circuits').map(e => e.text)
    
    // Get primary topic
    const primaryTopic = topics[0]?.topic || 'F1 general'
    const keywords = topics.flatMap(t => t.keywords).slice(0, 5)
    
    // Category-specific prompt templates
    const prompts = {
      'breaking-news': this.buildBreakingNewsPrompt(sourceData, drivers, teams, circuits, sentiment, suggestedLength),
      'trending': this.buildTrendingPrompt(sourceData, primaryTopic, keywords, sentiment, suggestedLength),
      'tech': this.buildTechnicalPrompt(sourceData, topics, targetAudience, suggestedLength),
      'gossip': this.buildGossipPrompt(sourceData, drivers, teams, sentiment, suggestedLength),
      'transfers': this.buildTransferPrompt(sourceData, drivers, teams, sentiment, suggestedLength)
    }
    
    return prompts[category] || prompts['trending']
  }

  private buildBreakingNewsPrompt(sourceData: any, drivers: string[], teams: string[], circuits: string[], sentiment: SentimentAnalysis, length: number): string {
    return `Write an urgent ${length}-word F1 breaking news article based on this information:

HEADLINE: ${sourceData.title}
SOURCE CONTENT: ${sourceData.content}

KEY F1 ELEMENTS:
- Drivers involved: ${drivers.join(', ') || 'N/A'}
- Teams involved: ${teams.join(', ') || 'N/A'}
- Circuits mentioned: ${circuits.join(', ') || 'N/A'}
- Overall sentiment: ${sentiment.overall}

REQUIREMENTS:
- Write in urgent, breaking news style
- Include specific F1 context and implications
- Focus on championship/season impact
- Use professional journalistic tone
- Include relevant quotes from source content
- End with what this means for upcoming races

Write the article now:`
  }

  private buildTrendingPrompt(sourceData: any, topic: string, keywords: string[], sentiment: SentimentAnalysis, length: number): string {
    return `Write a ${length}-word F1 trending article about ${topic}:

SOURCE: ${sourceData.title}
CONTENT: ${sourceData.content}

TRENDING ELEMENTS:
- Main topic: ${topic}
- Key terms: ${keywords.join(', ')}
- Sentiment: ${sentiment.overall}

REQUIREMENTS:
- Engaging, social media-friendly tone
- Include why this is trending now
- Connect to broader F1 season narrative
- Include fan perspective and reactions
- SEO-optimized for F1 audiences
- End with discussion questions or call-to-action

Write the article:`
  }

  private buildTechnicalPrompt(sourceData: any, topics: TopicAnalysis[], audience: string, length: number): string {
    const technicalTopics = topics.filter(t => t.topic.includes('technical') || t.topic.includes('development')).map(t => t.topic)
    
    return `Write a ${length}-word F1 technical analysis article for ${audience} audience:

TECHNICAL FOCUS: ${technicalTopics.join(', ') || 'F1 technical development'}
SOURCE: ${sourceData.title}
CONTENT: ${sourceData.content}

REQUIREMENTS:
- ${audience === 'technical' ? 'Deep technical analysis with specific details' : 'Technical concepts explained for general F1 fans'}
- Include aerodynamics, engine, or strategy insights
- Reference regulations and rule changes
- Compare with historical F1 technical developments
- Include performance implications
- Use proper F1 technical terminology

Write the analysis:`
  }

  private buildGossipPrompt(sourceData: any, drivers: string[], teams: string[], sentiment: SentimentAnalysis, length: number): string {
    return `Write a ${length}-word F1 paddock gossip article:

GOSSIP FOCUS: ${sourceData.title}
SOURCE: ${sourceData.content}
PEOPLE: ${[...drivers, ...teams].join(', ')}
TONE: ${sentiment.overall}

REQUIREMENTS:
- Entertaining but respectful paddock insider tone
- Include "sources say" and "rumor has it" style reporting
- Focus on driver relationships, team dynamics, behind-the-scenes drama
- Maintain journalistic integrity while being engaging
- Include speculation about future implications
- End with "What do you think?" engagement

Write the gossip piece:`
  }

  private buildTransferPrompt(sourceData: any, drivers: string[], teams: string[], sentiment: SentimentAnalysis, length: number): string {
    return `Write a ${length}-word F1 driver/team transfer analysis:

TRANSFER NEWS: ${sourceData.title}
SOURCE: ${sourceData.content}
DRIVERS: ${drivers.join(', ')}
TEAMS: ${teams.join(', ')}

REQUIREMENTS:
- Analyze transfer implications for championship
- Include contract details and timeline
- Discuss team strategy and driver market impact
- Reference similar historical transfers
- Include expert analysis of fit and performance potential
- End with transfer market predictions

Write the transfer analysis:`
  }

  /**
   * Call Qwen3 LLM with OpenAI-compatible API
   */
  private async callQwen3(prompt: string): Promise<string> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert F1 journalist and content writer. Write engaging, accurate F1 articles with proper formatting.'
            },
            {
              role: 'user', 
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 0.9,
        })
      })

      if (!response.ok) {
        throw new Error(`Qwen3 API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ''
      
    } catch (error) {
      console.error('Qwen3 API call failed:', error)
      throw error
    }
  }

  /**
   * Parse LLM response into structured article
   */
  private parseArticleResponse(content: string, semanticData: SemanticAnalysisOutput): GeneratedArticle {
    // Extract title (first line or create from content)
    const lines = content.trim().split('\n').filter(line => line.trim())
    const title = this.extractOrGenerateTitle(lines[0], semanticData)
    
    // Clean content (remove title if it was extracted)
    const articleContent = lines.length > 1 && lines[0].length < 100 ? 
      lines.slice(1).join('\n').trim() : 
      content.trim()

    // Generate tags from semantic data
    const tags = [
      semanticData.category,
      ...semanticData.entities.slice(0, 3).map(e => e.text),
      ...semanticData.topics.slice(0, 2).map(t => t.topic)
    ].filter(Boolean)

    // Estimate read time (average 200 words per minute)
    const wordCount = articleContent.split(/\s+/).length
    const estimatedReadTime = Math.ceil(wordCount / 200)

    return {
      title,
      content: articleContent,
      category: semanticData.category,
      tags,
      estimatedReadTime,
      seoMetadata: {
        description: this.generateMetaDescription(articleContent),
        keywords: tags
      }
    }
  }

  private extractOrGenerateTitle(firstLine: string, semanticData: SemanticAnalysisOutput): string {
    // If first line looks like a title (short, no periods except at end)
    if (firstLine.length < 100 && (firstLine.match(/\./g) || []).length <= 1) {
      return firstLine.replace(/^#+\s*/, '').trim()
    }
    
    // Generate title from semantic data
    const entities = semanticData.entities.slice(0, 2).map(e => e.text).join(' & ')
    const topic = semanticData.topics[0]?.topic || 'F1'
    
    const templates = {
      'breaking-news': `BREAKING: ${entities} ${topic}`,
      'trending': `${entities} Trending: ${topic}`,
      'tech': `Technical Analysis: ${topic} ${entities ? `for ${entities}` : ''}`,
      'gossip': `Paddock Talk: ${entities} ${topic}`,
      'transfers': `Transfer News: ${entities} ${topic}`
    }
    
    return templates[semanticData.category] || `F1: ${topic}`
  }

  private generateMetaDescription(content: string): string {
    // Take first sentence or first 150 characters
    const firstSentence = content.match(/^[^.!?]*[.!?]/)?.[0]
    if (firstSentence && firstSentence.length <= 160) {
      return firstSentence.trim()
    }
    
    return content.substring(0, 157) + '...'
  }

  /**
   * Test connection to Qwen3
   */
  async testConnection(): Promise<boolean> {
    try {
      const testPrompt = 'Write a one sentence F1 news headline about Lewis Hamilton.'
      const response = await this.callQwen3(testPrompt)
      console.log('🧪 Qwen3 test response:', response.substring(0, 100) + '...')
      return response.length > 0
    } catch (error) {
      console.error('❌ Qwen3 connection test failed:', error)
      return false
    }
  }
}

export default QwenConnector