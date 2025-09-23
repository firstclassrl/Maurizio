-- Script per risolvere definitivamente il problema della tabella clients

-- 1. Elimina la tabella se esiste (ATTENZIONE: perdi i dati!)
-- DROP TABLE IF EXISTS clients CASCADE;

-- 2. Crea la tabella clients con struttura corretta
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic client information
    tipologia TEXT NOT NULL DEFAULT 'Non specificata',
    alternativa BOOLEAN DEFAULT FALSE,
    ragione TEXT NOT NULL,
    
    -- Personal information (for natural persons)
    titolo TEXT,
    cognome TEXT,
    nome TEXT,
    sesso TEXT CHECK (sesso IN ('M', 'F', 'Altro')),
    data_nascita DATE,
    luogo_nascita TEXT,
    partita_iva TEXT,
    
    -- JSON fields for flexible data storage
    indirizzi JSONB DEFAULT '[]'::jsonb,
    contatti JSONB DEFAULT '[]'::jsonb,
    
    -- Recipient information (for public administration)
    codice_destinatario TEXT,
    codice_destinatario_pa TEXT,
    
    -- Additional information
    note TEXT,
    sigla TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crea indici per performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_tipologia ON clients(tipologia);
CREATE INDEX IF NOT EXISTS idx_clients_ragione ON clients USING gin(to_tsvector('italian', ragione));

-- 4. Crea funzione per updated_at (se non esiste)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Crea trigger per updated_at
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Abilita RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 7. Elimina policy esistenti (se ci sono)
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;
DROP POLICY IF EXISTS "Users can manage their own clients" ON clients;

-- 8. Crea policy RLS corrette
CREATE POLICY "Users can view their own clients" ON clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients" ON clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" ON clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" ON clients
    FOR DELETE USING (auth.uid() = user_id);

-- 9. Verifica che tutto sia stato creato correttamente
SELECT 
    'Verifica finale' as controllo,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients') 
        THEN '✅ Tabella clients creata'
        ELSE '❌ Tabella clients NON creata'
    END as status_tabella;

-- 10. Test inserimento
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Prova a ottenere l'ID utente corrente
    SELECT auth.uid() INTO test_user_id;
    
    IF test_user_id IS NOT NULL THEN
        -- Prova a inserire un record di test
        INSERT INTO clients (user_id, ragione) 
        VALUES (test_user_id, 'Test Client - ' || NOW())
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE '✅ Test inserimento completato con successo';
    ELSE
        RAISE NOTICE '⚠️ Nessun utente autenticato - impossibile testare inserimento';
    END IF;
END $$;

-- 11. Mostra struttura finale
SELECT 
    column_name as campo,
    data_type as tipo,
    is_nullable as nullable,
    column_default as default_value
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;
