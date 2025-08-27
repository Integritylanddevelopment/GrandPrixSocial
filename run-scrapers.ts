import { config } from 'dotenv'
import { F1NewsScraper, initializeMonitoredAccounts } from './lib/news-pipeline/f1-scrapers'

// Load environment variables
config({ path: '.env.local' })

async function runScrapers() {
  console.log('🏎️ Starting F1 News Scrapers...')
  
  try {
    // Initialize monitored accounts first
    await initializeMonitoredAccounts()
    
    // Create scraper instance
    const scraper = new F1NewsScraper()
    
    // Run full scrape
    const totalScraped = await scraper.runFullScrape()
    
    console.log(`✅ Scraping completed! ${totalScraped} new posts added to database`)
    
  } catch (error) {
    console.error('💥 Scraping failed:', error)
    process.exit(1)
  }
}

runScrapers()