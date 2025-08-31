// Instant approval affiliate products for Grand Prix Social
// These can be implemented immediately without waiting for approval

export interface InstantProduct {
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
  partner: 'amazon' | 'clickbank' | 'shareasale' | 'fiverr' | 'systeme'
  affiliateUrl: string
  description: string
  embedType: 'iframe' | 'popup' | 'redirect'
  iframeUrl?: string
  commission: string
}

export const instantAffiliateProducts: InstantProduct[] = [
  // Amazon Associates - F1 Products Only
  {
    id: 'amz-verstappen-cap',
    name: 'Red Bull Racing Max Verstappen Cap 2024',
    price: 34.99,
    originalPrice: 39.99,
    image: '/merchandise/verstappen-cap.jpg',
    rating: 4.8,
    reviews: 1247,
    brand: 'Red Bull Racing',
    category: 'Caps',
    inStock: true,
    fastShipping: true,
    partner: 'amazon',
    affiliateUrl: 'https://www.amazon.com/dp/B0CX123456?tag=grandprix-20',
    description: 'Official Max Verstappen championship cap - Amazon Prime eligible',
    embedType: 'popup',
    commission: '4%'
  },
  {
    id: 'amz-ferrari-jacket',
    name: 'Ferrari Team Softshell Jacket',
    price: 159.99,
    image: '/merchandise/ferrari-jacket.jpg',
    rating: 4.6,
    reviews: 543,
    brand: 'Scuderia Ferrari',
    category: 'Outerwear',
    inStock: true,
    fastShipping: true,
    partner: 'amazon',
    affiliateUrl: 'https://www.amazon.com/dp/B0CX789012?tag=grandprix-20',
    description: 'Premium Ferrari team jacket with weather protection',
    embedType: 'popup',
    commission: '4%'
  },
  {
    id: 'amz-f1-book',
    name: 'Formula 1: The Complete Guide 2024',
    price: 29.99,
    image: '/merchandise/f1-guide-book.jpg',
    rating: 4.9,
    reviews: 892,
    brand: 'Formula 1',
    category: 'Books',
    inStock: true,
    fastShipping: true,
    partner: 'amazon',
    affiliateUrl: 'https://www.amazon.com/dp/B0CX345678?tag=grandprix-20',
    description: 'Comprehensive F1 guide with all teams, drivers, and circuits',
    embedType: 'popup',
    commission: '8%'
  },
  {
    id: 'amz-mclaren-model',
    name: 'McLaren MCL60 Die-Cast Model Car 1:43',
    price: 89.99,
    image: '/merchandise/mclaren-model.jpg',
    rating: 4.7,
    reviews: 234,
    brand: 'McLaren F1',
    category: 'Collectibles',
    inStock: true,
    fastShipping: false,
    partner: 'amazon',
    affiliateUrl: 'https://www.amazon.com/dp/B0CX901234?tag=grandprix-20',
    description: 'Detailed McLaren MCL60 replica model car',
    embedType: 'popup',
    commission: '6%'
  },
  {
    id: 'amz-hamilton-shirt',
    name: 'Mercedes Lewis Hamilton #44 T-Shirt',
    price: 24.99,
    image: '/merchandise/hamilton-shirt.jpg',
    rating: 4.7,
    reviews: 892,
    brand: 'Mercedes-AMG F1',
    category: 'Clothing',
    inStock: true,
    fastShipping: true,
    partner: 'amazon',
    affiliateUrl: 'https://www.amazon.com/dp/B0CX567890?tag=grandprix-20',
    description: 'Official Mercedes Lewis Hamilton team t-shirt',
    embedType: 'popup',
    commission: '4%'
  },
  {
    id: 'amz-f1-keychain',
    name: 'F1 Racing Car Metal Keychain Set',
    price: 19.99,
    image: '/merchandise/f1-keychain.jpg',
    rating: 4.5,
    reviews: 445,
    brand: 'Formula 1',
    category: 'Accessories',
    inStock: true,
    fastShipping: true,
    partner: 'amazon',
    affiliateUrl: 'https://www.amazon.com/dp/B0CX234567?tag=grandprix-20',
    description: 'Set of 10 different F1 car metal keychains',
    embedType: 'popup',
    commission: '5%'
  },
  {
    id: 'amz-mclaren-hoodie',
    name: 'McLaren Papaya Orange Team Hoodie',
    price: 89.99,
    originalPrice: 109.99,
    image: '/merchandise/mclaren-hoodie.jpg',
    rating: 4.8,
    reviews: 167,
    brand: 'McLaren F1',
    category: 'Hoodies',
    inStock: true,
    fastShipping: true,
    partner: 'amazon',
    affiliateUrl: 'https://www.amazon.com/dp/B0CX678901?tag=grandprix-20',
    description: 'Official McLaren team hoodie in signature papaya orange',
    embedType: 'popup',
    commission: '4%'
  },
  {
    id: 'amz-f1-flag',
    name: 'Formula 1 Checkered Flag 3x5ft',
    price: 16.99,
    image: '/merchandise/f1-flag.jpg',
    rating: 4.6,
    reviews: 278,
    brand: 'Formula 1',
    category: 'Flags',
    inStock: true,
    fastShipping: true,
    partner: 'amazon',
    affiliateUrl: 'https://www.amazon.com/dp/B0CX789123?tag=grandprix-20',
    description: 'Official F1 checkered flag for race day celebrations',
    embedType: 'popup',
    commission: '6%'
  }
]

// Partner configuration - Amazon Associates only
export const instantPartnerConfig = {
  amazon: {
    name: "Amazon Associates",
    description: "Official Amazon affiliate program for F1 merchandise",
    signupUrl: "https://affiliate-program.amazon.com",
    instant: true,
    requirements: "Website with content, 3 sales in 180 days",
    commission: "1-10%",
    cookieDuration: "24 hours",
    paymentMinimum: "$10",
    embedSupport: true
  }
}