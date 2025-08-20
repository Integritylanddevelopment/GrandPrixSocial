"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, ExternalLink, Star, Truck, Shield, X } from 'lucide-react'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  brand: string
  category: string
  inStock: boolean
  fastShipping: boolean
  partner: 'amazon' | 'clickbank' | 'shareasale' | 'fiverr' | 'systeme' | 'gpbox' | 'f1store' | 'ebay' | 'fanatics'
  affiliateUrl: string
  description: string
  embedType: 'iframe' | 'popup' | 'redirect'
  iframeUrl?: string
}

interface HybridCheckoutProps {
  products: Product[]
  onPurchase?: (product: Product) => void
}

const partnerInfo = {
  amazon: {
    name: "Amazon",
    logo: "/partners/amazon-logo.png",
    commission: "1-10%",
    color: "bg-orange-500",
    description: "Massive F1 Product Selection",
    instant: true
  },
  clickbank: {
    name: "ClickBank",
    logo: "/partners/clickbank-logo.png", 
    commission: "50-75%",
    color: "bg-green-600",
    description: "Digital F1 Products",
    instant: true
  },
  shareasale: {
    name: "ShareASale",
    logo: "/partners/shareasale-logo.png",
    commission: "5-15%", 
    color: "bg-blue-700",
    description: "Affiliate Network",
    instant: true
  },
  fiverr: {
    name: "Fiverr",
    logo: "/partners/fiverr-logo.png",
    commission: "$150 CPA",
    color: "bg-green-500",
    description: "F1 Design Services",
    instant: true
  },
  systeme: {
    name: "Systeme.io",
    logo: "/partners/systeme-logo.png",
    commission: "30%",
    color: "bg-indigo-600",
    description: "Marketing Platform",
    instant: true
  },
  gpbox: {
    name: "TheGPBox",
    logo: "/partners/gpbox-logo.png",
    commission: "4%",
    color: "bg-blue-500",
    description: "Motorsport Marketplace",
    instant: false
  },
  f1store: {
    name: "F1 Official Store",
    logo: "/partners/f1store-logo.png",
    commission: "5%",
    color: "bg-red-500",
    description: "Official Formula 1 Merchandise",
    instant: false
  },
  ebay: {
    name: "eBay",
    logo: "/partners/ebay-logo.png",
    commission: "1-4%",
    color: "bg-blue-600",
    description: "F1 Collectibles & Vintage",
    instant: true
  },
  fanatics: {
    name: "Fanatics",
    logo: "/partners/fanatics-logo.png",
    commission: "8%",
    color: "bg-purple-600",
    description: "Sports Merchandise Giant",
    instant: false
  }
}

export default function HybridCheckout({ products, onPurchase }: HybridCheckoutProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const trackAffiliateClick = async (product: Product) => {
    try {
      await fetch('/api/affiliate/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          partner: product.partner,
          affiliateUrl: product.affiliateUrl,
          embedType: product.embedType,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Failed to track affiliate click:', error)
    }
  }

  const handleBuyNow = async (product: Product) => {
    setIsLoading(true)
    await trackAffiliateClick(product)
    
    if (product.embedType === 'iframe' && product.iframeUrl) {
      // Show iframe modal - customer stays on your site
      setSelectedProduct(product)
      setShowCheckoutModal(true)
    } else if (product.embedType === 'popup') {
      // Open partner checkout in popup window
      const popup = window.open(
        product.affiliateUrl,
        'checkout',
        'width=800,height=600,scrollbars=yes,resizable=yes'
      )
      
      // Monitor popup for completion
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          onPurchase?.(product)
        }
      }, 1000)
    } else {
      // Fallback to redirect in new tab
      window.open(product.affiliateUrl, '_blank')
    }
    
    setIsLoading(false)
  }

  const ProductCard = ({ product }: { product: Product }) => {
    const partner = partnerInfo[product.partner]
    
    return (
      <Card className="group hover:scale-105 transition-all duration-300 glass-purple border-purple-500 hover:border-purple-400">
        <CardHeader className="pb-3">
          <div className="relative aspect-square overflow-hidden rounded-lg">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute top-2 right-2">
              <Badge className={`${partner.color} text-white text-xs font-rajdhani`}>
                {partner.name}
              </Badge>
            </div>
            {partner.instant && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-green-600 text-white text-xs font-rajdhani">
                  INSTANT
                </Badge>
              </div>
            )}
            {product.originalPrice && (
              <div className="absolute bottom-2 left-2">
                <Badge variant="destructive" className="text-xs font-rajdhani">
                  SALE
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div>
            <h3 className="font-semibold text-white font-rajdhani truncate">{product.name}</h3>
            <p className="text-sm text-gray-400 font-rajdhani">{product.brand}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400 font-rajdhani">({product.reviews})</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-purple-400 font-orbitron">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through font-rajdhani">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {product.fastShipping && (
                <Truck className="w-4 h-4 text-green-400" title="Fast Shipping" />
              )}
              <Shield className="w-4 h-4 text-purple-400" title="Secure Purchase" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Button
              onClick={() => handleBuyNow(product)}
              disabled={!product.inStock || isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-rajdhani"
            >
              {isLoading ? (
                'Loading...'
              ) : !product.inStock ? (
                'Out of Stock'
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {product.embedType === 'iframe' ? 'Buy Now - Stay Here' : 'Buy Now - Secure Popup'}
                </>
              )}
            </Button>
          </div>
          
          <div className="text-xs text-gray-400 text-center font-rajdhani">
            {product.embedType === 'iframe' ? (
              <>
                ✅ Checkout loads on Grand Prix Social
                <br />
                🏆 Partner handles all payments
              </>
            ) : (
              <>
                🔒 Secure checkout via {partner.name}
                <br />
                💰 You earn {partner.commission} commission
              </>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Instant Partners Header */}
      <div className="glass-purple p-4 rounded-lg border border-purple-500">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-white font-orbitron mb-2">
            🚀 Live Partner Stores
          </h2>
          <p className="text-gray-300 font-rajdhani">
            Active affiliate partnerships - no approval needed, start earning immediately
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(partnerInfo)
            .filter(([_, info]) => info.instant)
            .map(([key, info]) => (
            <div key={key} className="flex items-center gap-2 p-2 bg-gray-800/50 rounded">
              <div className={`w-3 h-3 rounded-full ${info.color}`} />
              <div className="text-sm">
                <div className="text-white font-rajdhani">{info.name}</div>
                <div className="text-green-400 text-xs font-rajdhani">LIVE</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Iframe Checkout Modal */}
      {showCheckoutModal && selectedProduct && (
        <IframeCheckoutModal
          product={selectedProduct}
          onClose={() => {
            setShowCheckoutModal(false)
            setSelectedProduct(null)
          }}
          onPurchase={onPurchase}
        />
      )}

      {/* Partner Status Grid */}
      <div className="glass-purple p-6 rounded-lg border border-purple-500">
        <h3 className="text-xl font-bold text-white font-orbitron mb-4 text-center">
          Partner Network Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(partnerInfo).map(([key, info]) => (
            <div key={key} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
              <div className={`w-10 h-10 rounded-lg ${info.color} flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">
                  {info.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold font-rajdhani">{info.name}</div>
                <div className="text-sm text-gray-400 font-rajdhani">{info.description}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    className={info.instant ? "bg-green-600" : "bg-yellow-600"} 
                    variant="secondary"
                  >
                    <span className="text-white text-xs font-rajdhani">
                      {info.instant ? "LIVE" : "PENDING"}
                    </span>
                  </Badge>
                  <span className="text-xs text-gray-400 font-rajdhani">{info.commission}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Iframe Checkout Modal - Customer never leaves your site
function IframeCheckoutModal({ 
  product, 
  onClose, 
  onPurchase 
}: { 
  product: Product
  onClose: () => void
  onPurchase?: (product: Product) => void
}) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Monitor iframe for completion (implementation depends on partner)
    const checkCompletion = setInterval(() => {
      try {
        // Check for completion signals from iframe
        // This varies by partner - some provide postMessage APIs
      } catch (error) {
        // Cross-origin restrictions expected
      }
    }, 2000)

    return () => clearInterval(checkCompletion)
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl h-5/6 mx-4 flex flex-col border border-purple-500">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Image
              src={product.image}
              alt={product.name}
              width={40}
              height={40}
              className="rounded object-cover"
            />
            <div>
              <h3 className="text-white font-semibold font-rajdhani">{product.name}</h3>
              <p className="text-sm text-gray-400 font-rajdhani">
                Secure checkout via {partnerInfo[product.partner].name}
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Iframe Container */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-white font-rajdhani">Loading secure checkout...</p>
              </div>
            </div>
          )}
          
          <iframe
            src={product.iframeUrl || product.affiliateUrl}
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            title={`Checkout for ${product.name}`}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-400 font-rajdhani">
              🔒 This checkout is secured by {partnerInfo[product.partner].name}
            </div>
            <div className="text-purple-400 font-rajdhani">
              ✨ Stay on Grand Prix Social while you shop
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}