const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

async function createF1NewsEdgeFunction() {
  console.log('🚀 Creating F1 News Edge Function...')
  
  const projectRef = 'eeyboymoyvrgsbmnezag'
  const managementToken = 'sbp_d7d5e108d43328632f0b1b54852f72ce7cb7699c'
  
  // Edge Function code
  const functionCode = `
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🏎️ Starting F1 News Scraper...')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // F1 RSS Sources
    const sources = [
      { url: 'https://www.formula1.com/en/latest/all.xml', handle: 'formula1.com' },
      { url: 'https://www.autosport.com/rss/f1/news/', handle: 'autosport.com' },
      { url: 'https://www.motorsport.com/rss/f1/news/', handle: 'motorsport.com' }
    ]
    
    let totalScraped = 0
    
    for (const source of sources) {
      try {
        console.log(\`Scraping \${source.handle}...\`)
        
        const response = await fetch(source.url)
        const xmlText = await response.text()
        
        // Basic RSS parsing
        const items = xmlText.match(/<item[\\s\\S]*?<\\/item>/g) || []
        
        for (const item of items.slice(0, 5)) { // Latest 5 articles per source
          const title = item.match(/<title[^>]*>([\\s\\S]*?)<\\/title>/)?.[1]?.replace(/<\\!\\[CDATA\\[([\\s\\S]*?)\\]\\]>/, '$1') || ''
          const link = item.match(/<link[^>]*>([\\s\\S]*?)<\\/link>/)?.[1] || ''
          const description = item.match(/<description[^>]*>([\\s\\S]*?)<\\/description>/)?.[1]?.replace(/<\\!\\[CDATA\\[([\\s\\S]*?)\\]\\]>/, '$1') || ''
          const pubDate = item.match(/<pubDate[^>]*>([\\s\\S]*?)<\\/pubDate>/)?.[1] || ''
          
          if (title && link) {
            // Check if already exists
            const { data: existing } = await supabase
              .from('social_media_posts')
              .select('id')
              .eq('original_post_id', link)
              .single()
            
            if (!existing) {
              // Store raw content
              const { error: insertError } = await supabase
                .from('social_media_posts')
                .insert([{
                  platform: 'rss',
                  account_handle: source.handle,
                  account_type: 'news',
                  original_post_id: link,
                  content: \`\${title}\\n\\n\${description}\`,
                  author_name: source.handle,
                  published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
                  category: 'breaking-news',
                  priority: 'high',
                  processed: false
                }])
              
              if (!insertError) {
                totalScraped++
                
                // Generate article from raw content
                const articleTitle = title.replace(/[<>]/g, '').trim()
                const articleContent = \`
# \${articleTitle}

\${description.replace(/<[^>]*>/g, '').trim()}

*Source: [\${source.handle}](\${link})*

*This article was generated automatically from F1 news sources.*
                \`
                
                // Store processed article
                await supabase
                  .from('news_articles')
                  .insert([{
                    title: articleTitle,
                    content: articleContent,
                    summary: description.replace(/<[^>]*>/g, '').trim().substring(0, 200) + '...',
                    author: source.handle,
                    source_url: link,
                    source_name: source.handle,
                    category: 'f1-news',
                    tags: ['f1', 'racing', 'formula1'],
                    priority: 'high',
                    published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString()
                  }])
                
                console.log(\`✅ Processed: \${articleTitle}\`)
              }
            }
          }
        }
      } catch (sourceError) {
        console.error(\`Failed to scrape \${source.handle}:\`, sourceError)
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: \`Scraped \${totalScraped} new F1 articles\`,
      totalScraped 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
    
  } catch (error) {
    console.error('Scraping failed:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
`

  try {
    // Create the Edge Function
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/functions/f1-news-scraper`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${managementToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'f1-news-scraper',
          source: functionCode
        })
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    console.log('✅ Edge Function created successfully!')
    
    // Deploy the function
    const deployResponse = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/functions/f1-news-scraper/deploy`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${managementToken}`,
          'Content-Type': 'application/json',
        }
      }
    )

    if (deployResponse.ok) {
      console.log('✅ Function deployed successfully!')
      console.log(`🔗 Function URL: https://${projectRef}.supabase.co/functions/v1/f1-news-scraper`)
      
      console.log('\n🎉 F1 News scraping is now automated!')
      console.log('The function will scrape F1 news and create articles automatically.')
      console.log('You can test it by visiting the function URL or set up a cron job.')
      
    } else {
      console.log('⚠️ Function created but deployment failed')
    }
    
  } catch (error) {
    console.error('💥 Failed to create Edge Function:', error.message)
  }
}

createF1NewsEdgeFunction()