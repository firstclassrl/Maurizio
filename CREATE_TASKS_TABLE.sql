-- Script SQL per creare la tabella tasks nel database di produzione
-- Eseguire questo script nel database Supabase per ripristinare la funzionalità delle attività

-- Crea la tabella tasks se non esiste
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

-- Crea gli indici per migliorare le performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_scadenza ON public.tasks(scadenza);
CREATE INDEX IF NOT EXISTS idx_tasks_stato ON public.tasks(stato);
CREATE INDEX IF NOT EXISTS idx_tasks_urgent ON public.tasks(urgent);
CREATE INDEX IF NOT EXISTS idx_tasks_categoria ON public.tasks(categoria);

-- Abilita Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Crea le policy RLS per la tabella tasks
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

-- Crea la funzione per aggiornare automaticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crea il trigger per aggiornare automaticamente updated_at
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verifica che la tabella sia stata creata correttamente
SELECT 
    'Tabella tasks creata con successo' as status,
    COUNT(*) as task_count
FROM public.tasks;
