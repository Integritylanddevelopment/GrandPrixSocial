"use client"

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { AuthButtons } from '@/components/auth/auth-buttons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Send, Bot, User, Loader2, Mic, MicOff, Phone, MessageSquare, Crown, Zap } from 'lucide-react'
import { redirect } from 'next/navigation'

interface Message {
  id: string
  role: 'user' | 'claude' | 'system'
  content: string
  timestamp: Date
  typing?: boolean
}

export default function ClaudeInterface() {
  const { user, loading } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Check if user is authenticated
  useEffect(() => {
    if (!loading && !user) {
      redirect('/auth/login?redirect=/claude-interface')
    }
  }, [user, loading])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize connection
  useEffect(() => {
    if (user) {
      setIsConnected(true)
      addMessage({
        role: 'system',
        content: `Welcome back, ${user.user_metadata?.name || user.email}! I'm Claude, your F1 team management assistant. How can I help you today?`
      })
    }
  }, [user])

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      timestamp: new Date(),
      ...msg
    }
    setMessages(prev => [...prev, newMessage])
  }

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return

    const userMessage = input.trim()
    setInput('')
    
    // Add user message
    addMessage({ role: 'user', content: userMessage })
    
    setIsTyping(true)
    
    try {
      const response = await fetch('/api/claude/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          userId: user?.id,
          context: {
            page: 'claude-interface',
            userType: 'team-owner',
            timestamp: new Date().toISOString()
          }
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      
      addMessage({ 
        role: 'claude', 
        content: data.response || 'I apologize, but I encountered an error. Please try again.'
      })
      
    } catch (error) {
      addMessage({
        role: 'system',
        content: 'Sorry, I\'m having trouble connecting. Please check your connection and try again.'
      })
    } finally {
      setIsTyping(false)
    }
  }

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickActions = [
    { label: 'Fantasy Tips', prompt: 'Give me some fantasy F1 team tips for this week' },
    { label: 'Race Schedule', prompt: 'What races are coming up next?' },
    { label: 'Driver Analysis', prompt: 'Analyze the top performing drivers this season' },
    { label: 'Team Strategy', prompt: 'Help me optimize my fantasy team strategy' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-purple-950 flex items-center justify-center">
        <div className="text-purple-400 font-orbitron">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-purple-950 flex items-center justify-center">
        <Card className="bg-gray-900/50 border-purple-500 max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-purple-400 font-orbitron mb-4">Authentication Required</div>
            <AuthButtons themeColor="purple" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-purple-950">
      {/* Header */}
      <div className="border-b border-purple-500/30 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bot className="w-8 h-8 text-purple-400" />
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                } animate-pulse`} />
              </div>
              <div>
                <h1 className="text-xl font-bold font-orbitron text-purple-400">Claude Interface</h1>
                <p className="text-sm text-gray-400 font-rajdhani">Team Owner Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1 bg-purple-600/20 rounded-full border border-purple-500/50">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-purple-300 font-rajdhani">Team Owner</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-optimized Chat Interface */}
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {/* Messages Container */}
        <div className="h-[calc(100vh-200px)] mb-4">
          <div className="h-full bg-gray-900/50 border border-gray-700 rounded-xl backdrop-blur-xl">
            <div className="h-full overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-3 max-w-[85%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-purple-600' 
                        : message.role === 'claude'
                          ? 'bg-blue-600'
                          : 'bg-gray-600'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-5 h-5 text-white" />
                      ) : message.role === 'claude' ? (
                        <Bot className="w-5 h-5 text-white" />
                      ) : (
                        <MessageSquare className="w-5 h-5 text-white" />
                      )}
                    </div>
                    
                    {/* Message Bubble */}
                    <div className={`rounded-2xl px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : message.role === 'claude' 
                          ? 'bg-gray-700 text-gray-100'
                          : 'bg-gray-800/50 text-gray-300'
                    }`}>
                      <p className="text-sm font-rajdhani whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-gray-700 rounded-2xl px-4 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="whitespace-nowrap bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-purple-600/20 hover:border-purple-500 hover:text-purple-300"
                onClick={() => {
                  setInput(action.prompt)
                  sendMessage()
                }}
              >
                <Zap className="w-3 h-3 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 backdrop-blur-xl">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about F1, fantasy teams, race strategy..."
                className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 font-rajdhani resize-none"
                disabled={isTyping}
              />
            </div>
            
            {/* Voice Input */}
            {recognitionRef.current && (
              <Button
                size="icon"
                variant="outline"
                className={`border-gray-600 ${
                  isListening 
                    ? 'bg-red-600 border-red-500 text-white' 
                    : 'bg-gray-800/50 border-gray-600 text-gray-300'
                }`}
                onClick={toggleListening}
                disabled={isTyping}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            )}
            
            {/* Send Button */}
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isTyping ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="text-center mt-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
            isConnected 
              ? 'bg-green-600/20 border border-green-500/50 text-green-400'
              : 'bg-red-600/20 border border-red-500/50 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            } animate-pulse`} />
            <span className="font-rajdhani">
              {isConnected ? 'Connected to Claude' : 'Connection lost'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}