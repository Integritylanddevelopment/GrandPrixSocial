"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Twitter, Facebook, Instagram, Music, Send, ImageIcon, Calendar } from "lucide-react"

interface MultiPlatformComposerProps {
  connectedPlatforms: string[]
  onPost: (content: string, platforms: string[], images: string[]) => void
}

export function MultiPlatformComposer({ connectedPlatforms, onPost }: MultiPlatformComposerProps) {
  const [content, setContent] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const [isPosting, setIsPosting] = useState(false)

  const platforms = [
    { id: "twitter", name: "Twitter", icon: Twitter, color: "text-blue-500", limit: 280 },
    { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-600", limit: 63206 },
    { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-500", limit: 2200 },
    { id: "tiktok", name: "TikTok", icon: Music, color: "text-black", limit: 150 },
  ]

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((p) => p !== platformId) : [...prev, platformId],
    )
  }

  const handlePost = async () => {
    if (!content.trim() || selectedPlatforms.length === 0) return

    setIsPosting(true)
    try {
      await onPost(content, selectedPlatforms, images)
      setContent("")
      setSelectedPlatforms([])
      setImages([])
    } finally {
      setIsPosting(false)
    }
  }

  const getCharacterLimit = () => {
    if (selectedPlatforms.length === 0) return null
    return Math.min(...selectedPlatforms.map((p) => platforms.find((platform) => platform.id === p)?.limit || 280))
  }

  const characterLimit = getCharacterLimit()
  const remainingChars = characterLimit ? characterLimit - content.length : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Post to Multiple Platforms
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <label className="text-sm font-medium">Select Platforms:</label>
          <div className="grid grid-cols-2 gap-3">
            {platforms.map((platform) => {
              const isConnected = connectedPlatforms.includes(platform.id)
              const isSelected = selectedPlatforms.includes(platform.id)

              return (
                <div key={platform.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={platform.id}
                    checked={isSelected}
                    onCheckedChange={() => handlePlatformToggle(platform.id)}
                    disabled={!isConnected}
                  />
                  <label
                    htmlFor={platform.id}
                    className={`flex items-center gap-2 text-sm ${!isConnected ? "opacity-50" : ""}`}
                  >
                    <platform.icon className={`w-4 h-4 ${platform.color}`} />
                    {platform.name}
                    {!isConnected && (
                      <Badge variant="secondary" className="text-xs">
                        Not Connected
                      </Badge>
                    )}
                  </label>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Content:</label>
            {remainingChars !== null && (
              <span className={`text-xs ${remainingChars < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                {remainingChars} characters remaining
              </span>
            )}
          </div>
          <Textarea
            placeholder="What's happening in the F1 world? Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ImageIcon className="w-4 h-4 mr-2" />
            Add Images
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </Button>
        </div>

        <Button
          onClick={handlePost}
          disabled={
            !content.trim() ||
            selectedPlatforms.length === 0 ||
            isPosting ||
            (remainingChars !== null && remainingChars < 0)
          }
          className="w-full"
        >
          {isPosting
            ? "Posting..."
            : `Post to ${selectedPlatforms.length} Platform${selectedPlatforms.length !== 1 ? "s" : ""}`}
        </Button>
      </CardContent>
    </Card>
  )
}
