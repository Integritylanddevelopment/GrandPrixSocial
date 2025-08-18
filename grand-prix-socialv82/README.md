# Grand Prix Social

A comprehensive Formula 1 social platform built with Next.js 15, featuring real-time race tracking, fantasy leagues, social media integration, and F1 merchandise marketplace.

## Features

### Racing Features
- **Live Race Tracking** - Real-time race data and telemetry
- **Driver Statistics** - Comprehensive driver performance analytics
- **Race Calendar** - Complete F1 season schedule with countdown timers
- **Championship Standings** - Live constructor and driver standings
- **Race Results** - Historical and current race data

### Social Platform
- **User Profiles** - Customizable F1 fan profiles
- **Paddock Talk** - Community discussions and forums
- **Social Media Integration** - Connect Instagram, Twitter, TikTok, and YouTube
- **Multi-Platform Posting** - Create and schedule posts across platforms
- **F1 Content Sharing** - Share race highlights, driver updates, and team news

### Gaming & Fantasy
- **Fantasy F1 League** - Build your dream team and compete
- **Racing Challenges** - Weekly and seasonal competitions
- **Leaderboards** - Track your performance against other fans
- **Tournaments** - Special events and competitions

### Merchandise & Affiliate
- **F1 Store Integration** - Official team merchandise
- **Affiliate Program** - Earn commissions on sales
- **Product Recommendations** - Personalized merchandise suggestions
- **Wishlist & Collections** - Save and organize favorite items

### F1 Café
- **News Aggregation** - Latest F1 news from multiple sources
- **Content Discovery** - Trending topics and discussions
- **Expert Analysis** - Professional insights and commentary
- **Race Previews & Reviews** - In-depth race coverage

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom F1 theme
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **APIs**: F1 data integration
- **Real-time**: WebSocket connections for live data

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/Integritylanddevelopment/GrandPrixSocial-zf.git
cd grand-prix-socialv82
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Project Structure

```
grand-prix-socialv82/
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                   # Utility functions and configurations
├── public/                # Static assets
├── hooks/                 # Custom React hooks
├── styles/               # Global styles
└── scripts/              # Database scripts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

<!-- Updated for deployment -->