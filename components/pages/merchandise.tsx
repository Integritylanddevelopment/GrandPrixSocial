"use client"

import { useEffect, useState } from "react"
import { ProductCard } from "@/components/merchandise/product-card"
import { AffiliateGateway } from "@/components/merchandise/affiliate-gateway"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, ShoppingBag, ExternalLink, TrendingUp } from "lucide-react"

export default function Merchandise() {
  const [teamMerchandise, setTeamMerchandise] = useState([])
  const [affiliateProducts, setAffiliateProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedNetwork, setSelectedNetwork] = useState("")
  const [showGateway, setShowGateway] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [activeTab, setActiveTab] = useState("")

  useEffect(() => {
    fetchMerchandise()
    fetchAffiliateProducts()
  }, [])

  const fetchMerchandise = async () => {
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      if (selectedCategory && selectedCategory !== "all") params.append("category", selectedCategory)

      const response = await fetch(`/api/merchandise?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTeamMerchandise(data.merchandise)
      }
    } catch (error) {
      console.error("Error fetching merchandise:", error)
    }
  }

  const fetchAffiliateProducts = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory && selectedCategory !== "all") params.append("category", selectedCategory)
      if (selectedNetwork && selectedNetwork !== "all") params.append("network", selectedNetwork)

      const response = await fetch(`/api/affiliates?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAffiliateProducts(data.products)
      }
    } catch (error) {
      console.error("Error fetching affiliate products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAffiliateClick = async (productId: string, affiliateUrl: string) => {
    const product = affiliateProducts.find((p) => p.id === productId)
    if (product) {
      setSelectedProduct(product)
      setShowGateway(true)
    }
  }

  const handleGatewayProceed = async () => {
    if (selectedProduct) {
      // Track the affiliate click
      await fetch("/api/affiliates/redirect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          affiliateUrl: selectedProduct.affiliateUrl,
          userId: "current-user", // Replace with actual user ID
        }),
      })

      // Redirect to affiliate URL
      window.open(selectedProduct.affiliateUrl, "_blank")
      setShowGateway(false)
    }
  }

  const categories = ["apparel", "accessories", "collectibles", "team-gear", "luxury"]
  const networks = ["fueler", "fuel-for-fans", "f1-store", "motorsport-merch", "racing-republic"]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading F1 merchandise...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-red-950">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 font-orbitron text-green-400" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))' }}>F1 Merchandise Store</h1>
          <p className="text-gray-400 font-rajdhani">Official team gear and partner products with exclusive discounts</p>
        </div>


        {/* Content Tabs */}
        <div className="w-full">
          <div className="flex rounded-lg p-1 mb-6">
            <button
              onClick={() => setActiveTab("team-store")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200 font-rajdhani font-medium ${
                activeTab === "team-store" 
                  ? "glass-green text-green-300 shadow-lg scale-105 border border-green-400/50" 
                  : "text-green-400 hover:text-green-300 hover:bg-green-400/10"
              }`}
            >
              <ShoppingBag className="h-4 w-4 text-green-400" />
              Shop Team
            </button>
            <button
              onClick={() => setActiveTab("partner-deals")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200 font-rajdhani font-medium ${
                activeTab === "partner-deals" 
                  ? "glass-green text-green-300 shadow-lg scale-105 border border-green-400/50" 
                  : "text-green-400 hover:text-green-300 hover:bg-green-400/10"
              }`}
            >
              <ExternalLink className="h-4 w-4 text-green-400" />
              Shop Driver
            </button>
            <button
              onClick={() => setActiveTab("trending")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200 font-rajdhani font-medium ${
                activeTab === "trending" 
                  ? "glass-green text-green-300 shadow-lg scale-105 border border-green-400/50" 
                  : "text-green-400 hover:text-green-300 hover:bg-green-400/10"
              }`}
            >
              <TrendingUp className="h-4 w-4 text-green-400" />
              Shop Brand
            </button>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search merchandise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <Button
                onClick={fetchMerchandise}
                className="bg-transparent border border-green-600 text-green-400 hover:bg-green-600/10 hover:border-green-500 hover:text-green-300 transition-all duration-200"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-white">
                    All Categories
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="text-white">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Partner" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-white">
                    All Partners
                  </SelectItem>
                  {networks.map((network) => (
                    <SelectItem key={network} value={network} className="text-white">
                      {network.charAt(0).toUpperCase() + network.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={fetchAffiliateProducts}
                variant="outline"
                className="bg-transparent border border-gray-600 text-gray-400 hover:bg-gray-600/10 hover:border-gray-500 hover:text-gray-300 transition-all duration-200"
              >
                Apply Filters
              </Button>
            </div>
          </div>

          {activeTab === "team-store" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Team Merchandise</h2>
                <Badge className="bg-green-600 text-green-400">Official Team Gear</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {teamMerchandise.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}

          {activeTab === "partner-deals" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Partner Products</h2>
                <Badge className="bg-green-600 text-green-400">Affiliate Partners</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {affiliateProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isAffiliate={true}
                    onAffiliateClick={handleAffiliateClick}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === "trending" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Trending Items</h2>
                <Badge className="bg-green-600 text-green-400">Hot Deals</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...teamMerchandise, ...affiliateProducts]
                  .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                  .slice(0, 8)
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isAffiliate={!!product.network}
                      onAffiliateClick={handleAffiliateClick}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Affiliate Gateway Modal */}
        {showGateway && selectedProduct && (
          <AffiliateGateway
            product={selectedProduct}
            onClose={() => setShowGateway(false)}
            onProceed={handleGatewayProceed}
          />
        )}
      </div>
    </div>
  )
}
