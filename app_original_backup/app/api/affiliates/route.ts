import { NextResponse } from "next/server"

// Mock affiliate networks - in production, these would be real affiliate APIs
const AFFILIATE_NETWORKS = {
  fueler: {
    name: "Fueler",
    baseUrl: "https://fueler.com/affiliate",
    commission: 8,
    categories: ["apparel", "accessories", "collectibles"],
  },
  "fuel-for-fans": {
    name: "Fuel for Fans",
    baseUrl: "https://fuelforfans.com/partner",
    commission: 12,
    categories: ["team-gear", "memorabilia", "signed-items"],
  },
  "f1-store": {
    name: "Official F1 Store",
    baseUrl: "https://f1store.formula1.com/partner",
    commission: 6,
    categories: ["official-merchandise", "team-items", "accessories"],
  },
  "motorsport-merch": {
    name: "Motorsport Merchandise",
    baseUrl: "https://motorsportmerch.com/affiliate",
    commission: 10,
    categories: ["vintage", "collectibles", "racing-gear"],
  },
  "racing-republic": {
    name: "Racing Republic",
    baseUrl: "https://racingrepublic.com/partners",
    commission: 15,
    categories: ["premium-items", "limited-edition", "luxury"],
  },
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const network = searchParams.get("network")

    let affiliateProducts = []

    // Mock affiliate products - in production, these would come from real affiliate APIs
    const mockProducts = [
      {
        id: "aff-001",
        name: "Ferrari Team Polo Shirt 2024",
        price: 8999, // $89.99
        originalPrice: 10999,
        imageUrl: "/ferrari-polo-shirt.png",
        description: "Official Ferrari team polo shirt with moisture-wicking fabric",
        category: "apparel",
        network: "fueler",
        affiliateUrl: "https://fueler.com/affiliate/ferrari-polo-2024",
        commission: 8,
        inStock: true,
        rating: 4.8,
        reviews: 156,
      },
      {
        id: "aff-002",
        name: "Red Bull Racing Cap",
        price: 3999,
        originalPrice: 4999,
        imageUrl: "/red-bull-racing-cap.png",
        description: "Official Red Bull Racing team cap with adjustable strap",
        category: "accessories",
        network: "fuel-for-fans",
        affiliateUrl: "https://fuelforfans.com/partner/redbull-cap",
        commission: 12,
        inStock: true,
        rating: 4.6,
        reviews: 89,
      },
      {
        id: "aff-003",
        name: "McLaren Team Jacket",
        price: 15999,
        originalPrice: 19999,
        imageUrl: "/mclaren-team-jacket.png",
        description: "Premium McLaren team jacket with wind-resistant material",
        category: "apparel",
        network: "f1-store",
        affiliateUrl: "https://f1store.formula1.com/partner/mclaren-jacket",
        commission: 6,
        inStock: true,
        rating: 4.9,
        reviews: 234,
      },
      {
        id: "aff-004",
        name: "Vintage Ayrton Senna Helmet Replica",
        price: 29999,
        originalPrice: 34999,
        imageUrl: "/senna-inspired-helmet.png",
        description: "Limited edition Ayrton Senna helmet replica with certificate",
        category: "collectibles",
        network: "motorsport-merch",
        affiliateUrl: "https://motorsportmerch.com/affiliate/senna-helmet",
        commission: 10,
        inStock: true,
        rating: 5.0,
        reviews: 45,
      },
      {
        id: "aff-005",
        name: "Mercedes AMG F1 Watch",
        price: 45999,
        originalPrice: 52999,
        imageUrl: "/mercedes-f1-watch.png",
        description: "Luxury Mercedes AMG F1 team watch with Swiss movement",
        category: "luxury",
        network: "racing-republic",
        affiliateUrl: "https://racingrepublic.com/partners/mercedes-watch",
        commission: 15,
        inStock: true,
        rating: 4.7,
        reviews: 67,
      },
    ]

    // Filter products based on query parameters
    affiliateProducts = mockProducts.filter((product) => {
      if (category && product.category !== category) return false
      if (network && product.network !== network) return false
      return true
    })

    return NextResponse.json({
      success: true,
      products: affiliateProducts,
      networks: AFFILIATE_NETWORKS,
      total: affiliateProducts.length,
    })
  } catch (error) {
    console.error("Error fetching affiliate products:", error)
    return NextResponse.json({ error: "Failed to fetch affiliate products" }, { status: 500 })
  }
}
