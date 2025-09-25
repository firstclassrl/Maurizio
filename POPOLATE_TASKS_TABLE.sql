-- Script per popolare la tabella tasks con dati di esempio
-- Eseguire questo script nel database Supabase per testare l'applicazione

-- Prima, verifica che la tabella tasks esista
SELECT 'Tabella tasks verificata' as status, COUNT(*) as task_count FROM public.tasks;

-- Inserisci dati di esempio per tutti gli utenti esistenti
INSERT INTO public.tasks (user_id, pratica, attivita, scadenza, ora, stato, urgent, note, cliente, controparte, categoria, evaso)
SELECT 
    u.id as user_id,
    'Pratica Test 2025/001' as pratica,
    'Deposito ricorso presso il tribunale' as attivita,
    CURRENT_DATE + INTERVAL '7 days' as scadenza,
    '10:00' as ora,
    'todo' as stato,
    false as urgent,
    'Attività di test per verificare il funzionamento' as note,
    'Cliente Test' as cliente,
    'Controparte Test' as controparte,
    'Scadenza' as categoria,
    false as evaso
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.tasks t WHERE t.user_id = u.id
);

-- Inserisci una seconda attività di esempio
INSERT INTO public.tasks (user_id, pratica, attivita, scadenza, ora, stato, urgent, note, cliente, controparte, categoria, evaso)
SELECT 
    u.id as user_id,
    'Pratica Test 2025/002' as pratica,
    'Udienza di comparizione' as attivita,
    CURRENT_DATE + INTERVAL '3 days' as scadenza,
    '14:30' as ora,
    'todo' as stato,
    true as urgent,
    'Udienza urgente per il caso' as note,
    'Mario Rossi' as cliente,
    'Giuseppe Bianchi' as controparte,
    'Udienza' as categoria,
    false as evaso
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.tasks t WHERE t.user_id = u.id AND t.pratica = 'Pratica Test 2025/002'
);

-- Inserisci una terza attività completata
INSERT INTO public.tasks (user_id, pratica, attivita, scadenza, ora, stato, urgent, note, cliente, controparte, categoria, evaso)
SELECT 
    u.id as user_id,
    'Pratica Test 2025/003' as pratica,
    'Revisione contratto' as attivita,
    CURRENT_DATE - INTERVAL '2 days' as scadenza,
    '09:00' as ora,
    'done' as stato,
    false as urgent,
    'Contratto revisionato e approvato' as note,
    'Società ABC' as cliente,
    'Parte Contraente' as controparte,
    'Attività da Svolgere' as categoria,
    true as evaso
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.tasks t WHERE t.user_id = u.id AND t.pratica = 'Pratica Test 2025/003'
);

-- Verifica i dati inseriti
SELECT 
    'Dati di esempio inseriti' as status,
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN stato = 'todo' THEN 1 END) as todo_tasks,
    COUNT(CASE WHEN stato = 'done' THEN 1 END) as done_tasks,
    COUNT(CASE WHEN urgent = true THEN 1 END) as urgent_tasks
FROM public.tasks;
