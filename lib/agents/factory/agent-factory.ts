/**
 * Agent Factory
 * Creates, manages, and orchestrates AI agents
 */

import { BaseAgent, AgentConfig, AgentType, AgentStatus, AgentTask, AgentMessage } from '../base-agent'
import { ScraperAgent } from '../types/scraper-agent'
import { WriterAgent } from '../types/writer-agent'
import { PublisherAgent } from '../types/publisher-agent'
import { ModeratorAgent } from '../types/moderator-agent'
import { AnalyticsAgent } from '../types/analytics-agent'
import { OrchestratorAgent } from '../types/orchestrator-agent'

export interface FactoryConfig {
  maxAgents: number
  defaultTimeout: number
  defaultRetries: number
  messageQueueSize: number
  enableLogging: boolean
}

export interface AgentTemplate {
  type: AgentType
  name: string
  description: string
  defaultConfig: Partial<AgentConfig>
  maxInstances: number
}

/**
 * Agent Factory Manager
 */
export class AgentFactory {
  private agents: Map<string, BaseAgent> = new Map()
  private messageQueue: AgentMessage[] = []
  private config: FactoryConfig
  private templates: Map<AgentType, AgentTemplate> = new Map()

  constructor(config: FactoryConfig = {
    maxAgents: 50,
    defaultTimeout: 300000, // 5 minutes
    defaultRetries: 3,
    messageQueueSize: 1000,
    enableLogging: true
  }) {
    this.config = config
    this.initializeTemplates()
    this.startMessageProcessor()
  }

  /**
   * Create a new agent instance
   */
  async createAgent(type: AgentType, customConfig: Partial<AgentConfig> = {}): Promise<string> {
    const template = this.templates.get(type)
    if (!template) {
      throw new Error(`Unknown agent type: ${type}`)
    }

    // Check instance limits
    const existingCount = Array.from(this.agents.values())
      .filter(agent => agent.getStatus().type === type).length
    
    if (existingCount >= template.maxInstances) {
      throw new Error(`Maximum instances reached for agent type: ${type}`)
    }

    // Generate unique ID
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`

    // Merge configuration
    const config: AgentConfig = {
      id,
      type,
      name: customConfig.name || `${template.name} #${existingCount + 1}`,
      description: customConfig.description || template.description,
      priority: customConfig.priority || 'normal',
      maxConcurrency: customConfig.maxConcurrency || 1,
      retryAttempts: customConfig.retryAttempts || this.config.defaultRetries,
      timeout: customConfig.timeout || this.config.defaultTimeout,
      intervalMs: customConfig.intervalMs,
      enabled: customConfig.enabled ?? true,
      parameters: { ...template.defaultConfig.parameters, ...customConfig.parameters }
    }

    // Create agent instance
    const agent = this.instantiateAgent(type, config)
    this.agents.set(id, agent)

    this.log('info', `Created agent: ${config.name} (${id})`)
    return id
  }

  /**
   * Start an agent
   */
  async startAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId)
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`)
    }

    await agent.start()
    this.log('info', `Started agent: ${agentId}`)
  }

  /**
   * Stop an agent
   */
  async stopAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId)
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`)
    }

    await agent.stop()
    this.log('info', `Stopped agent: ${agentId}`)
  }

  /**
   * Remove an agent
   */
  async removeAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId)
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`)
    }

    await agent.stop()
    this.agents.delete(agentId)
    this.log('info', `Removed agent: ${agentId}`)
  }

  /**
   * Assign task to agent or find best agent for task
   */
  async assignTask(task: AgentTask, agentId?: string): Promise<void> {
    let targetAgent: BaseAgent | undefined

    if (agentId) {
      targetAgent = this.agents.get(agentId)
      if (!targetAgent) {
        throw new Error(`Agent not found: ${agentId}`)
      }
    } else {
      // Find best agent for task
      targetAgent = this.findBestAgentForTask(task)
      if (!targetAgent) {
        throw new Error(`No suitable agent found for task: ${task.type}`)
      }
    }

    targetAgent.addTask(task)
    this.log('info', `Assigned task ${task.id} to agent ${targetAgent.getStatus().id}`)
  }

  /**
   * Get all agent statuses
   */
  getAllAgentStatuses(): Array<{
    id: string
    type: AgentType
    name: string
    status: AgentStatus
    metrics: any
    queueSize: number
    currentTask: AgentTask | null
  }> {
    return Array.from(this.agents.values()).map(agent => agent.getStatus())
  }

  /**
   * Get agents by type
   */
  getAgentsByType(type: AgentType): BaseAgent[] {
    return Array.from(this.agents.values())
      .filter(agent => agent.getStatus().type === type)
  }

  /**
   * Get factory statistics
   */
  getFactoryStats(): {
    totalAgents: number
    runningAgents: number
    totalTasks: number
    avgExecutionTime: number
    errorRate: number
    agentsByType: Record<AgentType, number>
  } {
    const statuses = this.getAllAgentStatuses()
    const agentsByType = {} as Record<AgentType, number>

    statuses.forEach(status => {
      agentsByType[status.type] = (agentsByType[status.type] || 0) + 1
    })

    const totalTasks = statuses.reduce((sum, s) => sum + s.metrics.tasksCompleted + s.metrics.tasksFailes, 0)
    const avgExecutionTime = statuses.reduce((sum, s) => sum + s.metrics.averageExecutionTime, 0) / statuses.length || 0
    const totalErrors = statuses.reduce((sum, s) => sum + s.metrics.tasksFailes, 0)
    const errorRate = totalTasks > 0 ? totalErrors / totalTasks : 0

    return {
      totalAgents: statuses.length,
      runningAgents: statuses.filter(s => s.status === 'running').length,
      totalTasks,
      avgExecutionTime,
      errorRate,
      agentsByType
    }
  }

  /**
   * Broadcast message to all agents
   */
  broadcast(type: AgentMessage['type'], payload: any): void {
    const message: AgentMessage = {
      from: 'factory',
      to: 'broadcast',
      type,
      payload,
      timestamp: new Date().toISOString()
    }

    this.agents.forEach(agent => {
      agent.sendMessage('broadcast', type, payload)
    })
  }

  /**
   * Create a complete workflow (orchestrator + specialized agents)
   */
  async createWorkflow(name: string, config: {
    scraper?: Partial<AgentConfig>
    writer?: Partial<AgentConfig>
    publisher?: Partial<AgentConfig>
    moderator?: Partial<AgentConfig>
    analytics?: Partial<AgentConfig>
  }): Promise<{
    orchestrator: string
    agents: Record<string, string>
  }> {
    const agents: Record<string, string> = {}

    // Create specialized agents
    if (config.scraper) {
      agents.scraper = await this.createAgent('scraper', { 
        ...config.scraper, 
        name: `${name} Scraper`
      })
    }

    if (config.writer) {
      agents.writer = await this.createAgent('writer', { 
        ...config.writer, 
        name: `${name} Writer`
      })
    }

    if (config.publisher) {
      agents.publisher = await this.createAgent('publisher', { 
        ...config.publisher, 
        name: `${name} Publisher`
      })
    }

    if (config.moderator) {
      agents.moderator = await this.createAgent('moderator', { 
        ...config.moderator, 
        name: `${name} Moderator`
      })
    }

    if (config.analytics) {
      agents.analytics = await this.createAgent('analytics', { 
        ...config.analytics, 
        name: `${name} Analytics`
      })
    }

    // Create orchestrator
    const orchestrator = await this.createAgent('orchestrator', {
      name: `${name} Orchestrator`,
      parameters: {
        managedAgents: Object.values(agents),
        workflow: name
      }
    })

    return { orchestrator, agents }
  }

  /**
   * Private helper methods
   */
  private initializeTemplates(): void {
    this.templates.set('scraper', {
      type: 'scraper',
      name: 'F1 News Scraper',
      description: 'Scrapes F1 news from various sources',
      maxInstances: 10,
      defaultConfig: {
        priority: 'normal',
        maxConcurrency: 3,
        intervalMs: 300000, // 5 minutes
        parameters: {
          sources: ['formula1.com', 'autosport.com', 'motorsport.com'],
          categories: ['breaking-news', 'race-analysis', 'driver-news'],
          maxArticlesPerRun: 20
        }
      }
    })

    this.templates.set('writer', {
      type: 'writer',
      name: 'AI Article Writer',
      description: 'Transforms scraped content into engaging F1 articles',
      maxInstances: 5,
      defaultConfig: {
        priority: 'high',
        maxConcurrency: 2,
        parameters: {
          qwenUrl: 'http://localhost:11434',
          defaultLength: 'medium',
          defaultTone: 'exciting'
        }
      }
    })

    this.templates.set('publisher', {
      type: 'publisher',
      name: 'Content Publisher',
      description: 'Publishes articles to the website and social media',
      maxInstances: 3,
      defaultConfig: {
        priority: 'high',
        maxConcurrency: 1,
        parameters: {
          autoPublish: false,
          platforms: ['website', 'twitter', 'facebook']
        }
      }
    })

    this.templates.set('moderator', {
      type: 'moderator',
      name: 'Content Moderator',
      description: 'Reviews and filters content for quality and compliance',
      maxInstances: 2,
      defaultConfig: {
        priority: 'high',
        maxConcurrency: 1,
        parameters: {
          qualityThreshold: 7.5,
          checkPlagiarism: true,
          checkFactAccuracy: true
        }
      }
    })

    this.templates.set('analytics', {
      type: 'analytics',
      name: 'Performance Analytics',
      description: 'Tracks article performance and feeds data back for training',
      maxInstances: 2,
      defaultConfig: {
        priority: 'normal',
        maxConcurrency: 1,
        intervalMs: 60000, // 1 minute
        parameters: {
          trackingEnabled: true,
          trainingFeedback: true
        }
      }
    })

    this.templates.set('orchestrator', {
      type: 'orchestrator',
      name: 'Workflow Orchestrator',
      description: 'Coordinates and manages workflow between agents',
      maxInstances: 5,
      defaultConfig: {
        priority: 'critical',
        maxConcurrency: 1,
        intervalMs: 30000, // 30 seconds
        parameters: {
          managedAgents: [],
          workflow: 'default'
        }
      }
    })
  }

  private instantiateAgent(type: AgentType, config: AgentConfig): BaseAgent {
    switch (type) {
      case 'scraper':
        return new ScraperAgent(config)
      case 'writer':
        return new WriterAgent(config)
      case 'publisher':
        return new PublisherAgent(config)
      case 'moderator':
        return new ModeratorAgent(config)
      case 'analytics':
        return new AnalyticsAgent(config)
      case 'orchestrator':
        return new OrchestratorAgent(config)
      default:
        throw new Error(`Unknown agent type: ${type}`)
    }
  }

  private findBestAgentForTask(task: AgentTask): BaseAgent | undefined {
    const suitableAgents = Array.from(this.agents.values())
      .filter(agent => {
        const status = agent.getStatus()
        return status.status === 'running' && 
               status.queueSize < 10 && // Not overloaded
               this.canAgentHandleTask(status.type, task.type)
      })
      .sort((a, b) => {
        // Sort by queue size (prefer less busy agents)
        return a.getStatus().queueSize - b.getStatus().queueSize
      })

    return suitableAgents[0]
  }

  private canAgentHandleTask(agentType: AgentType, taskType: string): boolean {
    const capabilities = {
      scraper: ['scrape', 'extract', 'fetch'],
      writer: ['generate', 'write', 'transform'],
      publisher: ['publish', 'post', 'upload'],
      moderator: ['moderate', 'review', 'filter'],
      analytics: ['analyze', 'track', 'report'],
      orchestrator: ['coordinate', 'manage', 'workflow']
    }

    return capabilities[agentType]?.some(cap => taskType.toLowerCase().includes(cap)) || false
  }

  private startMessageProcessor(): void {
    setInterval(() => {
      if (this.messageQueue.length > 0) {
        const messages = this.messageQueue.splice(0, 10) // Process 10 messages at a time
        messages.forEach(message => this.routeMessage(message))
      }
    }, 100) // Process every 100ms
  }

  private routeMessage(message: AgentMessage): void {
    if (message.to === 'broadcast') {
      this.agents.forEach(agent => {
        // Route to agent's message handler
      })
    } else {
      const targetAgent = this.agents.get(message.to)
      if (targetAgent) {
        // Route message to specific agent
      }
    }
  }

  private log(level: 'info' | 'warning' | 'error' | 'success', message: string): void {
    if (!this.config.enableLogging) return
    
    const timestamp = new Date().toISOString()
    const emoji = { info: '🏭', warning: '⚠️', error: '❌', success: '✅' }[level]
    console.log(`${emoji} [${timestamp}] AgentFactory: ${message}`)
  }
}

// Global factory instance
export const agentFactory = new AgentFactory()

export default AgentFactory