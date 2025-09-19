-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'deadline_reminder', 'deadline_urgent', 'task_completed', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    scheduled_for TIMESTAMPTZ, -- When to show the notification
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_for ON public.notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically create deadline notifications
CREATE OR REPLACE FUNCTION create_deadline_notifications()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notification for 2 days before deadline
    INSERT INTO public.notifications (user_id, task_id, type, title, message, priority, scheduled_for)
    VALUES (
        NEW.user_id,
        NEW.id,
        'deadline_reminder',
        'Scadenza imminente',
        'La pratica "' || NEW.pratica || '" scade il ' || TO_CHAR(NEW.scadenza::DATE, 'DD/MM/YYYY'),
        'high',
        NEW.scadenza::TIMESTAMPTZ - INTERVAL '2 days'
    );
    
    -- Create urgent notification for 1 day before deadline
    INSERT INTO public.notifications (user_id, task_id, type, title, message, priority, scheduled_for)
    VALUES (
        NEW.user_id,
        NEW.id,
        'deadline_urgent',
        'SCADENZA URGENTE',
        'ATTENZIONE: La pratica "' || NEW.pratica || '" scade DOMANI (' || TO_CHAR(NEW.scadenza::DATE, 'DD/MM/YYYY') || ')',
        'urgent',
        NEW.scadenza::TIMESTAMPTZ - INTERVAL '1 day'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create notifications when tasks are created
CREATE TRIGGER trigger_create_deadline_notifications
    AFTER INSERT ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION create_deadline_notifications();

-- Create function to get unread notifications count
CREATE OR REPLACE FUNCTION get_unread_notifications_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.notifications
        WHERE user_id = user_uuid
        AND is_read = FALSE
        AND (scheduled_for IS NULL OR scheduled_for <= NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create email reminders table
CREATE TABLE IF NOT EXISTS public.email_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    email VARCHAR(255) NOT NULL,
    reminder_type VARCHAR(50) NOT NULL, -- 'day_before', 'urgent', 'custom'
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for email reminders
CREATE INDEX IF NOT EXISTS idx_email_reminders_user_id ON public.email_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_email_reminders_scheduled_for ON public.email_reminders(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_reminders_status ON public.email_reminders(status);

-- Enable Row Level Security for email reminders
ALTER TABLE public.email_reminders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email reminders
CREATE POLICY "Users can view their own email reminders" ON public.email_reminders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email reminders" ON public.email_reminders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to create email reminders
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
    INSERT INTO public.email_reminders (user_id, task_id, email, reminder_type, scheduled_for)
    VALUES (
        NEW.user_id,
        NEW.id,
        user_email,
        'day_before',
        NEW.scadenza::TIMESTAMPTZ - INTERVAL '1 day'
    );
    
    -- Create urgent reminder for overdue tasks (if deadline is in the past)
    IF NEW.scadenza::DATE < CURRENT_DATE THEN
        INSERT INTO public.email_reminders (user_id, task_id, email, reminder_type, scheduled_for)
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

-- Create trigger to automatically create email reminders when tasks are created
CREATE TRIGGER trigger_create_email_reminders
    AFTER INSERT ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION create_email_reminders();

-- Create function to get pending email reminders
CREATE OR REPLACE FUNCTION get_pending_email_reminders()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    task_id UUID,
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
        er.task_id,
        er.email,
        er.reminder_type,
        t.pratica as task_pratica,
        t.scadenza::DATE as task_scadenza,
        er.scheduled_for
    FROM public.email_reminders er
    JOIN public.tasks t ON er.task_id = t.id
    WHERE er.status = 'pending'
    AND er.scheduled_for <= NOW()
    AND t.stato = 'todo'; -- Only send for pending tasks
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
