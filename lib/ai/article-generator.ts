/**
 * AI Article Generator
 * Automatically generates engaging F1 articles from scraped content
 */

export interface ArticleGenerationRequest {
  title: string
  sourceContent: string
  source: string
  sourceUrl: string
  category?: 'breaking-news' | 'race-analysis' | 'driver-news' | 'tech' | 'rumors'
  targetLength?: 'short' | 'medium' | 'long'
  tone?: 'neutral' | 'exciting' | 'analytical'
}

export interface GeneratedArticle {
  title: string
  content: string
  summary: string
  tags: string[]
  category: string
  estimatedReadTime: number
  seoTitle: string
  metaDescription: string
}

export class F1ArticleGenerator {
  private qwenUrl: string
  private anthropicUrl: string
  private useLocal: boolean

  constructor(config?: { useLocal?: boolean, qwenUrl?: string }) {
    this.useLocal = config?.useLocal ?? true
    this.qwenUrl = config?.qwenUrl || process.env.QWEN_API_URL || 'http://localhost:11434'
    this.anthropicUrl = process.env.ANTHROPIC_API_URL || 'http://localhost:11434'
  }

  /**
   * Generate an engaging F1 article from source content
   */
  async generateArticle(request: ArticleGenerationRequest): Promise<GeneratedArticle> {
    const prompt = this.buildArticlePrompt(request)
    
    try {
      // Use local Qwen for article generation
      if (this.useLocal) {
        return await this.generateWithQwen(request, prompt)
      } else {
        // Fallback to enhanced content if no local Qwen
        return this.generateFallbackArticle(request)
      }

      return this.parseGeneratedContent(generatedContent, request)

    } catch (error) {
      console.error('AI article generation failed:', error)
      // Fall back to enhanced source content
      return this.generateFallbackArticle(request)
    }
  }

  /**
   * Generate article using local Qwen
   */
  private async generateWithQwen(request: ArticleGenerationRequest, prompt: string): Promise<GeneratedArticle> {
    try {
      console.log('🤖 Generating article with local Qwen:', request.title)

      const response = await fetch(`${this.qwenUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen2.5-coder:latest',
          prompt: this.buildQwenPrompt(request),
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Qwen API error: ${response.status}`)
      }

      const data = await response.json()
      const generatedContent = data.response

      if (!generatedContent) {
        throw new Error('No content generated from Qwen')
      }

      // Log the generation for training feedback
      await this.logGenerationForTraining(request, generatedContent)

      return this.parseGeneratedContent(generatedContent, request)

    } catch (error) {
      console.error('Qwen generation failed:', error)
      console.log('🔄 Falling back to enhanced content')
      return this.generateFallbackArticle(request)
    }
  }

  /**
   * Build optimized prompt for Qwen
   */
  private buildQwenPrompt(request: ArticleGenerationRequest): string {
    const lengthGuide = {
      short: '300-500 words',
      medium: '600-1000 words', 
      long: '1200-2000 words'
    }

    const targetLength = lengthGuide[request.targetLength || 'medium']

    return `You are an expert Formula 1 journalist writing for Grand Prix Social. Transform this source material into an engaging F1 article.

SOURCE TITLE: ${request.title}
SOURCE: ${request.source}
CONTENT: ${request.sourceContent}

REQUIREMENTS:
- Write exactly ${targetLength} 
- Category: ${request.category || 'F1 news'}
- Tone: Exciting but professional
- Include F1 context and technical details
- Make it engaging for F1 fans
- Use markdown formatting

Write a complete article that F1 fans will love to read. Focus on making the content more exciting and informative than the source while remaining accurate.

Article:`
  }

  /**
   * Log generation for training feedback loop
   */
  private async logGenerationForTraining(request: ArticleGenerationRequest, generatedContent: string): Promise<void> {
    try {
      const trainingData = {
        timestamp: new Date().toISOString(),
        sourceTitle: request.title,
        sourceContent: request.sourceContent,
        generatedContent,
        category: request.category,
        targetLength: request.targetLength,
        tone: request.tone,
        modelUsed: 'qwen2.5-coder:latest',
        version: '1.0'
      }

      // Store for training feedback (async, don't block generation)
      fetch('/api/ai/training-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingData)
      }).catch(err => console.log('Training log failed:', err.message))

    } catch (error) {
      console.log('Training logging error:', error)
    }
  }

  /**
   * Build the prompt for AI article generation
   */
  private buildArticlePrompt(request: ArticleGenerationRequest): string {
    const lengthGuide = {
      short: '300-500 words',
      medium: '600-1000 words', 
      long: '1200-2000 words'
    }

    const targetLength = lengthGuide[request.targetLength || 'medium']

    return `
Write an engaging Formula 1 article based on this source material:

TITLE: ${request.title}
SOURCE: ${request.source}
CONTENT: ${request.sourceContent}

REQUIREMENTS:
- Length: ${targetLength}
- Category: ${request.category || 'general F1 news'}
- Tone: ${request.tone || 'exciting but professional'}
- Include quotes if available in source
- Add context about F1 teams, drivers, or regulations when relevant
- Make it engaging for F1 fans
- Include technical details where appropriate

FORMAT your response as JSON:
{
  "title": "Engaging clickable title",
  "content": "Full article content in markdown format",
  "summary": "2-3 sentence summary",
  "tags": ["relevant", "f1", "tags"],
  "seoTitle": "SEO optimized title under 60 characters",
  "metaDescription": "SEO description under 160 characters"
}

Focus on accuracy while making the content more engaging than the source material.
`
  }

  /**
   * Generate fallback article when AI is unavailable
   */
  private generateFallbackArticle(request: ArticleGenerationRequest): GeneratedArticle {
    const enhancedContent = this.enhanceSourceContent(request)
    
    return {
      title: this.enhanceTitle(request.title),
      content: enhancedContent,
      summary: this.generateSummary(request.sourceContent),
      tags: this.generateTags(request),
      category: request.category || 'f1-news',
      estimatedReadTime: Math.ceil(enhancedContent.split(' ').length / 200),
      seoTitle: request.title.substring(0, 60),
      metaDescription: this.generateSummary(request.sourceContent).substring(0, 160)
    }
  }

  /**
   * Enhance source content with better formatting and context
   */
  private enhanceSourceContent(request: ArticleGenerationRequest): string {
    const { sourceContent, source, sourceUrl } = request
    
    let enhanced = `# ${this.enhanceTitle(request.title)}\n\n`
    
    // Add exciting opener
    enhanced += this.generateOpener(request) + '\n\n'
    
    // Process and enhance the main content
    const paragraphs = sourceContent.split('\n').filter(p => p.trim())
    
    for (let paragraph of paragraphs) {
      if (paragraph.length > 50) { // Skip very short lines
        enhanced += this.enhanceParagraph(paragraph) + '\n\n'
      }
    }
    
    // Add context section
    enhanced += this.addF1Context(request) + '\n\n'
    
    // Add source attribution
    enhanced += `---\n\n*Source: [${source}](${sourceUrl})*\n\n`
    enhanced += `*Enhanced by Grand Prix Social's AI • Stay updated with the latest F1 news*`
    
    return enhanced
  }

  /**
   * Enhance a title to be more engaging
   */
  private enhanceTitle(title: string): string {
    // Add excitement while keeping factual
    const enhancers = [
      { pattern: /wins/i, replacement: 'secures victory' },
      { pattern: /loses/i, replacement: 'suffers setback' },
      { pattern: /says/i, replacement: 'reveals' },
      { pattern: /announces/i, replacement: 'unveils' }
    ]
    
    let enhanced = title
    for (const { pattern, replacement } of enhancers) {
      enhanced = enhanced.replace(pattern, replacement)
    }
    
    return enhanced
  }

  /**
   * Generate an engaging opener
   */
  private generateOpener(request: ArticleGenerationRequest): string {
    const openers = [
      `The Formula 1 paddock is buzzing with the latest development...`,
      `In a significant turn of events for the F1 championship...`,
      `Formula 1 fans were treated to exciting news today...`,
      `The motorsport world is reacting to the announcement that...`,
      `Fresh from the F1 circuit comes news that...`
    ]
    
    return openers[Math.floor(Math.random() * openers.length)]
  }

  /**
   * Enhance a paragraph with better structure
   */
  private enhanceParagraph(paragraph: string): string {
    // Add F1-specific context where relevant
    let enhanced = paragraph
    
    // Replace common terms with more engaging versions
    const replacements = {
      'driver': 'the talented driver',
      'car': 'the high-performance machine', 
      'race': 'the thrilling Grand Prix',
      'team': 'the championship-contending team',
      'season': 'the current F1 campaign'
    }
    
    // Apply replacements sparingly to avoid over-enhancement
    if (Math.random() < 0.3) {
      for (const [term, replacement] of Object.entries(replacements)) {
        const regex = new RegExp(`\\b${term}\\b`, 'gi')
        if (enhanced.match(regex) && enhanced.match(regex)!.length === 1) {
          enhanced = enhanced.replace(regex, replacement)
          break // Only one replacement per paragraph
        }
      }
    }
    
    return enhanced
  }

  /**
   * Add relevant F1 context
   */
  private addF1Context(request: ArticleGenerationRequest): string {
    const contextSnippets = [
      "This development adds another layer of intrigue to what's shaping up to be one of the most competitive F1 seasons in recent memory.",
      "With the championship battle heating up, every decision carries significant weight for teams and drivers alike.",
      "Formula 1's evolution continues to captivate fans worldwide, blending cutting-edge technology with pure racing excitement.",
      "The implications of this news will likely reverberate throughout the F1 paddock in the coming weeks."
    ]
    
    return contextSnippets[Math.floor(Math.random() * contextSnippets.length)]
  }

  /**
   * Generate article summary
   */
  private generateSummary(content: string): string {
    // Extract first meaningful sentences
    const sentences = content.split('.').filter(s => s.trim().length > 30)
    return sentences.slice(0, 2).join('. ') + '.'
  }

  /**
   * Generate relevant tags
   */
  private generateTags(request: ArticleGenerationRequest): string[] {
    const baseTags = ['f1', 'formula1', 'racing']
    const contentTags = this.extractTagsFromContent(request.sourceContent)
    
    return [...baseTags, ...contentTags].slice(0, 8)
  }

  /**
   * Extract tags from content
   */
  private extractTagsFromContent(content: string): string[] {
    const commonF1Terms = [
      'verstappen', 'hamilton', 'ferrari', 'mclaren', 'mercedes', 'redbull',
      'championship', 'podium', 'qualifying', 'practice', 'drs', 'tire', 
      'strategy', 'pit', 'monaco', 'silverstone', 'spa', 'monza'
    ]
    
    const foundTags: string[] = []
    const lowerContent = content.toLowerCase()
    
    for (const term of commonF1Terms) {
      if (lowerContent.includes(term) && !foundTags.includes(term)) {
        foundTags.push(term)
      }
    }
    
    return foundTags.slice(0, 5)
  }

  /**
   * Parse AI-generated content
   */
  private parseGeneratedContent(content: string, request: ArticleGenerationRequest): GeneratedArticle {
    try {
      const parsed = JSON.parse(content)
      
      return {
        title: parsed.title || request.title,
        content: parsed.content || content,
        summary: parsed.summary || this.generateSummary(content),
        tags: parsed.tags || this.generateTags(request),
        category: request.category || 'f1-news',
        estimatedReadTime: Math.ceil((parsed.content || content).split(' ').length / 200),
        seoTitle: parsed.seoTitle || parsed.title || request.title,
        metaDescription: parsed.metaDescription || parsed.summary || this.generateSummary(content)
      }
    } catch (error) {
      // If JSON parsing fails, treat as plain text
      return {
        title: request.title,
        content,
        summary: this.generateSummary(content),
        tags: this.generateTags(request),
        category: request.category || 'f1-news',
        estimatedReadTime: Math.ceil(content.split(' ').length / 200),
        seoTitle: request.title.substring(0, 60),
        metaDescription: this.generateSummary(content).substring(0, 160)
      }
    }
  }

  /**
   * Get max tokens based on target length
   */
  private getMaxTokens(targetLength?: string): number {
    const tokenLimits = {
      short: 800,
      medium: 1500,
      long: 2500
    }
    
    return tokenLimits[targetLength as keyof typeof tokenLimits] || tokenLimits.medium
  }
}

export default F1ArticleGenerator