"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Eye, TrendingUp, Zap } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface NewsHeroProps {
  breakingNews: Array<{
    id: string
    title: string
    content: string
    category: string
    priority: string
    publishedAt: string
    engagement: {
      views: number
      likes: number
      shares: number
      comments: number
    }
    readTime: number
    mediaUrls?: string[]
  }>
}

export function NewsHero({ breakingNews }: NewsHeroProps) {
  const featuredStory = breakingNews[0]
  const sideStories = breakingNews.slice(1, 4)

  if (!featuredStory) {
    return (
      <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">No Breaking News</h2>
        <p className="text-gray-400">Check back soon for the latest F1 updates</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Featured Story */}
      <Card className="lg:col-span-2 bg-gradient-to-br from-red-600/10 to-orange-600/10 border-red-500/30 overflow-hidden">
        <CardContent className="p-0">
          {featuredStory.mediaUrls?.[0] && (
            <div className="relative h-64 overflow-hidden">
              <img
                src={featuredStory.mediaUrls[0] || "/placeholder.svg"}
                alt="Breaking news"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-red-600 text-white animate-pulse">
                  <Zap className="h-3 w-3 mr-1" />
                  BREAKING
                </Badge>
              </div>
            </div>
          )}
          <div className="p-6">
            <div className="flex items-center gap-4 mb-3">
              <Badge className="bg-red-600 text-white">
                <Zap className="h-3 w-3 mr-1" />
                BREAKING
              </Badge>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                <span>{formatDistanceToNow(new Date(featuredStory.publishedAt), { addSuffix: true })}</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3 leading-tight">{featuredStory.title}</h1>
            <p className="text-gray-300 mb-4 line-clamp-3">{featuredStory.content}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{featuredStory.engagement.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{featuredStory.readTime} min read</span>
                </div>
              </div>
              <Button className="bg-red-600 hover:bg-red-700">Read Full Story</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Side Stories */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-400" />
          More Breaking News
        </h3>
        {sideStories.map((story) => (
          <Card key={story.id} className="bg-gray-900/50 border-gray-700 hover:border-red-500/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs border-red-500/50 text-red-400">
                  {story.priority.toUpperCase()}
                </Badge>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(story.publishedAt), { addSuffix: true })}
                </span>
              </div>
              <h4 className="font-semibold text-white text-sm mb-2 line-clamp-2">{story.title}</h4>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{story.engagement.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{story.readTime}m</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
