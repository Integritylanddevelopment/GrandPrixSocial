"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Twitter, Facebook, Instagram, Music } from "lucide-react"

interface PlatformAccount {
  platform: string
  username: string
  isConnected: boolean
  followers: number
  lastPost: string | null
}

interface PlatformConnectorProps {
  accounts: PlatformAccount[]
  onConnect: (platform: string) => void
  onDisconnect: (platform: string) => void
}

export function PlatformConnector({ accounts, onConnect, onDisconnect }: PlatformConnectorProps) {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "twitter":
        return <Twitter className="w-5 h-5" />
      case "facebook":
        return <Facebook className="w-5 h-5" />
      case "instagram":
        return <Instagram className="w-5 h-5" />
      case "tiktok":
        return <Music className="w-5 h-5" />
      default:
        return null
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "twitter":
        return "text-blue-500"
      case "facebook":
        return "text-blue-600"
      case "instagram":
        return "text-pink-500"
      case "tiktok":
        return "text-black"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {accounts.map((account) => (
        <Card key={account.platform}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={getPlatformColor(account.platform)}>{getPlatformIcon(account.platform)}</div>
                <CardTitle className="text-lg capitalize">{account.platform}</CardTitle>
              </div>
              <Badge variant={account.isConnected ? "default" : "secondary"}>
                {account.isConnected ? "Connected" : "Not Connected"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {account.isConnected ? (
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">{account.username}</p>
                  <p className="text-muted-foreground">{account.followers.toLocaleString()} followers</p>
                </div>
                {account.lastPost && (
                  <p className="text-xs text-muted-foreground">
                    Last post: {new Date(account.lastPost).toLocaleDateString()}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-post enabled</span>
                  <Switch defaultChecked />
                </div>
                <Button variant="outline" size="sm" onClick={() => onDisconnect(account.platform)} className="w-full">
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={() => onConnect(account.platform)} className="w-full">
                Connect {account.platform}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
