"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Square, RefreshCw, Settings, Zap, Clock, FileText, CheckCircle, Brain, Download } from 'lucide-react'

interface AgentStatus {
  isRunning: boolean
  config: any
  lastRunTime: string | null
  uptime: number
}

interface QwenTrainingStatus {
  currentModelVersion: string
  activeJob: any
  lastTraining: any
  totalJobs: number
}

export default function AutomationControl() {
  const [status, setStatus] = useState<AgentStatus | null>(null)
  const [qwenStatus, setQwenStatus] = useState<QwenTrainingStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    fetchStatus()
    fetchQwenStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/ai/automation-agent')
      const data = await response.json()
      setStatus(data.agent?.status || null)
    } catch (error) {
      console.error('Failed to fetch agent status:', error)
      addLog('❌ Failed to fetch agent status')
    }
  }

  const fetchQwenStatus = async () => {
    try {
      const response = await fetch('/api/ai/qwen-training')
      const data = await response.json()
      setQwenStatus(data.system || null)
    } catch (error) {
      console.error('Failed to fetch Qwen status:', error)
      addLog('❌ Failed to fetch Qwen training status')
    }
  }

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)])
  }

  const controlAgent = async (action: string, config?: any) => {
    setLoading(true)
    addLog(`🔄 ${action.charAt(0).toUpperCase() + action.slice(1)}ing agent...`)

    try {
      const response = await fetch('/api/ai/automation-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, config })
      })

      const data = await response.json()
      
      if (data.success) {
        addLog(`✅ ${data.message}`)
        setStatus(data.status || null)
      } else {
        addLog(`❌ ${data.message || 'Operation failed'}`)
      }
    } catch (error) {
      addLog(`❌ Failed to ${action} agent`)
      console.error(`Agent ${action} failed:`, error)
    } finally {
      setLoading(false)
    }
  }

  const runManualCycle = async () => {
    await controlAgent('run-cycle', {
      enabled: true,
      maxArticlesPerRun: 5,
      autoPublish: false // Safe for testing
    })
  }

  const triggerQwenTraining = async () => {
    setLoading(true)
    addLog('🧠 Triggering Qwen training update...')

    try {
      const response = await fetch('/api/ai/qwen-training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'update-model',
          exampleCount: 20,
          trigger: 'manual'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        addLog(`✅ Qwen training job started: ${data.job.id}`)
        fetchQwenStatus()
      } else {
        addLog(`❌ Training failed: ${data.message}`)
      }
    } catch (error) {
      addLog('❌ Failed to start Qwen training')
    } finally {
      setLoading(false)
    }
  }

  const exportModelfile = async () => {
    setLoading(true)
    addLog('📥 Exporting Qwen modelfile...')

    try {
      const response = await fetch('/api/ai/qwen-training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export-modelfile' })
      })

      const data = await response.json()
      
      if (data.success) {
        // Download the modelfile
        const blob = new Blob([data.modelfile], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'Modelfile'
        a.click()
        window.URL.revokeObjectURL(url)
        
        addLog(`✅ Modelfile exported (${data.exampleCount} examples)`)
      } else {
        addLog(`❌ Export failed: ${data.message}`)
      }
    } catch (error) {
      addLog('❌ Failed to export modelfile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white font-orbitron mb-2">
          🤖 AI Article Automation
        </h1>
        <p className="text-gray-300 font-rajdhani">
          Automated F1 news scraping and AI article generation
        </p>
      </div>

      {/* Status Card */}
      <Card className="glass-purple border-purple-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white font-orbitron">
              <Zap className="w-5 h-5 text-purple-400" />
              Agent Status
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchStatus}
              disabled={loading}
              className="text-purple-400 border-purple-500"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 font-rajdhani">Status:</span>
            <Badge 
              variant={status?.isRunning ? "default" : "secondary"}
              className={status?.isRunning ? "bg-green-600" : "bg-gray-600"}
            >
              {status?.isRunning ? "Running" : "Stopped"}
            </Badge>
          </div>
          
          {status?.lastRunTime && (
            <div className="flex items-center justify-between">
              <span className="text-gray-300 font-rajdhani">Last Run:</span>
              <span className="text-white font-rajdhani text-sm">
                {new Date(status.lastRunTime).toLocaleString()}
              </span>
            </div>
          )}

          {status?.config && (
            <div className="space-y-2">
              <span className="text-gray-300 font-rajdhani">Configuration:</span>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Interval:</span>
                  <span className="text-white">{status.config.scrapeInterval}min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Articles:</span>
                  <span className="text-white">{status.config.maxArticlesPerRun}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Auto Publish:</span>
                  <span className="text-white">{status.config.autoPublish ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Categories:</span>
                  <span className="text-white">{status.config.categories?.length || 0}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controls */}
      <Card className="glass-purple border-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white font-orbitron">
            <Settings className="w-5 h-5 text-purple-400" />
            Agent Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={() => controlAgent('start')}
              disabled={loading || status?.isRunning}
              className="bg-green-600 hover:bg-green-700 text-white font-rajdhani"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Agent
            </Button>
            
            <Button
              onClick={() => controlAgent('stop')}
              disabled={loading || !status?.isRunning}
              className="bg-red-600 hover:bg-red-700 text-white font-rajdhani"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Agent
            </Button>
            
            <Button
              onClick={runManualCycle}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-rajdhani"
            >
              <Clock className="w-4 h-4 mr-2" />
              Run Once
            </Button>
            
            <Button
              onClick={fetchStatus}
              disabled={loading}
              variant="outline"
              className="text-purple-400 border-purple-500 font-rajdhani"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card className="glass-purple border-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white font-orbitron">
            <FileText className="w-5 h-5 text-purple-400" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400 font-rajdhani text-center py-4">
                No activity logged yet. Try starting the agent or running a manual cycle.
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

      {/* Qwen Training Status */}
      <Card className="glass-purple border-purple-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white font-orbitron">
              <Brain className="w-5 h-5 text-purple-400" />
              Qwen AI Training
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchQwenStatus}
              disabled={loading}
              className="text-purple-400 border-purple-500"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 font-rajdhani">Model Version:</span>
            <Badge variant="secondary" className="bg-blue-600">
              {qwenStatus?.currentModelVersion || 'v1.0'}
            </Badge>
          </div>

          {qwenStatus?.activeJob && (
            <div className="space-y-2">
              <span className="text-gray-300 font-rajdhani">Active Training Job:</span>
              <div className="bg-gray-800/50 rounded p-3 border-l-2 border-blue-500">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Job ID:</span>
                  <span className="text-white font-mono">{qwenStatus.activeJob.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status:</span>
                  <Badge variant="default" className="bg-orange-600">
                    {qwenStatus.activeJob.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Examples:</span>
                  <span className="text-white">{qwenStatus.activeJob.exampleCount}</span>
                </div>
              </div>
            </div>
          )}

          {qwenStatus?.lastTraining && (
            <div className="space-y-2">
              <span className="text-gray-300 font-rajdhani">Last Training:</span>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`text-white ${qwenStatus.lastTraining.status === 'completed' ? 'text-green-400' : 'text-red-400'}`}>
                    {qwenStatus.lastTraining.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Examples:</span>
                  <span className="text-white">{qwenStatus.lastTraining.exampleCount}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-gray-300 font-rajdhani">Total Jobs:</span>
            <span className="text-white">{qwenStatus?.totalJobs || 0}</span>
          </div>
        </CardContent>
      </Card>

      {/* Qwen Training Controls */}
      <Card className="glass-purple border-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white font-orbitron">
            <Brain className="w-5 h-5 text-purple-400" />
            AI Training Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={triggerQwenTraining}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-rajdhani"
            >
              <Brain className="w-4 h-4 mr-2" />
              Update Model
            </Button>
            
            <Button
              onClick={exportModelfile}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-rajdhani"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Modelfile
            </Button>
            
            <Button
              onClick={fetchQwenStatus}
              disabled={loading}
              variant="outline"
              className="text-purple-400 border-purple-500 font-rajdhani"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Status
            </Button>
          </div>
          
          <div className="mt-4 text-sm text-gray-400 font-rajdhani">
            <p>• Update Model: Train Qwen with recent high-performing articles</p>
            <p>• Export Modelfile: Download Ollama-compatible training file</p>
            <p>• Model learns from article engagement and user feedback</p>
          </div>
        </CardContent>
      </Card>

      {/* Features Overview */}
      <Card className="glass-purple border-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white font-orbitron">
            <CheckCircle className="w-5 h-5 text-purple-400" />
            Automation Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-white font-semibold font-rajdhani">Content Pipeline</h4>
              <ul className="text-sm text-gray-300 space-y-1 font-rajdhani">
                <li>• Automated F1 news scraping</li>
                <li>• Local Qwen AI article generation</li>
                <li>• Performance-based model training</li>
                <li>• Quality control and filtering</li>
                <li>• Automatic publishing pipeline</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-white font-semibold font-rajdhani">Smart AI Features</h4>
              <ul className="text-sm text-gray-300 space-y-1 font-rajdhani">
                <li>• Self-improving Qwen model</li>
                <li>• Engagement-based learning</li>
                <li>• F1-specific fine-tuning</li>
                <li>• Content categorization</li>
                <li>• SEO optimization</li>
                <li>• Custom model export</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}