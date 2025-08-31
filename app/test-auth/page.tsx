"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/auth-context"
import { createClient } from "@/lib/supabase/client"

export default function TestAuthPage() {
  const { user, loading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState("")
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("Signing up...")

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          username: `user_${Math.random().toString(36).substr(2, 9)}`
        }
      }
    })

    if (error) {
      setMessage(`Sign up failed: ${error.message}`)
    } else {
      setMessage("Sign up successful! Check your email for verification.")
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("Signing in...")

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setMessage(`Sign in failed: ${error.message}`)
    } else {
      setMessage("Sign in successful!")
    }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      setMessage(`Sign out failed: ${error.message}`)
    } else {
      setMessage("Signed out successfully!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-xl">Loading authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-red-600">
          🧪 Grand Prix Social Auth Test
        </h1>

        {user ? (
          <div className="bg-green-900 border border-green-600 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-400">✅ Authenticated</h2>
            <div className="space-y-2 text-sm">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Name:</strong> {user.user_metadata?.name || 'Not set'}</p>
              <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-600 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-400">Not Authenticated</h2>
            
            <div className="mb-4">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-red-400 hover:text-red-300 underline"
              >
                {isSignUp ? 'Switch to Sign In' : 'Switch to Sign Up'}
              </button>
            </div>

            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                    required={isSignUp}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                  required
                  minLength={6}
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
            </form>
          </div>
        )}

        {message && (
          <div className="mt-4 p-4 bg-blue-900 border border-blue-600 rounded text-blue-200">
            {message}
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-900 border border-gray-600 rounded">
          <h3 className="font-semibold mb-2 text-gray-400">🛠️ Setup Status</h3>
          <div className="text-sm space-y-1">
            <p>✅ Supabase client configured</p>
            <p>✅ Auth provider active</p>
            <p>⚠️ Database tables: Run create-tables.sql in Supabase dashboard</p>
            <p>🔗 <a href="https://supabase.com/dashboard/project/eeyboymoyvrgsbmnezag/sql/editor" 
                  target="_blank" rel="noopener" className="text-red-400 hover:underline">
              Supabase SQL Editor →
            </a></p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <a href="/" className="text-red-400 hover:text-red-300 underline">
            ← Back to App
          </a>
        </div>
      </div>
    </div>
  )
}