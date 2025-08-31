/**
 * Live Training Scheduler - Continuously trains Qwen3 from field data
 */

import { createClient } from '@supabase/supabase-js'
import QwenTrainingGenerator from '@/lib/analytics/qwen-training-generator'
import { QwenConnector } from '@/lib/llm/qwen-connector'

export class LiveTrainingScheduler {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  /**
   * Main training loop - runs continuously on your server
   */
  async startLiveTraining() {
    console.log('🧠 Starting live Qwen3 training from field data...')
    
    // Run every 24 hours
    setInterval(async () => {
      try {
        await this.runTrainingCycle()
      } catch (error) {
        console.error('Training cycle failed:', error)
      }
    }, 24 * 60 * 60 * 1000) // 24 hours

    // Also run immediately on startup
    await this.runTrainingCycle()
  }

  /**
   * Single training cycle
   */
  private async runTrainingCycle() {
    console.log('🔄 Running training cycle...')
    
    const stats = {
      interactions: 0,
      newTrainingExamples: 0,
      contentProcessed: 0
    }

    try {
      // 1. Check for new user interactions
      const newInteractions = await this.getNewInteractions()
      stats.interactions = newInteractions.length
      
      if (newInteractions.length < 50) {
        console.log(`⏸️ Only ${newInteractions.length} new interactions, waiting for more data...`)
        return stats
      }

      // 2. Update content performance scores
      await this.updateContentPerformance(newInteractions)
      
      // 3. Generate new training data from high-performing content
      const trainingGenerator = new QwenTrainingGenerator()
      const trainingExamples = await trainingGenerator.generateTrainingData(75) // High quality only
      stats.newTrainingExamples = trainingExamples.length
      
      if (trainingExamples.length === 0) {
        console.log('⏸️ No high-quality content found for training')
        return stats
      }

      // 4. Export training data for fine-tuning
      const jsonlData = await trainingGenerator.exportForFineTuning()
      await this.saveTrainingFile(jsonlData)
      
      // 5. Optionally: Trigger automatic fine-tuning
      if (trainingExamples.length > 100) {
        await this.triggerFineTuning(jsonlData)
      }

      console.log(`✅ Training cycle complete:`, stats)
      return stats

    } catch (error) {
      console.error('Training cycle error:', error)
      throw error
    }
  }

  /**
   * Get new user interactions since last training
   */
  private async getNewInteractions() {
    const { data: lastTraining } = await this.supabase
      .from('qwen_training_data')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const since = lastTraining?.created_at || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: interactions } = await this.supabase
      .from('user_interactions')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: false })

    return interactions || []
  }

  /**
   * Update content performance based on new interactions
   */
  private async updateContentPerformance(interactions: any[]) {
    const contentMetrics: Record<string, any> = {}

    // Aggregate metrics by content
    for (const interaction of interactions) {
      if (!interaction.content_id) continue

      if (!contentMetrics[interaction.content_id]) {
        contentMetrics[interaction.content_id] = {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          totalEngagement: 0,
          interactions: 0
        }
      }

      const metrics = contentMetrics[interaction.content_id]
      
      switch (interaction.interaction_type) {
        case 'view':
          metrics.views++
          break
        case 'like':
          metrics.likes++
          break
        case 'comment':
          metrics.comments++
          break
        case 'share':
          metrics.shares++
          break
      }
      
      metrics.totalEngagement += interaction.engagement_score || 0
      metrics.interactions++
    }

    // Update database
    for (const [contentId, metrics] of Object.entries(contentMetrics)) {
      const performanceScore = this.calculatePerformanceScore(metrics)
      
      await this.supabase
        .from('content_performance')
        .upsert([{
          content_id: contentId,
          views: metrics.views,
          likes: metrics.likes,
          comments: metrics.comments,
          shares: metrics.shares,
          performance_score: performanceScore,
          updated_at: new Date().toISOString()
        }])
    }

    console.log(`📊 Updated performance for ${Object.keys(contentMetrics).length} pieces of content`)
  }

  /**
   * Calculate performance score from metrics
   */
  private calculatePerformanceScore(metrics: any): number {
    const { views, likes, comments, shares, totalEngagement, interactions } = metrics
    
    let score = 0
    
    // Engagement rate (40 points max)
    const engagementRate = (likes + comments + shares) / Math.max(1, views)
    score += Math.min(40, engagementRate * 100)
    
    // Average engagement score (30 points max)
    const avgEngagement = totalEngagement / Math.max(1, interactions)
    score += Math.min(30, avgEngagement * 3)
    
    // Volume bonus (30 points max)
    score += Math.min(30, views * 0.1)
    
    return Math.min(100, score)
  }

  /**
   * Save training file to disk/storage
   */
  private async saveTrainingFile(jsonlData: string) {
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `qwen3-training-${timestamp}.jsonl`
    
    // Save to local file system (in production, use cloud storage)
    const fs = require('fs')
    const path = require('path')
    
    const trainingDir = path.join(process.cwd(), 'training-data')
    if (!fs.existsSync(trainingDir)) {
      fs.mkdirSync(trainingDir, { recursive: true })
    }
    
    const filepath = path.join(trainingDir, filename)
    fs.writeFileSync(filepath, jsonlData)
    
    console.log(`💾 Training data saved: ${filepath}`)
    return filepath
  }

  /**
   * Trigger automatic fine-tuning (if you have the setup)
   */
  private async triggerFineTuning(jsonlData: string) {
    // This is where you'd integrate with your fine-tuning pipeline
    // For now, just log that we're ready
    console.log('🔧 Ready for fine-tuning with', jsonlData.split('\n').length, 'training examples')
    
    // You could trigger:
    // - Ollama fine-tuning commands
    // - Custom training scripts
    // - Cloud-based training services
    // - Docker containers for training
  }

  /**
   * Get training statistics
   */
  async getTrainingStats() {
    const [interactions, trainingData, contentPerformance] = await Promise.all([
      this.supabase.from('user_interactions').select('count'),
      this.supabase.from('qwen_training_data').select('count'),
      this.supabase.from('content_performance').select('count')
    ])

    return {
      totalInteractions: interactions.data?.[0]?.count || 0,
      trainingExamples: trainingData.data?.[0]?.count || 0,
      contentTracked: contentPerformance.data?.[0]?.count || 0,
      lastUpdate: new Date().toISOString()
    }
  }
}

export default LiveTrainingScheduler