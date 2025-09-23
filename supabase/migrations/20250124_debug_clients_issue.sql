-- Script di debug per verificare il problema con la tabella clients

-- 1. Verifica se la tabella esiste
SELECT 
    'Tabella clients' as controllo,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients') 
        THEN 'ESISTE'
        ELSE 'NON ESISTE'
    END as status;

-- 2. Verifica struttura della tabella
SELECT 
    'Struttura tabella' as controllo,
    column_name as campo,
    data_type as tipo,
    is_nullable as nullable
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

-- 3. Verifica RLS
SELECT 
    'RLS Status' as controllo,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'clients';

-- 4. Verifica policy
SELECT 
    'Policy' as controllo,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'clients';

-- 5. Verifica permessi utente corrente
SELECT 
    'Utente corrente' as controllo,
    current_user as user_name,
    session_user as session_user;

-- 6. Test inserimento (solo se la tabella esiste)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients') THEN
        -- Prova a inserire un record di test
        INSERT INTO clients (user_id, ragione) 
        VALUES (auth.uid(), 'Test Client')
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Test inserimento completato';
    ELSE
        RAISE NOTICE 'Tabella clients non esiste - impossibile testare inserimento';
    END IF;
END $$;

-- 7. Verifica se ci sono record nella tabella
SELECT 
    'Record esistenti' as controllo,
    COUNT(*) as numero_record
FROM clients;
