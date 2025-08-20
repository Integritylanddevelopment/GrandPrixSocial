"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlatformConnector } from "./platform-connector"
import { MultiPlatformComposer } from "./multi-platform-composer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, TrendingUp, Share } from "lucide-react"

export function SocialDashboard() {
  const [accounts, setAccounts] = useState([
    {
      platform: "twitter",
      username: "@f1_fan_2024",
      isConnected: true,
      followers: 1250,
      lastPost: "2024-01-15T10:30:00Z",
    },
    {
      platform: "facebook",
      username: "F1 Racing Fan",
      isConnected: true,
      followers: 890,
      lastPost: "2024-01-14T15:45:00Z",
    },
    {
      platform: "instagram",
      username: "@grandprix_lover",
      isConnected: false,
      followers: 0,
      lastPost: null,
    },
    {
      platform: "tiktok",
      username: "@f1_highlights",
      isConnected: false,
      followers: 0,
      lastPost: null,
    },
  ])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Try to fetch real accounts, but use defaults if it fails
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/social-media/accounts")
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setAccounts(data)
        }
      }
    } catch (error) {
      console.error("Failed to fetch accounts, using defaults:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async (platform: string) => {
    // In production, this would redirect to OAuth flow
    console.log(`[v0] Connecting to ${platform}`)
    // Mock connection for demo
    setAccounts((prev) =>
      prev.map((account) =>
        account.platform === platform ? { ...account, isConnected: true, username: `@demo_${platform}` } : account,
      ),
    )
  }

  const handleDisconnect = async (platform: string) => {
    console.log(`[v0] Disconnecting from ${platform}`)
    setAccounts((prev) =>
      prev.map((account) =>
        account.platform === platform ? { ...account, isConnected: false, username: "", followers: 0 } : account,
      ),
    )
  }

  const handlePost = async (content: string, platforms: string[], images: string[]) => {
    try {
      const response = await fetch("/api/social-media/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, platforms, images }),
      })

      const result = await response.json()
      console.log("[v0] Post results:", result)

      // Show success/error messages based on results
      result.results?.forEach((platformResult: any) => {
        if (platformResult.success) {
          console.log(`[v0] Successfully posted to ${platformResult.platform}`)
        } else {
          console.error(`[v0] Failed to post to ${platformResult.platform}:`, platformResult.error)
        }
      })
    } catch (error) {
      console.error("[v0] Failed to post:", error)
    }
  }

  const connectedPlatforms = accounts.filter((account) => account.isConnected).map((account) => account.platform)
  const totalFollowers = accounts.reduce((sum, account) => sum + (account.followers || 0), 0)

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading social media dashboard...</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Share className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Connected</p>
                <p className="text-2xl font-bold">{connectedPlatforms.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Followers</p>
                <p className="text-2xl font-bold">{totalFollowers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Engagement</p>
                <p className="text-2xl font-bold">94.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Posts Today</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="compose" className="space-y-4">
        <TabsList>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <MultiPlatformComposer connectedPlatforms={connectedPlatforms} onPost={handlePost} />
        </TabsContent>

        <TabsContent value="accounts">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Connected Accounts</h3>
              <Badge variant="secondary">{connectedPlatforms.length} of 4 connected</Badge>
            </div>
            <PlatformConnector accounts={accounts} onConnect={handleConnect} onDisconnect={handleDisconnect} />
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
