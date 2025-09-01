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
    name: "Amazon Associates",
    logo: "/partners/amazon-logo.png",
    commission: "1-10%",
    color: "bg-orange-500",
    description: "Official F1 Merchandise",
    instant: true
  }
}

export default function HybridCheckout({ products, onPurchase }: HybridCheckoutProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [showComingSoonModal, setShowComingSoonModal] = useState(false)
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
      <Card className="group hover:scale-105 transition-all duration-300 bg-gray-900/50 border-gray-700 hover:border-green-400 relative">
        <CardHeader className="pb-3">
          <div className="relative aspect-square overflow-hidden rounded-lg">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute bottom-2 left-2">
              <Badge className="bg-green-500 text-white text-xs font-rajdhani">
                Coming Soon
              </Badge>
            </div>
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
              onClick={() => setShowComingSoonModal(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-rajdhani"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Buy Now
            </Button>
          </div>
          
          <div className="text-xs text-gray-400 text-center font-rajdhani">
            🚀 Motor Market is launching soon
            <br />
            🔔 We'll notify you when available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Coming Soon Modal */}
      {showComingSoonModal && (
        <ComingSoonModal
          onClose={() => setShowComingSoonModal(false)}
        />
      )}

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

    </div>
  )
}

// Coming Soon Modal
function ComingSoonModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-md mx-4 p-6 border border-green-500">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🚀</span>
          </div>
          
          <h3 className="text-2xl font-bold text-white font-orbitron mb-4">
            Motor Market Loading...
          </h3>
          
          <p className="text-gray-300 font-rajdhani mb-6">
            We're working hard to bring you the best F1 merchandise from across the entire internet. 
            Thanks for being a Grand Prix Social member - we'll be in touch as soon as we launch 
            with exclusive deals on caps, shirts, helmets, and all the hottest racing gear!
          </p>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-gray-300 font-rajdhani">
              <span className="text-green-400">✓</span>
              <span>Sourcing official team merchandise</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300 font-rajdhani">
              <span className="text-green-400">✓</span>
              <span>Negotiating exclusive member discounts</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300 font-rajdhani">
              <span className="text-green-400">✓</span>
              <span>Building secure checkout experience</span>
            </div>
          </div>
          
          <Button 
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-rajdhani"
          >
            Got it - Keep me posted!
          </Button>
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