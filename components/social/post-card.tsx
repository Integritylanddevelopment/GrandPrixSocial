"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface PostCardProps {
  post: {
    id: string
    content: string
    images?: string[]
    likes: number
    comments: number
    createdAt: string
    author?: {
      id: string
      username: string
      name: string
      avatar?: string
      favoriteTeam?: string
    }
    team?: {
      id: string
      name: string
      color: string
      logo?: string
    }
  }
}

export function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes || 0)

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  const getTeamColor = (teamName?: string) => {
    const teamColors: Record<string, string> = {
      "Red Bull Racing": "#1E3A8A",
      Ferrari: "#DC2626",
      Mercedes: "#10B981",
      McLaren: "#F97316",
      "Aston Martin": "#059669",
      Alpine: "#3B82F6",
      Williams: "#6366F1",
      AlphaTauri: "#8B5CF6",
      "Alfa Romeo": "#EF4444",
      Haas: "#6B7280",
    }
    return teamColors[teamName || ""] || "#6B7280"
  }

  const formatPostDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Recently"
      }
      return formatDistanceToNow(date, { addSuffix: true })
    } catch {
      return "Recently"
    }
  }

  const author = post.author || { username: "unknown", name: "Unknown User" }
  const authorInitial = author.username?.[0]?.toUpperCase() || "U"

  return (
    <Card className="bg-gray-900/90 border-gray-700 mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={author.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-red-600 text-white">{authorInitial}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-white">{author.name}</h4>
                {post.team && (
                  <Badge
                    className="text-xs"
                    style={{
                      backgroundColor: getTeamColor(author.favoriteTeam),
                      color: "white",
                    }}
                  >
                    {post.team.name}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-400">@{author.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">{formatPostDate(post.createdAt)}</span>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-white mb-4 leading-relaxed">{post.content}</p>

        {post.images && post.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {post.images.map((image, index) => (
              <img
                key={index}
                src={image || "/placeholder.svg"}
                alt={`Post image ${index + 1}`}
                className="rounded-lg w-full h-48 object-cover"
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-700">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 ${
                liked ? "text-red-500 hover:text-red-400" : "text-gray-400 hover:text-red-400"
              }`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              <span>{likeCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-400 hover:text-blue-400">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments || 0}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-400 hover:text-green-400">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
