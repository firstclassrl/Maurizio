-- Migration to add new fields to clients table for the updated client form structure

-- Add new columns to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS codice_fiscale TEXT,
ADD COLUMN IF NOT EXISTS denominazione TEXT,
ADD COLUMN IF NOT EXISTS cliente BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS controparte BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS altri BOOLEAN DEFAULT FALSE;

-- Update the default value for tipologia to match new structure
ALTER TABLE clients 
ALTER COLUMN tipologia SET DEFAULT 'Persona fisica';

-- Update existing records to have the new default tipologia if they have the old default
UPDATE clients 
SET tipologia = 'Persona fisica' 
WHERE tipologia = 'Non specificata';

-- Create index for the new boolean fields for better performance
CREATE INDEX IF NOT EXISTS idx_clients_cliente ON clients(cliente);
CREATE INDEX IF NOT EXISTS idx_clients_controparte ON clients(controparte);
CREATE INDEX IF NOT EXISTS idx_clients_altri ON clients(altri);
CREATE INDEX IF NOT EXISTS idx_clients_codice_fiscale ON clients(codice_fiscale);

-- Add comments to document the new fields
COMMENT ON COLUMN clients.codice_fiscale IS 'Codice fiscale del cliente';
COMMENT ON COLUMN clients.denominazione IS 'Denominazione per ditte individuali';
COMMENT ON COLUMN clients.cliente IS 'Indica se il soggetto è un cliente';
COMMENT ON COLUMN clients.controparte IS 'Indica se il soggetto è una controparte';
COMMENT ON COLUMN clients.altri IS 'Indica se il soggetto ha altri ruoli';

-- Verify the changes
SELECT 
    'Migration completed' as status,
    column_name as campo,
    data_type as tipo,
    is_nullable as nullable,
    column_default as default_value
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND column_name IN ('codice_fiscale', 'denominazione', 'cliente', 'controparte', 'altri', 'tipologia')
ORDER BY column_name;
