-- Grand Prix Social Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Create users table that syncs with auth.users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  rank INTEGER NOT NULL DEFAULT 0,
  team_id UUID,
  favorite_driver TEXT,
  favorite_team TEXT,
  
  -- AI Consent & Privacy Settings
  ai_consent_given BOOLEAN NOT NULL DEFAULT false,
  ai_consent_date TIMESTAMP WITH TIME ZONE,
  ai_consent_version TEXT DEFAULT '1.0',
  data_retention_period TEXT DEFAULT '30days',
  ai_features JSONB DEFAULT '{
    "contentPersonalization": false,
    "socialMatching": false,
    "interfaceCustomization": false,
    "behaviorTracking": false,
    "analyticsInsights": false,
    "marketingCommunications": false
  }'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#DC2626',
  logo TEXT,
  sponsor_id UUID,
  captain_id UUID NOT NULL REFERENCES public.users(id),
  member_count INTEGER NOT NULL DEFAULT 1,
  total_points INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  is_recruiting BOOLEAN NOT NULL DEFAULT true,
  team_level TEXT NOT NULL DEFAULT 'member',
  can_host_events BOOLEAN NOT NULL DEFAULT false,
  can_sell_merch BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images TEXT[],
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  team_id UUID REFERENCES public.teams(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create team_members junction table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  permissions TEXT[] DEFAULT '{}'::TEXT[],
  UNIQUE(team_id, user_id)
);

-- Create post_likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(post_id, user_id)
);

-- Create post_comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.post_comments(id),
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add foreign key for users.team_id (after teams table is created)
ALTER TABLE public.users ADD CONSTRAINT fk_users_team FOREIGN KEY (team_id) REFERENCES public.teams(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_team_id ON public.users(team_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_team_id ON public.posts(team_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
DROP POLICY IF EXISTS "users_view_own" ON public.users;
CREATE POLICY "users_view_own" ON public.users
  FOR SELECT USING (auth.uid() = id);
  
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for posts table  
DROP POLICY IF EXISTS "posts_view_all" ON public.posts;
CREATE POLICY "posts_view_all" ON public.posts
  FOR SELECT USING (true);
  
DROP POLICY IF EXISTS "posts_create_own" ON public.posts;
CREATE POLICY "posts_create_own" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);
  
DROP POLICY IF EXISTS "posts_update_own" ON public.posts;
CREATE POLICY "posts_update_own" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);
  
DROP POLICY IF EXISTS "posts_delete_own" ON public.posts;
CREATE POLICY "posts_delete_own" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for post_likes table
DROP POLICY IF EXISTS "post_likes_view_all" ON public.post_likes;
CREATE POLICY "post_likes_view_all" ON public.post_likes
  FOR SELECT USING (true);
  
DROP POLICY IF EXISTS "post_likes_create_own" ON public.post_likes;
CREATE POLICY "post_likes_create_own" ON public.post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
DROP POLICY IF EXISTS "post_likes_delete_own" ON public.post_likes;
CREATE POLICY "post_likes_delete_own" ON public.post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for post_comments table
DROP POLICY IF EXISTS "post_comments_view_all" ON public.post_comments;
CREATE POLICY "post_comments_view_all" ON public.post_comments
  FOR SELECT USING (true);
  
DROP POLICY IF EXISTS "post_comments_create_own" ON public.post_comments;
CREATE POLICY "post_comments_create_own" ON public.post_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
DROP POLICY IF EXISTS "post_comments_update_own" ON public.post_comments;
CREATE POLICY "post_comments_update_own" ON public.post_comments
  FOR UPDATE USING (auth.uid() = user_id);
  
DROP POLICY IF EXISTS "post_comments_delete_own" ON public.post_comments;
CREATE POLICY "post_comments_delete_own" ON public.post_comments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for teams table
DROP POLICY IF EXISTS "teams_view_all" ON public.teams;
CREATE POLICY "teams_view_all" ON public.teams
  FOR SELECT USING (true);
  
DROP POLICY IF EXISTS "teams_update_captain" ON public.teams;
CREATE POLICY "teams_update_captain" ON public.teams
  FOR UPDATE USING (auth.uid() = captain_id);

DROP POLICY IF EXISTS "teams_create_own" ON public.teams;
CREATE POLICY "teams_create_own" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() = captain_id);

-- RLS Policies for team_members table
DROP POLICY IF EXISTS "team_members_view_all" ON public.team_members;
CREATE POLICY "team_members_view_all" ON public.team_members
  FOR SELECT USING (true);
  
DROP POLICY IF EXISTS "team_members_manage_captain" ON public.team_members;
CREATE POLICY "team_members_manage_captain" ON public.team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE teams.id = team_members.team_id 
      AND teams.captain_id = auth.uid()
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS trigger_users_updated_at ON public.users;
CREATE TRIGGER trigger_users_updated_at 
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  
DROP TRIGGER IF EXISTS trigger_post_comments_updated_at ON public.post_comments;
CREATE TRIGGER trigger_post_comments_updated_at 
  BEFORE UPDATE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'F1 Fan'),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8))
  );
  RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Commit changes
COMMIT;