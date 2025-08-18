"use client"

import { useState } from "react"
import NewsIcon from "@/components/icons/news-icon"
import { AuthButtons } from "@/components/auth/auth-buttons"

export default function PaddockTalk() {
  const [activeTab, setActiveTab] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const newsData = {
    breaking: [
      {
        id: 1,
        title: "BREAKING: Major F1 Regulation Changes Announced",
        summary: "The FIA has announced significant technical regulation changes that will reshape the sport.",
        publishedAt: "2 hours ago",
        engagement: { views: 2500, likes: 180, comments: 45 },
        source: "F1 Official",
      },
    ],
    trending: [
      {
        id: 2,
        title: "Driver Market Heating Up: Latest Transfer Rumors",
        summary: "Multiple sources suggest major driver moves are imminent for next season.",
        publishedAt: "4 hours ago",
        engagement: { views: 1800, likes: 120, comments: 67 },
        source: "Paddock Insider",
      },
    ],
    tech: [
      {
        id: 3,
        title: "Technical Analysis: New Aerodynamic Packages",
        summary: "Deep dive into the latest aerodynamic developments across the grid.",
        publishedAt: "6 hours ago",
        engagement: { views: 950, likes: 85, comments: 23 },
        source: "Tech F1",
      },
    ],
    gossip: [
      {
        id: 4,
        title: "Paddock Whispers: Behind the Scenes Drama",
        summary: "The latest rumors and insider information from the F1 paddock.",
        publishedAt: "8 hours ago",
        engagement: { views: 1200, likes: 95, comments: 78 },
        source: "Paddock Gossip",
      },
    ],
    transfers: [
      {
        id: 5,
        title: "Transfer Window Update: Who's Moving Where?",
        summary: "Complete breakdown of confirmed and rumored driver transfers.",
        publishedAt: "10 hours ago",
        engagement: { views: 1600, likes: 110, comments: 56 },
        source: "Transfer Central",
      },
    ],
  }

  const categories = [
    { id: "breaking", label: "Breaking" },
    { id: "trending", label: "Trending" },
    { id: "tech", label: "Tech" },
    { id: "gossip", label: "Gossip" },
    { id: "transfers", label: "Transfers" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-red-950">
      <div className="py-6">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <NewsIcon className="text-blue-400" width={48} height={48} />
            <h1 className="text-4xl font-bold font-orbitron text-blue-400" style={{ filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))' }}>Paddock Talk</h1>
            <NewsIcon className="text-blue-400" width={48} height={48} />
          </div>
          <p className="text-gray-400 font-rajdhani">
            AI-powered F1 news with real-time updates from the paddock
          </p>
        </div>

        {/* Auth Buttons */}
        <div className="mb-6">
          <AuthButtons themeColor="blue" />
        </div>


        <div className="w-full">
          <div className="flex rounded-lg p-1 mb-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 font-rajdhani font-medium ${
                  activeTab === category.id
                    ? "glass-blue text-blue-300 shadow-lg scale-105 border border-blue-400/50"
                    : "text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Search and Action Buttons */}
          <div className="flex justify-between items-center mb-6 px-4">
            <div className="relative max-w-md">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                placeholder="Search F1 news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                inputMode="search"
                className="w-full pl-10 pr-4 py-2 bg-transparent border-2 border-blue-500 text-blue-400 placeholder-blue-400/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-rajdhani focus:bg-blue-500/10"
                onFocus={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.blur()
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-transparent border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 hover:text-blue-300 rounded-lg transition-all duration-200 font-rajdhani font-medium">
                ↻ Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-transparent border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 hover:text-blue-300 rounded-lg transition-all duration-200 font-rajdhani font-medium">
                📡 Subscribe
              </button>
            </div>
          </div>

          {activeTab && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
              {newsData[activeTab as keyof typeof newsData]?.map((article) => (
              <div
                key={article.id}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 hover:border-blue-500/50 transition-all duration-200"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2 font-sans">{article.title}</h3>
                  <p className="text-gray-400 text-sm mb-3 font-sans">{article.summary}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 font-sans">
                    <span>{article.source}</span>
                    <span>{article.publishedAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-400 text-sm font-sans">
                  <div className="flex items-center gap-1">
                    <span>👁</span>
                    {article.engagement.views}
                  </div>
                  <div className="flex items-center gap-1">
                    <span>❤</span>
                    {article.engagement.likes}
                  </div>
                  <div className="flex items-center gap-1">
                    <span>💬</span>
                    {article.engagement.comments}
                  </div>
                </div>
              </div>
            )) || (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-400 font-sans">No {activeTab} news available at the moment.</p>
              </div>
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
