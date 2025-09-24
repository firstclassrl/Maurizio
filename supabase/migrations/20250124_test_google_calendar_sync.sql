-- Test script for Google Calendar Sync migration
-- This script tests that all tables and functions were created correctly

-- Test 1: Check if users table exists and has correct structure
SELECT 
    'users table' as test_name,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as status;

-- Test 2: Check if watch_channels table exists
SELECT 
    'watch_channels table' as test_name,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'watch_channels') 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as status;

-- Test 3: Check if events table exists
SELECT 
    'events table' as test_name,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'events') 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as status;

-- Test 4: Check if sync_log table exists
SELECT 
    'sync_log table' as test_name,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sync_log') 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as status;

-- Test 5: Check if users table has Google Calendar columns
SELECT 
    'users google columns' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name IN ('google_access_token', 'google_refresh_token', 'google_calendar_connected')
        ) 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as status;

-- Test 6: Check if functions exist
SELECT 
    'cleanup function' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'cleanup_expired_watch_channels'
        ) 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as status;

SELECT 
    'sync status function' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'get_user_sync_status'
        ) 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as status;

-- Test 7: Check if triggers exist
SELECT 
    'user signup trigger' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_name = 'on_auth_user_created'
        ) 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as status;

-- Test 8: Check if views exist
SELECT 
    'sync dashboard view' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.views 
            WHERE table_name = 'sync_dashboard'
        ) 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as status;

-- Test 9: Check RLS policies
SELECT 
    'users RLS enabled' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE tablename = 'users' AND rowsecurity = true
        ) 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as status;

-- Test 10: Check service role permissions
SELECT 
    'service role permissions' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_privileges 
            WHERE grantee = 'service_role' 
            AND table_name IN ('users', 'watch_channels', 'events', 'sync_log')
        ) 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as status;

-- Summary query
SELECT 
    'MIGRATION SUMMARY' as summary,
    COUNT(*) as total_tests,
    COUNT(*) FILTER (WHERE status = 'PASS') as passed_tests,
    COUNT(*) FILTER (WHERE status = 'FAIL') as failed_tests
FROM (
    SELECT 'users table' as test_name, CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN 'PASS' ELSE 'FAIL' END as status
    UNION ALL
    SELECT 'watch_channels table' as test_name, CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'watch_channels') THEN 'PASS' ELSE 'FAIL' END as status
    UNION ALL
    SELECT 'events table' as test_name, CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'events') THEN 'PASS' ELSE 'FAIL' END as status
    UNION ALL
    SELECT 'sync_log table' as test_name, CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sync_log') THEN 'PASS' ELSE 'FAIL' END as status
    UNION ALL
    SELECT 'functions created' as test_name, CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name IN ('cleanup_expired_watch_channels', 'get_user_sync_status')) THEN 'PASS' ELSE 'FAIL' END as status
    UNION ALL
    SELECT 'triggers created' as test_name, CASE WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') THEN 'PASS' ELSE 'FAIL' END as status
) as test_results;
