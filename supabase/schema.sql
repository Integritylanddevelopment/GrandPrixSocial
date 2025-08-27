-- Grand Prix Social Database Schema
-- Created for F1 Cafe, News, Fantasy Formula, and Schedule functionality

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar TEXT,
  favorite_team TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Teams table for F1 teams
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  logo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Posts table for F1 Cafe
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  images JSONB,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Post comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Post likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

-- News articles table
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  author TEXT,
  source_url TEXT UNIQUE,
  source_name TEXT,
  category TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  priority TEXT DEFAULT 'medium',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fantasy Formula leagues table
CREATE TABLE IF NOT EXISTS public.fantasy_leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  season_year INTEGER NOT NULL,
  is_public BOOLEAN DEFAULT false,
  max_participants INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fantasy Formula teams/lineups table
CREATE TABLE IF NOT EXISTS public.fantasy_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES public.fantasy_leagues(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  drivers JSONB NOT NULL DEFAULT '[]'::jsonb,
  constructor TEXT,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, league_id)
);

-- F1 Schedule/races table
CREATE TABLE IF NOT EXISTS public.f1_races (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_year INTEGER NOT NULL,
  round INTEGER NOT NULL,
  race_name TEXT NOT NULL,
  circuit_name TEXT NOT NULL,
  circuit_location TEXT NOT NULL,
  race_date TIMESTAMP WITH TIME ZONE NOT NULL,
  practice1_date TIMESTAMP WITH TIME ZONE,
  practice2_date TIMESTAMP WITH TIME ZONE,
  practice3_date TIMESTAMP WITH TIME ZONE,
  qualifying_date TIMESTAMP WITH TIME ZONE,
  sprint_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'scheduled', -- scheduled, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default F1 teams
INSERT INTO public.teams (name, color, logo) VALUES
  ('Red Bull Racing', '#1E41FF', 'redbull-logo.png'),
  ('Mercedes', '#00D2BE', 'mercedes-logo.png'),
  ('Ferrari', '#DC143C', 'ferrari-logo.png'),
  ('McLaren', '#FF8700', 'mclaren-logo.png'),
  ('Alpine', '#0090FF', 'alpine-logo.png'),
  ('AlphaTauri', '#2B4562', 'alphatauri-logo.png'),
  ('Aston Martin', '#006F62', 'astonmartin-logo.png'),
  ('Williams', '#005AFF', 'williams-logo.png'),
  ('Alfa Romeo', '#900000', 'alfaromeo-logo.png'),
  ('Haas', '#FFFFFF', 'haas-logo.png')
ON CONFLICT (name) DO NOTHING;

-- Row Level Security Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fantasy_leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fantasy_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.f1_races ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Teams policies (read-only for most users)
CREATE POLICY "Teams are viewable by everyone" ON public.teams FOR SELECT USING (true);

-- Posts policies
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can insert own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = author_id);

-- Post comments policies
CREATE POLICY "Comments are viewable by everyone" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete own comments" ON public.post_comments FOR DELETE USING (auth.uid() = author_id);

-- Post likes policies
CREATE POLICY "Likes are viewable by everyone" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- News articles policies (read-only for users, admin insert/update)
CREATE POLICY "News articles are viewable by everyone" ON public.news_articles FOR SELECT USING (true);

-- Fantasy leagues policies
CREATE POLICY "Leagues are viewable by everyone" ON public.fantasy_leagues FOR SELECT USING (true);
CREATE POLICY "Users can create leagues" ON public.fantasy_leagues FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own leagues" ON public.fantasy_leagues FOR UPDATE USING (auth.uid() = creator_id);

-- Fantasy teams policies
CREATE POLICY "Fantasy teams are viewable by league members" ON public.fantasy_teams FOR SELECT USING (true);
CREATE POLICY "Users can insert own fantasy teams" ON public.fantasy_teams FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fantasy teams" ON public.fantasy_teams FOR UPDATE USING (auth.uid() = user_id);

-- F1 races policies (read-only for users)
CREATE POLICY "F1 races are viewable by everyone" ON public.f1_races FOR SELECT USING (true);

-- Functions and triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER fantasy_teams_updated_at BEFORE UPDATE ON public.fantasy_teams FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER news_articles_updated_at BEFORE UPDATE ON public.news_articles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON public.news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON public.news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_fantasy_teams_league_id ON public.fantasy_teams(league_id);
CREATE INDEX IF NOT EXISTS idx_f1_races_season_year ON public.f1_races(season_year);
CREATE INDEX IF NOT EXISTS idx_f1_races_race_date ON public.f1_races(race_date);

-- Social Media Posts table for F1 content scraping and processing
CREATE TABLE IF NOT EXISTS public.social_media_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL, -- "rss", "twitter", "instagram", "tiktok", "f1-api"
  account_handle TEXT NOT NULL,
  account_type TEXT NOT NULL, -- "news", "gossip", "driver", "team"
  original_post_id TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  author_name TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  category TEXT, -- "breaking", "technical", "transfers", "gossip", "general"
  priority TEXT, -- "breaking", "trending", "regular"
  processed BOOLEAN DEFAULT false,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Monitored accounts for scraping
CREATE TABLE IF NOT EXISTS public.monitored_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  handle TEXT NOT NULL UNIQUE,
  display_name TEXT,
  account_type TEXT NOT NULL,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  scrape_frequency INTEGER DEFAULT 60, -- minutes
  last_scraped TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- F1 processed content for generated articles
CREATE TABLE IF NOT EXISTS public.f1_processed_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_post_id UUID REFERENCES public.social_media_posts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  quality_score FLOAT DEFAULT 0.0,
  semantic_analysis JSONB,
  generated_by TEXT DEFAULT 'qwen3',
  published_status TEXT DEFAULT 'draft', -- "draft", "ready", "published"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Social media posts policies
CREATE POLICY "Social media posts are viewable by everyone" ON public.social_media_posts FOR SELECT USING (true);
CREATE POLICY "System can insert scraped posts" ON public.social_media_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update scraped posts" ON public.social_media_posts FOR UPDATE USING (true);

-- Monitored accounts policies
CREATE POLICY "Monitored accounts are viewable by everyone" ON public.monitored_accounts FOR SELECT USING (true);

-- F1 processed content policies  
CREATE POLICY "Processed content is viewable by everyone" ON public.f1_processed_content FOR SELECT USING (true);
CREATE POLICY "System can insert processed content" ON public.f1_processed_content FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update processed content" ON public.f1_processed_content FOR UPDATE USING (true);

-- Enable RLS on new tables
ALTER TABLE public.social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitored_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.f1_processed_content ENABLE ROW LEVEL SECURITY;

-- Indexes for performance on new tables
CREATE INDEX IF NOT EXISTS idx_social_media_posts_processed ON public.social_media_posts(processed);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_category ON public.social_media_posts(category);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_priority ON public.social_media_posts(priority);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_published_at ON public.social_media_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_monitored_accounts_platform ON public.monitored_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_monitored_accounts_active ON public.monitored_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_f1_processed_content_status ON public.f1_processed_content(published_status);

-- Triggers for updated_at on new tables
CREATE TRIGGER f1_processed_content_updated_at BEFORE UPDATE ON public.f1_processed_content FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();