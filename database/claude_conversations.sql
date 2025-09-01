-- Claude Conversations Table
-- Stores all conversations between users and Claude AI interface

CREATE TABLE IF NOT EXISTS claude_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    context JSONB,
    session_id UUID,
    conversation_thread UUID, -- Group related messages in a conversation
    message_type VARCHAR(20) DEFAULT 'chat' CHECK (message_type IN ('chat', 'voice', 'quick_action')),
    user_agent TEXT,
    ip_address INET,
    response_time_ms INTEGER, -- How long Claude took to respond
    llm_model VARCHAR(50) DEFAULT 'qwen2.5:7b',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_claude_conversations_user_id ON claude_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_claude_conversations_created_at ON claude_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_claude_conversations_session_id ON claude_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_claude_conversations_thread ON claude_conversations(conversation_thread);

-- RLS policies
ALTER TABLE claude_conversations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own conversations
CREATE POLICY "Users can view own conversations" ON claude_conversations
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own conversations
CREATE POLICY "Users can create own conversations" ON claude_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own conversations (for editing, etc.)
CREATE POLICY "Users can update own conversations" ON claude_conversations
    FOR UPDATE USING (auth.uid() = user_id);

-- Optional: Users can delete their own conversations
CREATE POLICY "Users can delete own conversations" ON claude_conversations
    FOR DELETE USING (auth.uid() = user_id);

-- Service role can do everything (for system operations)
CREATE POLICY "Service role has full access" ON claude_conversations
    FOR ALL USING (current_setting('role') = 'service_role');

-- Function to automatically set conversation thread for new messages
CREATE OR REPLACE FUNCTION set_conversation_thread()
RETURNS TRIGGER AS $$
BEGIN
    -- If no conversation_thread is set, use the message ID as the thread starter
    IF NEW.conversation_thread IS NULL THEN
        NEW.conversation_thread = NEW.id;
    END IF;
    
    -- Update the updated_at timestamp
    NEW.updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set conversation thread
CREATE TRIGGER trigger_set_conversation_thread
    BEFORE INSERT OR UPDATE ON claude_conversations
    FOR EACH ROW
    EXECUTE FUNCTION set_conversation_thread();

-- Function to get conversation statistics
CREATE OR REPLACE FUNCTION get_claude_conversation_stats(user_uuid UUID DEFAULT NULL)
RETURNS TABLE (
    total_conversations BIGINT,
    total_messages BIGINT,
    avg_response_time NUMERIC,
    conversations_today BIGINT,
    most_active_hour INTEGER,
    favorite_topics TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(DISTINCT conversation_thread) as conv_count,
            COUNT(*) as msg_count,
            ROUND(AVG(response_time_ms), 2) as avg_resp_time,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_count,
            EXTRACT(HOUR FROM created_at) as hour_of_day
        FROM claude_conversations 
        WHERE (user_uuid IS NULL OR user_id = user_uuid)
        GROUP BY EXTRACT(HOUR FROM created_at)
    ),
    topic_analysis AS (
        SELECT 
            ARRAY_AGG(DISTINCT 
                CASE 
                    WHEN LOWER(message) LIKE '%fantasy%' THEN 'Fantasy F1'
                    WHEN LOWER(message) LIKE '%race%' OR LOWER(message) LIKE '%grand prix%' THEN 'Race Discussion'
                    WHEN LOWER(message) LIKE '%driver%' THEN 'Driver Analysis'
                    WHEN LOWER(message) LIKE '%team%' THEN 'Team Strategy'
                    WHEN LOWER(message) LIKE '%schedule%' THEN 'Race Schedule'
                    ELSE 'General F1'
                END
            ) as topics
        FROM claude_conversations 
        WHERE (user_uuid IS NULL OR user_id = user_uuid)
    )
    SELECT 
        COALESCE(MAX(conv_count), 0),
        COALESCE(SUM(msg_count), 0),
        COALESCE(AVG(avg_resp_time), 0),
        COALESCE(SUM(today_count), 0),
        COALESCE((SELECT hour_of_day FROM stats ORDER BY msg_count DESC LIMIT 1), 0)::INTEGER,
        COALESCE((SELECT topics FROM topic_analysis), ARRAY[]::TEXT[])
    FROM stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old conversations (optional, for privacy)
CREATE OR REPLACE FUNCTION cleanup_old_conversations()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete conversations older than 1 year
    DELETE FROM claude_conversations 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helpful comments
COMMENT ON TABLE claude_conversations IS 'Stores all conversations between users and the Claude AI interface';
COMMENT ON COLUMN claude_conversations.context IS 'JSON context like page location, user type, session info';
COMMENT ON COLUMN claude_conversations.conversation_thread IS 'Groups related messages in the same conversation session';
COMMENT ON COLUMN claude_conversations.response_time_ms IS 'Time in milliseconds for Claude to generate response';
COMMENT ON FUNCTION get_claude_conversation_stats IS 'Returns conversation statistics for analytics dashboard';
COMMENT ON FUNCTION cleanup_old_conversations IS 'Removes conversations older than 1 year for privacy compliance';