"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Users, Trophy, Flame, Heart, MessageCircle, Share2, User, Mail, Send } from "lucide-react"
import CafeIcon from "@/components/icons/cafe-icon"
import { AuthButtons } from "@/components/auth/auth-buttons"
import { useAuth } from "@/components/auth/auth-context"
import type { PostWithDetails, PostCommentWithAuthor } from "@/lib/schema"

export default function Cafe() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("feed")
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState<{[key: string]: string}>({})
  const [showComments, setShowComments] = useState<{[key: string]: boolean}>({})
  const [comments, setComments] = useState<{[key: string]: PostCommentWithAuthor[]}>({})

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      const data = await response.json()
      
      // Check if API returned an error
      if (!response.ok || data.success === false) {
        console.error('Posts API error:', data.error || 'Unknown error')
        setError(data.error || 'Failed to load posts from database')
        setPosts([])  // Empty array, no dummy data
        setLoading(false)
        return
      }
      
      setPosts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      setError('Network error: Unable to connect to database')
      setPosts([])  // Empty array, no dummy data
    } finally {
      setLoading(false)
    }
  }

  const toggleLike = async (postId: string) => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST'
      })
      const result = await response.json()
      
      // Update the post in state
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isLiked: result.liked,
            likes: result.liked ? post.likes + 1 : post.likes - 1
          }
        }
        return post
      }))
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }

  const loadComments = async (postId: string) => {
    if (comments[postId]) {
      setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }))
      return
    }
    
    try {
      const response = await fetch(`/api/posts/${postId}/comments`)
      const data = await response.json()
      setComments(prev => ({ ...prev, [postId]: data }))
      setShowComments(prev => ({ ...prev, [postId]: true }))
    } catch (error) {
      console.error('Failed to load comments:', error)
    }
  }

  const submitComment = async (postId: string) => {
    if (!user || !newComment[postId]?.trim()) return
    
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment[postId] })
      })
      const comment = await response.json()
      
      // Add comment to state
      setComments(prev => ({
        ...prev,
        [postId]: [comment, ...(prev[postId] || [])]
      }))
      
      // Update comment count
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return { ...post, comments: post.comments + 1 }
        }
        return post
      }))
      
      // Clear input
      setNewComment(prev => ({ ...prev, [postId]: '' }))
    } catch (error) {
      console.error('Failed to submit comment:', error)
    }
  }

  const sharePost = async (platform: string, post: PostWithDetails) => {
    try {
      const response = await fetch('/api/social-sharing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          postId: post.id,
          content: post.content,
          author: post.author.username,
          url: `${window.location.origin}/cafe#post-${post.id}`
        })
      })
      const data = await response.json()
      
      if (data.shareUrl) {
        window.open(data.shareUrl, '_blank', 'width=600,height=400')
      } else {
        // Copy to clipboard for platforms that don't support URL sharing
        navigator.clipboard.writeText(data.clipboardText)
        alert(`Post copied to clipboard! Paste it in your ${platform} post.`)
      }
    } catch (error) {
      console.error('Failed to share post:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-red-950 flex items-center justify-center">
        <div className="text-yellow-400 text-xl font-rajdhani">Loading F1 Café...</div>
      </div>
    )
  }

  const tabs = [
    { id: "feed", label: "Feed", icon: MessageSquare },
    { id: "following", label: "Following", icon: Users },
    { id: "messages", label: "Messages", icon: Mail },
    { id: "profile", label: "Profile", icon: User },
    { id: "mypage", label: "My Page", icon: Trophy },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-red-950">
      <div className="py-6">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <CafeIcon className="text-yellow-400" width={48} height={48} />
            <h1 className="text-4xl font-bold font-orbitron text-yellow-400" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))' }}>The F1 Café</h1>
            <CafeIcon className="text-yellow-400" width={48} height={48} />
          </div>
          <p className="text-gray-400">Connect with fellow F1 fans and share your passion for racing</p>
        </div>

        {/* Auth Buttons */}
        <div className="mb-6">
          <AuthButtons themeColor="yellow" />
        </div>

        <div className="w-full">
          <div className="flex rounded-lg p-1 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200 font-rajdhani font-medium ${
                    activeTab === tab.id 
                      ? "glass-yellow text-yellow-300 shadow-lg scale-105 border border-yellow-400/50" 
                      : "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
                  }`}
                >
                  <Icon className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-400">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {activeTab && (
            <div className="space-y-4 px-4">
              {error && (
                <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 text-center">
                  <h3 className="text-red-300 font-semibold mb-2">Database Configuration Required</h3>
                  <p className="text-red-200 text-sm mb-2">{error}</p>
                  <p className="text-red-300 text-xs">
                    Please check Supabase API keys in .env.local or contact an administrator.
                  </p>
                </div>
              )}
              
              {!error && posts.length === 0 && !loading && (
                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-8 text-center">
                  <h3 className="text-gray-300 font-semibold mb-2">No Posts Yet</h3>
                  <p className="text-gray-400 text-sm">
                    Be the first to share your F1 thoughts with the community!
                  </p>
                </div>
              )}
              
              {posts.map((post) => (
                <div key={post.id} id={`post-${post.id}`} className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg">
                      {post.author.avatar || post.author.name?.[0] || post.author.username?.[0] || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-white">{post.author.name || post.author.username}</span>
                        <span className="text-gray-500 text-sm">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-4">{post.content}</p>
                      <div className="flex items-center gap-6 text-gray-400">
                        <button 
                          onClick={() => toggleLike(post.id)}
                          disabled={!user}
                          className={`flex items-center gap-2 transition-colors ${
                            post.isLiked ? 'text-red-400 hover:text-red-300' : 'hover:text-yellow-400'
                          } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                          {post.likes}
                        </button>
                        <button 
                          onClick={() => loadComments(post.id)}
                          className="flex items-center gap-2 hover:text-yellow-400 transition-colors"
                        >
                          <MessageCircle className="h-4 w-4" />
                          {post.comments}
                        </button>
                        <div className="relative group">
                          <button className="flex items-center gap-2 hover:text-yellow-400 transition-colors">
                            <Share2 className="h-4 w-4" />
                            Share
                          </button>
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:flex bg-gray-800 rounded-lg p-2 gap-2 whitespace-nowrap z-10">
                            <button 
                              onClick={() => sharePost('facebook', post)}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                            >
                              Facebook
                            </button>
                            <button 
                              onClick={() => sharePost('twitter', post)}
                              className="px-2 py-1 bg-gray-900 text-white rounded text-xs hover:bg-gray-800"
                            >
                              X
                            </button>
                            <button 
                              onClick={() => sharePost('instagram', post)}
                              className="px-2 py-1 bg-pink-600 text-white rounded text-xs hover:bg-pink-700"
                            >
                              Instagram
                            </button>
                            <button 
                              onClick={() => sharePost('tiktok', post)}
                              className="px-2 py-1 bg-gray-900 text-white rounded text-xs hover:bg-gray-800"
                            >
                              TikTok
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Comments Section */}
                      {showComments[post.id] && (
                        <div className="mt-4 space-y-3">
                          {/* Add Comment */}
                          {user && (
                            <div className="flex gap-3">
                              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm">
                                {user.user_metadata?.name?.[0] || user.email?.[0] || '?'}
                              </div>
                              <div className="flex-1 flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Add a comment..."
                                  value={newComment[post.id] || ''}
                                  onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                                  onKeyPress={(e) => e.key === 'Enter' && submitComment(post.id)}
                                  className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-yellow-400 focus:outline-none"
                                />
                                <button
                                  onClick={() => submitComment(post.id)}
                                  disabled={!newComment[post.id]?.trim()}
                                  className="px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Send className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {/* Comments List */}
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {comments[post.id]?.map((comment) => (
                              <div key={comment.id} className="flex gap-3">
                                <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs">
                                  {comment.author?.name?.[0] || comment.author?.username?.[0] || '?'}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-white">
                                      {comment.author?.name || comment.author?.username}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-300">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}