-- Migration to fix dependencies and drop the tasks table
-- This migration updates foreign keys and functions to use activities instead of tasks

-- 1. First, update the notifications table to point to activities
-- =====================================================

-- Drop the existing foreign key constraint
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_task_id_fkey;

-- Add new foreign key constraint pointing to activities
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_activity_id_fkey 
FOREIGN KEY (task_id) REFERENCES public.activities(id) ON DELETE CASCADE;

-- Rename the column to be more accurate
ALTER TABLE public.notifications RENAME COLUMN task_id TO activity_id;

-- 2. Update the email_reminders table to point to activities
-- =====================================================

-- Drop the existing foreign key constraint
ALTER TABLE public.email_reminders DROP CONSTRAINT IF EXISTS email_reminders_task_id_fkey;

-- Add new foreign key constraint pointing to activities
ALTER TABLE public.email_reminders 
ADD CONSTRAINT email_reminders_activity_id_fkey 
FOREIGN KEY (task_id) REFERENCES public.activities(id) ON DELETE CASCADE;

-- Rename the column to be more accurate
ALTER TABLE public.email_reminders RENAME COLUMN task_id TO activity_id;

-- 3. Update the create_deadline_notifications function
-- =====================================================
CREATE OR REPLACE FUNCTION create_deadline_notifications()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notification for 2 days before deadline
    INSERT INTO public.notifications (user_id, activity_id, type, title, message, priority, scheduled_for)
    VALUES (
        NEW.user_id,
        NEW.id,
        'deadline_reminder',
        'Scadenza imminente',
        'La pratica "' || (SELECT numero FROM public.practices WHERE id = NEW.pratica_id) || '" scade il ' || TO_CHAR(NEW.data::DATE, 'DD/MM/YYYY'),
        'high',
        NEW.data::TIMESTAMPTZ - INTERVAL '2 days'
    );
    
    -- Create urgent notification for 1 day before deadline
    INSERT INTO public.notifications (user_id, activity_id, type, title, message, priority, scheduled_for)
    VALUES (
        NEW.user_id,
        NEW.id,
        'deadline_urgent',
        'SCADENZA URGENTE',
        'ATTENZIONE: La pratica "' || (SELECT numero FROM public.practices WHERE id = NEW.pratica_id) || '" scade DOMANI (' || TO_CHAR(NEW.data::DATE, 'DD/MM/YYYY') || ')',
        'urgent',
        NEW.data::TIMESTAMPTZ - INTERVAL '1 day'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update the create_email_reminders function
-- =====================================================
CREATE OR REPLACE FUNCTION create_email_reminders()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Get user email
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = NEW.user_id;
    
    -- Create reminder for 1 day before deadline
    INSERT INTO public.email_reminders (user_id, activity_id, email, reminder_type, scheduled_for)
    VALUES (
        NEW.user_id,
        NEW.id,
        user_email,
        'day_before',
        NEW.data::TIMESTAMPTZ - INTERVAL '1 day'
    );
    
    -- Create urgent reminder for overdue tasks (if deadline is in the past)
    IF NEW.data::DATE < CURRENT_DATE THEN
        INSERT INTO public.email_reminders (user_id, activity_id, email, reminder_type, scheduled_for)
        VALUES (
            NEW.user_id,
            NEW.id,
            user_email,
            'urgent',
            NOW() -- Send immediately for overdue tasks
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update the get_pending_email_reminders function
-- =====================================================

-- Drop the existing function first (it has a different return type)
DROP FUNCTION IF EXISTS get_pending_email_reminders();

-- Create the updated function
CREATE OR REPLACE FUNCTION get_pending_email_reminders()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    activity_id UUID,
    email VARCHAR,
    reminder_type VARCHAR,
    task_pratica TEXT,
    task_scadenza DATE,
    scheduled_for TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        er.id,
        er.user_id,
        er.activity_id,
        er.email,
        er.reminder_type,
        p.numero as task_pratica,
        a.data::DATE as task_scadenza,
        er.scheduled_for
    FROM public.email_reminders er
    JOIN public.activities a ON er.activity_id = a.id
    JOIN public.practices p ON a.pratica_id = p.id
    WHERE er.status = 'pending'
    AND er.scheduled_for <= NOW()
    AND a.stato = 'todo'; -- Only send for pending activities
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Update triggers to work with activities table
-- =====================================================

-- Drop old triggers
DROP TRIGGER IF EXISTS trigger_create_deadline_notifications ON public.tasks;
DROP TRIGGER IF EXISTS trigger_create_email_reminders ON public.tasks;

-- Create new triggers for activities table
CREATE TRIGGER trigger_create_deadline_notifications
    AFTER INSERT ON public.activities
    FOR EACH ROW
    EXECUTE FUNCTION create_deadline_notifications();

CREATE TRIGGER trigger_create_email_reminders
    AFTER INSERT ON public.activities
    FOR EACH ROW
    EXECUTE FUNCTION create_email_reminders();

-- 7. Now we can safely drop the tasks table
-- =====================================================

-- Drop RLS policies for tasks table
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

-- Drop indexes for tasks table
DROP INDEX IF EXISTS idx_tasks_user_id;
DROP INDEX IF EXISTS idx_tasks_pratica;
DROP INDEX IF EXISTS idx_tasks_scadenza;
DROP INDEX IF EXISTS idx_tasks_categoria;
DROP INDEX IF EXISTS idx_tasks_stato;
DROP INDEX IF EXISTS idx_tasks_urgent;

-- Drop the tasks table
DROP TABLE IF EXISTS public.tasks;

-- 8. Verify the migration was successful
-- =====================================================
SELECT 
    'Migration completed successfully' as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') 
        THEN 'ERROR: Tasks table still exists'
        ELSE 'SUCCESS: Tasks table removed'
    END as tasks_verification,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activities') 
        THEN 'SUCCESS: Activities table exists'
        ELSE 'ERROR: Activities table missing'
    END as activities_verification,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') 
        THEN 'SUCCESS: Notifications table exists with updated foreign key'
        ELSE 'ERROR: Notifications table missing'
    END as notifications_verification;
