"use client"

import { useAuth } from "./auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import Link from "next/link"

interface AuthButtonsProps {
  themeColor?: "yellow" | "blue" | "purple" | "green" | "red"
  className?: string
}

export function AuthButtons({ themeColor = "purple", className = "" }: AuthButtonsProps) {
  const { user, loading, signOut } = useAuth()

  const getThemeClasses = (color: string) => {
    switch (color) {
      case "yellow":
        return "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
      case "blue":
        return "text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
      case "purple":
        return "text-purple-400 hover:text-purple-300 hover:bg-purple-400/10"
      case "green":
        return "text-green-400 hover:text-green-300 hover:bg-green-400/10"
      case "red":
        return "text-red-400 hover:text-red-300 hover:bg-red-400/10"
      default:
        return "text-purple-400 hover:text-purple-300 hover:bg-purple-400/10"
    }
  }

  if (loading) {
    return (
      <div className={`flex justify-center gap-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 w-16 bg-gray-700 rounded"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-8 w-16 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (user) {
    // User is signed in - show user info and sign out
    return (
      <div className={`flex justify-center items-center gap-4 ${className}`}>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className={`text-sm font-rajdhani font-medium ${getThemeClasses(themeColor).split(' ')[0]}`}>
            {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
          </span>
        </div>
        <Button
          onClick={signOut}
          variant="ghost"
          size="sm"
          className={`px-4 py-2 text-lg font-rajdhani font-medium transition-all duration-200 ${getThemeClasses(themeColor)}`}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    )
  }

  // User is not signed in - show sign up/sign in buttons
  return (
    <div className={`flex justify-center gap-6 ${className}`}>
      <Link
        href="/auth/signup"
        className={`px-4 py-2 text-lg font-rajdhani font-medium transition-all duration-200 ${getThemeClasses(themeColor)}`}
      >
        Sign Up
      </Link>
      <Link
        href="/auth/login"
        className={`px-4 py-2 text-lg font-rajdhani font-medium transition-all duration-200 ${getThemeClasses(themeColor)}`}
      >
        Sign In
      </Link>
    </div>
  )
}