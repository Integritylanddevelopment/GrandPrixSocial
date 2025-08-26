"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"

interface ArticleDetailProps {
  article: {
    id: string
    title: string
    content: string
    author: string
    publishedAt: string
    tags: string[]
    readTime: number
    imageUrl?: string
    engagement: {
      views: number
      likes: number
      shares: number
      comments: number
    }
  }
  onClose: () => void
}

export default function ArticleDetail({ article, onClose }: ArticleDetailProps) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(article.engagement.likes)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [realViews, setRealViews] = useState(0)

  const handleLike = () => {
    setLiked(!liked)
    setLikes(prev => liked ? prev - 1 : prev + 1)
  }

  const handleShare = (platform: string) => {
    const url = `${window.location.origin}/paddock-talk`
    const text = `${article.title} - Check out this F1 news on GrandPrixSocial!`
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      instagram: '', // Will be handled specially
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      tiktok: '' // Will be handled specially
    }
    
    if (platform === 'instagram') {
      // Copy text for Instagram - they'll paste it in their story/post
      navigator.clipboard.writeText(`${text}\n\n${url}`)
      alert(`Text copied! Open Instagram and paste into your story or post. 📸`)
    } else if (platform === 'tiktok') {
      // Copy text for TikTok - they'll paste it in their video description
      navigator.clipboard.writeText(`${text}\n\n${url}`)
      alert(`Text copied! Open TikTok and paste into your video description. 🎥`)
    } else {
      // Direct sharing for Facebook and Twitter
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400')
    }
    
    setShowShareMenu(false)
  }

  const formatPublishedDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return "Recently"
    }
  }

  // Load comments and track view on component mount
  useEffect(() => {
    loadComments()
    trackArticleView()
  }, [])

  const trackArticleView = async () => {
    try {
      const response = await fetch(`/api/articles/${article.id}/view`, {
        method: 'POST'
      })
      if (response.ok) {
        const data = await response.json()
        setRealViews(data.views || 0)
      }
    } catch (error) {
      console.error('Failed to track view:', error)
    }
  }

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/comments/${article.id}`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Failed to load comments:', error)
    }
  }

  const handleComment = async () => {
    if (!newComment.trim()) return

    const comment = {
      id: Date.now().toString(),
      content: newComment,
      author: "Anonymous User", // TODO: Get from auth system
      createdAt: new Date().toISOString(),
      likes: 0
    }

    try {
      const response = await fetch(`/api/comments/${article.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment)
      })

      if (response.ok) {
        setComments(prev => [comment, ...prev])
        setNewComment("")
      }
    } catch (error) {
      console.error('Failed to post comment:', error)
      // Add comment locally even if API fails
      setComments(prev => [comment, ...prev])
      setNewComment("")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 border border-gray-700/50 rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 border-b border-gray-700/50 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-rajdhani">
              F1 News
            </span>
            <span className="text-gray-400 text-sm font-rajdhani">
              {article.readTime} min read
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Article Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-4 font-orbitron">
              {article.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
              <span className="font-rajdhani">By {article.author}</span>
              <span className="font-rajdhani">{formatPublishedDate(article.publishedAt)}</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags.map((tag) => (
                <span 
                  key={tag}
                  className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-sm font-rajdhani"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Article Image */}
          {article.imageUrl && (
            <div className="mb-6">
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-invert max-w-none mb-8">
            <div className="text-gray-300 leading-relaxed font-rajdhani text-lg whitespace-pre-line">
              {article.content}
            </div>
          </div>

          {/* Engagement Actions */}
          <div className="border-t border-gray-700/50 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-6 text-gray-400">
                <span className="flex items-center gap-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                  {realViews.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                  </svg>
                  {comments.length.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Like Button */}
              <button 
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-rajdhani ${
                  liked 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                    : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-red-500/50 hover:text-red-400'
                }`}
              >
                <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {likes.toLocaleString()}
              </button>

              {/* Share Button */}
              <div className="relative">
                <button 
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg hover:border-blue-500/50 hover:text-blue-400 transition-all font-rajdhani"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share
                </button>

                {showShareMenu && (
                  <div className="absolute top-full mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10 min-w-48">
                    <button 
                      onClick={() => handleShare('facebook')}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-800 hover:text-blue-600 font-rajdhani transition-colors"
                    >
                      Share on Facebook
                    </button>
                    <button 
                      onClick={() => handleShare('instagram')}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-800 hover:text-pink-400 font-rajdhani transition-colors"
                    >
                      Share on Instagram
                    </button>
                    <button 
                      onClick={() => handleShare('twitter')}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-800 hover:text-blue-400 font-rajdhani transition-colors"
                    >
                      Share on Twitter
                    </button>
                    <button 
                      onClick={() => handleShare('tiktok')}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-800 hover:text-purple-400 font-rajdhani transition-colors"
                    >
                      Share on TikTok
                    </button>
                  </div>
                )}
              </div>

              {/* Comment Button */}
              <button 
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg hover:border-green-500/50 hover:text-green-400 transition-all font-rajdhani"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Comment ({comments.length})
              </button>
            </div>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="border-t border-gray-700/50 pt-6 mt-6">
              <h3 className="text-xl font-bold text-white mb-4 font-orbitron">Comments</h3>
              
              {/* Add Comment */}
              <div className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts on this F1 article..."
                  className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none resize-none font-rajdhani"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleComment}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-rajdhani"
                  >
                    Post Comment
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="font-rajdhani">No comments yet. Be the first to share your thoughts!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold font-rajdhani">
                          {comment.author.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-white font-rajdhani">{comment.author}</div>
                          <div className="text-xs text-gray-400 font-rajdhani">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-300 font-rajdhani leading-relaxed">
                        {comment.content}
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <button className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors font-rajdhani">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {comment.likes || 0}
                        </button>
                        <button className="text-gray-400 hover:text-blue-400 transition-colors font-rajdhani">
                          Reply
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}