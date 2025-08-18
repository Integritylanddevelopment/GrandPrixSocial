"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Bell, Shield, Palette, Save } from "lucide-react"

export default function ProfileSettingsPage() {
  const [settings, setSettings] = useState({
    displayName: "F1 Fan",
    email: "user@example.com",
    favoriteTeam: "ferrari",
    favoriteDriver: "leclerc",
    notifications: {
      raceUpdates: true,
      teamNews: true,
      socialActivity: false,
      marketing: false,
    },
    privacy: {
      profileVisible: true,
      showFavorites: true,
      allowMessages: true,
    },
    theme: "dark",
    language: "en",
  })

  const handleSave = () => {
    console.log("[v0] Settings saved:", settings)
    // TODO: Implement actual save functionality
  }

  const f1Teams = [
    { value: "ferrari", label: "Ferrari", color: "bg-red-600" },
    { value: "mercedes", label: "Mercedes", color: "bg-cyan-400" },
    { value: "redbull", label: "Red Bull Racing", color: "bg-blue-600" },
    { value: "mclaren", label: "McLaren", color: "bg-orange-500" },
    { value: "alpine", label: "Alpine", color: "bg-pink-500" },
    { value: "aston", label: "Aston Martin", color: "bg-green-600" },
  ]

  const drivers = [
    { value: "leclerc", label: "Charles Leclerc", team: "Ferrari" },
    { value: "sainz", label: "Carlos Sainz", team: "Ferrari" },
    { value: "hamilton", label: "Lewis Hamilton", team: "Mercedes" },
    { value: "russell", label: "George Russell", team: "Mercedes" },
    { value: "verstappen", label: "Max Verstappen", team: "Red Bull" },
    { value: "perez", label: "Sergio Pérez", team: "Red Bull" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400">Customize your F1 experience and account preferences</p>
        </div>

        <div className="grid gap-6">
          {/* Profile Information */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder.svg" alt="Profile" />
                  <AvatarFallback className="bg-red-600 text-white text-lg">U</AvatarFallback>
                </Avatar>
                <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 bg-transparent">
                  Change Avatar
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-white">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    value={settings.displayName}
                    onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* F1 Preferences */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Palette className="h-5 w-5" />
                F1 Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Favorite Team</Label>
                  <Select
                    value={settings.favoriteTeam}
                    onValueChange={(value) => setSettings({ ...settings, favoriteTeam: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {f1Teams.map((team) => (
                        <SelectItem key={team.value} value={team.value} className="text-white hover:bg-gray-700">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${team.color}`} />
                            {team.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Favorite Driver</Label>
                  <Select
                    value={settings.favoriteDriver}
                    onValueChange={(value) => setSettings({ ...settings, favoriteDriver: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {drivers.map((driver) => (
                        <SelectItem key={driver.value} value={driver.value} className="text-white hover:bg-gray-700">
                          <div className="flex flex-col">
                            <span>{driver.label}</span>
                            <span className="text-xs text-gray-400">{driver.team}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Race Updates</Label>
                    <p className="text-sm text-gray-400">Get notified about race results and live updates</p>
                  </div>
                  <Switch
                    checked={settings.notifications.raceUpdates}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, raceUpdates: checked },
                      })
                    }
                  />
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Team News</Label>
                    <p className="text-sm text-gray-400">Updates about your favorite team and driver</p>
                  </div>
                  <Switch
                    checked={settings.notifications.teamNews}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, teamNews: checked },
                      })
                    }
                  />
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Social Activity</Label>
                    <p className="text-sm text-gray-400">Likes, comments, and mentions on your posts</p>
                  </div>
                  <Switch
                    checked={settings.notifications.socialActivity}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, socialActivity: checked },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Public Profile</Label>
                    <p className="text-sm text-gray-400">Allow others to view your profile and activity</p>
                  </div>
                  <Switch
                    checked={settings.privacy.profileVisible}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, profileVisible: checked },
                      })
                    }
                  />
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Show Favorites</Label>
                    <p className="text-sm text-gray-400">Display your favorite team and driver on your profile</p>
                  </div>
                  <Switch
                    checked={settings.privacy.showFavorites}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, showFavorites: checked },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              className="bg-transparent border border-red-600 text-red-400 hover:bg-red-600/10 hover:border-red-500 hover:text-red-300"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
