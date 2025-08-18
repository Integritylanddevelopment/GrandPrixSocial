import { SocialDashboard } from "@/components/social-media/social-dashboard"

export default function SocialMediaPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Social Media Management</h1>
          <p className="text-muted-foreground">Connect your accounts and post F1 content across all platforms</p>
        </div>

        <SocialDashboard />
      </div>
    </div>
  )
}
