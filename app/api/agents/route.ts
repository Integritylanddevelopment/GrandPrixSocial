/**
 * Agent Factory API
 * REST API for managing AI agents through the agent factory
 */

import { NextRequest, NextResponse } from 'next/server'
import { agentFactory } from '@/lib/agents/factory/agent-factory'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

/**
 * Get agent information and factory status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const agentId = searchParams.get('agent-id')

    switch (action) {
      case 'list':
        // Get all agents
        const agents = agentFactory.getAllAgentStatuses()
        return NextResponse.json({
          success: true,
          agents,
          count: agents.length
        })

      case 'stats':
        // Get factory statistics
        const stats = agentFactory.getFactoryStats()
        return NextResponse.json({
          success: true,
          stats
        })

      case 'agent':
        // Get specific agent status
        if (!agentId) {
          return NextResponse.json({
            success: false,
            error: 'Agent ID required'
          }, { status: 400 })
        }

        const agents_list = agentFactory.getAllAgentStatuses()
        const agent = agents_list.find(a => a.id === agentId)
        
        if (!agent) {
          return NextResponse.json({
            success: false,
            error: 'Agent not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          agent
        })

      case 'workflows':
        // Get available workflows (placeholder)
        return NextResponse.json({
          success: true,
          workflows: [
            {
              id: 'f1-article-generation',
              name: 'F1 Article Generation Pipeline',
              description: 'Complete pipeline from scraping to publishing F1 articles',
              steps: 5,
              estimatedTime: '10-15 minutes'
            }
          ]
        })

      default:
        // Default overview
        const overview = {
          factory: agentFactory.getFactoryStats(),
          agents: agentFactory.getAllAgentStatuses(),
          capabilities: [
            'Dynamic agent creation and scaling',
            'Workflow orchestration',
            'Health monitoring and auto-recovery',
            'Performance optimization',
            'Task queue management'
          ]
        }

        return NextResponse.json({
          success: true,
          message: 'Agent Factory API',
          overview
        })
    }

  } catch (error) {
    console.error('Agent API GET error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * Create agents and manage factory operations
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { action, ...params } = data

    switch (action) {
      case 'create-agent':
        return await createAgent(params)
      
      case 'create-workflow':
        return await createWorkflow(params)
      
      case 'start-agent':
        return await startAgent(params)
      
      case 'stop-agent':
        return await stopAgent(params)
      
      case 'remove-agent':
        return await removeAgent(params)
      
      case 'assign-task':
        return await assignTask(params)
      
      case 'health-check':
        return await performHealthCheck()
      
      case 'broadcast':
        return await broadcastMessage(params)

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Available actions: create-agent, create-workflow, start-agent, stop-agent, remove-agent, assign-task, health-check, broadcast'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Agent API POST error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Operation failed'
    }, { status: 500 })
  }
}

/**
 * Create a new agent
 */
async function createAgent(params: {
  type: string
  name?: string
  description?: string
  config?: any
}): Promise<NextResponse> {
  const { type, name, description, config = {} } = params

  if (!type) {
    return NextResponse.json({
      success: false,
      error: 'Agent type is required'
    }, { status: 400 })
  }

  const validTypes = ['scraper', 'writer', 'publisher', 'moderator', 'analytics', 'orchestrator']
  if (!validTypes.includes(type)) {
    return NextResponse.json({
      success: false,
      error: `Invalid agent type. Valid types: ${validTypes.join(', ')}`
    }, { status: 400 })
  }

  try {
    const agentId = await agentFactory.createAgent(type as any, {
      name,
      description,
      ...config
    })

    return NextResponse.json({
      success: true,
      message: 'Agent created successfully',
      agentId,
      type
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Failed to create agent: ${error}`
    }, { status: 500 })
  }
}

/**
 * Create a complete workflow
 */
async function createWorkflow(params: {
  name: string
  config: any
}): Promise<NextResponse> {
  const { name, config } = params

  if (!name) {
    return NextResponse.json({
      success: false,
      error: 'Workflow name is required'
    }, { status: 400 })
  }

  try {
    const workflow = await agentFactory.createWorkflow(name, config)

    // Auto-start all agents in the workflow
    for (const agentId of Object.values(workflow.agents)) {
      try {
        await agentFactory.startAgent(agentId)
      } catch (error) {
        console.log(`Warning: Failed to start agent ${agentId}:`, error)
      }
    }

    // Start orchestrator
    try {
      await agentFactory.startAgent(workflow.orchestrator)
    } catch (error) {
      console.log('Warning: Failed to start orchestrator:', error)
    }

    return NextResponse.json({
      success: true,
      message: 'Workflow created and started',
      workflow: {
        name,
        orchestrator: workflow.orchestrator,
        agents: workflow.agents,
        totalAgents: Object.keys(workflow.agents).length + 1
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Failed to create workflow: ${error}`
    }, { status: 500 })
  }
}

/**
 * Start an agent
 */
async function startAgent(params: { agentId: string }): Promise<NextResponse> {
  const { agentId } = params

  if (!agentId) {
    return NextResponse.json({
      success: false,
      error: 'Agent ID is required'
    }, { status: 400 })
  }

  try {
    await agentFactory.startAgent(agentId)

    return NextResponse.json({
      success: true,
      message: 'Agent started successfully',
      agentId
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Failed to start agent: ${error}`
    }, { status: 500 })
  }
}

/**
 * Stop an agent
 */
async function stopAgent(params: { agentId: string }): Promise<NextResponse> {
  const { agentId } = params

  if (!agentId) {
    return NextResponse.json({
      success: false,
      error: 'Agent ID is required'
    }, { status: 400 })
  }

  try {
    await agentFactory.stopAgent(agentId)

    return NextResponse.json({
      success: true,
      message: 'Agent stopped successfully',
      agentId
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Failed to stop agent: ${error}`
    }, { status: 500 })
  }
}

/**
 * Remove an agent
 */
async function removeAgent(params: { agentId: string }): Promise<NextResponse> {
  const { agentId } = params

  if (!agentId) {
    return NextResponse.json({
      success: false,
      error: 'Agent ID is required'
    }, { status: 400 })
  }

  try {
    await agentFactory.removeAgent(agentId)

    return NextResponse.json({
      success: true,
      message: 'Agent removed successfully',
      agentId
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Failed to remove agent: ${error}`
    }, { status: 500 })
  }
}

/**
 * Assign task to agent
 */
async function assignTask(params: {
  task: any
  agentId?: string
}): Promise<NextResponse> {
  const { task, agentId } = params

  if (!task) {
    return NextResponse.json({
      success: false,
      error: 'Task is required'
    }, { status: 400 })
  }

  try {
    // Create proper task object
    const agentTask = {
      id: `api_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: task.type || 'execute',
      priority: task.priority || 'normal',
      data: task.data || {},
      createdAt: new Date().toISOString(),
      maxRetries: task.maxRetries || 3,
      currentRetries: 0
    }

    await agentFactory.assignTask(agentTask, agentId)

    return NextResponse.json({
      success: true,
      message: 'Task assigned successfully',
      taskId: agentTask.id,
      assignedTo: agentId || 'auto-selected'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Failed to assign task: ${error}`
    }, { status: 500 })
  }
}

/**
 * Perform health check on all agents
 */
async function performHealthCheck(): Promise<NextResponse> {
  try {
    const agents = agentFactory.getAllAgentStatuses()
    const stats = agentFactory.getFactoryStats()
    
    const healthReport = {
      timestamp: new Date().toISOString(),
      totalAgents: stats.totalAgents,
      runningAgents: stats.runningAgents,
      healthStatus: stats.runningAgents / stats.totalAgents,
      avgExecutionTime: stats.avgExecutionTime,
      errorRate: stats.errorRate,
      agentsByType: stats.agentsByType,
      agents: agents.map(agent => ({
        id: agent.id,
        type: agent.type,
        name: agent.name,
        status: agent.status,
        queueSize: agent.queueSize,
        metrics: {
          tasksCompleted: agent.metrics.tasksCompleted,
          errorRate: agent.metrics.errorRate,
          avgExecutionTime: agent.metrics.averageExecutionTime
        }
      }))
    }

    return NextResponse.json({
      success: true,
      message: 'Health check completed',
      healthReport
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Health check failed: ${error}`
    }, { status: 500 })
  }
}

/**
 * Broadcast message to all agents
 */
async function broadcastMessage(params: {
  type: string
  message: any
}): Promise<NextResponse> {
  const { type, message } = params

  if (!type) {
    return NextResponse.json({
      success: false,
      error: 'Message type is required'
    }, { status: 400 })
  }

  try {
    agentFactory.broadcast(type as any, message)

    return NextResponse.json({
      success: true,
      message: 'Message broadcasted successfully',
      type,
      recipients: agentFactory.getFactoryStats().totalAgents
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Broadcast failed: ${error}`
    }, { status: 500 })
  }
}