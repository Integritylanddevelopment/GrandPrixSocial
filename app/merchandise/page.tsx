import HybridCheckout from '@/components/merchandise/hybrid-checkout'
import { instantAffiliateProducts, instantPartnerConfig } from '@/data/instant-affiliate-products'

// Using instant approval affiliate products
const sampleProducts = instantAffiliateProducts.slice(0, 8) // Show first 8 products

// Old products removed - using instantAffiliateProducts instead
const oldProducts = [
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold font-orbitron mb-4">
            <span className="bg-gradient-to-r from-green-400 via-green-300 to-green-400 bg-clip-text text-transparent">
              Welcome to the Motor Market
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-rajdhani">
            Your ultimate destination for the hottest F1 gear and merchandise. We scour the entire internet to bring you the most coveted caps, shirts, helmets, collectibles, and racing essentials—all delivered straight to your doorstep through the Motor Market.
          </p>
        </div>

        {/* Motor Market Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-900/50 border-gray-700 p-6 rounded-lg border text-center relative">
            <div className="absolute bottom-2 left-2">
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded font-rajdhani">Coming Soon</span>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">🏎️</span>
            </div>
            <h3 className="text-lg font-semibold text-white font-rajdhani mb-2">Curated Collection</h3>
            <p className="text-gray-400 text-sm font-rajdhani">
              Hand-picked F1 gear from the best retailers across the web, all in one place.
            </p>
          </div>
          
          <div className="bg-gray-900/50 border-gray-700 p-6 rounded-lg border text-center relative">
            <div className="absolute bottom-2 left-2">
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded font-rajdhani">Coming Soon</span>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">🔥</span>
            </div>
            <h3 className="text-lg font-semibold text-white font-rajdhani mb-2">Hottest Drops</h3>
            <p className="text-gray-400 text-sm font-rajdhani">
              First access to limited edition releases and exclusive team merchandise.
            </p>
          </div>
          
          <div className="bg-gray-900/50 border-gray-700 p-6 rounded-lg border text-center relative">
            <div className="absolute bottom-2 left-2">
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded font-rajdhani">Coming Soon</span>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">🛡️</span>
            </div>
            <h3 className="text-lg font-semibold text-white font-rajdhani mb-2">Authenticated Gear</h3>
            <p className="text-gray-400 text-sm font-rajdhani">
              Only official merchandise from verified F1 teams and licensed retailers.
            </p>
          </div>
          
          <div className="bg-gray-900/50 border-gray-700 p-6 rounded-lg border text-center relative">
            <div className="absolute bottom-2 left-2">
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded font-rajdhani">Coming Soon</span>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-white font-rajdhani mb-2">Lightning Fast</h3>
            <p className="text-gray-400 text-sm font-rajdhani">
              Express shipping options to get your gear before the next race weekend.
            </p>
          </div>
        </div>

        {/* Hybrid Merchandise Store */}
        <HybridCheckout
          products={sampleProducts}
        />

        {/* Amazon Associates Integration */}
        <div className="mt-16 bg-gray-900/50 border-gray-700 p-8 rounded-lg border">
          <h2 className="text-3xl font-bold text-white font-orbitron mb-6 text-center">
            <span className="bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
              Motor Market Promise
            </span>
          </h2>
          <p className="text-gray-300 font-rajdhani text-center mb-8 max-w-3xl mx-auto">
            We're building something special just for you. The Motor Market will be your one-stop destination for the most exclusive F1 merchandise from every corner of the internet.
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="bg-gray-800/50 rounded-lg p-6 text-center">
              <h3 className="text-white font-semibold font-rajdhani mb-2">Coming Soon</h3>
              <p className="text-gray-400 text-sm font-rajdhani mb-3">We're currently sourcing the best F1 gear suppliers worldwide</p>
              <div className="text-xs text-gray-500 mb-4 font-rajdhani">
                <div>✓ Official team merchandise</div>
                <div>✓ Limited edition collectibles</div>
                <div>✓ Racing helmets & apparel</div>
                <div>✓ Exclusive driver gear</div>
              </div>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-rajdhani py-2 px-4 rounded transition-colors">
                Notify Me When Live
              </button>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-gray-800/30 rounded-lg">
            <p className="text-gray-300 text-sm text-center font-rajdhani">
              <strong className="text-green-400">Legal Disclaimer:</strong> As an Amazon Associate, we may earn from qualifying purchases. This helps us keep Grand Prix Social free for all F1 fans while bringing you the best merchandise deals from trusted retailers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
