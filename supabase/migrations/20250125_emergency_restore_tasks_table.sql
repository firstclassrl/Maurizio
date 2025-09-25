-- Emergency migration to restore the tasks table
-- This migration recreates the tasks table with the original structure

-- First, check if tasks table exists, if not create it
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pratica TEXT NOT NULL,
    attivita TEXT NOT NULL,
    scadenza DATE NOT NULL,
    ora TIME,
    stato TEXT DEFAULT 'todo' CHECK (stato IN ('todo', 'done')),
    urgent BOOLEAN DEFAULT FALSE,
    note TEXT,
    cliente TEXT,
    controparte TEXT,
    categoria TEXT,
    evaso BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_scadenza ON public.tasks(scadenza);
CREATE INDEX IF NOT EXISTS idx_tasks_stato ON public.tasks(stato);
CREATE INDEX IF NOT EXISTS idx_tasks_urgent ON public.tasks(urgent);
CREATE INDEX IF NOT EXISTS idx_tasks_categoria ON public.tasks(categoria);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tasks
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

CREATE POLICY "Users can view their own tasks" ON public.tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON public.tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON public.tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON public.tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add some sample data if the table is empty
INSERT INTO public.tasks (user_id, pratica, attivita, scadenza, stato, urgent, categoria, cliente, controparte)
SELECT 
    auth.uid(),
    'Pratica Test',
    'Attività di test',
    CURRENT_DATE + INTERVAL '7 days',
    'todo',
    false,
    'Appuntamento',
    'Cliente Test',
    'Controparte Test'
WHERE NOT EXISTS (SELECT 1 FROM public.tasks WHERE user_id = auth.uid())
AND auth.uid() IS NOT NULL;

-- Verify the table was created successfully
SELECT 
    'Tasks table restored successfully' as status,
    COUNT(*) as task_count
FROM public.tasks;
