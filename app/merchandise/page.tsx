import EmbeddedCheckout from '@/components/merchandise/embedded-checkout'

// Sample F1 merchandise data - replace with real API calls
const sampleProducts = [
  {
    id: 'gpbox-001',
    name: 'Max Verstappen Championship Cap',
    price: 34.99,
    originalPrice: 39.99,
    image: '/merchandise/verstappen-cap.jpg',
    rating: 4.8,
    reviews: 156,
    brand: 'Red Bull Racing',
    category: 'Caps',
    inStock: true,
    fastShipping: true,
    partner: 'gpbox' as const,
    affiliateUrl: 'https://www.thegpbox.com/products/verstappen-cap?ref=grandprix-social',
    description: 'Official Max Verstappen championship celebration cap'
  },
  {
    id: 'f1store-001',
    name: 'Ferrari Team Polo Shirt',
    price: 89.99,
    image: '/merchandise/ferrari-polo.jpg',
    rating: 4.6,
    reviews: 203,
    brand: 'Scuderia Ferrari',
    category: 'Clothing',
    inStock: true,
    fastShipping: true,
    partner: 'f1store' as const,
    affiliateUrl: 'https://f1store.formula1.com/ferrari-polo?ref=grandprix-social',
    description: 'Official Ferrari team polo shirt - 2024 season'
  },
  {
    id: 'gpbox-002',
    name: 'Lewis Hamilton Signature Hoodie',
    price: 79.99,
    originalPrice: 99.99,
    image: '/merchandise/hamilton-hoodie.jpg',
    rating: 4.9,
    reviews: 89,
    brand: 'Mercedes-AMG F1',
    category: 'Hoodies',
    inStock: true,
    fastShipping: false,
    partner: 'gpbox' as const,
    affiliateUrl: 'https://www.thegpbox.com/products/hamilton-hoodie?ref=grandprix-social',
    description: 'Limited edition Lewis Hamilton signature hoodie'
  },
  {
    id: 'f1store-002',
    name: 'F1 Championship Trophy Replica',
    price: 149.99,
    image: '/merchandise/f1-trophy.jpg',
    rating: 4.7,
    reviews: 67,
    brand: 'Formula 1',
    category: 'Collectibles',
    inStock: true,
    fastShipping: true,
    partner: 'f1store' as const,
    affiliateUrl: 'https://f1store.formula1.com/trophy-replica?ref=grandprix-social',
    description: 'Official F1 World Championship trophy replica'
  },
  {
    id: 'gpbox-003',
    name: 'McLaren Team Cap - Lando Norris',
    price: 29.99,
    image: '/merchandise/mclaren-cap.jpg',
    rating: 4.5,
    reviews: 124,
    brand: 'McLaren F1',
    category: 'Caps',
    inStock: true,
    fastShipping: true,
    partner: 'gpbox' as const,
    affiliateUrl: 'https://www.thegpbox.com/products/mclaren-norris-cap?ref=grandprix-social',
    description: 'Official McLaren team cap featuring Lando Norris'
  },
  {
    id: 'f1store-003',
    name: 'F1 Paddock Club VIP Experience',
    price: 2499.99,
    image: '/merchandise/paddock-experience.jpg',
    rating: 5.0,
    reviews: 12,
    brand: 'Formula 1',
    category: 'Experiences',
    inStock: true,
    fastShipping: false,
    partner: 'f1store' as const,
    affiliateUrl: 'https://f1store.formula1.com/paddock-experience?ref=grandprix-social',
    description: 'Ultimate F1 Paddock Club VIP race weekend experience'
  }
]

export default function MerchandisePage() {
  const handlePurchase = (product: any) => {
    console.log('Product purchased:', product)
    // Handle post-purchase actions (analytics, user points, etc.)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold font-orbitron mb-4">
            <span className="bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 bg-clip-text text-transparent">
              F1 Merchandise Store
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-rajdhani">
            Shop official Formula 1 merchandise from our trusted partners. 
            Stay on Grand Prix Social while we handle the purchase through our affiliate network.
          </p>
        </div>

        {/* Store Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass p-6 rounded-lg border border-gray-800 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">✓</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Stay on Our Site</h3>
            <p className="text-gray-400 text-sm">
              Complete purchases without leaving Grand Prix Social. Seamless checkout experience.
            </p>
          </div>
          
          <div className="glass p-6 rounded-lg border border-gray-800 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">🛡️</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure Payments</h3>
            <p className="text-gray-400 text-sm">
              All payments processed securely through our encrypted payment system.
            </p>
          </div>
          
          <div className="glass p-6 rounded-lg border border-gray-800 text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">🏆</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Earn Points</h3>
            <p className="text-gray-400 text-sm">
              Earn Grand Prix Social points with every purchase for exclusive rewards.
            </p>
          </div>
        </div>

        {/* Embedded Merchandise Store */}
        <EmbeddedCheckout
          products={sampleProducts}
          partnerId="multi-partner"
          onPurchase={handlePurchase}
        />

        {/* Partner Information */}
        <div className="mt-16 glass p-6 rounded-lg border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Our Trusted Partners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">GP</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">TheGPBox</h3>
                <p className="text-gray-400 text-sm">Motorsport Marketplace - 4% Commission</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">F1</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">F1 Official Store</h3>
                <p className="text-gray-400 text-sm">Official Formula 1 Merchandise - 5% Commission</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
            <p className="text-gray-300 text-sm text-center">
              <strong>How it works:</strong> When you purchase through our store, 
              we earn a small commission from our partners at no extra cost to you. 
              This helps support Grand Prix Social and keep our platform free for all F1 fans!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
