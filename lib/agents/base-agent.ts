/**
 * Base Agent System
 * Factory pattern for creating and managing AI agents
 */

export type AgentStatus = 'idle' | 'running' | 'paused' | 'error' | 'stopped'
export type AgentType = 'scraper' | 'writer' | 'publisher' | 'moderator' | 'analytics' | 'orchestrator'
export type AgentPriority = 'low' | 'normal' | 'high' | 'critical'

export interface AgentConfig {
  id: string
  type: AgentType
  name: string
  description: string
  priority: AgentPriority
  maxConcurrency: number
  retryAttempts: number
  timeout: number
  intervalMs?: number
  enabled: boolean
  parameters: Record<string, any>
}

export interface AgentMetrics {
  tasksCompleted: number
  tasksFailes: number
  averageExecutionTime: number
  lastExecutionTime: number
  uptime: number
  memoryUsage: number
  errorRate: number
}

export interface AgentTask {
  id: string
  type: string
  priority: AgentPriority
  data: any
  createdAt: string
  scheduledAt?: string
  maxRetries: number
  currentRetries: number
}

export interface AgentResult {
  success: boolean
  data?: any
  error?: string
  metrics?: Partial<AgentMetrics>
  nextTasks?: AgentTask[]
}

export interface AgentMessage {
  from: string
  to: string
  type: 'task' | 'result' | 'status' | 'command'
  payload: any
  timestamp: string
}

/**
 * Base Agent Class
 * All agents inherit from this base class
 */
export abstract class BaseAgent {
  protected config: AgentConfig
  protected status: AgentStatus = 'idle'
  protected metrics: AgentMetrics
  protected taskQueue: AgentTask[] = []
  protected currentTask: AgentTask | null = null
  protected intervalId: NodeJS.Timeout | null = null
  protected messageHandlers: Map<string, (message: AgentMessage) => void> = new Map()

  constructor(config: AgentConfig) {
    this.config = config
    this.metrics = {
      tasksCompleted: 0,
      tasksFailes: 0,
      averageExecutionTime: 0,
      lastExecutionTime: 0,
      uptime: 0,
      memoryUsage: 0,
      errorRate: 0
    }
    this.setupMessageHandlers()
  }

  /**
   * Start the agent
   */
  async start(): Promise<void> {
    if (this.status === 'running') {
      throw new Error(`Agent ${this.config.id} is already running`)
    }

    this.status = 'running'
    this.log('info', 'Agent starting...')
    
    await this.onStart()
    
    // Start periodic execution if configured
    if (this.config.intervalMs && this.config.intervalMs > 0) {
      this.intervalId = setInterval(async () => {
        if (this.status === 'running' && !this.currentTask) {
          await this.processQueue()
        }
      }, this.config.intervalMs)
    }
    
    this.log('info', 'Agent started successfully')
  }

  /**
   * Stop the agent
   */
  async stop(): Promise<void> {
    if (this.status === 'stopped') {
      return
    }

    this.status = 'stopped'
    this.log('info', 'Agent stopping...')
    
    // Clear interval
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    // Wait for current task to complete
    if (this.currentTask) {
      this.log('info', 'Waiting for current task to complete...')
      await this.waitForCurrentTask()
    }

    await this.onStop()
    this.log('info', 'Agent stopped')
  }

  /**
   * Pause the agent
   */
  pause(): void {
    if (this.status === 'running') {
      this.status = 'paused'
      this.log('info', 'Agent paused')
    }
  }

  /**
   * Resume the agent
   */
  resume(): void {
    if (this.status === 'paused') {
      this.status = 'running'
      this.log('info', 'Agent resumed')
    }
  }

  /**
   * Add task to queue
   */
  addTask(task: AgentTask): void {
    this.taskQueue.push(task)
    this.taskQueue.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority))
    
    // Process immediately if agent is idle
    if (this.status === 'running' && !this.currentTask) {
      setTimeout(() => this.processQueue(), 0)
    }
  }

  /**
   * Get agent status
   */
  getStatus(): {
    id: string
    type: AgentType
    name: string
    status: AgentStatus
    metrics: AgentMetrics
    queueSize: number
    currentTask: AgentTask | null
    config: AgentConfig
  } {
    return {
      id: this.config.id,
      type: this.config.type,
      name: this.config.name,
      status: this.status,
      metrics: { ...this.metrics },
      queueSize: this.taskQueue.length,
      currentTask: this.currentTask,
      config: { ...this.config }
    }
  }

  /**
   * Send message to another agent
   */
  sendMessage(to: string, type: AgentMessage['type'], payload: any): void {
    const message: AgentMessage = {
      from: this.config.id,
      to,
      type,
      payload,
      timestamp: new Date().toISOString()
    }
    
    this.onMessage(message)
  }

  /**
   * Process message queue
   */
  protected async processQueue(): Promise<void> {
    if (this.taskQueue.length === 0 || this.currentTask || this.status !== 'running') {
      return
    }

    const task = this.taskQueue.shift()!
    this.currentTask = task
    const startTime = Date.now()

    try {
      this.log('info', `Processing task ${task.id} (${task.type})`)
      
      const result = await this.executeTask(task)
      
      const executionTime = Date.now() - startTime
      this.updateMetrics(true, executionTime)
      
      if (result.nextTasks) {
        result.nextTasks.forEach(nextTask => this.addTask(nextTask))
      }
      
      this.log('success', `Task ${task.id} completed in ${executionTime}ms`)
      
    } catch (error) {
      const executionTime = Date.now() - startTime
      this.updateMetrics(false, executionTime)
      
      // Retry logic
      if (task.currentRetries < task.maxRetries) {
        task.currentRetries++
        this.taskQueue.unshift(task) // Put back at front of queue
        this.log('warning', `Task ${task.id} failed, retrying (${task.currentRetries}/${task.maxRetries})`)
      } else {
        this.log('error', `Task ${task.id} failed permanently: ${error}`)
      }
    } finally {
      this.currentTask = null
    }

    // Process next task
    setTimeout(() => this.processQueue(), 10)
  }

  /**
   * Abstract methods to be implemented by concrete agents
   */
  protected abstract onStart(): Promise<void>
  protected abstract onStop(): Promise<void>
  protected abstract executeTask(task: AgentTask): Promise<AgentResult>
  protected abstract onMessage(message: AgentMessage): void

  /**
   * Setup message handlers
   */
  protected setupMessageHandlers(): void {
    this.messageHandlers.set('ping', (message) => {
      this.sendMessage(message.from, 'result', { pong: true })
    })
    
    this.messageHandlers.set('stop', () => {
      this.stop()
    })
    
    this.messageHandlers.set('pause', () => {
      this.pause()
    })
    
    this.messageHandlers.set('resume', () => {
      this.resume()
    })
  }

  /**
   * Utility methods
   */
  private getPriorityValue(priority: AgentPriority): number {
    const values = { low: 1, normal: 2, high: 3, critical: 4 }
    return values[priority] || 2
  }

  private updateMetrics(success: boolean, executionTime: number): void {
    if (success) {
      this.metrics.tasksCompleted++
    } else {
      this.metrics.tasksFailes++
    }
    
    this.metrics.lastExecutionTime = executionTime
    this.metrics.averageExecutionTime = 
      (this.metrics.averageExecutionTime * (this.metrics.tasksCompleted + this.metrics.tasksFailes - 1) + executionTime) /
      (this.metrics.tasksCompleted + this.metrics.tasksFailes)
    
    this.metrics.errorRate = this.metrics.tasksFailes / (this.metrics.tasksCompleted + this.metrics.tasksFailes)
  }

  private async waitForCurrentTask(): Promise<void> {
    while (this.currentTask) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  protected log(level: 'info' | 'warning' | 'error' | 'success', message: string): void {
    const timestamp = new Date().toISOString()
    const emoji = { info: '🔍', warning: '⚠️', error: '❌', success: '✅' }[level]
    console.log(`${emoji} [${timestamp}] Agent ${this.config.name}: ${message}`)
  }
}

export default BaseAgent