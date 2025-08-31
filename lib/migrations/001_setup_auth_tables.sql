-- Grand Prix Social Authentication Setup
-- This migration sets up the user tables and authentication system

-- Create users table that syncs with Supabase auth.users
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY, -- matches auth.users.id from Supabase
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  rank INTEGER NOT NULL DEFAULT 0,
  team_id VARCHAR,
  favorite_driver TEXT,
  favorite_team TEXT,
  
  -- AI Consent & Privacy Settings
  ai_consent_given BOOLEAN NOT NULL DEFAULT false,
  ai_consent_date TIMESTAMP,
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
  
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#DC2626',
  logo TEXT,
  sponsor_id VARCHAR,
  captain_id VARCHAR NOT NULL,
  member_count INTEGER NOT NULL DEFAULT 1,
  total_points INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  is_recruiting BOOLEAN NOT NULL DEFAULT true,
  team_level TEXT NOT NULL DEFAULT 'member',
  can_host_events BOOLEAN NOT NULL DEFAULT false,
  can_sell_merch BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id VARCHAR NOT NULL,
  content TEXT NOT NULL,
  images TEXT[],
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  team_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create team_members junction table
CREATE TABLE IF NOT EXISTS team_members (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW() NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  permissions TEXT[] DEFAULT '{}'::TEXT[]
);

-- Create post_likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(post_id, user_id)
);

-- Create post_comments table
CREATE TABLE IF NOT EXISTS post_comments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id VARCHAR,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE users ADD CONSTRAINT fk_users_team FOREIGN KEY (team_id) REFERENCES teams(id);
ALTER TABLE teams ADD CONSTRAINT fk_teams_captain FOREIGN KEY (captain_id) REFERENCES users(id);
ALTER TABLE posts ADD CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users(id);
ALTER TABLE posts ADD CONSTRAINT fk_posts_team FOREIGN KEY (team_id) REFERENCES teams(id);
ALTER TABLE team_members ADD CONSTRAINT fk_team_members_team FOREIGN KEY (team_id) REFERENCES teams(id);
ALTER TABLE team_members ADD CONSTRAINT fk_team_members_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE post_likes ADD CONSTRAINT fk_post_likes_post FOREIGN KEY (post_id) REFERENCES posts(id);
ALTER TABLE post_likes ADD CONSTRAINT fk_post_likes_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE post_comments ADD CONSTRAINT fk_post_comments_post FOREIGN KEY (post_id) REFERENCES posts(id);
ALTER TABLE post_comments ADD CONSTRAINT fk_post_comments_user FOREIGN KEY (user_id) REFERENCES users(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_team_id ON posts(team_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);
  
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- RLS Policies for posts table  
CREATE POLICY "Anyone can view posts" ON posts
  FOR SELECT USING (true);
  
CREATE POLICY "Users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid()::text = author_id);
  
CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (auth.uid()::text = author_id);
  
CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE USING (auth.uid()::text = author_id);

-- RLS Policies for post_likes table
CREATE POLICY "Anyone can view post likes" ON post_likes
  FOR SELECT USING (true);
  
CREATE POLICY "Users can like posts" ON post_likes
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);
  
CREATE POLICY "Users can unlike posts" ON post_likes
  FOR DELETE USING (auth.uid()::text = user_id);

-- RLS Policies for post_comments table
CREATE POLICY "Anyone can view comments" ON post_comments
  FOR SELECT USING (true);
  
CREATE POLICY "Users can create comments" ON post_comments
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);
  
CREATE POLICY "Users can update their own comments" ON post_comments
  FOR UPDATE USING (auth.uid()::text = user_id);
  
CREATE POLICY "Users can delete their own comments" ON post_comments
  FOR DELETE USING (auth.uid()::text = user_id);

-- RLS Policies for teams table
CREATE POLICY "Anyone can view teams" ON teams
  FOR SELECT USING (true);
  
CREATE POLICY "Team captains can update their team" ON teams
  FOR UPDATE USING (auth.uid()::text = captain_id);

-- RLS Policies for team_members table
CREATE POLICY "Anyone can view team members" ON team_members
  FOR SELECT USING (true);
  
CREATE POLICY "Team captains can manage members" ON team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_members.team_id 
      AND teams.captain_id = auth.uid()::text
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_post_comments_updated_at BEFORE UPDATE ON post_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (you can customize this)
INSERT INTO users (
  id, 
  username, 
  email, 
  name, 
  ai_consent_given,
  ai_consent_date,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- placeholder admin ID
  'admin',
  'admin@grandprixsocial.com',
  'Grand Prix Social Admin',
  true,
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Commit the transaction
COMMIT;