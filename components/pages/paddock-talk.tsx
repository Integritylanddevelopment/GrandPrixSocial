"use client"

import { useState } from "react"

export default function PaddockTalk() {
  const [activeTab, setActiveTab] = useState("breaking")
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900/20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="w-full">
            <h1 className="text-4xl font-bold text-white mb-2 text-center font-sans">Paddock Talk</h1>
            <p className="text-gray-400 text-center font-sans">
              AI-powered F1 news with real-time updates from the paddock
            </p>
          </div>
          <div className="flex gap-2 absolute top-6 right-6">
            <button className="flex items-center gap-2 px-4 py-2 bg-transparent border-2 border-red-500 text-red-400 hover:bg-red-500/10 hover:border-red-400 hover:text-red-300 rounded-lg transition-all duration-200 font-sans font-medium">
              ↻ Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-transparent border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 hover:text-blue-300 rounded-lg transition-all duration-200 font-sans font-medium">
              📡 Subscribe
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 text-center"
            >
              <div className="text-2xl font-bold text-red-400 font-sans">
                {newsData[category.id as keyof typeof newsData]?.length || 0}
              </div>
              <div className="text-sm text-gray-400 font-sans">{category.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              placeholder="Search F1 news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              inputMode="search"
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-sans"
              onFocus={(e) => {
                if (document.activeElement !== e.target) {
                  e.target.blur()
                }
              }}
            />
          </div>
        </div>

        <div className="w-full">
          <div className="flex bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-1 mb-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 font-sans font-medium ${
                  activeTab === category.id
                    ? "bg-transparent border-2 border-red-500 text-red-400"
                    : "bg-transparent border-2 border-transparent text-gray-400 hover:text-white hover:border-gray-600"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsData[activeTab as keyof typeof newsData]?.map((article) => (
              <div
                key={article.id}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 hover:border-red-500/50 transition-all duration-200"
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
        </div>
      </div>
    </div>
  )
}
