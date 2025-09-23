-- Query per verificare se la tabella clients esiste e la sua struttura

-- 1. Verifica se la tabella esiste
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients') 
        THEN '✅ Tabella clients ESISTE'
        ELSE '❌ Tabella clients NON ESISTE'
    END as status_tabella;

-- 2. Se la tabella esiste, mostra la sua struttura
SELECT 
    column_name as "Campo",
    data_type as "Tipo",
    is_nullable as "Nullable",
    column_default as "Default"
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

-- 3. Verifica le policy RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'clients';

-- 4. Verifica gli indici
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'clients';
