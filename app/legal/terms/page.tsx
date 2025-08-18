import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, Shield, AlertTriangle, Gavel, Trophy } from "lucide-react"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
            <FileText className="h-8 w-8 text-red-500" />
            Terms of Service
          </h1>
          <p className="text-gray-400 text-lg">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-blue-400" />
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                Welcome to Grand Prix Social! By accessing or using our platform, you agree to be bound by these Terms
                of Service and our Privacy Policy.
              </p>
              <p>
                Grand Prix Social is a community platform for Formula 1 fans to connect, share content, participate in
                fantasy leagues, and engage with F1-related activities.
              </p>
              <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
                <p className="text-red-300">
                  <strong>Important:</strong> If you do not agree to these terms, please do not use our platform.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Platform Features & Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-white">F1 Café (Social Features):</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Share posts, comments, and engage with the F1 community</li>
                  <li>Follow your favorite teams and drivers</li>
                  <li>Participate in discussions about races, news, and gossip</li>
                </ul>

                <h4 className="font-semibold text-white">Fantasy Leagues:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Create and join fantasy F1 leagues with other users</li>
                  <li>Select drivers and teams within budget constraints</li>
                  <li>Compete for points based on real race performance</li>
                </ul>

                <h4 className="font-semibold text-white">Teams & Tournaments:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Join or create teams with other F1 fans</li>
                  <li>Participate in challenges and tournaments</li>
                  <li>Earn points and climb leaderboards</li>
                </ul>

                <h4 className="font-semibold text-white">Merchandise & Affiliates:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Browse F1 merchandise and team gear</li>
                  <li>Access affiliate links to purchase products</li>
                  <li>We may earn commissions from affiliate purchases</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5 text-green-400" />
                User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Account Security:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Provide accurate and up-to-date information</li>
                </ul>

                <h4 className="font-semibold text-white">Content Guidelines:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Keep content respectful and family-friendly</li>
                  <li>No harassment, hate speech, or discriminatory content</li>
                  <li>Respect intellectual property rights</li>
                  <li>No spam, misleading information, or commercial solicitation</li>
                </ul>

                <h4 className="font-semibold text-white">Fair Play:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>No cheating or exploitation in fantasy leagues</li>
                  <li>Respect other users and their opinions</li>
                  <li>Follow community guidelines and moderator decisions</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                Prohibited Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>The following activities are strictly prohibited:</p>

              <div className="space-y-3">
                <ul className="list-disc list-inside space-y-1">
                  <li>Impersonating other users, drivers, teams, or F1 officials</li>
                  <li>Sharing false or misleading information about races or drivers</li>
                  <li>Attempting to hack, exploit, or disrupt the platform</li>
                  <li>Creating multiple accounts to gain unfair advantages</li>
                  <li>Selling or transferring your account to others</li>
                  <li>Using automated tools or bots without permission</li>
                  <li>Posting content that violates copyright or trademark laws</li>
                  <li>Engaging in any illegal activities through the platform</li>
                </ul>
              </div>

              <div className="bg-orange-900/20 border border-orange-500/30 p-4 rounded-lg">
                <p className="text-orange-300">
                  <strong>Enforcement:</strong> Violations may result in warnings, temporary suspensions, or permanent
                  account termination.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Gavel className="h-5 w-5 text-purple-400" />
                Disclaimers & Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-white">F1 Content:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>We are not affiliated with Formula 1, FIA, or any F1 teams</li>
                  <li>Race data and statistics are provided for entertainment purposes</li>
                  <li>We cannot guarantee the accuracy of real-time race information</li>
                </ul>

                <h4 className="font-semibold text-white">Fantasy Leagues:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Fantasy leagues are for entertainment only, not gambling</li>
                  <li>No monetary prizes or real-world value exchanges</li>
                  <li>Points and rankings are based on our scoring system</li>
                </ul>

                <h4 className="font-semibold text-white">Platform Availability:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>We strive for 99.9% uptime but cannot guarantee continuous availability</li>
                  <li>Maintenance windows may temporarily interrupt service</li>
                  <li>We are not liable for any losses due to platform downtime</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                We may update these Terms of Service from time to time. We will notify users of significant changes
                through:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Email notifications to registered users</li>
                <li>Platform announcements and banners</li>
                <li>Updates to this page with revision dates</li>
              </ul>
              <p>Continued use of the platform after changes constitutes acceptance of the new terms.</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>For questions about these Terms of Service, please contact us:</p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p>
                  <strong className="text-white">Email:</strong> legal@grandprixsocial.com
                </p>
                <p>
                  <strong className="text-white">Support:</strong> support@grandprixsocial.com
                </p>
                <p>
                  <strong className="text-white">Address:</strong> Grand Prix Social, Legal Department
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
