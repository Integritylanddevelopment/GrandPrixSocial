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
  // Amazon Associates - F1 Products (INSTANT)
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

  // ClickBank - F1 Digital Products (INSTANT)
  {
    id: 'cb-f1-betting-course',
    name: 'F1 Betting Mastery Course',
    price: 197.00,
    image: '/merchandise/f1-betting-course.jpg',
    rating: 4.5,
    reviews: 178,
    brand: 'F1 Pro Analytics',
    category: 'Digital Courses',
    inStock: true,
    fastShipping: true,
    partner: 'clickbank',
    affiliateUrl: 'https://hop.clickbank.net/?affiliate=grandprix&vendor=f1betting',
    description: 'Master F1 race analysis and betting strategies',
    embedType: 'redirect',
    commission: '50%'
  },
  {
    id: 'cb-fantasy-guide',
    name: 'Ultimate Fantasy F1 Strategy Guide',
    price: 47.00,
    image: '/merchandise/fantasy-f1-guide.jpg',
    rating: 4.8,
    reviews: 412,
    brand: 'Fantasy F1 Pro',
    category: 'Digital Guides',
    inStock: true,
    fastShipping: true,
    partner: 'clickbank',
    affiliateUrl: 'https://hop.clickbank.net/?affiliate=grandprix&vendor=fantasyf1',
    description: 'Complete guide to winning Fantasy Formula 1 leagues',
    embedType: 'redirect',
    commission: '60%'
  },

  // Fiverr - F1 Services (INSTANT)
  {
    id: 'fvr-f1-logo-design',
    name: 'Custom F1 Team Logo Design',
    price: 25.00,
    image: '/merchandise/f1-logo-design.jpg',
    rating: 4.9,
    reviews: 89,
    brand: 'Fiverr Pro',
    category: 'Design Services',
    inStock: true,
    fastShipping: true,
    partner: 'fiverr',
    affiliateUrl: 'https://fiverr.com/gig/f1-logo-design?affiliate_id=grandprix',
    description: 'Professional F1-style logo design for your fantasy team',
    embedType: 'popup',
    commission: '$150 CPA'
  },
  {
    id: 'fvr-f1-video-edit',
    name: 'F1 Race Highlight Video Editing',
    price: 75.00,
    image: '/merchandise/f1-video-editing.jpg',
    rating: 4.7,
    reviews: 156,
    brand: 'Fiverr Pro',
    category: 'Video Services',
    inStock: true,
    fastShipping: true,
    partner: 'fiverr',
    affiliateUrl: 'https://fiverr.com/gig/f1-video-editing?affiliate_id=grandprix',
    description: 'Professional F1 race highlight and analysis videos',
    embedType: 'popup',
    commission: '$150 CPA'
  },

  // ShareASale - Sports Retailers (INSTANT for many)
  {
    id: 'sas-motorsport-watch',
    name: 'TAG Heuer Formula 1 Chronograph',
    price: 1299.99,
    image: '/merchandise/tag-heuer-f1.jpg',
    rating: 4.8,
    reviews: 67,
    brand: 'TAG Heuer',
    category: 'Watches',
    inStock: true,
    fastShipping: true,
    partner: 'shareasale',
    affiliateUrl: 'https://shareasale.com/r.cfm?b=123456&u=grandprix&m=12345',
    description: 'Official Formula 1 branded luxury chronograph watch',
    embedType: 'redirect',
    commission: '8%'
  },
  {
    id: 'sas-racing-simulator',
    name: 'F1 Racing Simulator Setup',
    price: 2499.99,
    image: '/merchandise/f1-simulator.jpg',
    rating: 4.9,
    reviews: 45,
    brand: 'SimRacing Pro',
    category: 'Gaming',
    inStock: true,
    fastShipping: false,
    partner: 'shareasale',
    affiliateUrl: 'https://shareasale.com/r.cfm?b=789012&u=grandprix&m=67890',
    description: 'Professional F1 racing simulator with wheel and pedals',
    embedType: 'redirect',
    commission: '12%'
  }
]

// Partner configuration for instant approval programs
export const instantPartnerConfig = {
  amazon: {
    name: "Amazon",
    description: "World's largest online marketplace",
    signupUrl: "https://affiliate-program.amazon.com",
    instant: true,
    requirements: "Website with content, 3 sales in 180 days",
    commission: "1-10%",
    cookieDuration: "24 hours",
    paymentMinimum: "$10",
    embedSupport: true
  },
  clickbank: {
    name: "ClickBank",
    description: "Digital product marketplace",
    signupUrl: "https://www.clickbank.com/affiliate-network/",
    instant: true,
    requirements: "None - instant approval",
    commission: "1-75%",
    cookieDuration: "60 days",
    paymentMinimum: "$10",
    embedSupport: false
  },
  fiverr: {
    name: "Fiverr",
    description: "Freelance services marketplace",
    signupUrl: "https://affiliates.fiverr.com",
    instant: true,
    requirements: "None - instant approval",
    commission: "$150 CPA or 10% revenue share",
    cookieDuration: "30 days",
    paymentMinimum: "$100",
    embedSupport: true
  },
  shareasale: {
    name: "ShareASale",
    description: "Affiliate network with thousands of merchants",
    signupUrl: "https://www.shareasale.com/shareasale.cfm?flag=1",
    instant: false,
    requirements: "Website review (usually approved quickly)",
    commission: "Varies by merchant",
    cookieDuration: "Varies",
    paymentMinimum: "$50",
    embedSupport: true
  },
  systeme: {
    name: "Systeme.io",
    description: "All-in-one marketing platform",
    signupUrl: "https://systeme.io/affiliate",
    instant: true,
    requirements: "None - instant approval",
    commission: "30% recurring",
    cookieDuration: "365 days",
    paymentMinimum: "$50",
    embedSupport: false
  }
}