"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, ExternalLink, Star, Truck, Shield } from 'lucide-react'
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
  partner: 'gpbox' | 'f1store' | 'fueller' | 'fuelforfans'
  affiliateUrl: string
  description: string
}

interface EmbeddedCheckoutProps {
  products: Product[]
  partnerId: string
  onPurchase?: (product: Product) => void
}

const partnerInfo = {
  gpbox: {
    name: "GPBox",
    logo: "/partners/gpbox-logo.png",
    commission: "4%",
    color: "bg-blue-500",
    description: "Motorsport Marketplace"
  },
  f1store: {
    name: "F1 Official Store",
    logo: "/partners/f1store-logo.png", 
    commission: "5%",
    color: "bg-red-500",
    description: "Official Formula 1 Merchandise"
  },
  fueller: {
    name: "Fueller",
    logo: "/partners/fueller-logo.png",
    commission: "TBD",
    color: "bg-green-500",
    description: "Premium F1 Gear"
  },
  fuelforfans: {
    name: "Fuel For Fans",
    logo: "/partners/fuelforfans-logo.png",
    commission: "TBD", 
    color: "bg-purple-500",
    description: "F1 Fan Merchandise"
  }
}

export default function EmbeddedCheckout({ products, partnerId, onPurchase }: EmbeddedCheckoutProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cart, setCart] = useState<Product[]>([])
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  
  const handleAddToCart = (product: Product) => {
    setCart([...cart, product])
    if (onPurchase) {
      onPurchase(product)
    }
  }

  const handleBuyNow = async (product: Product) => {
    setIsCheckingOut(true)
    
    // Track affiliate click
    await trackAffiliateClick(product)
    
    // Open embedded checkout modal instead of redirecting
    setSelectedProduct(product)
    setIsCheckingOut(false)
  }

  const trackAffiliateClick = async (product: Product) => {
    try {
      // Track the click for commission purposes
      await fetch('/api/affiliate/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          partner: product.partner,
          affiliateUrl: product.affiliateUrl,
          userId: 'current_user_id', // Get from auth context
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Failed to track affiliate click:', error)
    }
  }

  const ProductCard = ({ product }: { product: Product }) => {
    const partner = partnerInfo[product.partner]
    
    return (
      <Card className="group hover:scale-105 transition-all duration-300 glass border-gray-800 hover:border-red-500">
        <CardHeader className="pb-3">
          <div className="relative aspect-square overflow-hidden rounded-lg">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute top-2 right-2">
              <Badge className={`${partner.color} text-white text-xs`}>
                {partner.name}
              </Badge>
            </div>
            {product.originalPrice && (
              <div className="absolute top-2 left-2">
                <Badge variant="destructive" className="text-xs">
                  SALE
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div>
            <h3 className="font-semibold text-white truncate">{product.name}</h3>
            <p className="text-sm text-gray-400">{product.brand}</p>
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
            <span className="text-xs text-gray-400">({product.reviews})</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-red-400">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {product.fastShipping && (
                <Truck className="w-4 h-4 text-green-400" title="Fast Shipping" />
              )}
              <Shield className="w-4 h-4 text-blue-400" title="Secure Purchase" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Button
              onClick={() => handleBuyNow(product)}
              disabled={!product.inStock || isCheckingOut}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {isCheckingOut ? (
                'Processing...'
              ) : !product.inStock ? (
                'Out of Stock'
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Buy Now - Stay on Site
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleAddToCart(product)}
              disabled={!product.inStock}
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Add to Cart
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            ✅ Purchase processed on Grand Prix Social
            <br />
            🏆 Earn points with every purchase
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Partner Header */}
      <div className="glass p-4 rounded-lg border border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full ${partnerInfo[products[0]?.partner]?.color || 'bg-gray-500'}`} />
            <div>
              <h2 className="text-xl font-bold text-white">
                {partnerInfo[products[0]?.partner]?.name || 'Partner Store'}
              </h2>
              <p className="text-sm text-gray-400">
                {partnerInfo[products[0]?.partner]?.description || 'Premium F1 Merchandise'}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-green-500 text-green-400">
            {partnerInfo[products[0]?.partner]?.commission || '4%'} Commission
          </Badge>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Embedded Checkout Modal */}
      {selectedProduct && (
        <EmbeddedCheckoutModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onPurchase={handleAddToCart}
        />
      )}

      {/* Trust Indicators */}
      <div className="glass p-4 rounded-lg border border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-300">Secure Payments</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-300">Fast Shipping</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-300">Verified Reviews</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Embedded Checkout Modal Component
function EmbeddedCheckoutModal({ 
  product, 
  onClose, 
  onPurchase 
}: { 
  product: Product
  onClose: () => void
  onPurchase: (product: Product) => void
}) {
  const [quantity, setQuantity] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePurchase = async () => {
    setIsProcessing(true)
    
    try {
      // Process payment through embedded system
      const response = await fetch('/api/checkout/embedded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          partner: product.partner,
          affiliateUrl: product.affiliateUrl,
          totalAmount: product.price * quantity
        })
      })

      if (response.ok) {
        onPurchase(product)
        onClose()
        // Show success message
      }
    } catch (error) {
      console.error('Purchase failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glass p-6 rounded-lg border border-gray-800 max-w-md w-full mx-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Complete Purchase</h3>
            <Button variant="ghost" onClick={onClose} className="text-gray-400">×</Button>
          </div>
          
          <div className="flex gap-4">
            <Image
              src={product.image}
              alt={product.name}
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-white">{product.name}</h4>
              <p className="text-sm text-gray-400">{product.brand}</p>
              <p className="text-lg font-bold text-red-400">${product.price}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">Quantity:</label>
            <select 
              value={quantity} 
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white"
            >
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <div className="flex justify-between text-lg font-bold text-white">
              <span>Total:</span>
              <span>${(product.price * quantity).toFixed(2)}</span>
            </div>
          </div>

          <Button 
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {isProcessing ? 'Processing...' : 'Complete Purchase'}
          </Button>

          <div className="text-xs text-gray-500 text-center">
            🔒 Secure checkout powered by Grand Prix Social
            <br />
            ✅ Order processed through official partner
          </div>
        </div>
      </div>
    </div>
  )
}