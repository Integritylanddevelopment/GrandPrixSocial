import fs from 'fs/promises'
import path from 'path'

// F1 Image Scraper - Extracts tagged images from F1 news sources
export class F1ImageScraper {
  private readonly imagesDir = path.join(process.cwd(), 'data', 'images')
  private readonly metadataFile = path.join(this.imagesDir, 'image-metadata.json')

  constructor() {
    this.ensureImageDirectory()
  }

  private async ensureImageDirectory() {
    try {
      await fs.mkdir(this.imagesDir, { recursive: true })
    } catch (error) {
      console.error('Failed to create images directory:', error)
    }
  }

  // Main scraping function - extracts images from RSS posts
  async scrapeImagesFromPosts(posts: any[]): Promise<any[]> {
    console.log('🖼️ Starting F1 image scraping...')
    
    const imageMetadata = []
    
    for (const post of posts) {
      try {
        const images = await this.extractImagesFromPost(post)
        for (const image of images) {
          const taggedImage = await this.tagImage(image, post)
          if (taggedImage && this.isF1Related(taggedImage)) {
            imageMetadata.push(taggedImage)
          }
        }
      } catch (error) {
        console.error(`Failed to process images for post ${post.id}:`, error.message)
      }
    }

    // Save metadata to file
    await this.saveImageMetadata(imageMetadata)
    console.log(`🖼️ Scraped ${imageMetadata.length} F1 images with metadata`)
    
    return imageMetadata
  }

  // Extract images from a single RSS post
  private async extractImagesFromPost(post: any): Promise<any[]> {
    const images = []
    
    // Method 1: Extract from RSS enclosures (media:content, enclosure tags)
    if (post.enclosures) {
      for (const enclosure of post.enclosures) {
        if (enclosure.type && enclosure.type.startsWith('image/')) {
          images.push({
            url: enclosure.url,
            type: 'rss-enclosure',
            mimeType: enclosure.type,
            sourcePost: post.id,
            sourceUrl: post.link
          })
        }
      }
    }

    // Method 2: Extract from RSS media:content namespace
    if (post['media:content']) {
      const mediaContent = Array.isArray(post['media:content']) ? post['media:content'] : [post['media:content']]
      for (const media of mediaContent) {
        if (media.$ && media.$.type && media.$.type.startsWith('image/')) {
          images.push({
            url: media.$.url,
            type: 'rss-media',
            mimeType: media.$.type,
            width: media.$.width,
            height: media.$.height,
            sourcePost: post.id,
            sourceUrl: post.link
          })
        }
      }
    }

    // Method 3: Extract from content and description
    const contentImages = this.extractImagesFromHTML(post.content || post.description || '', post)
    images.push(...contentImages)

    return images
  }

  // Extract images from HTML content using regex
  private extractImagesFromHTML(htmlContent: string, post: any): any[] {
    const images = []
    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi
    let match

    while ((match = imgRegex.exec(htmlContent)) !== null) {
      const imgTag = match[0]
      const src = match[1]
      
      // Extract alt text and other attributes
      const altMatch = imgTag.match(/alt="([^"]*)"/)
      const titleMatch = imgTag.match(/title="([^"]*)"/)
      const classMatch = imgTag.match(/class="([^"]*)"/)
      
      images.push({
        url: src,
        type: 'html-content',
        alt: altMatch ? altMatch[1] : '',
        title: titleMatch ? titleMatch[1] : '',
        cssClass: classMatch ? classMatch[1] : '',
        sourcePost: post.id,
        sourceUrl: post.link
      })
    }

    return images
  }

  // Tag image with metadata and F1 relevance scoring
  private async tagImage(image: any, post: any): Promise<any> {
    try {
      // Fetch additional metadata from the source page if needed
      const tags = this.generateImageTags(image, post)
      const f1Score = this.calculateF1RelevanceScore(image, post, tags)
      
      return {
        ...image,
        tags,
        f1RelevanceScore: f1Score,
        extractedAt: new Date().toISOString(),
        postTitle: post.title,
        postCategory: post.category,
        source: post.source
      }
    } catch (error) {
      console.error('Failed to tag image:', error)
      return null
    }
  }

  // Generate tags based on available metadata
  private generateImageTags(image: any, post: any): string[] {
    const tags = new Set<string>()
    
    // Tags from image attributes
    if (image.alt) {
      const altTags = this.extractTagsFromText(image.alt)
      altTags.forEach(tag => tags.add(tag))
    }
    
    if (image.title) {
      const titleTags = this.extractTagsFromText(image.title)
      titleTags.forEach(tag => tags.add(tag))
    }
    
    // Tags from post content
    const postTags = this.extractTagsFromText(post.title + ' ' + (post.content || post.description || ''))
    postTags.forEach(tag => tags.add(tag))
    
    // Tags from URL patterns
    const urlTags = this.extractTagsFromUrl(image.url)
    urlTags.forEach(tag => tags.add(tag))
    
    // Category-based tags
    tags.add(post.category)
    tags.add(post.source)
    
    return Array.from(tags).filter(tag => tag.length > 2) // Filter out very short tags
  }

  // Extract relevant tags from text using F1 keywords
  private extractTagsFromText(text: string): string[] {
    const tags = []
    const lowerText = text.toLowerCase()
    
    // F1 specific keywords
    const f1Keywords = [
      'formula 1', 'f1', 'grand prix', 'gp', 'race', 'racing', 'circuit', 'track',
      'driver', 'pilot', 'car', 'vehicle', 'mercedes', 'ferrari', 'red bull', 'mclaren',
      'alpine', 'aston martin', 'williams', 'alphatauri', 'alfa romeo', 'haas',
      'verstappen', 'hamilton', 'leclerc', 'russell', 'perez', 'alonso', 'ocon',
      'norris', 'piastri', 'stroll', 'vettel', 'bottas', 'zhou', 'gasly', 'tsunoda',
      'magnussen', 'hulkenberg', 'albon', 'sargeant', 'de vries',
      'podium', 'victory', 'win', 'championship', 'qualifying', 'practice',
      'pit stop', 'drs', 'kers', 'hybrid', 'turbo', 'engine', 'chassis',
      'monaco', 'silverstone', 'spa', 'monza', 'austin', 'suzuka', 'interlagos',
      'bahrain', 'saudi arabia', 'australia', 'imola', 'miami', 'spain',
      'helmet', 'suit', 'gloves', 'steering wheel', 'cockpit', 'garage', 'paddock'
    ]
    
    for (const keyword of f1Keywords) {
      if (lowerText.includes(keyword)) {
        tags.push(keyword.replace(/\s+/g, '-'))
      }
    }
    
    return tags
  }

  // Extract tags from image URL patterns
  private extractTagsFromUrl(url: string): string[] {
    const tags = []
    const urlLower = url.toLowerCase()
    
    // Common F1 image URL patterns
    const urlPatterns = [
      { pattern: /f1|formula.*1/i, tag: 'f1' },
      { pattern: /grand.*prix|gp/i, tag: 'grand-prix' },
      { pattern: /race|racing/i, tag: 'racing' },
      { pattern: /driver|pilot/i, tag: 'driver' },
      { pattern: /car|vehicle/i, tag: 'car' },
      { pattern: /circuit|track/i, tag: 'circuit' },
      { pattern: /podium/i, tag: 'podium' },
      { pattern: /qualifying|quali/i, tag: 'qualifying' },
      { pattern: /practice/i, tag: 'practice' },
      { pattern: /pit.*stop|pitstop/i, tag: 'pit-stop' },
      { pattern: /helmet/i, tag: 'helmet' },
      { pattern: /garage|paddock/i, tag: 'paddock' }
    ]
    
    for (const { pattern, tag } of urlPatterns) {
      if (pattern.test(urlLower)) {
        tags.push(tag)
      }
    }
    
    return tags
  }

  // Calculate F1 relevance score (0-100)
  private calculateF1RelevanceScore(image: any, post: any, tags: string[]): number {
    let score = 0
    
    // Base score from post category
    const categoryScores = {
      'breaking': 20,
      'driver-news': 25,
      'team-news': 20,
      'technical': 15,
      'championship': 25,
      'general': 10
    }
    score += categoryScores[post.category] || 10
    
    // Score from F1-related tags
    const f1Tags = tags.filter(tag => 
      tag.includes('f1') || tag.includes('formula') || tag.includes('grand-prix') ||
      tag.includes('driver') || tag.includes('racing') || tag.includes('circuit')
    )
    score += f1Tags.length * 10
    
    // Score from team/driver mentions
    const teamDriverTags = tags.filter(tag => 
      ['mercedes', 'ferrari', 'red-bull', 'mclaren', 'alpine', 'aston-martin',
       'verstappen', 'hamilton', 'leclerc', 'russell'].includes(tag)
    )
    score += teamDriverTags.length * 15
    
    // Score from image attributes
    if (image.alt && image.alt.toLowerCase().includes('f1')) score += 15
    if (image.title && image.title.toLowerCase().includes('formula')) score += 15
    if (image.url && image.url.toLowerCase().includes('f1')) score += 10
    
    // Penalty for non-F1 indicators
    const nonF1Keywords = ['ski', 'snow', 'phone', 'mobile', 'football', 'soccer', 'basketball']
    const hasNonF1 = nonF1Keywords.some(keyword => 
      (image.alt && image.alt.toLowerCase().includes(keyword)) ||
      (image.title && image.title.toLowerCase().includes(keyword)) ||
      tags.some(tag => tag.includes(keyword))
    )
    if (hasNonF1) score -= 50
    
    return Math.max(0, Math.min(100, score))
  }

  // Check if image is F1 related (score > 40)
  private isF1Related(image: any): boolean {
    return image.f1RelevanceScore > 40
  }

  // Save image metadata to file
  private async saveImageMetadata(imageMetadata: any[]) {
    try {
      // Load existing metadata
      let existingData = []
      try {
        const data = await fs.readFile(this.metadataFile, 'utf-8')
        existingData = JSON.parse(data)
      } catch {
        // No existing file
      }
      
      // Merge new metadata (avoid duplicates by URL)
      const urlSet = new Set(existingData.map((img: any) => img.url))
      const newImages = imageMetadata.filter(img => !urlSet.has(img.url))
      
      const combined = [...existingData, ...newImages]
        .sort((a, b) => b.f1RelevanceScore - a.f1RelevanceScore) // Sort by relevance
        .slice(0, 1000) // Keep top 1000 images
      
      await fs.writeFile(this.metadataFile, JSON.stringify(combined, null, 2))
      console.log(`💾 Saved ${combined.length} total images (${newImages.length} new)`)
    } catch (error) {
      console.error('Failed to save image metadata:', error)
    }
  }

  // Get images by category and relevance score
  async getImagesByCategory(category: string, minScore: number = 60): Promise<any[]> {
    try {
      const data = await fs.readFile(this.metadataFile, 'utf-8')
      const images = JSON.parse(data)
      
      return images.filter((img: any) => 
        img.postCategory === category && 
        img.f1RelevanceScore >= minScore
      ).slice(0, 10) // Return top 10 for the category
    } catch (error) {
      console.log('No image metadata found')
      return []
    }
  }

  // Get random F1 image for a category
  async getRandomImageForCategory(category: string): Promise<string> {
    const images = await this.getImagesByCategory(category, 50)
    if (images.length === 0) return ''
    
    const randomImage = images[Math.floor(Math.random() * images.length)]
    return randomImage.url
  }

  // Debug: Get image statistics
  async getImageStats(): Promise<any> {
    try {
      const data = await fs.readFile(this.metadataFile, 'utf-8')
      const images = JSON.parse(data)
      
      const stats = {
        total: images.length,
        byCategory: {},
        bySource: {},
        averageScore: images.reduce((sum: number, img: any) => sum + img.f1RelevanceScore, 0) / images.length,
        highQuality: images.filter((img: any) => img.f1RelevanceScore >= 70).length,
        mediumQuality: images.filter((img: any) => img.f1RelevanceScore >= 40 && img.f1RelevanceScore < 70).length,
        lowQuality: images.filter((img: any) => img.f1RelevanceScore < 40).length
      }
      
      // Group by category and source
      for (const img of images) {
        stats.byCategory[img.postCategory] = (stats.byCategory[img.postCategory] || 0) + 1
        stats.bySource[img.source] = (stats.bySource[img.source] || 0) + 1
      }
      
      return stats
    } catch (error) {
      return { total: 0, error: 'No metadata file found' }
    }
  }
}