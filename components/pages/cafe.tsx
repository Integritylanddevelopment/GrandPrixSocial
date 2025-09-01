"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Users, Trophy, Flame, Heart, MessageCircle, Share2, User, Mail, Send } from "lucide-react"
import CafeIcon from "@/components/icons/cafe-icon"
import { AuthButtons } from "@/components/auth/auth-buttons"
import { useAuth } from "@/components/auth/auth-context"
import { FeedbackTracking, TrackingWrapper, TrackableLikeButton, TrackableCommentForm } from "@/components/analytics/feedback-tracking"
import type { PostWithDetails, PostCommentWithAuthor } from "@/lib/schema"

// Sample data (static to prevent rerenders)
const SAMPLE_POSTS: PostWithDetails[] = [
  {
    id: 'sample-1',
    content: 'What an incredible race at Monza! Max Verstappen showing why he\'s the current champion. The wheel-to-wheel racing was absolutely spectacular!',
    images: null,
    likes: 42,
    comments: 8,
    createdAt: new Date().toISOString(),
    isLiked: false,
    author: {
      id: 'admin',
      username: 'max_champion',
      name: 'Alex Rodriguez',
      avatar: null,
      favoriteTeam: 'Red Bull Racing'
    },
    team: {
      id: 'redbull',
      name: 'Red Bull Racing',
      color: '#0600EF',
      logo: null
    }
  },
  {
    id: 'sample-2',
    content: 'Ferrari\'s strategy today was questionable at best. Charles had the pace but the team let him down again. When will they learn? #TifosiFrustration',
    images: null,
    likes: 89,
    comments: 23,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    isLiked: false,
    author: {
      id: 'tifosi_fan',
      username: 'marco_rossi',
      name: 'Marco Rossi',
      avatar: null,
      favoriteTeam: 'Ferrari'
    },
    team: {
      id: 'ferrari',
      name: 'Ferrari',
      color: '#DC143C',
      logo: null
    }
  },
  {
    id: 'sample-3',
    content: 'George Russell drove brilliantly today! Mercedes is finally finding their form. That overtake on Sainz was pure class 👏',
    images: null,
    likes: 67,
    comments: 15,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    isLiked: false,
    author: {
      id: 'merc_fan',
      username: 'sarah_hamilton',
      name: 'Sarah Hamilton',
      avatar: null,
      favoriteTeam: 'Mercedes'
    },
    team: {
      id: 'mercedes',
      name: 'Mercedes',
      color: '#00D2BE',
      logo: null
    }
  },
  {
    id: 'sample-4',
    content: 'Lando P3! McLaren\'s upgrades are clearly working. The car looks so much better through the technical sections. Papaya power! 🧡',
    images: null,
    likes: 134,
    comments: 31,
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    isLiked: false,
    author: {
      id: 'mclaren_fan',
      username: 'james_norris',
      name: 'James Norris',
      avatar: null,
      favoriteTeam: 'McLaren'
    },
    team: {
      id: 'mclaren',
      name: 'McLaren',
      color: '#FF8700',
      logo: null
    }
  },
  {
    id: 'sample-5',
    content: 'Rain forecast for next weekend! Singapore GP could be absolutely wild. Who do you think performs best in wet conditions? 🌧️',
    images: null,
    likes: 92,
    comments: 18,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    isLiked: false,
    author: {
      id: 'weather_watcher',
      username: 'weather_watcher',
      name: 'Race Weather Expert',
      avatar: null,
      favoriteTeam: null
    },
    team: null
  }
]

export default function Cafe() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("feed")
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState<{[key: string]: string}>({})
  const [showComments, setShowComments] = useState<{[key: string]: boolean}>({})
  const [comments, setComments] = useState<{[key: string]: PostCommentWithAuthor[]}>({})
  const [showShareMenu, setShowShareMenu] = useState<{[key: string]: boolean}>({})

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
        // Use fallback sample data instead of showing error
        setPosts(SAMPLE_POSTS)
        setLoading(false)
        return
      }
      
      setPosts(Array.isArray(data) ? data : SAMPLE_POSTS)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      // Use fallback sample data instead of showing error
      setPosts(SAMPLE_POSTS)
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
      } else if (data.copyToClipboard) {
        // Copy to clipboard for platforms that don't support URL sharing
        await navigator.clipboard.writeText(data.text)
        alert(data.message)
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
    <>
      <FeedbackTracking 
        contentType="page" 
        metadata={{ 
          title: "F1 Cafe", 
          category: "community" 
        }} 
      />
      <TrackingWrapper className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-red-950">
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
              {activeTab === "feed" && (
                <>
                  {posts.length === 0 && !loading && (
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
                            <div className="relative" onMouseEnter={() => setShowShareMenu(prev => ({...prev, [post.id]: true}))} onMouseLeave={() => setShowShareMenu(prev => ({...prev, [post.id]: false}))}>
                              <button className="flex items-center gap-2 hover:text-yellow-400 transition-colors">
                                <Share2 className="h-4 w-4" />
                                Share
                              </button>
                              {showShareMenu[post.id] && (
                                <div className="absolute bottom-full left-0 mb-2 flex bg-gray-800 rounded-lg p-2 gap-2 whitespace-nowrap z-20 shadow-lg">
                                  <button 
                                    onClick={() => sharePost('facebook', post)}
                                    className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors min-w-[80px]"
                                  >
                                    Facebook
                                  </button>
                                  <button 
                                    onClick={() => sharePost('twitter', post)}
                                    className="px-3 py-2 bg-gray-900 text-white rounded text-sm hover:bg-gray-800 transition-colors min-w-[60px]"
                                  >
                                    X
                                  </button>
                                  <button 
                                    onClick={() => sharePost('instagram', post)}
                                    className="px-3 py-2 bg-pink-600 text-white rounded text-sm hover:bg-pink-700 transition-colors min-w-[80px]"
                                  >
                                    Instagram
                                  </button>
                                  <button 
                                    onClick={() => sharePost('tiktok', post)}
                                    className="px-3 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 transition-colors min-w-[70px]"
                                  >
                                    TikTok
                                  </button>
                                </div>
                              )}
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
                </>
              )}
              
              {activeTab === "following" && (
                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-8 text-center">
                  <Users className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-yellow-400 font-semibold mb-2">Following</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Follow other F1 fans to see their posts in a personalized feed!
                  </p>
                  <button className="px-6 py-2 bg-yellow-600 text-black rounded-lg font-medium hover:bg-yellow-500 transition-colors">
                    Discover F1 Fans
                  </button>
                </div>
              )}
              
              {activeTab === "messages" && (
                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-8 text-center">
                  <Mail className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-yellow-400 font-semibold mb-2">Messages</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Direct messages with fellow F1 enthusiasts. Start conversations about races, drivers, and teams!
                  </p>
                  <button className="px-6 py-2 bg-yellow-600 text-black rounded-lg font-medium hover:bg-yellow-500 transition-colors">
                    Start Conversation
                  </button>
                </div>
              )}
              
              {activeTab === "profile" && (
                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center text-2xl font-bold text-yellow-400">
                      {user?.user_metadata?.name?.[0] || user?.email?.[0] || '?'}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {user?.user_metadata?.name || user?.email || 'F1 Fan'}
                      </h3>
                      <p className="text-gray-400 text-sm">{user?.email}</p>
                      <p className="text-yellow-400 text-sm">Level 5 • 2,450 points</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400">127</div>
                      <div className="text-sm text-gray-400">Posts</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400">892</div>
                      <div className="text-sm text-gray-400">Followers</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400">456</div>
                      <div className="text-sm text-gray-400">Following</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Favorite Team</span>
                      <span className="text-yellow-400">Red Bull Racing</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Favorite Driver</span>
                      <span className="text-yellow-400">Max Verstappen</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Member Since</span>
                      <span className="text-gray-400">January 2024</span>
                    </div>
                  </div>
                  
                  <button className="w-full mt-6 px-6 py-3 bg-yellow-600 text-black rounded-lg font-medium hover:bg-yellow-500 transition-colors">
                    Edit Profile
                  </button>
                </div>
              )}
              
              {activeTab === "mypage" && (
                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                    <h3 className="text-xl font-semibold text-yellow-400">My F1 Page</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Recent Achievements</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                          <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-black" />
                          </div>
                          <div>
                            <div className="text-white font-medium">Race Predictor</div>
                            <div className="text-sm text-gray-400">Correctly predicted the last 5 race winners</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-white font-medium">Community Leader</div>
                            <div className="text-sm text-gray-400">Posted 100+ engaging discussions</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">F1 Stats</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <div className="text-2xl font-bold text-yellow-400">94%</div>
                          <div className="text-sm text-gray-400">Prediction Accuracy</div>
                        </div>
                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <div className="text-2xl font-bold text-yellow-400">23</div>
                          <div className="text-sm text-gray-400">Races Attended</div>
                        </div>
                      </div>
                    </div>
                    
                    <button className="w-full px-6 py-3 bg-yellow-600 text-black rounded-lg font-medium hover:bg-yellow-500 transition-colors">
                      Customize Page
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </TrackingWrapper>
    </>
  )
}