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
            <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-purple-400 bg-clip-text text-transparent">
              F1 Merchandise Store
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-rajdhani">
            Shop F1 merchandise from Amazon, ClickBank, and top retailers. 
            Stay on Grand Prix Social while our partners handle secure payments.
          </p>
        </div>

        {/* Store Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="glass-purple p-6 rounded-lg border border-purple-500 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">🚀</span>
            </div>
            <h3 className="text-lg font-semibold text-white font-rajdhani mb-2">Instant Access</h3>
            <p className="text-gray-400 text-sm font-rajdhani">
              Live affiliate partnerships - no approval waiting period required.
            </p>
          </div>
          
          <div className="glass-purple p-6 rounded-lg border border-purple-500 text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">🛒</span>
            </div>
            <h3 className="text-lg font-semibold text-white font-rajdhani mb-2">Stay Here</h3>
            <p className="text-gray-400 text-sm font-rajdhani">
              Shop without leaving our site. Partners handle all payments securely.
            </p>
          </div>
          
          <div className="glass-purple p-6 rounded-lg border border-purple-500 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">🛡️</span>
            </div>
            <h3 className="text-lg font-semibold text-white font-rajdhani mb-2">Secure Partners</h3>
            <p className="text-gray-400 text-sm font-rajdhani">
              Amazon, ClickBank, Fiverr - trusted platforms handle your payments.
            </p>
          </div>
          
          <div className="glass-purple p-6 rounded-lg border border-purple-500 text-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">💰</span>
            </div>
            <h3 className="text-lg font-semibold text-white font-rajdhani mb-2">Best Prices</h3>
            <p className="text-gray-400 text-sm font-rajdhani">
              Direct from major retailers - competitive pricing and fast shipping.
            </p>
          </div>
        </div>

        {/* Hybrid Merchandise Store */}
        <HybridCheckout
          products={sampleProducts}
        />

        {/* Instant Signup Guide */}
        <div className="mt-16 glass-purple p-8 rounded-lg border border-purple-500">
          <h2 className="text-3xl font-bold text-white font-orbitron mb-6 text-center">
            🚀 Ready to Start Your Own Affiliate Program?
          </h2>
          <p className="text-gray-300 font-rajdhani text-center mb-8 max-w-3xl mx-auto">
            Join the same instant-approval affiliate programs we use! Start earning commissions today without waiting for approvals.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(instantPartnerConfig)
              .filter(([_, config]) => config.instant)
              .map(([key, config]) => (
              <div key={key} className="bg-gray-800/50 rounded-lg p-4 text-center">
                <h3 className="text-white font-semibold font-rajdhani mb-2">{config.name}</h3>
                <p className="text-gray-400 text-sm font-rajdhani mb-3">{config.description}</p>
                <div className="text-xs text-gray-500 mb-4 font-rajdhani">
                  <div>Commission: {config.commission}</div>
                  <div>Minimum: {config.paymentMinimum}</div>
                </div>
                <a 
                  href={config.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-rajdhani py-2 px-4 rounded transition-colors"
                >
                  Sign Up Free
                </a>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 bg-gray-800/30 rounded-lg">
            <p className="text-gray-300 text-sm text-center font-rajdhani">
              <strong className="text-purple-400">How it works:</strong> These are the exact same affiliate programs powering our store. 
              Sign up instantly, get your affiliate links, and start earning commissions on F1 merchandise, courses, and services. 
              No approval waiting period - start promoting immediately!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
