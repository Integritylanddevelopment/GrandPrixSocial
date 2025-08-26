"use client"

import { useState, useEffect } from "react"
import NewsIcon from "@/components/icons/news-icon"
import { AuthButtons } from "@/components/auth/auth-buttons"
import ArticleDetail from "@/components/news/article-detail"

export default function PaddockTalk() {
  const [activeTab, setActiveTab] = useState("breaking")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedArticle, setSelectedArticle] = useState<any>(null)
  const [newsData, setNewsData] = useState({
    breaking: [],
    trending: [],
    tech: [],
    gossip: [],
    transfers: []
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchNewsData = async () => {
    try {
      console.log('📡 fetchNewsData called - starting API calls...')
      setLoading(true)

      // Fetch all articles for each category - no limits for persistent feed
      console.log('📡 Fetching breaking news...')
      const breakingResponse = await fetch(`/api/news/search?priority=high&limit=50`)
      const breakingData = await breakingResponse.json()
      console.log('📡 Breaking news response:', breakingData)

      // Fetch trending news from categories API
      const trendingResponse = await fetch("/api/news/categories")
      const trendingResult = await trendingResponse.json()

      // Fetch technical news  
      const techResponse = await fetch("/api/news/search?category=technical&limit=50")
      const techData = await techResponse.json()

      // Fetch gossip news (use team-news as fallback)
      const gossipResponse = await fetch("/api/news/search?category=team-news&limit=50")
      const gossipData = await gossipResponse.json()

      // Fetch transfer/driver news
      const transferResponse = await fetch("/api/news/search?category=driver-news&limit=50")
      const transferData = await transferResponse.json()

      // Merge with existing data to maintain persistence
      setNewsData(prev => ({
        breaking: [...(breakingData.results || []), ...prev.breaking].slice(0, 100), // Keep latest 100
        trending: [...(trendingResult.trending || []), ...prev.trending].slice(0, 100),
        tech: [...(techData.results || []), ...prev.tech].slice(0, 100),
        gossip: [...(gossipData.results || []), ...prev.gossip].slice(0, 100),
        transfers: [...(transferData.results || []), ...prev.transfers].slice(0, 100)
      }))

      setLastUpdated(new Date())
      setLoading(false)

      // Show pipeline status to user
      if (breakingData.pipeline) {
        console.log('F1 News Pipeline Status:', breakingData.pipeline)
      }
    } catch (error) {
      console.error("Failed to fetch news:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('🔄 PaddockTalk useEffect triggered - fetching news data...')
    fetchNewsData()
  }, [])

  // Remove auto-refresh - articles should be persistent

  // Utility function to get time ago
  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
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

          {/* Search Bar */}
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
            <div className="flex gap-2 items-center">
              <button className="flex items-center gap-2 px-4 py-2 bg-transparent border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 hover:text-blue-300 rounded-lg transition-all duration-200 font-rajdhani font-medium">
                📡 Subscribe
              </button>
            </div>
          </div>

          {activeTab && (
            <div className="flex flex-col gap-4 px-4 max-w-2xl mx-auto">
              {loading ? (
                Array.from({length: 6}).map((_, index) => (
                  <div key={index} className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 animate-pulse">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded mb-3 w-3/4"></div>
                    <div className="h-2 bg-gray-700 rounded mb-2 w-1/2"></div>
                    <div className="flex gap-4 mt-4">
                      <div className="h-2 bg-gray-700 rounded w-12"></div>
                      <div className="h-2 bg-gray-700 rounded w-12"></div>
                      <div className="h-2 bg-gray-700 rounded w-12"></div>
                    </div>
                  </div>
                ))
              ) : newsData[activeTab as keyof typeof newsData]?.length > 0 ? (
                newsData[activeTab as keyof typeof newsData]?.map((article: any) => {
                  const publishedDate = new Date(article.publishedAt)
                  const timeAgo = getTimeAgo(publishedDate)
                  
                  return (
                    <div
                      key={article.id}
                      className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 hover:border-blue-500/50 transition-all duration-200 cursor-pointer"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white mb-2 font-sans line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3 font-sans line-clamp-3">
                          {article.excerpt || article.summary}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 font-sans">
                          <span className="flex items-center gap-1">
                            {article.isLive && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                            {article.source}
                          </span>
                          <span>{timeAgo}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-gray-400 text-sm font-sans">
                          <div className="flex items-center gap-1">
                            <span>👁</span>
                            {(article.engagement?.views || 0).toLocaleString()}
                          </div>
                          {article.sentiment && (
                            <div className="flex items-center gap-1">
                              <span>
                                {article.sentiment === 'positive' ? '📈' : 
                                 article.sentiment === 'negative' ? '📉' : 
                                 article.sentiment === 'emotional' ? '💭' : '📊'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:text-red-400 transition-colors rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Increment likes locally - in real app would call API
                              const currentLikes = article.engagement?.likes || 0;
                              article.engagement.likes = currentLikes + 1;
                              // Force re-render by updating state
                              setNewsData(prev => ({...prev}));
                            }}
                          >
                            <span>❤</span>
                            {(article.engagement?.likes || 0).toLocaleString()}
                          </button>
                          <button 
                            className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:text-blue-400 transition-colors rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedArticle(article);
                            }}
                          >
                            <span>💬</span>
                            {(article.engagement?.comments || 0).toLocaleString()}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-400 font-sans">No {activeTab} news available at the moment.</p>
                  <p className="text-gray-500 text-sm font-sans mt-2">Try refreshing or check back later for updates.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <ArticleDetail
          article={selectedArticle}
          onClose={() => {
            setSelectedArticle(null)
            // Stay on the same page - don't navigate anywhere
          }}
        />
      )}
    </div>
  )
}
