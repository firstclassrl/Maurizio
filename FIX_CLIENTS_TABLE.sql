-- Script per correggere la tabella clients aggiungendo i campi mancanti
-- Eseguire questo script nel database Supabase per risolvere definitivamente il problema

-- Aggiungi i campi mancanti alla tabella clients
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS codice_fiscale text null,
ADD COLUMN IF NOT EXISTS denominazione text null,
ADD COLUMN IF NOT EXISTS cliente boolean null default false,
ADD COLUMN IF NOT EXISTS controparte boolean null default false,
ADD COLUMN IF NOT EXISTS altri boolean null default false;

-- Crea indici per i nuovi campi per migliorare le performance
CREATE INDEX IF NOT EXISTS idx_clients_codice_fiscale ON public.clients USING btree (codice_fiscale);
CREATE INDEX IF NOT EXISTS idx_clients_denominazione ON public.clients USING btree (denominazione);
CREATE INDEX IF NOT EXISTS idx_clients_cliente ON public.clients USING btree (cliente);
CREATE INDEX IF NOT EXISTS idx_clients_controparte ON public.clients USING btree (controparte);
CREATE INDEX IF NOT EXISTS idx_clients_altri ON public.clients USING btree (altri);

-- Aggiorna i record esistenti per impostare valori di default per i nuovi campi
UPDATE public.clients 
SET 
    codice_fiscale = NULL,
    denominazione = NULL,
    cliente = false,
    controparte = false,
    altri = false
WHERE 
    codice_fiscale IS NULL 
    OR denominazione IS NULL 
    OR cliente IS NULL 
    OR controparte IS NULL 
    OR altri IS NULL;

-- Verifica che la tabella sia stata aggiornata correttamente
SELECT 
    'Tabella clients aggiornata con successo' as status,
    COUNT(*) as total_clients,
    COUNT(CASE WHEN codice_fiscale IS NOT NULL THEN 1 END) as clients_with_codice_fiscale,
    COUNT(CASE WHEN cliente = true THEN 1 END) as clients_with_cliente_role,
    COUNT(CASE WHEN controparte = true THEN 1 END) as clients_with_controparte_role,
    COUNT(CASE WHEN altri = true THEN 1 END) as clients_with_altri_role
FROM public.clients;
