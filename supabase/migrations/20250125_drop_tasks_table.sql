-- Migration to drop the tasks table as it's no longer needed
-- The new system uses 'practices' and 'activities' tables

-- Drop RLS policies for tasks table
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;

-- Drop indexes for tasks table
DROP INDEX IF EXISTS idx_tasks_user_id;
DROP INDEX IF EXISTS idx_tasks_pratica;
DROP INDEX IF EXISTS idx_tasks_scadenza;
DROP INDEX IF EXISTS idx_tasks_categoria;
DROP INDEX IF EXISTS idx_tasks_stato;
DROP INDEX IF EXISTS idx_tasks_urgent;

-- Drop the tasks table
DROP TABLE IF EXISTS tasks;

-- Verify the table has been dropped
SELECT 
    'Tasks table dropped successfully' as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') 
        THEN 'ERROR: Tasks table still exists'
        ELSE 'SUCCESS: Tasks table removed'
    END as verification;
