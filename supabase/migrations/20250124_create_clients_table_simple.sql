-- Versione semplificata per test rapido
-- Verifica prima se la tabella esiste già

-- Controlla se la tabella clients esiste
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients') THEN
        -- Crea la tabella solo se non esiste
        CREATE TABLE clients (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            tipologia TEXT NOT NULL DEFAULT 'Non specificata',
            alternativa BOOLEAN DEFAULT FALSE,
            ragione TEXT NOT NULL,
            titolo TEXT,
            cognome TEXT,
            nome TEXT,
            sesso TEXT CHECK (sesso IN ('M', 'F', 'Altro')),
            data_nascita DATE,
            luogo_nascita TEXT,
            partita_iva TEXT,
            indirizzi JSONB DEFAULT '[]'::jsonb,
            contatti JSONB DEFAULT '[]'::jsonb,
            codice_destinatario TEXT,
            codice_destinatario_pa TEXT,
            note TEXT,
            sigla TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Abilita RLS
        ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
        
        -- Crea policy di base
        CREATE POLICY "Users can manage their own clients" ON clients
            FOR ALL USING (auth.uid() = user_id);
            
        RAISE NOTICE 'Tabella clients creata con successo';
    ELSE
        RAISE NOTICE 'Tabella clients esiste già';
    END IF;
END $$;
