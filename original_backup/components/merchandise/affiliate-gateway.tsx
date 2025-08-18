"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ArrowLeft, Shield, Award, Clock } from "lucide-react"

interface AffiliateGatewayProps {
  product: {
    id: string
    name: string
    price: number
    imageUrl: string
    network: string
    affiliateUrl: string
    commission: number
  }
  onClose: () => void
  onProceed: () => void
}

export function AffiliateGateway({ product, onClose, onProceed }: AffiliateGatewayProps) {
  const [countdown, setCountdown] = useState(5)
  const [autoRedirect, setAutoRedirect] = useState(true)

  useEffect(() => {
    if (autoRedirect && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (autoRedirect && countdown === 0) {
      onProceed()
    }
  }, [countdown, autoRedirect, onProceed])

  const formatPrice = (price: number) => `$${(price / 100).toFixed(2)}`

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-blue-400" />
              Redirecting to Partner Store
            </CardTitle>
            <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Product Preview */}
          <div className="flex gap-4 p-4 bg-gray-800/50 rounded-lg">
            <img
              src={product.imageUrl || "/placeholder.svg"}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">{product.name}</h3>
              <p className="text-2xl font-bold text-green-400">{formatPrice(product.price)}</p>
              <Badge className="bg-blue-600 text-white mt-2">Partner: {product.network}</Badge>
            </div>
          </div>

          {/* Security & Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-600/10 rounded-lg border border-green-600/20">
              <Shield className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-sm font-semibold text-white">Secure Purchase</div>
                <div className="text-xs text-gray-400">SSL Protected</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-600/10 rounded-lg border border-blue-600/20">
              <Award className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-sm font-semibold text-white">Trusted Partner</div>
                <div className="text-xs text-gray-400">Verified Seller</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-600/10 rounded-lg border border-purple-600/20">
              <ExternalLink className="h-5 w-5 text-purple-400" />
              <div>
                <div className="text-sm font-semibold text-white">Grand Prix Social</div>
                <div className="text-xs text-gray-400">Earns {product.commission}%</div>
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="bg-gray-800/30 p-4 rounded-lg">
            <h4 className="font-semibold text-white mb-2">What happens next?</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• You'll be redirected to our trusted partner's secure checkout</li>
              <li>• Your purchase supports Grand Prix Social (we earn {product.commission}% commission)</li>
              <li>• You get the same price and warranty as buying directly</li>
              <li>• Return to Grand Prix Social anytime to track your order</li>
            </ul>
          </div>

          {/* Auto-redirect countdown */}
          {autoRedirect && (
            <div className="text-center p-4 bg-blue-600/10 rounded-lg border border-blue-600/20">
              <Clock className="h-5 w-5 text-blue-400 mx-auto mb-2" />
              <p className="text-white mb-2">Automatically redirecting in {countdown} seconds...</p>
              <Button
                variant="outline"
                onClick={() => setAutoRedirect(false)}
                className="border-gray-600 text-gray-400 bg-transparent"
              >
                Cancel Auto-redirect
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 border-gray-600 text-gray-400 bg-transparent">
              Stay on Grand Prix Social
            </Button>
            <Button onClick={onProceed} className="flex-1 bg-blue-600 hover:bg-blue-700">
              <ExternalLink className="h-4 w-4 mr-2" />
              Continue to Partner Store
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
