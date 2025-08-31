-- Fix schema alignment between migration and Drizzle schema
-- This migration updates the existing tables to match the Drizzle schema exactly

-- Drop foreign key constraints first
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_team;
ALTER TABLE teams DROP CONSTRAINT IF EXISTS fk_teams_captain;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS fk_posts_author;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS fk_posts_team;
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS fk_team_members_team;
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS fk_team_members_user;
ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS fk_post_likes_post;
ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS fk_post_likes_user;
ALTER TABLE post_comments DROP CONSTRAINT IF EXISTS fk_post_comments_post;
ALTER TABLE post_comments DROP CONSTRAINT IF EXISTS fk_post_comments_user;

-- Update users table to use UUID instead of VARCHAR
ALTER TABLE users ALTER COLUMN id TYPE UUID USING id::UUID;
ALTER TABLE users ALTER COLUMN team_id TYPE UUID USING team_id::UUID;

-- Update teams table
ALTER TABLE teams ALTER COLUMN id TYPE UUID USING id::UUID;
ALTER TABLE teams ALTER COLUMN captain_id TYPE UUID USING captain_id::UUID;

-- Update posts table
ALTER TABLE posts ALTER COLUMN id TYPE UUID USING id::UUID;
ALTER TABLE posts ALTER COLUMN author_id TYPE UUID USING author_id::UUID;
ALTER TABLE posts ALTER COLUMN team_id TYPE UUID USING team_id::UUID;

-- Update team_members table
ALTER TABLE team_members ALTER COLUMN id TYPE UUID USING id::UUID;
ALTER TABLE team_members ALTER COLUMN team_id TYPE UUID USING team_id::UUID;
ALTER TABLE team_members ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- Update post_likes table
ALTER TABLE post_likes ALTER COLUMN id TYPE UUID USING id::UUID;
ALTER TABLE post_likes ALTER COLUMN post_id TYPE UUID USING post_id::UUID;
ALTER TABLE post_likes ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- Update post_comments table
ALTER TABLE post_comments ALTER COLUMN id TYPE UUID USING id::UUID;
ALTER TABLE post_comments ALTER COLUMN post_id TYPE UUID USING post_id::UUID;
ALTER TABLE post_comments ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE post_comments ALTER COLUMN parent_comment_id TYPE UUID USING parent_comment_id::UUID;

-- Re-add foreign key constraints with proper UUID types
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

-- Insert sample F1 teams
INSERT INTO teams (id, name, description, color, captain_id) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Red Bull Racing', 'Official Red Bull Racing team', '#0600EF', '00000000-0000-0000-0000-000000000000'),
  ('22222222-2222-2222-2222-222222222222', 'Ferrari', 'Scuderia Ferrari team', '#DC143C', '00000000-0000-0000-0000-000000000000'),
  ('33333333-3333-3333-3333-333333333333', 'Mercedes', 'Mercedes-AMG Petronas F1 Team', '#00D2BE', '00000000-0000-0000-0000-000000000000'),
  ('44444444-4444-4444-4444-444444444444', 'McLaren', 'McLaren F1 Team', '#FF8700', '00000000-0000-0000-0000-000000000000'),
  ('55555555-5555-5555-5555-555555555555', 'Aston Martin', 'Aston Martin Aramco Cognizant F1 Team', '#006F62', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Insert sample F1 posts for the cafe
INSERT INTO posts (id, author_id, content, team_id, likes, comments) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'What an incredible race at Monza! Max Verstappen showing why he''s the current champion. The wheel-to-wheel racing was absolutely spectacular! 🏁', '11111111-1111-1111-1111-111111111111', 42, 8),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000', 'Ferrari''s strategy today was questionable at best. Charles had the pace but the team let him down again. When will they learn? 😤 #TifosiFrustration', '22222222-2222-2222-2222-222222222222', 89, 23),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '00000000-0000-0000-0000-000000000000', 'George Russell drove brilliantly today! Mercedes is finally finding their form. That overtake on Sainz was pure class 👏', '33333333-3333-3333-3333-333333333333', 67, 15),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '00000000-0000-0000-0000-000000000000', 'Lando P3! McLaren''s upgrades are clearly working. The car looks so much better through the technical sections. Papaya power! 🧡', '44444444-4444-4444-4444-444444444444', 134, 31),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '00000000-0000-0000-0000-000000000000', 'Alonso proving age is just a number! 42 years old and still showing the young guns how it''s done. Legend status confirmed ✨', '55555555-5555-5555-5555-555555555555', 78, 12),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '00000000-0000-0000-0000-000000000000', 'DRS zones were perfect today. Finally some proper battles! The racing was close but fair. This is what F1 should be about 🏎️', null, 45, 9),
  ('99999999-9999-9999-9999-999999999999', '00000000-0000-0000-0000-000000000000', 'Rain forecast for next weekend! Singapore GP could be absolutely wild. Who do you think performs best in wet conditions? 🌧️', null, 92, 18)
ON CONFLICT (id) DO NOTHING;

-- Insert some sample comments
INSERT INTO post_comments (id, post_id, user_id, content) VALUES
  ('cmt11111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'Max was untouchable today! That start was incredible'),
  ('cmt22222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'The championship is basically over now. Nobody can catch Red Bull'),
  ('cmt33333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000', 'Ferrari needs to hire some proper strategists. This is getting embarrassing'),
  ('cmt44444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '00000000-0000-0000-0000-000000000000', 'Mercedes comeback story of the year! Finally competitive again'),
  ('cmt55555-5555-5555-5555-555555555555', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '00000000-0000-0000-0000-000000000000', 'McLaren looking strong for next season. Lando deserves a championship car')
ON CONFLICT (id) DO NOTHING;

-- Update post comment counts
UPDATE posts SET comments = (
  SELECT COUNT(*) FROM post_comments WHERE post_comments.post_id = posts.id
);

-- Commit the transaction
COMMIT;