"use client"

import { useState } from "react"
import { MessageSquare, Users, Trophy, Flame, Heart, MessageCircle, Share2, UserPlus, LogIn } from "lucide-react"

export default function Cafe() {
  const [activeTab, setActiveTab] = useState("")
  const [activeAuthTab, setActiveAuthTab] = useState("")

  const posts = [
    {
      id: 1,
      content:
        "Just watched the latest F1 highlights - what an incredible season! Who else is excited for the next race?",
      author: { username: "F1Fan2024", avatar: "🏎️" },
      createdAt: "2 hours ago",
      likes: 24,
      comments: 8,
    },
    {
      id: 2,
      content: "The new regulations are really shaking up the grid! Loving the close competition this year.",
      author: { username: "RacingExpert", avatar: "🏁" },
      createdAt: "4 hours ago",
      likes: 15,
      comments: 12,
    },
    {
      id: 3,
      content: "Anyone else think the McLaren livery looks amazing this season?",
      author: { username: "McLarenFan", avatar: "🧡" },
      createdAt: "6 hours ago",
      likes: 31,
      comments: 5,
    },
  ]

  const tabs = [
    { id: "feed", label: "Feed", icon: MessageSquare },
    { id: "trending", label: "Trending", icon: Flame },
    { id: "recent", label: "Recent", icon: Users },
    { id: "popular", label: "Popular", icon: Trophy },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-red-950">
      <div className="py-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 font-orbitron text-yellow-400" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))' }}>The F1 Café</h1>
          <p className="text-gray-400">Connect with fellow F1 fans and share your passion for racing</p>
        </div>

        {/* Auth Buttons */}
        <div className="mb-6">
          <div className="flex rounded-lg p-1 gap-2">
            <button
              onClick={() => setActiveAuthTab("signup")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200 font-rajdhani font-medium ${
                activeAuthTab === "signup" 
                  ? "glass-yellow text-yellow-300 shadow-lg scale-105 border border-yellow-400/50" 
                  : "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
              }`}
            >
              <UserPlus className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-400">Sign Up</span>
            </button>
            <button
              onClick={() => setActiveAuthTab("signin")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200 font-rajdhani font-medium ${
                activeAuthTab === "signin" 
                  ? "glass-yellow text-yellow-300 shadow-lg scale-105 border border-yellow-400/50" 
                  : "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
              }`}
            >
              <LogIn className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-400">Sign In</span>
            </button>
          </div>
        </div>

        <div className="w-full">
          <div className="flex rounded-lg p-1 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200 font-rajdhani font-medium ${
                    activeTab === tab.id 
                      ? "glass-yellow text-yellow-300 shadow-lg scale-105 border border-yellow-400/50" 
                      : "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
                  }`}
                >
                  <Icon className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-400">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {activeTab && (
            <div className="space-y-4 px-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg">
                      {post.author.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-white">{post.author.username}</span>
                        <span className="text-gray-500 text-sm">{post.createdAt}</span>
                      </div>
                      <p className="text-gray-300 mb-4">{post.content}</p>
                      <div className="flex items-center gap-6 text-gray-400">
                        <button className="flex items-center gap-2 hover:text-red-400 transition-colors">
                          <Heart className="h-4 w-4" />
                          {post.likes}
                        </button>
                        <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          {post.comments}
                        </button>
                        <button className="flex items-center gap-2 hover:text-green-400 transition-colors">
                          <Share2 className="h-4 w-4" />
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { Cafe }
