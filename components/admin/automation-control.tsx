"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Square, RefreshCw, Settings, Zap, Clock, FileText, CheckCircle } from 'lucide-react'

interface AgentStatus {
  isRunning: boolean
  config: any
  lastRunTime: string | null
  uptime: number
}

export default function AutomationControl() {
  const [status, setStatus] = useState<AgentStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    fetchStatus()
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
                <li>• AI-powered article enhancement</li>
                <li>• Quality control and filtering</li>
                <li>• Automatic publishing pipeline</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-white font-semibold font-rajdhani">Smart Features</h4>
              <ul className="text-sm text-gray-300 space-y-1 font-rajdhani">
                <li>• Content categorization</li>
                <li>• SEO optimization</li>
                <li>• Configurable intervals</li>
                <li>• Manual trigger capability</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}