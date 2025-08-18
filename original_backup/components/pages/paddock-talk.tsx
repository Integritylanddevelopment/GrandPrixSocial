"use client"

import { useEffect, useState } from "react"
import { NewsHero } from "@/components/news/news-hero"
import { NewsSearch } from "@/components/news/news-search"
import { AIProcessingStats } from "@/components/news/ai-processing-stats"
import { F1ContentCard } from "@/components/social/f1-content-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RefreshCw, Rss, Filter } from "lucide-react"

export default function PaddockTalk() {
  const [newsData, setNewsData] = useState<any>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("breaking")

  useEffect(() => {
    fetchNewsData()
  }, [])

  const fetchNewsData = async () => {
    try {
      const response = await fetch("/api/news/categories")
      if (response.ok) {
        const data = await response.json()
        setNewsData(data)
      }
    } catch (error) {
      console.error("Error fetching news data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchNewsData()
    setRefreshing(false)
  }

  const handleSearch = async (query: string, filters: { category?: string; priority?: string }) => {
    try {
      const params = new URLSearchParams()
      if (query) params.append("q", query)
      if (filters.category) params.append("category", filters.category)
      if (filters.priority) params.append("priority", filters.priority)

      const response = await fetch(`/api/news/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results)
      }
    } catch (error) {
      console.error("Error searching news:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading the latest from the paddock...</p>
        </div>
      </div>
    )
  }

  const categories = ["breaking", "trending", "tech", "gossip", "transfers"]
  const priorities = ["breaking", "trending", "regular"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900/20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Paddock Talk</h1>
            <p className="text-gray-400">AI-powered F1 news with real-time updates from the paddock</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-gray-600 text-gray-400 hover:text-white bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" className="border-gray-600 text-gray-400 hover:text-white bg-transparent">
              <Rss className="h-4 w-4 mr-2" />
              Subscribe
            </Button>
          </div>
        </div>

        {/* AI Processing Stats */}
        {newsData && <AIProcessingStats stats={newsData.aiProcessingStats} categories={newsData.categories} />}

        {/* Breaking News Hero */}
        {newsData?.breaking && <NewsHero breakingNews={newsData.breaking} />}

        {/* Search */}
        <div className="mb-8">
          <NewsSearch onSearch={handleSearch} categories={categories} priorities={priorities} />
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-900/50 mb-6">
            <TabsTrigger value="breaking">Breaking</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="tech">Tech</TabsTrigger>
            <TabsTrigger value="gossip">Gossip</TabsTrigger>
            <TabsTrigger value="transfers">Transfers</TabsTrigger>
          </TabsList>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Search Results ({searchResults.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((content) => (
                  <F1ContentCard key={content.id} content={content} />
                ))}
              </div>
            </div>
          )}

          {/* Category Content */}
          {categories.map((category) => (
            <TabsContent key={category} value={category} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsData?.[category]?.map((content: any) => <F1ContentCard key={content.id} content={content} />) ||
                  // Fallback to trending if specific category is empty
                  newsData?.trending
                    ?.filter((content: any) => content.category === category)
                    .map((content: any) => <F1ContentCard key={content.id} content={content} />)}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
