# 🏎️ Grand Prix Social

A comprehensive Formula 1 social platform built with Next.js 15, featuring real-time race tracking, fantasy leagues, social media integration, and F1 merchandise marketplace.

## 🚀 Live Demo

**Production**: [https://grand-prix-social-93jzyisaw-togetherwe.vercel.app](https://grand-prix-social-93jzyisaw-togetherwe.vercel.app)

## ✨ Features

### 🏁 Racing Features
- **Live Race Tracking** - Real-time race data and telemetry
- **Driver Statistics** - Comprehensive driver performance analytics
- **Race Calendar** - Complete F1 season schedule with countdown timers
- **Championship Standings** - Live constructor and driver standings
- **Race Results** - Historical and current race data

### 👥 Social Platform
- **User Profiles** - Customizable F1 fan profiles
- **Paddock Talk** - Community discussions and forums
- **Social Media Integration** - Multi-platform posting and sharing
- **F1 Content Sharing** - Share race highlights and analysis

### 🎮 Fantasy & Gaming
- **Fantasy Leagues** - Create and join F1 fantasy competitions
- **Team Builder** - Build your dream F1 team
- **Challenges** - Weekly F1 prediction challenges
- **Leaderboards** - Compete with other F1 fans

### 🛍️ Marketplace
- **F1 Merchandise** - Official team gear and memorabilia
- **Affiliate Program** - Earn from F1 product recommendations
- **Product Reviews** - Community-driven product ratings

### 📱 Additional Features
- **Mobile Responsive** - Optimized for all devices
- **Dark/Light Mode** - Theme switching
- **Real-time Notifications** - Race updates and social alerts
- **Multi-language Support** - Localized content

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern UI component library
- **Radix UI** - Accessible component primitives
- **React Hook Form** - Form handling
- **Lucide React** - Icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **Drizzle ORM** - Type-safe database toolkit
- **PostgreSQL** - Production database
- **Neon Database** - Serverless PostgreSQL

### Deployment & Infrastructure
- **Vercel** - Hosting and deployment
- **GitHub** - Version control and CI/CD
- **Edge Functions** - Serverless API endpoints

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Zod** - Runtime type validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Integritylanddevelopment/GrandPrixSocial-zf.git
   cd GrandPrixSocial-zf
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   DATABASE_URL=your_database_connection_string
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🔧 Configuration

### Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Run the SQL scripts in `/scripts` to set up the database schema
4. Update your environment variables

### Database Schema
The project uses Drizzle ORM for database management. Schema files are located in:
- `lib/schema.ts` - Database schema definitions
- `scripts/` - SQL migration scripts

### API Routes
API endpoints are organized in the `app/api/` directory:
- `/api/f1/` - F1 data endpoints
- `/api/auth/` - Authentication
- `/api/social-media/` - Social features
- `/api/fantasy/` - Fantasy league management

## 📁 Project Structure

```
grand-prix-social/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── profile/           # User profiles
│   ├── teams/             # F1 teams
│   ├── drivers/           # Driver statistics
│   ├── fantasy/           # Fantasy leagues
│   ├── merchandise/       # Marketplace
│   └── ...
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── auth/             # Authentication components
│   ├── racing/           # F1-specific components
│   ├── social/           # Social features
│   └── ...
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase client setup
│   ├── schema.ts         # Database schema
│   ├── utils.ts          # Helper functions
│   └── ...
├── hooks/                # Custom React hooks
├── public/               # Static assets
├── styles/               # Global styles
└── scripts/              # Database scripts
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `DATABASE_URL` | Database connection string | No* |

*Required for database operations in development

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the project: `npm run build`
2. Start the server: `npm run start`
3. Configure your reverse proxy (nginx, Apache, etc.)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Project Wiki](https://github.com/Integritylanddevelopment/GrandPrixSocial-zf/wiki)
- **Issues**: [GitHub Issues](https://github.com/Integritylanddevelopment/GrandPrixSocial-zf/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Integritylanddevelopment/GrandPrixSocial-zf/discussions)

## 🏆 Acknowledgments

- **Formula 1** for the amazing sport that inspired this platform
- **Ergast Developer API** for F1 data
- **OpenF1 API** for real-time telemetry
- **Shadcn/ui** for the beautiful component library
- **Vercel** for hosting and deployment
- **Supabase** for backend services

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

---

Built with ❤️ for the F1 community by [TogetherWe](https://github.com/Integritylanddevelopment)

**Live Demo**: [https://grand-prix-social-93jzyisaw-togetherwe.vercel.app](https://grand-prix-social-93jzyisaw-togetherwe.vercel.app)
