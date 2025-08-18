"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Zap, TrendingUp, Clock } from "lucide-react"

interface AIProcessingStatsProps {
  stats: {
    totalArticles: number
    lastProcessed: string
    processingEngine: string
    contentMix: string
  }
  categories: Array<{
    category: string
    count: number
    totalViews: number
    totalEngagement: number
  }>
}

export function AIProcessingStats({ stats, categories }: AIProcessingStatsProps) {
  const totalViews = categories.reduce((sum, cat) => sum + (cat.totalViews || 0), 0)
  const totalEngagement = categories.reduce((sum, cat) => sum + (cat.totalEngagement || 0), 0)

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      breaking: "bg-red-500",
      trending: "bg-orange-500",
      tech: "bg-blue-500",
      gossip: "bg-pink-500",
      transfers: "bg-green-500",
    }
    return colors[category] || "bg-gray-500"
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* AI Processing Overview */}
      <Card className="bg-gradient-to-br from-purple-600/10 to-blue-600/10 border-purple-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-sm">
            <Brain className="h-4 w-4 text-purple-400" />
            AI Processing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-white">{stats.totalArticles}</div>
            <div className="text-xs text-gray-400">Articles Processed</div>
            <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-400">
              {stats.processingEngine}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Content Mix */}
      <Card className="bg-gradient-to-br from-green-600/10 to-teal-600/10 border-green-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-green-400" />
            Content Mix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-lg font-bold text-white">{stats.contentMix}</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">News</span>
                <span className="text-green-400">70%</span>
              </div>
              <Progress value={70} className="h-1" />
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Gossip</span>
                <span className="text-pink-400">30%</span>
              </div>
              <Progress value={30} className="h-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Stats */}
      <Card className="bg-gradient-to-br from-orange-600/10 to-red-600/10 border-orange-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-orange-400" />
            Engagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-white">{totalViews.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Total Views</div>
            <div className="text-sm text-orange-400">{totalEngagement.toLocaleString()} interactions</div>
          </div>
        </CardContent>
      </Card>

      {/* Last Update */}
      <Card className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border-blue-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-blue-400" />
            Last Update
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm font-bold text-white">Just Now</div>
            <div className="text-xs text-gray-400">AI Processing Active</div>
            <Badge className="bg-green-600 text-white text-xs animate-pulse">Live</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
