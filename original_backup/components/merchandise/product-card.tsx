"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, ExternalLink, Star, Percent } from "lucide-react"

interface ProductCardProps {
  product: {
    id: string
    itemName?: string
    name?: string
    price: number
    originalPrice?: number
    imageUrl: string
    description: string
    inStock: boolean
    team?: {
      name: string
      color: string
    }
    sponsor?: {
      name: string
      merchandiseDiscount: number
    }
    // Affiliate product fields
    network?: string
    affiliateUrl?: string
    commission?: number
    rating?: number
    reviews?: number
  }
  isAffiliate?: boolean
  onAffiliateClick?: (productId: string, affiliateUrl: string) => void
}

export function ProductCard({ product, isAffiliate = false, onAffiliateClick }: ProductCardProps) {
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  const productName = product.itemName || product.name || "F1 Product"
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  const handleAffiliateClick = async () => {
    if (!isAffiliate || !product.affiliateUrl || !onAffiliateClick) return

    setLoading(true)
    try {
      await onAffiliateClick(product.id, product.affiliateUrl)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => `$${(price / 100).toFixed(2)}`

  return (
    <Card className="bg-gray-900/90 border-gray-700 hover:border-red-500/50 transition-all duration-300 group overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden">
          <img
            src={product.imageUrl || "/placeholder.svg"}
            alt={productName}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasDiscount && (
              <Badge className="bg-red-600 text-white">
                <Percent className="h-3 w-3 mr-1" />
                {discountPercent}% OFF
              </Badge>
            )}
            {isAffiliate && (
              <Badge className="bg-blue-600 text-white">
                <ExternalLink className="h-3 w-3 mr-1" />
                Partner
              </Badge>
            )}
            {product.team && (
              <Badge style={{ backgroundColor: product.team.color }} className="text-white">
                {product.team.name}
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="sm"
            className={`absolute top-3 right-3 ${
              liked ? "text-red-500 hover:text-red-400" : "text-gray-400 hover:text-red-400"
            }`}
            onClick={() => setLiked(!liked)}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
          </Button>

          {/* Stock Status */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Product Name */}
          <h3 className="font-semibold text-white text-lg leading-tight">{productName}</h3>

          {/* Rating (for affiliate products) */}
          {isAffiliate && product.rating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating!) ? "text-yellow-400 fill-current" : "text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-400">({product.reviews} reviews)</span>
            </div>
          )}

          {/* Description */}
          <p className="text-gray-400 text-sm line-clamp-2">{product.description}</p>

          {/* Sponsor Discount */}
          {product.sponsor?.merchandiseDiscount && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-500/50 text-green-400">
                {product.sponsor.name} Members: {product.sponsor.merchandiseDiscount}% OFF
              </Badge>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-lg text-gray-500 line-through">{formatPrice(product.originalPrice!)}</span>
            )}
          </div>

          {/* Commission Info (for affiliates) */}
          {isAffiliate && product.commission && (
            <div className="text-xs text-gray-400">
              Earn {product.commission}% commission • Partner: {product.network}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {isAffiliate ? (
              <Button
                onClick={handleAffiliateClick}
                disabled={!product.inStock || loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {loading ? "Redirecting..." : "Buy from Partner"}
              </Button>
            ) : (
              <Button disabled={!product.inStock} className="flex-1 bg-red-600 hover:bg-red-700">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
