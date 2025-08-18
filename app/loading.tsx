import { Card, CardContent } from "@/components/ui/card"
import { Flag } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 flex items-center justify-center px-4">
      <Card className="bg-gray-900/50 border-gray-700 max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Flag className="h-16 w-16 text-red-500 animate-pulse" />
              <div className="absolute inset-0 animate-spin">
                <div className="h-16 w-16 border-4 border-transparent border-t-red-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Loading Grand Prix Social</h2>
            <p className="text-gray-400">Preparing your F1 experience...</p>
          </div>

          <div className="flex justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
