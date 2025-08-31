"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bot, 
  Play, 
  Square, 
  Trash2, 
  Plus, 
  Activity, 
  Users, 
  TrendingUp,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Network,
  Workflow
} from 'lucide-react'

interface Agent {
  id: string
  type: string
  name: string
  status: string
  metrics: {
    tasksCompleted: number
    tasksFailes: number
    errorRate: number
    averageExecutionTime: number
  }
  queueSize: number
}

interface FactoryStats {
  totalAgents: number
  runningAgents: number
  totalTasks: number
  avgExecutionTime: number
  errorRate: number
  agentsByType: Record<string, number>
}

export default function AgentFactoryControl() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [stats, setStats] = useState<FactoryStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [selectedAgentType, setSelectedAgentType] = useState<string>('scraper')

  useEffect(() => {
    fetchAgents()
    fetchStats()
  }, [])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)])
  }

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents?action=list')
      const data = await response.json()
      
      if (data.success) {
        setAgents(data.agents || [])
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error)
      addLog('❌ Failed to fetch agents')
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/agents?action=stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      addLog('❌ Failed to fetch factory stats')
    }
  }

  const createAgent = async (type: string, customConfig?: any) => {
    setLoading(true)
    addLog(`🤖 Creating ${type} agent...`)

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-agent',
          type,
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} Agent`,
          config: customConfig || {}
        })
      })

      const data = await response.json()
      
      if (data.success) {
        addLog(`✅ Created agent: ${data.agentId}`)
        await fetchAgents()
        await fetchStats()
        
        // Auto-start the agent
        await startAgent(data.agentId)
      } else {
        addLog(`❌ Failed to create agent: ${data.error}`)
      }
    } catch (error) {
      addLog(`❌ Agent creation failed: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const startAgent = async (agentId: string) => {
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start-agent',
          agentId
        })
      })

      const data = await response.json()
      
      if (data.success) {
        addLog(`✅ Started agent: ${agentId}`)
        await fetchAgents()
        await fetchStats()
      } else {
        addLog(`❌ Failed to start agent: ${data.error}`)
      }
    } catch (error) {
      addLog(`❌ Start failed: ${error}`)
    }
  }

  const stopAgent = async (agentId: string) => {
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'stop-agent',
          agentId
        })
      })

      const data = await response.json()
      
      if (data.success) {
        addLog(`🛑 Stopped agent: ${agentId}`)
        await fetchAgents()
        await fetchStats()
      } else {
        addLog(`❌ Failed to stop agent: ${data.error}`)
      }
    } catch (error) {
      addLog(`❌ Stop failed: ${error}`)
    }
  }

  const removeAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to remove this agent?')) return

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove-agent',
          agentId
        })
      })

      const data = await response.json()
      
      if (data.success) {
        addLog(`🗑️ Removed agent: ${agentId}`)
        await fetchAgents()
        await fetchStats()
      } else {
        addLog(`❌ Failed to remove agent: ${data.error}`)
      }
    } catch (error) {
      addLog(`❌ Remove failed: ${error}`)
    }
  }

  const createWorkflow = async () => {
    setLoading(true)
    addLog('🔄 Creating F1 article generation workflow...')

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-workflow',
          name: 'F1 Article Pipeline',
          config: {
            scraper: { parameters: { maxArticlesPerRun: 5 } },
            writer: { parameters: { defaultLength: 'medium' } },
            publisher: { parameters: { autoPublish: false } },
            moderator: { parameters: { qualityThreshold: 7.0 } },
            analytics: { parameters: { trackingEnabled: true } }
          }
        })
      })

      const data = await response.json()
      
      if (data.success) {
        addLog(`✅ Workflow created with ${data.workflow.totalAgents} agents`)
        await fetchAgents()
        await fetchStats()
      } else {
        addLog(`❌ Workflow creation failed: ${data.error}`)
      }
    } catch (error) {
      addLog(`❌ Workflow failed: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const performHealthCheck = async () => {
    setLoading(true)
    addLog('🏥 Performing health check...')

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'health-check' })
      })

      const data = await response.json()
      
      if (data.success) {
        const report = data.healthReport
        addLog(`✅ Health check: ${report.runningAgents}/${report.totalAgents} agents healthy`)
        addLog(`📊 Error rate: ${(report.errorRate * 100).toFixed(1)}%`)
        await fetchAgents()
        await fetchStats()
      } else {
        addLog(`❌ Health check failed: ${data.error}`)
      }
    } catch (error) {
      addLog(`❌ Health check error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-600'
      case 'idle': return 'bg-blue-600'
      case 'paused': return 'bg-yellow-600'
      case 'error': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  const getAgentIcon = (type: string) => {
    const icons = {
      scraper: '🕷️',
      writer: '✍️',
      publisher: '📢',
      moderator: '🛡️',
      analytics: '📊',
      orchestrator: '🎭'
    }
    return icons[type] || '🤖'
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white font-orbitron mb-2">
          🏭 Agent Factory
        </h1>
        <p className="text-gray-300 font-rajdhani">
          Dynamic AI agent creation, management, and orchestration
        </p>
      </div>

      {/* Factory Stats */}
      <Card className="glass-purple border-purple-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white font-orbitron">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Factory Status
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => { fetchAgents(); fetchStats() }}
              disabled={loading}
              className="text-purple-400 border-purple-500"
            >
              <Activity className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.totalAgents}</div>
                <div className="text-sm text-gray-400">Total Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.runningAgents}</div>
                <div className="text-sm text-gray-400">Running</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.totalTasks}</div>
                <div className="text-sm text-gray-400">Tasks Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{(stats.errorRate * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-400">Error Rate</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400">Loading factory stats...</div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="glass-purple border-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white font-orbitron">
            <Settings className="w-5 h-5 text-purple-400" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={createWorkflow}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-rajdhani"
            >
              <Workflow className="w-4 h-4 mr-2" />
              Create Pipeline
            </Button>
            
            <Button
              onClick={performHealthCheck}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-rajdhani"
            >
              <Activity className="w-4 h-4 mr-2" />
              Health Check
            </Button>
            
            <select
              value={selectedAgentType}
              onChange={(e) => setSelectedAgentType(e.target.value)}
              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 font-rajdhani"
            >
              <option value="scraper">Scraper Agent</option>
              <option value="writer">Writer Agent</option>
              <option value="publisher">Publisher Agent</option>
              <option value="moderator">Moderator Agent</option>
              <option value="analytics">Analytics Agent</option>
              <option value="orchestrator">Orchestrator Agent</option>
            </select>
            
            <Button
              onClick={() => createAgent(selectedAgentType)}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-rajdhani"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Agent
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Agents List */}
      <Card className="glass-purple border-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white font-orbitron">
            <Bot className="w-5 h-5 text-purple-400" />
            Active Agents ({agents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <div className="text-center py-8 text-gray-400 font-rajdhani">
              No agents created yet. Create your first agent to get started!
            </div>
          ) : (
            <div className="space-y-3">
              {agents.map((agent) => (
                <div 
                  key={agent.id} 
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getAgentIcon(agent.type)}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white font-rajdhani">
                            {agent.name}
                          </span>
                          <Badge 
                            variant="secondary" 
                            className={`${getStatusColor(agent.status)} text-white`}
                          >
                            {agent.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-400 font-rajdhani">
                          {agent.type} • Queue: {agent.queueSize} • Completed: {agent.metrics.tasksCompleted}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => agent.status === 'running' ? stopAgent(agent.id) : startAgent(agent.id)}
                        disabled={loading}
                        className={agent.status === 'running' 
                          ? "bg-red-600 hover:bg-red-700" 
                          : "bg-green-600 hover:bg-green-700"
                        }
                      >
                        {agent.status === 'running' ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeAgent(agent.id)}
                        disabled={loading}
                        className="text-red-400 border-red-500 hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Agent Metrics */}
                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Success Rate:</span>
                      <span className="ml-2 text-green-400">
                        {agent.metrics.tasksCompleted > 0 
                          ? (100 - agent.metrics.errorRate * 100).toFixed(1)
                          : 100}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Avg Time:</span>
                      <span className="ml-2 text-blue-400">
                        {agent.metrics.averageExecutionTime.toFixed(0)}ms
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Failed:</span>
                      <span className="ml-2 text-red-400">{agent.metrics.tasksFailes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card className="glass-purple border-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white font-orbitron">
            <Clock className="w-5 h-5 text-purple-400" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400 font-rajdhani text-center py-4">
                No activity logged yet. Create some agents to get started!
              </p>
            ) : (
              logs.map((log, index) => (
                <div 
                  key={index} 
                  className="text-sm font-mono p-2 bg-gray-800/50 rounded border-l-2 border-purple-500"
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Factory Capabilities */}
      <Card className="glass-purple border-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white font-orbitron">
            <Network className="w-5 h-5 text-purple-400" />
            Agent Factory Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-white font-semibold font-rajdhani">Agent Types</h4>
              <ul className="text-sm text-gray-300 space-y-1 font-rajdhani">
                <li>🕷️ Scraper - Automated F1 news collection</li>
                <li>✍️ Writer - AI-powered article generation with Qwen</li>
                <li>📢 Publisher - Multi-platform content distribution</li>
                <li>🛡️ Moderator - Quality control and content filtering</li>
                <li>📊 Analytics - Performance tracking and insights</li>
                <li>🎭 Orchestrator - Workflow coordination</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-white font-semibold font-rajdhani">Advanced Features</h4>
              <ul className="text-sm text-gray-300 space-y-1 font-rajdhani">
                <li>• Dynamic scaling and load balancing</li>
                <li>• Health monitoring and auto-recovery</li>
                <li>• Task queue management and prioritization</li>
                <li>• Workflow orchestration and coordination</li>
                <li>• Real-time performance metrics</li>
                <li>• Message passing and agent communication</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}