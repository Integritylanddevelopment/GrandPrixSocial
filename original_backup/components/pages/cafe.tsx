"use client"

import { useEffect, useState } from "react"
import { CreatePost } from "@/components/social/create-post"
import { PostCard } from "@/components/social/post-card"
import { F1ContentCard } from "@/components/social/f1-content-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Flame, TrendingUp, Zap, MessageSquare } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function Cafe() {
  const [posts, setPosts] = useState([])
  const [f1Content, setF1Content] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("feed")
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  useEffect(() => {
    fetchPosts()
    fetchF1Content()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts")
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchF1Content = async () => {
    try {
      const response = await fetch("/api/f1-content?limit=10")
      if (response.ok) {
        const data = await response.json()
        setF1Content(data.content || [])
      }
    } catch (error) {
      console.error("Error fetching F1 content:", error)
    }
  }

  const handlePostCreated = () => {
    fetchPosts()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900/20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">The Cafe</h1>
          <p className="text-gray-400">Connect with fellow F1 fans and stay updated with the latest paddock buzz</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{posts.length}</div>
            <div className="text-sm text-gray-400">Community Posts</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">{f1Content.length}</div>
            <div className="text-sm text-gray-400">F1 Stories</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">Live</div>
            <div className="text-sm text-gray-400">Race Weekend</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">24/7</div>
            <div className="text-sm text-gray-400">Active Community</div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900/50 mb-6">
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Feed
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="breaking" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Breaking
            </TabsTrigger>
            <TabsTrigger value="gossip" className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Gossip
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <CreatePost user={user} onPostCreated={handlePostCreated} />

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading the latest from the paddock...</p>
                </div>
              ) : (
                <>
                  {/* Mix F1 content and user posts */}
                  {f1Content.slice(0, 2).map((content) => (
                    <F1ContentCard key={content.id} content={content} />
                  ))}
                  {posts.slice(0, 5).map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                  {f1Content.slice(2, 4).map((content) => (
                    <F1ContentCard key={content.id} content={content} />
                  ))}
                  {posts.slice(5).map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-4">
            {f1Content
              .filter((content) => content.category === "trending" || content.priority === "trending")
              .map((content) => (
                <F1ContentCard key={content.id} content={content} />
              ))}
          </TabsContent>

          <TabsContent value="breaking" className="space-y-4">
            {f1Content
              .filter((content) => content.category === "breaking" || content.priority === "breaking")
              .map((content) => (
                <F1ContentCard key={content.id} content={content} />
              ))}
          </TabsContent>

          <TabsContent value="gossip" className="space-y-4">
            {f1Content
              .filter((content) => content.category === "gossip")
              .map((content) => (
                <F1ContentCard key={content.id} content={content} />
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
