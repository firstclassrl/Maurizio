-- Step-by-step Google Calendar Sync Migration
-- Run each section one by one in your Supabase SQL Editor

-- ========================================
-- STEP 1: Create users table
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    google_access_token TEXT,
    google_refresh_token TEXT,
    google_token_expiry TIMESTAMP WITH TIME ZONE,
    google_calendar_connected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Google Calendar columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'google_access_token') THEN
        ALTER TABLE users ADD COLUMN google_access_token TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'google_refresh_token') THEN
        ALTER TABLE users ADD COLUMN google_refresh_token TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'google_token_expiry') THEN
        ALTER TABLE users ADD COLUMN google_token_expiry TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'google_calendar_connected') THEN
        ALTER TABLE users ADD COLUMN google_calendar_connected BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- ========================================
-- STEP 2: Create watch_channels table
-- ========================================
CREATE TABLE IF NOT EXISTS watch_channels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    calendar_id TEXT NOT NULL DEFAULT 'primary',
    channel_id TEXT NOT NULL UNIQUE,
    resource_id TEXT NOT NULL,
    expiration TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 3: Create events table
-- ========================================
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    google_event_id TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT NOT NULL CHECK (source IN ('lex', 'google')),
    sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed', 'conflict')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- STEP 4: Create sync_log table
-- ========================================
CREATE TABLE IF NOT EXISTS sync_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sync_type TEXT NOT NULL CHECK (sync_type IN ('push', 'pull', 'webhook', 'full_resync')),
    status TEXT NOT NULL CHECK (status IN ('success', 'error', 'partial')),
    events_processed INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    error_details JSONB,
    sync_token TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 5: Create indexes
-- ========================================
CREATE INDEX IF NOT EXISTS idx_watch_channels_user_id ON watch_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_channels_expiration ON watch_channels(expiration);
CREATE INDEX IF NOT EXISTS idx_watch_channels_channel_id ON watch_channels(channel_id);

CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_google_event_id ON events(google_event_id);
CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_events_sync_status ON events(sync_status);
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source);
CREATE INDEX IF NOT EXISTS idx_events_last_modified ON events(last_modified);

CREATE INDEX IF NOT EXISTS idx_sync_log_user_id ON sync_log(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_created_at ON sync_log(created_at);
CREATE INDEX IF NOT EXISTS idx_sync_log_sync_type ON sync_log(sync_type);

-- ========================================
-- STEP 6: Enable RLS
-- ========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 7: Create RLS policies
-- ========================================
-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Watch channels policies
CREATE POLICY "Users can manage their own watch channels" ON watch_channels
    FOR ALL USING (auth.uid() = user_id);

-- Events policies
CREATE POLICY "Users can view their own events" ON events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events" ON events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" ON events
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" ON events
    FOR DELETE USING (auth.uid() = user_id);

-- Sync log policies
CREATE POLICY "Users can view their own sync logs" ON sync_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert sync logs" ON sync_log
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update sync logs" ON sync_log
    FOR UPDATE WITH CHECK (true);

-- ========================================
-- STEP 8: Create utility functions
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- STEP 9: Create triggers
-- ========================================
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watch_channels_updated_at 
    BEFORE UPDATE ON watch_channels 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- User signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- STEP 10: Create sync utility functions
-- ========================================
CREATE OR REPLACE FUNCTION cleanup_expired_watch_channels()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM watch_channels 
    WHERE expiration < NOW() - INTERVAL '1 day';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_sync_status(user_uuid UUID)
RETURNS TABLE (
    google_connected BOOLEAN,
    active_watch_channels INTEGER,
    pending_events INTEGER,
    last_sync TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.google_calendar_connected,
        COUNT(wc.id)::INTEGER as active_channels,
        COUNT(e.id)::INTEGER as pending_events,
        MAX(sl.completed_at) as last_sync
    FROM users u
    LEFT JOIN watch_channels wc ON u.id = wc.user_id AND wc.expiration > NOW()
    LEFT JOIN events e ON u.id = e.user_id AND e.sync_status = 'pending'
    LEFT JOIN sync_log sl ON u.id = sl.user_id
    WHERE u.id = user_uuid
    GROUP BY u.id, u.google_calendar_connected;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 11: Create sync dashboard view
-- ========================================
CREATE OR REPLACE VIEW sync_dashboard AS
SELECT 
    u.id as user_id,
    u.email,
    u.google_calendar_connected,
    COUNT(DISTINCT wc.id) as active_channels,
    COUNT(DISTINCT CASE WHEN e.sync_status = 'pending' THEN e.id END) as pending_events,
    COUNT(DISTINCT CASE WHEN e.sync_status = 'failed' THEN e.id END) as failed_events,
    MAX(sl.completed_at) as last_sync,
    MAX(wc.expiration) as next_channel_renewal
FROM users u
LEFT JOIN watch_channels wc ON u.id = wc.user_id AND wc.expiration > NOW()
LEFT JOIN events e ON u.id = e.user_id
LEFT JOIN sync_log sl ON u.id = sl.user_id
WHERE u.google_calendar_connected = TRUE
GROUP BY u.id, u.email, u.google_calendar_connected;

-- ========================================
-- STEP 12: Grant permissions
-- ========================================
GRANT ALL ON users TO service_role;
GRANT ALL ON watch_channels TO service_role;
GRANT ALL ON events TO service_role;
GRANT ALL ON sync_log TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_expired_watch_channels() TO service_role;
GRANT EXECUTE ON FUNCTION get_user_sync_status(UUID) TO service_role;

-- ========================================
-- STEP 13: Final verification
-- ========================================
SELECT 'Migration completed successfully!' as status;
SELECT 'All tables, functions, and policies have been created.' as message;
