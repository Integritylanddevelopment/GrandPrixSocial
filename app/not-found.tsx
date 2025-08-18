import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 flex items-center justify-center px-4">
      <Card className="bg-gray-900/50 border-gray-700 max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <AlertTriangle className="h-16 w-16 text-red-500" />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">404</h1>
            <h2 className="text-xl font-semibold text-white">Page Not Found</h2>
            <p className="text-gray-400">
              Looks like this page took a wrong turn at the chicane. The page you're looking for doesn't exist.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              className="bg-transparent border border-red-600 text-red-400 hover:bg-red-600/10 hover:border-red-500 hover:text-red-300 transition-all duration-200"
            >
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-gray-600 text-white hover:bg-gray-800 bg-transparent">
              <Link href="javascript:history.back()">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Link>
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-500">
              Need help?{" "}
              <Link href="mailto:support@grandprixsocial.com" className="text-red-400 hover:text-red-300">
                Contact Support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
