import { createClient } from '@supabase/supabase-js'
import { QwenConnector } from '@/lib/llm/qwen-connector'

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// F1 RSS Sources
const F1_SOURCES = [
  { url: 'https://www.formula1.com/en/latest/all.xml', handle: 'formula1.com', type: 'news' },
  { url: 'https://www.autosport.com/rss/f1/news/', handle: 'autosport.com', type: 'news' },
  { url: 'https://www.motorsport.com/rss/f1/news/', handle: 'motorsport.com', type: 'news' }
]

async function parseRSSFeed(url: string, handle: string) {
  try {
    const response = await fetch(url)
    const xmlText = await response.text()
    
    // Parse RSS items
    const items = xmlText.match(/<item[\s\S]*?<\/item>/g) || []
    const articles = []
    
    for (const item of items.slice(0, 5)) { // Latest 5 per source
      const title = item.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1') || ''
      const link = item.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1] || ''
      const description = item.match(/<description[^>]*>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1') || ''
      const pubDate = item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/)?.[1] || ''
      
      if (title && link) {
        articles.push({
          title: title.replace(/[<>]/g, '').trim(),
          link,
          description: description.replace(/<[^>]*>/g, '').trim(),
          pubDate,
          source: handle
        })
      }
    }
    
    return articles
  } catch (error) {
    console.error(`Failed to parse ${handle}:`, error)
    return []
  }
}

export async function GET() {
  try {
    console.log('🏎️ Starting automated F1 news scraping...')
    
    let totalScraped = 0
    const results = []
    
    // Scrape all sources
    for (const source of F1_SOURCES) {
      const articles = await parseRSSFeed(source.url, source.handle)
      
      for (const article of articles) {
        // Check if already exists
        const { data: existing } = await supabase
          .from('social_media_posts')
          .select('id')
          .eq('original_post_id', article.link)
          .maybeSingle()
        
        if (!existing) {
          // Store raw scraped content
          const { error: rawError } = await supabase
            .from('social_media_posts')
            .insert([{
              platform: 'rss',
              account_handle: source.handle,
              account_type: source.type,
              original_post_id: article.link,
              content: `${article.title}\n\n${article.description}`,
              author_name: source.handle,
              published_at: article.pubDate ? new Date(article.pubDate).toISOString() : new Date().toISOString(),
              category: 'f1-news',
              priority: 'high',
              processed: false
            }])
          
          if (!rawError) {
            // Generate processed article using your QwenConnector
            const qwenConnector = new QwenConnector()
            
            // Create semantic analysis data for QwenConnector
            const semanticData = {
              contentId: `${source.handle}-${Date.now()}`,
              category: 'breaking-news' as const,
              confidence: 0.9,
              entities: [], // Could enhance with F1 entity extraction
              topics: [{ topic: 'F1 News', score: 1.0, keywords: ['f1', 'racing'], confidence: 0.9 }],
              sentiment: { overall: 'neutral' as const, confidence: 0.8, scores: { positive: 0.3, negative: 0.2, neutral: 0.5 } },
              priority: 'high' as const,
              sourceData: {
                title: article.title,
                content: article.description,
                source: source.handle,
                publishedAt: article.pubDate || new Date().toISOString()
              },
              suggestedLength: 300,
              targetAudience: 'general' as const
            }
            
            let articleContent = `# ${article.title}\n\n${article.description}\n\n---\n\n*Source: [${source.handle}](${article.link})*`
            
            try {
              const generatedArticle = await qwenConnector.generateF1Article(semanticData)
              articleContent = `# ${generatedArticle.title}\n\n${generatedArticle.content}\n\n---\n\n*Powered by Grand Prix Social's AI • Source: [${source.handle}](${article.link})*`
            } catch (error) {
              console.log(`Using fallback content for ${article.title}:`, error.message)
            }
            
            // Store processed article
            const { error: articleError } = await supabase
              .from('news_articles')
              .insert([{
                title: article.title,
                content: articleContent,
                summary: article.description.substring(0, 200) + '...',
                author: source.handle,
                source_url: article.link,
                source_name: source.handle,
                category: 'f1-news',
                tags: ['f1', 'racing', 'formula1', 'news'],
                priority: 'high',
                published_at: article.pubDate ? new Date(article.pubDate).toISOString() : new Date().toISOString()
              }])
            
            if (!articleError) {
              totalScraped++
              results.push({
                title: article.title,
                source: source.handle,
                status: 'processed'
              })
              
              console.log(`✅ Processed: ${article.title}`)
            } else {
              console.error('Failed to create article:', articleError)
            }
          } else {
            console.error('Failed to store raw content:', rawError)
          }
        }
      }
    }
    
    return Response.json({
      success: true,
      message: `Successfully scraped and processed ${totalScraped} new F1 articles`,
      totalScraped,
      results,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('F1 scraping failed:', error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}