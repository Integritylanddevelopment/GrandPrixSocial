"use client"

import { useState } from 'react'
import { Heart, MessageCircle, Share2, Search } from 'lucide-react'
import { FeedbackTracking, TrackingWrapper, TrackableLikeButton, TrackableCommentForm, TrackableShareButton, TrackableSearchInput } from '@/components/analytics/feedback-tracking'

export default function AnalyticsTestPage() {
  const [likes, setLikes] = useState(42)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState([
    "Max is dominating this season!",
    "Can't wait for the next race at Monza"
  ])

  const handleLike = (newLiked: boolean) => {
    setLiked(newLiked)
    setLikes(newLiked ? likes + 1 : likes - 1)
  }

  const handleComment = (comment: string) => {
    setComments([...comments, comment])
  }

  const handleSearch = (query: string, results: any[]) => {
    console.log(`Search for "${query}" returned ${results.length} results`)
  }

  return (
    <>
      <FeedbackTracking 
        contentId="test-article-123"
        contentType="article" 
        metadata={{ 
          title: "Analytics Test Article", 
          category: "test",
          tags: ["analytics", "testing", "f1"]
        }} 
      />
      
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-red-950 p-6">
        <TrackingWrapper className="max-w-4xl mx-auto">
          <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-8 border border-gray-700">
            <h1 className="text-3xl font-bold text-yellow-400 mb-6">Analytics Testing Page</h1>
            <p className="text-gray-300 mb-8">
              This page tests the user feedback collection system that will train your Qwen3 model.
              Every interaction you make here is tracked and can be used to improve AI content generation.
            </p>

            {/* Search Test */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">🔍 Search Tracking Test</h2>
              <TrackableSearchInput 
                onSearch={handleSearch}
                placeholder="Search for F1 content..."
                className="w-full max-w-md"
              />
            </div>

            {/* Sample Article */}
            <div className="bg-gray-800/50 rounded-lg p-6 mb-8" data-content-id="test-article-123">
              <h2 className="text-2xl font-bold text-white mb-4">Max Verstappen Wins Dutch Grand Prix</h2>
              <p className="text-gray-300 mb-4">
                Max Verstappen dominated the Dutch Grand Prix from start to finish, securing his 10th victory of the season
                in front of his home crowd at Zandvoort. The Red Bull Racing driver controlled the race from pole position
                and never looked in danger of losing the lead.
              </p>
              <p className="text-gray-300 mb-6">
                Lando Norris finished second for McLaren, with Charles Leclerc completing the podium for Ferrari.
                The result extends Verstappen's championship lead to 120 points with just 8 races remaining.
              </p>

              {/* Interaction Buttons */}
              <div className="flex items-center gap-4 mb-6">
                <TrackableLikeButton
                  contentId="test-article-123"
                  contentType="article"
                  initialLiked={liked}
                  onLikeChange={handleLike}
                >
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
                    liked 
                      ? 'bg-red-600 border-red-600 text-white' 
                      : 'border-gray-600 text-gray-300 hover:border-red-600 hover:text-red-400'
                  }`}>
                    <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                    <span>{likes}</span>
                  </div>
                </TrackableLikeButton>

                <button 
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-600 text-gray-300 hover:border-blue-600 hover:text-blue-400 transition-colors"
                  data-track="comment-toggle"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{comments.length}</span>
                </button>

                <TrackableShareButton
                  contentId="test-article-123"
                  platform="twitter"
                  shareUrl={typeof window !== 'undefined' ? window.location.href : ''}
                >
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-600 text-gray-300 hover:border-green-600 hover:text-green-400 transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span>Share</span>
                  </div>
                </TrackableShareButton>
              </div>

              {/* Comments Section */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Comments</h3>
                
                {/* Existing Comments */}
                <div className="space-y-3 mb-6">
                  {comments.map((comment, index) => (
                    <div key={index} className="bg-gray-700/30 rounded-lg p-3">
                      <p className="text-gray-300">{comment}</p>
                    </div>
                  ))}
                </div>

                {/* Comment Form */}
                <TrackableCommentForm
                  contentId="test-article-123"
                  onComment={handleComment}
                  placeholder="Share your thoughts on this race..."
                />
              </div>
            </div>

            {/* Analytics Status */}
            <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-400 mb-4">📊 What's Being Tracked</h2>
              <ul className="space-y-2 text-gray-300">
                <li>• Page views and time spent reading</li>
                <li>• Click tracking on buttons and links</li>
                <li>• Like/unlike interactions with engagement scoring</li>
                <li>• Comment length and frequency</li>
                <li>• Share behavior across platforms</li>
                <li>• Search queries and result interactions</li>
                <li>• Scroll depth and reading patterns</li>
                <li>• Device type and user preferences</li>
              </ul>
              
              <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                <p className="text-yellow-400 font-semibold mb-2">🧠 Training Data Generation</p>
                <p className="text-gray-300 text-sm">
                  After collecting enough user feedback, visit{' '}
                  <code className="bg-gray-800 px-2 py-1 rounded text-yellow-400">
                    /api/analytics/generate-training-data
                  </code>{' '}
                  to create training data for your Qwen3 model.
                </p>
              </div>
            </div>
          </div>
        </TrackingWrapper>
      </div>
    </>
  )
}