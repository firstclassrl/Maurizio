# 🗄️ ISTRUZIONI PER APPLICARE LA MIGRAZIONE CLIENTI

## ⚠️ IMPORTANTE
Prima di utilizzare la gestione clienti, devi applicare la migrazione del database per creare la tabella `clients`.

## 📋 Passaggi per Applicare la Migrazione

### 1. Accedi al Dashboard Supabase
- Vai su [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Seleziona il tuo progetto

### 2. Vai alla Sezione SQL Editor
- Nel menu laterale, clicca su **"SQL Editor"**
- Clicca su **"New query"**

### 3. Copia e Incolla la Migrazione
Copia il contenuto del file `supabase/migrations/20250124_create_clients_table.sql`:

```sql
-- Create clients table for managing client information
-- This table stores comprehensive client data including personal information, addresses, and contacts

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_tipologia ON clients(tipologia);
CREATE INDEX IF NOT EXISTS idx_clients_ragione ON clients USING gin(to_tsvector('italian', ragione));
CREATE INDEX IF NOT EXISTS idx_clients_cognome ON clients(cognome);
CREATE INDEX IF NOT EXISTS idx_clients_nome ON clients(nome);
CREATE INDEX IF NOT EXISTS idx_clients_partita_iva ON clients(partita_iva);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE clients IS 'Table for storing comprehensive client information';
COMMENT ON COLUMN clients.tipologia IS 'Type of client (Persona fisica, Società, etc.)';
COMMENT ON COLUMN clients.alternativa IS 'Whether this is an alternative client record';
COMMENT ON COLUMN clients.ragione IS 'Company name or reason for legal entities, or full name for individuals';
COMMENT ON COLUMN clients.titolo IS 'Title (Dott., Avv., etc.) for individuals';
COMMENT ON COLUMN clients.cognome IS 'Last name for individuals';
COMMENT ON COLUMN clients.nome IS 'First name for individuals';
COMMENT ON COLUMN clients.sesso IS 'Gender for individuals';
COMMENT ON COLUMN clients.data_nascita IS 'Birth date for individuals';
COMMENT ON COLUMN clients.luogo_nascita IS 'Birth place for individuals';
COMMENT ON COLUMN clients.partita_iva IS 'VAT number';
COMMENT ON COLUMN clients.indirizzi IS 'JSON array of addresses with field names';
COMMENT ON COLUMN clients.contatti IS 'JSON array of contact information';
COMMENT ON COLUMN clients.codice_destinatario IS 'Recipient code';
COMMENT ON COLUMN clients.codice_destinatario_pa IS 'Public administration recipient code';
COMMENT ON COLUMN clients.note IS 'Additional notes';
COMMENT ON COLUMN clients.sigla IS 'Abbreviation or acronym';

-- Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own clients" ON clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients" ON clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" ON clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" ON clients
    FOR DELETE USING (auth.uid() = user_id);
```

### 4. Esegui la Query
- Clicca sul pulsante **"Run"** (▶️)
- Attendi che la migrazione sia completata
- Dovresti vedere un messaggio di successo

### 5. Verifica la Creazione della Tabella
Esegui questa query per verificare che la tabella sia stata creata:

```sql
-- Verifica che la tabella clients esista
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;
```

Dovresti vedere tutti i campi della tabella clients elencati.

## ✅ Dopo l'Applicazione della Migrazione

Una volta applicata la migrazione:

1. **La tabella `clients` sarà creata** con tutti i campi necessari
2. **I permessi RLS saranno configurati** per sicurezza
3. **Gli indici saranno creati** per performance ottimali
4. **Il form "Crea Cliente" funzionerà correttamente**

## 🚨 Se Ricevi Errori

### Errore "table already exists"
- La tabella esiste già, puoi procedere

### Errore "permission denied"
- Verifica di essere loggato con un account admin
- Controlla i permessi del progetto Supabase

### Errore "function already exists"
- La funzione `update_updated_at_column()` esiste già, è normale

## 📞 Supporto

Se hai problemi con la migrazione, controlla:
1. **Logs di Supabase** per errori dettagliati
2. **Permessi utente** nel progetto
3. **Stato del database** nella sezione Database

---

**Versione App:** 1.0.0  
**Data Migrazione:** 2025-01-24  
**Tabella Creata:** `clients`
