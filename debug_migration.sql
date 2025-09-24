-- Debug script to identify migration issues
-- Run this in your Supabase SQL Editor to see exactly what failed

-- Check 1: Users table
SELECT 
    'users table exists' as check_name,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') 
        THEN 'Table created successfully'
        ELSE 'Need to create users table'
    END as action_needed;

-- Check 2: Watch channels table
SELECT 
    'watch_channels table exists' as check_name,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'watch_channels') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'watch_channels') 
        THEN 'Table created successfully'
        ELSE 'Need to create watch_channels table'
    END as action_needed;

-- Check 3: Events table
SELECT 
    'events table exists' as check_name,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'events') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'events') 
        THEN 'Table created successfully'
        ELSE 'Need to create events table'
    END as action_needed;

-- Check 4: Sync log table
SELECT 
    'sync_log table exists' as check_name,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sync_log') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sync_log') 
        THEN 'Table created successfully'
        ELSE 'Need to create sync_log table'
    END as action_needed;

-- Check 5: Functions
SELECT 
    'cleanup function exists' as check_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'cleanup_expired_watch_channels') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'cleanup_expired_watch_channels') 
        THEN 'Function created successfully'
        ELSE 'Need to create cleanup_expired_watch_channels function'
    END as action_needed;

-- Check 6: Triggers
SELECT 
    'user signup trigger exists' as check_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') 
        THEN 'Trigger created successfully'
        ELSE 'Need to create on_auth_user_created trigger'
    END as action_needed;

-- Check 7: Users table columns
SELECT 
    'users table columns' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name IN ('google_access_token', 'google_refresh_token', 'google_calendar_connected')
        ) 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name IN ('google_access_token', 'google_refresh_token', 'google_calendar_connected')
        ) 
        THEN 'Google Calendar columns added successfully'
        ELSE 'Need to add Google Calendar columns to users table'
    END as action_needed;

-- Check 8: RLS policies
SELECT 
    'users RLS enabled' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE tablename = 'users' AND rowsecurity = true
        ) 
        THEN '✅ ENABLED' 
        ELSE '❌ DISABLED' 
    END as status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE tablename = 'users' AND rowsecurity = true
        ) 
        THEN 'RLS enabled successfully'
        ELSE 'Need to enable RLS on users table'
    END as action_needed;

-- Show current table structure if users table exists
SELECT 'Current users table structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Show any error messages from the last operation
SELECT 'Last operation status:' as info;
SELECT 'If you see any error messages above, those need to be addressed' as guidance;
