-- COPIA E INCOLLA QUESTO CODICE NEL SQL EDITOR DI SUPABASE
-- Questo script aggiunge i campi mancanti alla tabella clients

-- Aggiungi i campi mancanti
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS codice_fiscale text null,
ADD COLUMN IF NOT EXISTS denominazione text null,
ADD COLUMN IF NOT EXISTS cliente boolean null default false,
ADD COLUMN IF NOT EXISTS controparte boolean null default false,
ADD COLUMN IF NOT EXISTS altri boolean null default false;

-- Verifica che i campi siano stati aggiunti
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND table_schema = 'public'
ORDER BY ordinal_position;
