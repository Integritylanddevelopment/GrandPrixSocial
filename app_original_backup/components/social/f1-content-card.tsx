"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Eye, Heart, MessageCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface F1ContentCardProps {
  content: {
    id: string
    title: string
    content: string
    category: string
    priority: string
    tags: string[]
    readTime: number
    engagement: {
      views: number
      likes: number
      shares: number
      comments: number
    }
    publishedAt: string
    mediaUrls?: string[]
  }
}

export function F1ContentCard({ content }: F1ContentCardProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      breaking: "bg-red-600",
      trending: "bg-orange-600",
      tech: "bg-blue-600",
      gossip: "bg-pink-600",
      transfers: "bg-green-600",
    }
    return colors[category] || "bg-gray-600"
  }

  const getPriorityIcon = (priority: string) => {
    if (priority === "breaking") return "🚨"
    if (priority === "trending") return "🔥"
    return ""
  }

  return (
    <Card className="bg-gray-900/90 border-gray-700 mb-4 hover:border-red-500/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${getCategoryColor(content.category)} text-white text-xs`}>
                {getPriorityIcon(content.priority)} {content.category.toUpperCase()}
              </Badge>
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <Clock className="h-3 w-3" />
                <span>{content.readTime} min read</span>
              </div>
            </div>
            <h3 className="font-bold text-white text-lg leading-tight mb-2">{content.title}</h3>
            <p className="text-sm text-gray-400">
              {formatDistanceToNow(new Date(content.publishedAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-gray-300 mb-4 leading-relaxed line-clamp-3">{content.content}</p>

        {content.mediaUrls && content.mediaUrls.length > 0 && (
          <div className="mb-4">
            <img
              src={content.mediaUrls[0] || "/placeholder.svg"}
              alt="F1 content"
              className="rounded-lg w-full h-48 object-cover"
            />
          </div>
        )}

        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {content.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-400">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-700">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{content.engagement.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{content.engagement.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{content.engagement.comments}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
            Read More
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
