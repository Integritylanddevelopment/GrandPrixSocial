import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Database, Users, Mail, Lock } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-500" />
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-lg">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Eye className="h-5 w-5 text-blue-400" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                At Grand Prix Social, we collect information to provide you with the best F1 fan experience possible.
              </p>

              <div className="space-y-3">
                <h4 className="font-semibold text-white">Account Information:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Username, email address, and profile information</li>
                  <li>F1 team and driver preferences</li>
                  <li>Profile photos and avatars</li>
                </ul>

                <h4 className="font-semibold text-white">Activity Data:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Posts, comments, and social interactions</li>
                  <li>Fantasy league participation and team selections</li>
                  <li>Race predictions and tournament activities</li>
                  <li>Merchandise browsing and affiliate link clicks</li>
                </ul>

                <h4 className="font-semibold text-white">Technical Information:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Device information and browser type</li>
                  <li>IP address and location data</li>
                  <li>Usage analytics and performance metrics</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="h-5 w-5 text-green-400" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Platform Features:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Personalize your F1 content feed and recommendations</li>
                  <li>Enable social features like posts, comments, and team interactions</li>
                  <li>Process fantasy league entries and calculate standings</li>
                  <li>Provide live race updates and notifications</li>
                </ul>

                <h4 className="font-semibold text-white">Communication:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Send race updates and breaking F1 news</li>
                  <li>Notify you about team activities and challenges</li>
                  <li>Provide customer support and platform updates</li>
                </ul>

                <h4 className="font-semibold text-white">Improvement & Analytics:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Analyze platform usage to improve features</li>
                  <li>Detect and prevent fraud or abuse</li>
                  <li>Ensure platform security and performance</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-purple-400" />
                Information Sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>We do not sell your personal information. We may share information in these limited circumstances:</p>

              <div className="space-y-3">
                <h4 className="font-semibold text-white">With Your Consent:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Public posts and profile information you choose to share</li>
                  <li>Team memberships and fantasy league participation</li>
                </ul>

                <h4 className="font-semibold text-white">Service Providers:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Hosting and infrastructure providers (Vercel, Supabase)</li>
                  <li>Analytics services for platform improvement</li>
                  <li>Email service providers for notifications</li>
                </ul>

                <h4 className="font-semibold text-white">Legal Requirements:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>When required by law or legal process</li>
                  <li>To protect the rights and safety of our users</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Lock className="h-5 w-5 text-red-400" />
                Data Security & Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Security Measures:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Encrypted data transmission and storage</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication systems</li>
                </ul>

                <h4 className="font-semibold text-white">Your Rights:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Access and download your personal data</li>
                  <li>Correct or update your information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Control privacy settings and data sharing</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Mail className="h-5 w-5 text-orange-400" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>If you have questions about this Privacy Policy or your data, please contact us:</p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p>
                  <strong className="text-white">Email:</strong> privacy@grandprixsocial.com
                </p>
                <p>
                  <strong className="text-white">Address:</strong> Grand Prix Social, Privacy Team
                </p>
                <p>
                  <strong className="text-white">Response Time:</strong> We aim to respond within 48 hours
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
