-- Creating core user and profile tables for persistent membership data
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users profile table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fantasy teams table for persistent F1 game data
CREATE TABLE IF NOT EXISTS public.fantasy_teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  team_name TEXT NOT NULL,
  budget_remaining DECIMAL(10,2) DEFAULT 100.00,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fantasy team selections table
CREATE TABLE IF NOT EXISTS public.fantasy_selections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.fantasy_teams(id) ON DELETE CASCADE NOT NULL,
  selection_type TEXT NOT NULL, -- 'driver', 'constructor', 'pit_crew', etc.
  selection_name TEXT NOT NULL,
  selection_price DECIMAL(8,2) NOT NULL,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leaderboard table for persistent rankings
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.fantasy_teams(id) ON DELETE CASCADE NOT NULL,
  total_points INTEGER DEFAULT 0,
  rank INTEGER,
  season_year INTEGER DEFAULT 2025,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fantasy_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fantasy_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policies for data access
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own fantasy teams" ON public.fantasy_teams
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own fantasy teams" ON public.fantasy_teams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fantasy teams" ON public.fantasy_teams
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own selections" ON public.fantasy_selections
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.fantasy_teams WHERE id = team_id));

CREATE POLICY "Users can create own selections" ON public.fantasy_selections
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.fantasy_teams WHERE id = team_id));

CREATE POLICY "Everyone can view leaderboard" ON public.leaderboard
  FOR SELECT TO authenticated;

CREATE POLICY "Users can update own leaderboard entry" ON public.leaderboard
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
