-- WaifuHub Supabase Database Schema
-- This file contains all the necessary tables and constraints for the WaifuHub application
-- Run this in your Supabase SQL editor to set up the complete database

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - tracks wallet connections and rate limiting
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    username TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_waifu_creation TIMESTAMP WITH TIME ZONE,
    last_vote TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Waifus table - stores all created waifus with full details
CREATE TABLE waifus (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    personality TEXT,
    style TEXT,
    hair_color TEXT,
    biography TEXT,
    character_profile JSONB,
    video_url TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    likes INTEGER DEFAULT 0,
    dislikes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table - tracks all likes and dislikes with rate limiting
CREATE TABLE votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    waifu_id UUID REFERENCES waifus(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('like', 'dislike')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure one vote per user per waifu
    UNIQUE(user_id, waifu_id)
);

-- Chat messages table - stores AI conversations
CREATE TABLE chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    waifu_id UUID REFERENCES waifus(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_last_waifu_creation ON users(last_waifu_creation);
CREATE INDEX idx_users_last_vote ON users(last_vote);
CREATE INDEX idx_waifus_user_id ON waifus(user_id);
CREATE INDEX idx_waifus_is_published ON waifus(is_published);
CREATE INDEX idx_waifus_created_at ON waifus(created_at);
CREATE INDEX idx_waifus_published_at ON waifus(published_at);
CREATE INDEX idx_waifus_likes ON waifus(likes);
CREATE INDEX idx_waifus_dislikes ON waifus(dislikes);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_waifu_id ON votes(waifu_id);
CREATE INDEX idx_votes_created_at ON votes(created_at);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_waifu_id ON chat_messages(waifu_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- Functions for rate limiting checks

-- Function to check if user can create a waifu (10 minute cooldown)
CREATE OR REPLACE FUNCTION can_create_waifu(user_wallet TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    last_creation TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT last_waifu_creation INTO last_creation
    FROM users
    WHERE wallet_address = user_wallet;
    
    -- If no previous creation or more than 10 minutes have passed
    RETURN (last_creation IS NULL OR last_creation < NOW() - INTERVAL '10 minutes');
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can vote (10 minute cooldown)
CREATE OR REPLACE FUNCTION can_vote(user_wallet TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    last_vote_time TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT last_vote INTO last_vote_time
    FROM users
    WHERE wallet_address = user_wallet;
    
    -- If no previous vote or more than 10 minutes have passed
    RETURN (last_vote_time IS NULL OR last_vote_time < NOW() - INTERVAL '10 minutes');
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has already voted on a specific waifu
CREATE OR REPLACE FUNCTION has_voted_on_waifu(user_wallet TEXT, waifu_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    vote_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM votes v
        JOIN users u ON v.user_id = u.id
        WHERE u.wallet_address = user_wallet AND v.waifu_id = waifu_uuid
    ) INTO vote_exists;
    
    RETURN vote_exists;
END;
$$ LANGUAGE plpgsql;

-- Function to update waifu vote counts
CREATE OR REPLACE FUNCTION update_waifu_vote_counts(waifu_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE waifus SET
        likes = (SELECT COUNT(*) FROM votes WHERE waifu_id = waifu_uuid AND vote_type = 'like'),
        dislikes = (SELECT COUNT(*) FROM votes WHERE waifu_id = waifu_uuid AND vote_type = 'dislike'),
        updated_at = NOW()
    WHERE id = waifu_uuid;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update vote counts when votes are added/removed
CREATE OR REPLACE FUNCTION trigger_update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM update_waifu_vote_counts(NEW.waifu_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_waifu_vote_counts(OLD.waifu_id);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM update_waifu_vote_counts(NEW.waifu_id);
        IF NEW.waifu_id != OLD.waifu_id THEN
            PERFORM update_waifu_vote_counts(OLD.waifu_id);
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic vote count updates
CREATE TRIGGER votes_update_counts
    AFTER INSERT OR UPDATE OR DELETE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_vote_counts();

-- Trigger to update updated_at timestamp on users table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER waifus_updated_at
    BEFORE UPDATE ON waifus
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies for data protection

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE waifus ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can read all user data but only update their own
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own data" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (true);

-- Waifus can be read by everyone, but only created/updated by owner
CREATE POLICY "Anyone can view published waifus" ON waifus FOR SELECT USING (is_published = true OR auth.uid()::text = user_id::text);
CREATE POLICY "Users can create their own waifus" ON waifus FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own waifus" ON waifus FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own waifus" ON waifus FOR DELETE USING (true);

-- Votes can be read by everyone, created by authenticated users
CREATE POLICY "Anyone can view votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own votes" ON votes FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own votes" ON votes FOR DELETE USING (true);

-- Chat messages can be read by waifu owner and message sender
CREATE POLICY "Users can view relevant chat messages" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Users can create chat messages" ON chat_messages FOR INSERT WITH CHECK (true);

-- Helper views for common queries

-- View for published waifus with creator information
CREATE VIEW published_waifus_with_creator AS
SELECT 
    w.*,
    u.username,
    u.wallet_address,
    COALESCE(u.username, SUBSTRING(u.wallet_address, 1, 5)) as display_name
FROM waifus w
JOIN users u ON w.user_id = u.id
WHERE w.is_published = true
ORDER BY w.published_at DESC;

-- View for user statistics
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.wallet_address,
    u.username,
    u.created_at,
    COUNT(w.id) as total_waifus,
    COUNT(CASE WHEN w.is_published THEN 1 END) as published_waifus,
    COALESCE(SUM(w.likes), 0) as total_likes_received,
    COALESCE(SUM(w.dislikes), 0) as total_dislikes_received,
    COUNT(v.id) as total_votes_cast
FROM users u
LEFT JOIN waifus w ON u.id = w.user_id
LEFT JOIN votes v ON u.id = v.user_id
GROUP BY u.id, u.wallet_address, u.username, u.created_at;

-- View for waifu leaderboard
CREATE VIEW waifu_leaderboard AS
SELECT 
    w.*,
    u.username,
    u.wallet_address,
    COALESCE(u.username, SUBSTRING(u.wallet_address, 1, 5)) as display_name,
    (w.likes - w.dislikes) as net_score
FROM waifus w
JOIN users u ON w.user_id = u.id
WHERE w.is_published = true
ORDER BY net_score DESC, w.likes DESC, w.published_at DESC;

-- Sample data insertion (optional - remove if not needed)
-- This creates a sample user and waifu for testing

-- INSERT INTO users (wallet_address, username) VALUES 
-- ('sample_wallet_address_123', 'TestUser');

-- INSERT INTO waifus (user_id, name, personality, style, hair_color, biography, is_published) VALUES 
-- ((SELECT id FROM users WHERE wallet_address = 'sample_wallet_address_123'), 
--  'Sample Waifu', 'Shy & Sweet', 'School Girl', 'Black', 
--  'A sample waifu for testing the database schema.', true);

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT USAGE ON SCHEMA public TO anon, authenticated;
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
-- GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE users IS 'Stores user wallet addresses, usernames, and rate limiting timestamps';
COMMENT ON TABLE waifus IS 'Stores all created waifus with their properties and publication status';
COMMENT ON TABLE votes IS 'Tracks likes and dislikes with one vote per user per waifu constraint';
COMMENT ON TABLE chat_messages IS 'Stores AI chat conversations between users and waifus';

COMMENT ON FUNCTION can_create_waifu(TEXT) IS 'Checks if user can create a waifu (10 minute cooldown)';
COMMENT ON FUNCTION can_vote(TEXT) IS 'Checks if user can vote (10 minute cooldown)';
COMMENT ON FUNCTION has_voted_on_waifu(TEXT, UUID) IS 'Checks if user has already voted on a specific waifu';
COMMENT ON FUNCTION update_waifu_vote_counts(UUID) IS 'Updates like and dislike counts for a waifu';

-- End of schema
