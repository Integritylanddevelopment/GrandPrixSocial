"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageIcon, Send } from "lucide-react"

interface CreatePostProps {
  user?: {
    id: string
    username: string
    name: string
    avatar?: string
  }
  onPostCreated?: () => void
}

export function CreatePost({ user, onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !user) return

    setLoading(true)
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          authorId: user.id,
        }),
      })

      if (response.ok) {
        setContent("")
        onPostCreated?.()
      }
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Card className="bg-gray-900/90 border-gray-700 mb-6">
        <CardContent className="pt-6">
          <p className="text-center text-gray-400">
            <Button variant="link" className="text-red-400 hover:text-red-300">
              Sign in
            </Button>{" "}
            to share your F1 thoughts with the community
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/90 border-gray-700 mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg">Share your F1 thoughts</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-red-600 text-white">{user.username[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's happening in the F1 world?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 resize-none"
                rows={3}
              />
              <div className="flex items-center justify-between mt-3">
                <Button type="button" variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
                <Button
                  type="submit"
                  disabled={!content.trim() || loading}
                  className="bg-transparent border border-red-600 text-red-400 hover:bg-red-600/10 hover:border-red-500 hover:text-red-300"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
