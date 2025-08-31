-- User Interactions Table (for Qwen3 training data)
CREATE TABLE IF NOT EXISTS public.user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL, -- 'view', 'click', 'like', 'comment', 'share', 'scroll', 'search', 'navigation'
  content_id TEXT, -- Reference to article, post, etc.
  content_type TEXT NOT NULL, -- 'article', 'post', 'comment', 'page', 'element'
  metadata JSONB DEFAULT '{}'::jsonb,
  engagement_score INTEGER DEFAULT 0, -- 0-10 calculated engagement score
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_content_id ON public.user_interactions(content_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON public.user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON public.user_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_session ON public.user_interactions(session_id);

-- Content Performance Table (tracks article/post performance)
CREATE TABLE IF NOT EXISTS public.content_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id TEXT UNIQUE NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'article',
  views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  avg_time_on_page INTEGER DEFAULT 0, -- in milliseconds
  bounce_rate DECIMAL(5,2) DEFAULT 0.00,
  scroll_depth INTEGER DEFAULT 0, -- average scroll depth percentage
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  click_through_rate DECIMAL(5,2) DEFAULT 0.00,
  performance_score DECIMAL(5,2) DEFAULT 0.00, -- 0-100 overall score
  user_feedback JSONB DEFAULT '{"positive": 0, "negative": 0, "neutral": 0}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_performance_content_id ON public.content_performance(content_id);
CREATE INDEX IF NOT EXISTS idx_content_performance_score ON public.content_performance(performance_score DESC);
CREATE INDEX IF NOT EXISTS idx_content_performance_updated ON public.content_performance(updated_at DESC);

-- User Preferences Table (for personalized AI content)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferences JSONB DEFAULT '{
    "favoriteTopics": [],
    "preferredContentLength": "medium",
    "engagementPatterns": {
      "bestTimeToRead": [],
      "preferredCategories": [],
      "interactionStyle": "reader"
    },
    "f1Interests": {
      "favoriteDrivers": [],
      "favoriteTeams": [],
      "techInterest": 5,
      "gossipInterest": 5,
      "newsInterest": 5
    }
  }'::jsonb,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Training Dataset Table (processed data for Qwen3 fine-tuning)
CREATE TABLE IF NOT EXISTS public.qwen_training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL,
  original_content TEXT NOT NULL,
  user_feedback_summary JSONB NOT NULL,
  performance_metrics JSONB NOT NULL,
  training_prompt TEXT NOT NULL, -- Generated training prompt
  expected_output TEXT NOT NULL, -- High-performing content as training target
  training_score DECIMAL(5,2) NOT NULL, -- 0-100, how good this training example is
  content_category TEXT,
  f1_entities JSONB DEFAULT '[]'::jsonb,
  user_engagement_patterns JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  processed_for_training BOOLEAN DEFAULT false,
  training_batch_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_qwen_training_content_id ON public.qwen_training_data(content_id);
CREATE INDEX IF NOT EXISTS idx_qwen_training_score ON public.qwen_training_data(training_score DESC);
CREATE INDEX IF NOT EXISTS idx_qwen_training_processed ON public.qwen_training_data(processed_for_training);
CREATE INDEX IF NOT EXISTS idx_qwen_training_batch ON public.qwen_training_data(training_batch_id);

-- Enable Row Level Security
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qwen_training_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow authenticated users to read their own data)
CREATE POLICY "Users can view their own interactions" ON public.user_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own interactions" ON public.user_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Content performance is viewable by everyone" ON public.content_performance FOR SELECT USING (true);
CREATE POLICY "Service role can manage content performance" ON public.content_performance FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Training data is viewable by service role only" ON public.qwen_training_data FOR ALL USING (auth.role() = 'service_role');