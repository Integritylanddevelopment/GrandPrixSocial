import fs from 'fs/promises'
import path from 'path'

// Semantic Tagging System - NLP and Vector-based content analysis
export class SemanticTaggingSystem {
  private readonly dataDir = path.join(process.cwd(), 'data', 'semantic')
  private readonly tagsFile = path.join(this.dataDir, 'semantic-tags.json')
  private readonly vectorsFile = path.join(this.dataDir, 'content-vectors.json')
  private readonly ontologyFile = path.join(this.dataDir, 'f1-ontology.json')

  constructor() {
    this.ensureDataDirectory()
    this.initializeF1Ontology()
  }

  private async ensureDataDirectory() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true })
    } catch (error) {
      console.error('Failed to create semantic data directory:', error)
    }
  }

  // Initialize F1 domain ontology for semantic understanding
  private async initializeF1Ontology() {
    const ontology = {
      entities: {
        drivers: {
          concepts: ['driver', 'pilot', 'racer', 'competitor'],
          instances: [
            'verstappen', 'hamilton', 'leclerc', 'russell', 'perez', 'alonso', 'ocon',
            'norris', 'piastri', 'stroll', 'vettel', 'bottas', 'zhou', 'gasly', 'tsunoda',
            'magnussen', 'hulkenberg', 'albon', 'sargeant', 'de vries'
          ],
          relations: ['drives_for', 'competed_with', 'replaced_by', 'teammate_of']
        },
        teams: {
          concepts: ['team', 'constructor', 'manufacturer', 'outfit'],
          instances: [
            'mercedes', 'ferrari', 'red-bull', 'mclaren', 'alpine', 'aston-martin',
            'williams', 'alphatauri', 'alfa-romeo', 'haas'
          ],
          relations: ['employs', 'competes_against', 'supplies_engine_to', 'partnership_with']
        },
        circuits: {
          concepts: ['circuit', 'track', 'venue', 'course'],
          instances: [
            'monaco', 'silverstone', 'spa', 'monza', 'austin', 'suzuka', 'interlagos',
            'bahrain', 'jeddah', 'melbourne', 'imola', 'miami', 'barcelona', 'zandvoort'
          ],
          relations: ['hosts', 'located_in', 'lap_record_held_by', 'first_race_in']
        },
        technical: {
          concepts: ['engine', 'chassis', 'aerodynamics', 'setup', 'strategy'],
          instances: [
            'drs', 'ers', 'kers', 'hybrid', 'turbo', 'downforce', 'drag', 'pit-stop',
            'qualifying', 'practice', 'sprint', 'pole-position', 'fastest-lap'
          ],
          relations: ['affects', 'optimized_for', 'regulated_by', 'impacts']
        },
        events: {
          concepts: ['race', 'session', 'weekend', 'championship'],
          instances: [
            'grand-prix', 'qualifying', 'practice', 'sprint-shootout', 'formation-lap',
            'safety-car', 'red-flag', 'checkered-flag', 'podium', 'points'
          ],
          relations: ['part_of', 'follows', 'determines', 'contributes_to']
        }
      },
      relationships: {
        hierarchical: ['is_a', 'part_of', 'member_of', 'category_of'],
        temporal: ['before', 'after', 'during', 'since', 'until'],
        causal: ['causes', 'leads_to', 'results_in', 'influences'],
        competitive: ['beats', 'outperforms', 'competes_with', 'rivals']
      },
      sentiments: {
        positive: ['dominates', 'excels', 'achieves', 'breakthrough', 'victory', 'success'],
        negative: ['struggles', 'fails', 'crashes', 'disappoints', 'penalty', 'retire'],
        neutral: ['participates', 'competes', 'attempts', 'continues', 'maintains']
      }
    }

    try {
      await fs.writeFile(this.ontologyFile, JSON.stringify(ontology, null, 2))
    } catch (error) {
      console.error('Failed to save F1 ontology:', error)
    }
  }

  // Main semantic analysis function - processes any content type
  async analyzeContent(content: {
    id: string
    type: 'article' | 'image' | 'comment' | 'user-post' | 'fantasy-entry' | 'social-post'
    title?: string
    text?: string
    metadata?: any
    source?: string
  }): Promise<any> {
    console.log(`🧠 Semantic analysis: ${content.type} - ${content.id}`)

    try {
      // Step 1: Named Entity Recognition
      const entities = await this.extractNamedEntities(content)

      // Step 2: Semantic Role Labeling  
      const semanticRoles = await this.extractSemanticRoles(content)

      // Step 3: Sentiment Analysis
      const sentiment = await this.analyzeSentiment(content)

      // Step 4: Topic Modeling
      const topics = await this.extractTopics(content)

      // Step 5: Relationship Extraction
      const relationships = await this.extractRelationships(content, entities)

      // Step 6: Vector Embedding Generation
      const embedding = await this.generateEmbedding(content)

      // Step 7: Concept Hierarchy Mapping
      const conceptHierarchy = await this.mapConceptHierarchy(entities, topics)

      const semanticProfile = {
        contentId: content.id,
        contentType: content.type,
        timestamp: new Date().toISOString(),
        entities,
        semanticRoles,
        sentiment,
        topics,
        relationships,
        embedding,
        conceptHierarchy,
        confidence: this.calculateConfidence(entities, topics, sentiment),
        tags: this.generateSemanticTags(entities, topics, semanticRoles, sentiment)
      }

      // Store the semantic profile
      await this.storeSemanticProfile(semanticProfile)

      return semanticProfile
    } catch (error) {
      console.error(`Semantic analysis failed for ${content.id}:`, error)
      return null
    }
  }

  // Named Entity Recognition using F1 ontology
  private async extractNamedEntities(content: any): Promise<any[]> {
    const entities = []
    const text = `${content.title || ''} ${content.text || ''}`.toLowerCase()
    
    try {
      const ontology = JSON.parse(await fs.readFile(this.ontologyFile, 'utf-8'))
      
      // Extract entities from each category
      for (const [category, data] of Object.entries(ontology.entities)) {
        const categoryData = data as any
        
        // Check for concept matches
        for (const concept of categoryData.concepts) {
          if (text.includes(concept)) {
            entities.push({
              text: concept,
              category,
              type: 'concept',
              confidence: 0.8,
              positions: this.findTextPositions(text, concept)
            })
          }
        }

        // Check for instance matches
        for (const instance of categoryData.instances) {
          if (text.includes(instance)) {
            entities.push({
              text: instance,
              category,
              type: 'instance',
              confidence: 0.9,
              positions: this.findTextPositions(text, instance)
            })
          }
        }
      }

      return entities.sort((a, b) => b.confidence - a.confidence)
    } catch (error) {
      console.error('Entity extraction failed:', error)
      return []
    }
  }

  // Semantic Role Labeling - who did what to whom, when, where
  private async extractSemanticRoles(content: any): Promise<any[]> {
    const roles = []
    const text = `${content.title || ''} ${content.text || ''}`.toLowerCase()

    // Common F1 action patterns
    const patterns = [
      {
        pattern: /(\w+)\s+(wins?|won|dominates?|dominated)\s+(at|in)?\s*(\w+)?/gi,
        roles: { agent: 1, action: 2, location: 4 }
      },
      {
        pattern: /(\w+)\s+(crashes?|crashed|retires?|retired)\s+(from|in|at)?\s*(\w+)?/gi,
        roles: { agent: 1, action: 2, location: 4 }
      },
      {
        pattern: /(\w+)\s+(signs?|signed|joins?|joined)\s+(with)?\s*(\w+)/gi,
        roles: { agent: 1, action: 2, target: 4 }
      },
      {
        pattern: /(\w+)\s+(beats?|beat|outperforms?|outperformed)\s+(\w+)/gi,
        roles: { agent: 1, action: 2, patient: 3 }
      }
    ]

    for (const { pattern, roles: roleMap } of patterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        const extractedRoles = {}
        for (const [role, index] of Object.entries(roleMap)) {
          if (match[index as number]) {
            extractedRoles[role] = match[index as number]
          }
        }
        roles.push({
          pattern: pattern.source,
          roles: extractedRoles,
          fullMatch: match[0],
          confidence: 0.7
        })
      }
    }

    return roles
  }

  // Advanced sentiment analysis with F1 context
  private async analyzeSentiment(content: any): Promise<any> {
    const text = `${content.title || ''} ${content.text || ''}`.toLowerCase()
    
    try {
      const ontology = JSON.parse(await fs.readFile(this.ontologyFile, 'utf-8'))
      const sentiments = ontology.sentiments

      let positiveScore = 0
      let negativeScore = 0
      let neutralScore = 0

      // Count sentiment indicators
      for (const word of sentiments.positive) {
        positiveScore += (text.match(new RegExp(word, 'gi')) || []).length
      }
      for (const word of sentiments.negative) {
        negativeScore += (text.match(new RegExp(word, 'gi')) || []).length
      }
      for (const word of sentiments.neutral) {
        neutralScore += (text.match(new RegExp(word, 'gi')) || []).length
      }

      const total = positiveScore + negativeScore + neutralScore
      if (total === 0) {
        return { overall: 'neutral', confidence: 0.5, scores: { positive: 0, negative: 0, neutral: 1 } }
      }

      const scores = {
        positive: positiveScore / total,
        negative: negativeScore / total,
        neutral: neutralScore / total
      }

      const overall = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0]

      return {
        overall,
        confidence: Math.max(...Object.values(scores)),
        scores,
        indicators: { positiveScore, negativeScore, neutralScore }
      }
    } catch (error) {
      console.error('Sentiment analysis failed:', error)
      return { overall: 'neutral', confidence: 0.5, scores: { positive: 0, negative: 0, neutral: 1 } }
    }
  }

  // Topic extraction using TF-IDF and F1 domain knowledge
  private async extractTopics(content: any): Promise<any[]> {
    const text = `${content.title || ''} ${content.text || ''}`.toLowerCase()
    const topics = []

    // F1-specific topic categories with keywords
    const topicCategories = {
      'race-performance': ['win', 'victory', 'podium', 'points', 'position', 'fastest', 'lap', 'time'],
      'driver-news': ['driver', 'pilot', 'contract', 'move', 'sign', 'join', 'leave', 'retire'],
      'team-strategy': ['strategy', 'pit', 'stop', 'tire', 'fuel', 'setup', 'configuration'],
      'technical-development': ['engine', 'aerodynamics', 'chassis', 'upgrade', 'development', 'innovation'],
      'championship': ['championship', 'points', 'standings', 'leader', 'title', 'season'],
      'regulations': ['regulation', 'rule', 'fia', 'penalty', 'investigation', 'steward'],
      'circuit-analysis': ['track', 'circuit', 'corner', 'straight', 'sector', 'grip', 'surface']
    }

    // Calculate topic scores
    for (const [topic, keywords] of Object.entries(topicCategories)) {
      let score = 0
      const matchedKeywords = []
      
      for (const keyword of keywords) {
        const matches = text.match(new RegExp(`\\b${keyword}\\b`, 'gi')) || []
        score += matches.length
        if (matches.length > 0) {
          matchedKeywords.push(keyword)
        }
      }

      if (score > 0) {
        topics.push({
          topic,
          score,
          keywords: matchedKeywords,
          confidence: Math.min(score / keywords.length, 1)
        })
      }
    }

    return topics.sort((a, b) => b.score - a.score)
  }

  // Extract relationships between entities
  private async extractRelationships(content: any, entities: any[]): Promise<any[]> {
    const relationships = []
    const text = `${content.title || ''} ${content.text || ''}`.toLowerCase()

    // Define relationship patterns
    const relationshipPatterns = [
      { pattern: /(\w+)\s+drives\s+for\s+(\w+)/gi, relation: 'drives_for' },
      { pattern: /(\w+)\s+beats\s+(\w+)/gi, relation: 'outperforms' },
      { pattern: /(\w+)\s+joins\s+(\w+)/gi, relation: 'joins' },
      { pattern: /(\w+)\s+leaves\s+(\w+)/gi, relation: 'leaves' },
      { pattern: /(\w+)\s+crashes\s+at\s+(\w+)/gi, relation: 'crashes_at' },
      { pattern: /(\w+)\s+wins\s+at\s+(\w+)/gi, relation: 'wins_at' }
    ]

    for (const { pattern, relation } of relationshipPatterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        const subject = match[1]
        const object = match[2]
        
        // Verify entities exist in our extracted entities
        const subjectEntity = entities.find(e => e.text === subject)
        const objectEntity = entities.find(e => e.text === object)
        
        if (subjectEntity && objectEntity) {
          relationships.push({
            subject: subject,
            relation: relation,
            object: object,
            confidence: 0.8,
            context: match[0]
          })
        }
      }
    }

    return relationships
  }

  // Generate vector embeddings (simplified - in production would use actual embedding model)
  private async generateEmbedding(content: any): Promise<number[]> {
    const text = `${content.title || ''} ${content.text || ''}`.toLowerCase()
    
    // Simplified feature-based embedding (300 dimensions)
    const embedding = new Array(300).fill(0)
    
    // Generate features based on F1 content characteristics
    const words = text.split(/\s+/)
    for (let i = 0; i < words.length && i < 300; i++) {
      embedding[i] = words[i]?.charCodeAt(0) % 100 / 100 || 0
    }

    // Add semantic features
    const entities = await this.extractNamedEntities(content)
    for (let i = 0; i < entities.length && i < 50; i++) {
      embedding[250 + i] = entities[i].confidence
    }

    return embedding
  }

  // Map concepts to hierarchical structure
  private async mapConceptHierarchy(entities: any[], topics: any[]): Promise<any> {
    const hierarchy = {
      domain: 'formula-1',
      categories: {},
      instances: {},
      relationships: []
    }

    // Group entities by category
    for (const entity of entities) {
      if (!hierarchy.categories[entity.category]) {
        hierarchy.categories[entity.category] = []
      }
      hierarchy.categories[entity.category].push({
        text: entity.text,
        type: entity.type,
        confidence: entity.confidence
      })
    }

    // Map topics to concept hierarchy
    for (const topic of topics) {
      hierarchy.instances[topic.topic] = {
        keywords: topic.keywords,
        score: topic.score,
        confidence: topic.confidence
      }
    }

    return hierarchy
  }

  // Calculate overall confidence score
  private calculateConfidence(entities: any[], topics: any[], sentiment: any): number {
    const entityConfidence = entities.length > 0 ? 
      entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length : 0
    const topicConfidence = topics.length > 0 ? 
      topics.reduce((sum, t) => sum + t.confidence, 0) / topics.length : 0
    const sentimentConfidence = sentiment.confidence || 0

    return (entityConfidence + topicConfidence + sentimentConfidence) / 3
  }

  // Generate semantic tags from analysis
  private generateSemanticTags(entities: any[], topics: any[], roles: any[], sentiment: any): string[] {
    const tags = new Set<string>()

    // Add entity-based tags
    entities.forEach(e => {
      tags.add(`entity:${e.category}:${e.text}`)
      tags.add(`${e.category}`)
    })

    // Add topic-based tags
    topics.forEach(t => {
      tags.add(`topic:${t.topic}`)
      t.keywords.forEach(k => tags.add(`keyword:${k}`))
    })

    // Add sentiment tags
    tags.add(`sentiment:${sentiment.overall}`)

    // Add semantic role tags
    roles.forEach(r => {
      Object.entries(r.roles).forEach(([role, value]) => {
        tags.add(`role:${role}:${value}`)
      })
    })

    return Array.from(tags)
  }

  // Store semantic profile
  private async storeSemanticProfile(profile: any) {
    try {
      // Load existing profiles
      let profiles = []
      try {
        const data = await fs.readFile(this.tagsFile, 'utf-8')
        profiles = JSON.parse(data)
      } catch {
        // No existing file
      }

      // Add new profile
      profiles.push(profile)

      // Keep only latest 10000 profiles
      profiles = profiles.slice(-10000)

      await fs.writeFile(this.tagsFile, JSON.stringify(profiles, null, 2))
      console.log(`💾 Stored semantic profile for ${profile.contentId}`)
    } catch (error) {
      console.error('Failed to store semantic profile:', error)
    }
  }

  // Utility functions
  private findTextPositions(text: string, term: string): number[] {
    const positions = []
    let index = text.indexOf(term)
    while (index !== -1) {
      positions.push(index)
      index = text.indexOf(term, index + 1)
    }
    return positions
  }

  // Query semantic profiles
  async querySemanticProfiles(query: {
    contentType?: string
    entities?: string[]
    topics?: string[]
    sentiment?: string
    minConfidence?: number
    limit?: number
  }): Promise<any[]> {
    try {
      const data = await fs.readFile(this.tagsFile, 'utf-8')
      let profiles = JSON.parse(data)

      // Apply filters
      if (query.contentType) {
        profiles = profiles.filter(p => p.contentType === query.contentType)
      }
      if (query.minConfidence) {
        profiles = profiles.filter(p => p.confidence >= query.minConfidence)
      }
      if (query.sentiment) {
        profiles = profiles.filter(p => p.sentiment.overall === query.sentiment)
      }
      if (query.entities) {
        profiles = profiles.filter(p => 
          query.entities.some(entity => 
            p.entities.some(e => e.text === entity)
          )
        )
      }
      if (query.topics) {
        profiles = profiles.filter(p => 
          query.topics.some(topic => 
            p.topics.some(t => t.topic === topic)
          )
        )
      }

      // Sort by confidence and limit
      profiles.sort((a, b) => b.confidence - a.confidence)
      if (query.limit) {
        profiles = profiles.slice(0, query.limit)
      }

      return profiles
    } catch (error) {
      console.error('Failed to query semantic profiles:', error)
      return []
    }
  }
}