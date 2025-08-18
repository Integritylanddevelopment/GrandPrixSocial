"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Settings, Trophy, Users, Edit3, Save } from "lucide-react"

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    username: "F1Fan2024",
    email: "user@example.com",
    favoriteTeam: "ferrari",
    favoriteDriver: "leclerc",
    bio: "Passionate F1 fan since 2010. Ferrari forever!",
    location: "Monaco",
  })

  const teams = [
    { value: "ferrari", label: "Ferrari", color: "text-red-500" },
    { value: "mercedes", label: "Mercedes", color: "text-cyan-400" },
    { value: "redbull", label: "Red Bull Racing", color: "text-blue-600" },
    { value: "mclaren", label: "McLaren", color: "text-orange-500" },
    { value: "alpine", label: "Alpine", color: "text-pink-500" },
  ]

  const drivers = [
    { value: "leclerc", label: "Charles Leclerc" },
    { value: "sainz", label: "Carlos Sainz Jr." },
    { value: "hamilton", label: "Lewis Hamilton" },
    { value: "russell", label: "George Russell" },
    { value: "verstappen", label: "Max Verstappen" },
  ]

  const handleSave = () => {
    setIsEditing(false)
    console.log("[v0] Profile saved:", profile)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900/20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
          <p className="text-gray-400">Manage your F1 fan profile and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900/50">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Profile Information</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                  className="border-gray-600 text-gray-400 hover:text-white"
                >
                  {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
                  {isEditing ? "Save" : "Edit"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-red-600 text-white text-xl">
                      {profile.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">{profile.username}</h3>
                    <div className="flex gap-2">
                      <Badge className="bg-red-600 text-white">
                        {teams.find((t) => t.value === profile.favoriteTeam)?.label}
                      </Badge>
                      <Badge variant="outline" className="border-gray-600 text-gray-400">
                        {drivers.find((d) => d.value === profile.favoriteDriver)?.label}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-300">
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      disabled={!isEditing}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      disabled={!isEditing}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="team" className="text-gray-300">
                      Favorite Team
                    </Label>
                    <Select
                      value={profile.favoriteTeam}
                      onValueChange={(value) => setProfile({ ...profile, favoriteTeam: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {teams.map((team) => (
                          <SelectItem key={team.value} value={team.value} className="text-white">
                            <span className={team.color}>{team.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="driver" className="text-gray-300">
                      Favorite Driver
                    </Label>
                    <Select
                      value={profile.favoriteDriver}
                      onValueChange={(value) => setProfile({ ...profile, favoriteDriver: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {drivers.map((driver) => (
                          <SelectItem key={driver.value} value={driver.value} className="text-white">
                            {driver.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-gray-300">
                    Bio
                  </Label>
                  <Input
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    disabled={!isEditing}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6 text-center">
                  <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">12</div>
                  <div className="text-sm text-gray-400">Achievements</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">3</div>
                  <div className="text-sm text-gray-400">Teams Joined</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6 text-center">
                  <User className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">1,250</div>
                  <div className="text-sm text-gray-400">Community Points</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-gray-400">
                  <p>Additional settings and preferences will be available here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
