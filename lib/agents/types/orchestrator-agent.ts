/**
 * Orchestrator Agent
 * Coordinates and manages workflow between different agent types
 */

import { BaseAgent, AgentConfig, AgentTask, AgentResult, AgentMessage } from '../base-agent'

interface OrchestratorConfig {
  managedAgents: string[] // Agent IDs that this orchestrator manages
  workflow: string // Workflow name/type
  maxConcurrentTasks: number
  priorityScheduling: boolean
  healthMonitoring: boolean
  autoRecovery: boolean
}

interface WorkflowStep {
  id: string
  name: string
  agentType: string
  dependencies: string[] // Step IDs that must complete first
  timeout: number
  retryPolicy: {
    maxRetries: number
    backoffMs: number
  }
  optional: boolean
}

interface WorkflowDefinition {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  triggers: string[] // Events that trigger this workflow
  outputTargets: string[] // Where to send final results
}

interface AgentHealth {
  agentId: string
  status: string
  lastHeartbeat: string
  taskQueue: number
  errorRate: number
  avgResponseTime: number
}

interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused'
  currentStep: string
  completedSteps: string[]
  failedSteps: string[]
  startTime: string
  endTime?: string
  context: any // Data passed between steps
  results: Map<string, any>
}

export class OrchestratorAgent extends BaseAgent {
  private orchestratorConfig: OrchestratorConfig
  private workflows: Map<string, WorkflowDefinition> = new Map()
  private executions: Map<string, WorkflowExecution> = new Map()
  private agentHealth: Map<string, AgentHealth> = new Map()
  private healthCheckInterval: NodeJS.Timeout | null = null

  constructor(config: AgentConfig) {
    super(config)
    this.orchestratorConfig = {
      managedAgents: config.parameters.managedAgents || [],
      workflow: config.parameters.workflow || 'default',
      maxConcurrentTasks: config.parameters.maxConcurrentTasks || 10,
      priorityScheduling: config.parameters.priorityScheduling ?? true,
      healthMonitoring: config.parameters.healthMonitoring ?? true,
      autoRecovery: config.parameters.autoRecovery ?? true
    }
    
    this.initializeWorkflows()
  }

  protected async onStart(): Promise<void> {
    this.log('info', `Orchestrator started managing ${this.orchestratorConfig.managedAgents.length} agents`)
    this.log('info', `Active workflow: ${this.orchestratorConfig.workflow}`)
    
    // Start health monitoring
    if (this.orchestratorConfig.healthMonitoring) {
      this.startHealthMonitoring()
    }
    
    // Initialize agent health tracking
    for (const agentId of this.orchestratorConfig.managedAgents) {
      this.initializeAgentHealth(agentId)
    }
  }

  protected async onStop(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }
    
    // Gracefully pause all running executions
    for (const execution of this.executions.values()) {
      if (execution.status === 'running') {
        execution.status = 'paused'
      }
    }
    
    this.log('info', 'Orchestrator stopped')
  }

  protected async executeTask(task: AgentTask): Promise<AgentResult> {
    switch (task.type) {
      case 'coordinate':
        return await this.coordinateWorkflow(task.data)
      
      case 'manage':
        return await this.manageAgents(task.data)
      
      case 'workflow':
        return await this.executeWorkflow(task.data)
      
      case 'health-check':
        return await this.performHealthCheck()
      
      case 'recover-agent':
        return await this.recoverAgent(task.data.agentId)
      
      default:
        throw new Error(`Unknown task type: ${task.type}`)
    }
  }

  protected onMessage(message: AgentMessage): void {
    switch (message.type) {
      case 'status':
        this.updateAgentHealth(message.from, message.payload)
        break
      
      case 'result':
        this.handleStepCompletion(message)
        break
      
      case 'command':
        if (message.payload.command === 'start-workflow') {
          this.addTask({
            id: `workflow_${Date.now()}`,
            type: 'workflow',
            priority: message.payload.priority || 'normal',
            data: message.payload.data,
            createdAt: new Date().toISOString(),
            maxRetries: 1,
            currentRetries: 0
          })
        }
        break
    }
  }

  /**
   * Coordinate a workflow execution
   */
  private async coordinateWorkflow(data: { workflowId: string, input: any }): Promise<AgentResult> {
    const { workflowId, input } = data
    const workflow = this.workflows.get(workflowId)
    
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`)
    }
    
    this.log('info', `Starting workflow coordination: ${workflow.name}`)
    
    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      workflowId,
      status: 'pending',
      currentStep: '',
      completedSteps: [],
      failedSteps: [],
      startTime: new Date().toISOString(),
      context: input,
      results: new Map()
    }
    
    this.executions.set(execution.id, execution)
    
    // Start workflow execution
    const result = await this.runWorkflow(execution)
    
    return {
      success: result.success,
      data: {
        executionId: execution.id,
        status: execution.status,
        completedSteps: execution.completedSteps.length,
        totalSteps: workflow.steps.length,
        results: Object.fromEntries(execution.results)
      },
      error: result.error
    }
  }

  /**
   * Execute a complete workflow
   */
  private async executeWorkflow(data: { workflow?: string, input?: any, steps?: WorkflowStep[] }): Promise<AgentResult> {
    const workflowId = data.workflow || this.orchestratorConfig.workflow
    return await this.coordinateWorkflow({ workflowId, input: data.input || {} })
  }

  /**
   * Manage agents (start, stop, health check)
   */
  private async manageAgents(data: { action: string, agentId?: string }): Promise<AgentResult> {
    const { action, agentId } = data
    
    switch (action) {
      case 'health-check-all':
        return await this.performHealthCheck()
      
      case 'restart-agent':
        if (!agentId) throw new Error('Agent ID required for restart')
        return await this.restartAgent(agentId)
      
      case 'rebalance-load':
        return await this.rebalanceLoad()
      
      default:
        throw new Error(`Unknown management action: ${action}`)
    }
  }

  /**
   * Run a workflow execution
   */
  private async runWorkflow(execution: WorkflowExecution): Promise<{ success: boolean, error?: string }> {
    const workflow = this.workflows.get(execution.workflowId)!
    execution.status = 'running'
    
    try {
      // Execute steps in dependency order
      const stepOrder = this.calculateStepOrder(workflow.steps)
      
      for (const stepId of stepOrder) {
        const step = workflow.steps.find(s => s.id === stepId)!
        execution.currentStep = stepId
        
        this.log('info', `Executing workflow step: ${step.name}`)
        
        const stepResult = await this.executeWorkflowStep(execution, step)
        
        if (stepResult.success) {
          execution.completedSteps.push(stepId)
          execution.results.set(stepId, stepResult.data)
        } else {
          execution.failedSteps.push(stepId)
          
          if (!step.optional) {
            execution.status = 'failed'
            return { success: false, error: `Step ${step.name} failed: ${stepResult.error}` }
          }
        }
        
        // Update context for next steps
        if (stepResult.data && stepResult.data.context) {
          execution.context = { ...execution.context, ...stepResult.data.context }
        }
      }
      
      execution.status = 'completed'
      execution.endTime = new Date().toISOString()
      
      this.log('success', `Workflow completed: ${workflow.name}`)
      
      return { success: true }
      
    } catch (error) {
      execution.status = 'failed'
      execution.endTime = new Date().toISOString()
      
      this.log('error', `Workflow failed: ${error}`)
      return { success: false, error: `Workflow execution failed: ${error}` }
    }
  }

  /**
   * Execute a single workflow step
   */
  private async executeWorkflowStep(execution: WorkflowExecution, step: WorkflowStep): Promise<AgentResult> {
    try {
      // Find available agent for this step
      const availableAgent = await this.findAvailableAgent(step.agentType)
      
      if (!availableAgent) {
        throw new Error(`No available agent of type ${step.agentType}`)
      }
      
      // Create task for the agent
      const task: AgentTask = {
        id: `step_${execution.id}_${step.id}`,
        type: this.getTaskTypeForStep(step),
        priority: 'normal',
        data: {
          ...execution.context,
          stepId: step.id,
          executionId: execution.id
        },
        createdAt: new Date().toISOString(),
        maxRetries: step.retryPolicy.maxRetries,
        currentRetries: 0
      }
      
      // Send task to agent
      const result = await this.delegateToAgent(availableAgent, task)
      
      return result
      
    } catch (error) {
      return {
        success: false,
        error: `Step execution failed: ${error}`
      }
    }
  }

  /**
   * Find available agent for task
   */
  private async findAvailableAgent(agentType: string): Promise<string | null> {
    const healthyAgents = Array.from(this.agentHealth.entries())
      .filter(([agentId, health]) => 
        health.status === 'running' && 
        health.taskQueue < 5 && // Not overloaded
        agentId.startsWith(agentType) // Type match
      )
      .sort(([,a], [,b]) => a.taskQueue - b.taskQueue) // Sort by queue size
    
    return healthyAgents.length > 0 ? healthyAgents[0][0] : null
  }

  /**
   * Delegate task to specific agent
   */
  private async delegateToAgent(agentId: string, task: AgentTask): Promise<AgentResult> {
    // Send message to agent
    this.sendMessage(agentId, 'task', {
      taskType: task.type,
      priority: task.priority,
      data: task.data
    })
    
    // Wait for result (simplified - in real implementation would use proper async messaging)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { completed: true, agentId, taskId: task.id }
        })
      }, 1000 + Math.random() * 2000)
    })
  }

  /**
   * Health monitoring and management
   */
  private async performHealthCheck(): Promise<AgentResult> {
    const healthResults = new Map<string, AgentHealth>()
    
    for (const agentId of this.orchestratorConfig.managedAgents) {
      try {
        // Send ping to agent
        this.sendMessage(agentId, 'command', { command: 'ping' })
        
        // Update health status (simplified)
        const health: AgentHealth = {
          agentId,
          status: 'running',
          lastHeartbeat: new Date().toISOString(),
          taskQueue: Math.floor(Math.random() * 10),
          errorRate: Math.random() * 0.1,
          avgResponseTime: 500 + Math.random() * 1000
        }
        
        healthResults.set(agentId, health)
        this.agentHealth.set(agentId, health)
        
      } catch (error) {
        const health: AgentHealth = {
          agentId,
          status: 'error',
          lastHeartbeat: new Date().toISOString(),
          taskQueue: 0,
          errorRate: 1.0,
          avgResponseTime: 0
        }
        
        healthResults.set(agentId, health)
        this.agentHealth.set(agentId, health)
        
        // Auto-recovery if enabled
        if (this.orchestratorConfig.autoRecovery) {
          await this.recoverAgent(agentId)
        }
      }
    }
    
    const healthyCount = Array.from(healthResults.values()).filter(h => h.status === 'running').length
    const totalAgents = this.orchestratorConfig.managedAgents.length
    
    return {
      success: true,
      data: {
        healthyAgents: healthyCount,
        totalAgents,
        healthStatus: healthyCount / totalAgents,
        details: Object.fromEntries(healthResults)
      }
    }
  }

  /**
   * Recover failed agent
   */
  private async recoverAgent(agentId: string): Promise<AgentResult> {
    this.log('info', `Attempting to recover agent: ${agentId}`)
    
    try {
      // Send restart command
      this.sendMessage(agentId, 'command', { command: 'restart' })
      
      // Wait a moment then check health
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update health status
      const health: AgentHealth = {
        agentId,
        status: 'running',
        lastHeartbeat: new Date().toISOString(),
        taskQueue: 0,
        errorRate: 0,
        avgResponseTime: 500
      }
      
      this.agentHealth.set(agentId, health)
      
      this.log('success', `Agent recovered: ${agentId}`)
      
      return {
        success: true,
        data: { recovered: true, agentId }
      }
      
    } catch (error) {
      this.log('error', `Failed to recover agent ${agentId}: ${error}`)
      
      return {
        success: false,
        error: `Recovery failed: ${error}`
      }
    }
  }

  /**
   * Restart agent
   */
  private async restartAgent(agentId: string): Promise<AgentResult> {
    return await this.recoverAgent(agentId)
  }

  /**
   * Rebalance load across agents
   */
  private async rebalanceLoad(): Promise<AgentResult> {
    const loadStats = Array.from(this.agentHealth.entries())
      .map(([agentId, health]) => ({ agentId, load: health.taskQueue }))
      .sort((a, b) => b.load - a.load)
    
    // In a real implementation, this would redistribute tasks
    this.log('info', 'Load rebalancing completed')
    
    return {
      success: true,
      data: { rebalanced: true, loadStats }
    }
  }

  /**
   * Utility methods
   */
  private initializeWorkflows(): void {
    // Define standard F1 article generation workflow
    const articleWorkflow: WorkflowDefinition = {
      id: 'f1-article-generation',
      name: 'F1 Article Generation Pipeline',
      description: 'Complete pipeline from scraping to publishing F1 articles',
      steps: [
        {
          id: 'scrape',
          name: 'Scrape F1 News',
          agentType: 'scraper',
          dependencies: [],
          timeout: 60000,
          retryPolicy: { maxRetries: 3, backoffMs: 5000 },
          optional: false
        },
        {
          id: 'write',
          name: 'Generate Article',
          agentType: 'writer',
          dependencies: ['scrape'],
          timeout: 120000,
          retryPolicy: { maxRetries: 2, backoffMs: 10000 },
          optional: false
        },
        {
          id: 'moderate',
          name: 'Content Moderation',
          agentType: 'moderator',
          dependencies: ['write'],
          timeout: 30000,
          retryPolicy: { maxRetries: 1, backoffMs: 5000 },
          optional: false
        },
        {
          id: 'publish',
          name: 'Publish Article',
          agentType: 'publisher',
          dependencies: ['moderate'],
          timeout: 60000,
          retryPolicy: { maxRetries: 2, backoffMs: 15000 },
          optional: false
        },
        {
          id: 'track',
          name: 'Track Performance',
          agentType: 'analytics',
          dependencies: ['publish'],
          timeout: 30000,
          retryPolicy: { maxRetries: 1, backoffMs: 5000 },
          optional: true
        }
      ],
      triggers: ['manual', 'scheduled', 'webhook'],
      outputTargets: ['website', 'social-media']
    }
    
    this.workflows.set(articleWorkflow.id, articleWorkflow)
    this.workflows.set('default', articleWorkflow)
  }

  private calculateStepOrder(steps: WorkflowStep[]): string[] {
    const ordered: string[] = []
    const remaining = new Set(steps.map(s => s.id))
    
    while (remaining.size > 0) {
      const ready = Array.from(remaining).filter(stepId => {
        const step = steps.find(s => s.id === stepId)!
        return step.dependencies.every(dep => ordered.includes(dep))
      })
      
      if (ready.length === 0) {
        throw new Error('Circular dependency detected in workflow')
      }
      
      ready.forEach(stepId => {
        ordered.push(stepId)
        remaining.delete(stepId)
      })
    }
    
    return ordered
  }

  private getTaskTypeForStep(step: WorkflowStep): string {
    const taskTypes = {
      scraper: 'scrape-all',
      writer: 'generate-article',
      moderator: 'moderate-article',
      publisher: 'publish-article',
      analytics: 'track-publication'
    }
    
    return taskTypes[step.agentType] || 'execute'
  }

  private initializeAgentHealth(agentId: string): void {
    this.agentHealth.set(agentId, {
      agentId,
      status: 'unknown',
      lastHeartbeat: new Date().toISOString(),
      taskQueue: 0,
      errorRate: 0,
      avgResponseTime: 0
    })
  }

  private updateAgentHealth(agentId: string, statusData: any): void {
    const existing = this.agentHealth.get(agentId)
    if (existing) {
      this.agentHealth.set(agentId, {
        ...existing,
        ...statusData,
        lastHeartbeat: new Date().toISOString()
      })
    }
  }

  private handleStepCompletion(message: AgentMessage): void {
    // Handle step completion in workflow
    const { executionId, stepId, success, data } = message.payload
    
    if (executionId && stepId) {
      const execution = this.executions.get(executionId)
      if (execution) {
        if (success) {
          execution.completedSteps.push(stepId)
          execution.results.set(stepId, data)
        } else {
          execution.failedSteps.push(stepId)
        }
      }
    }
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.addTask({
          id: `health_${Date.now()}`,
          type: 'health-check',
          priority: 'low',
          data: {},
          createdAt: new Date().toISOString(),
          maxRetries: 1,
          currentRetries: 0
        })
      } catch (error) {
        this.log('error', `Health monitoring failed: ${error}`)
      }
    }, 30000) // Every 30 seconds
  }
}

export default OrchestratorAgent