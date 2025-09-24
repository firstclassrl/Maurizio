-- Test the Google Calendar Sync migration
-- Run this in your Supabase SQL Editor

-- First, let's check if we can create the users table
SELECT 'Testing users table creation...' as status;

-- Create users table if it doesn't exist
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

SELECT 'Users table created successfully!' as status;

-- Test creating a sample user record (this will only work if you have auth.users)
DO $$
BEGIN
    -- Try to insert a test user record
    INSERT INTO users (id, email, full_name, google_calendar_connected)
    VALUES (
        gen_random_uuid(),
        'test@example.com',
        'Test User',
        false
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Test user record created successfully!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not create test user record: %', SQLERRM;
END $$;

-- Check if the table structure is correct
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

SELECT 'Migration test completed successfully!' as final_status;
