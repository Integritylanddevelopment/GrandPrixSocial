// Test Qwen3 F1 Article Generation
const QwenConnector = require('./lib/llm/qwen-connector.ts')

async function testF1ArticleGeneration() {
  console.log('🧪 Testing F1 Article Generation with Qwen3')
  
  const qwen = new QwenConnector.default()
  
  // Test semantic analysis data
  const mockSemanticData = {
    contentId: 'test-001',
    category: 'breaking-news',
    confidence: 0.92,
    entities: [
      { text: 'verstappen', category: 'drivers', confidence: 0.95 },
      { text: 'red-bull', category: 'teams', confidence: 0.88 },
      { text: 'monaco', category: 'circuits', confidence: 0.82 }
    ],
    topics: [
      { topic: 'race-performance', score: 0.9, keywords: ['victory', 'pole', 'fastest'], confidence: 0.87 }
    ],
    sentiment: {
      overall: 'positive',
      confidence: 0.78,
      scores: { positive: 0.7, negative: 0.1, neutral: 0.2 }
    },
    priority: 'urgent',
    sourceData: {
      title: 'Verstappen Dominates Monaco GP Practice',
      content: 'Max Verstappen topped both practice sessions at Monaco today, setting the fastest time and showing impressive pace around the challenging street circuit.',
      source: 'F1 Official',
      publishedAt: new Date().toISOString()
    },
    suggestedLength: 300,
    targetAudience: 'general'
  }
  
  try {
    // Test the article generation
    const article = await qwen.generateF1Article(mockSemanticData)
    
    console.log('\n🎉 F1 ARTICLE GENERATION SUCCESS!')
    console.log('==========================================')
    console.log(`📰 Title: ${article.title}`)
    console.log(`📂 Category: ${article.category}`)
    console.log(`🏷️  Tags: ${article.tags.join(', ')}`)
    console.log(`⏱️  Read Time: ${article.estimatedReadTime} min`)
    console.log(`📝 SEO Description: ${article.seoMetadata.description}`)
    console.log('\n📄 ARTICLE CONTENT:')
    console.log('==========================================')
    console.log(article.content)
    console.log('\n✅ Test completed successfully!')
    
  } catch (error) {
    console.error('❌ F1 Article Generation Test Failed:', error)
  }
}

testF1ArticleGeneration()