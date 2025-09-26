-- Migrazione per spostare i campi giudiziali dalle attività alle pratiche
-- Data: 2024-12-20

-- Aggiungi i campi giudiziali alla tabella practices
ALTER TABLE practices 
ADD COLUMN IF NOT EXISTS autorita_giudiziaria TEXT,
ADD COLUMN IF NOT EXISTS rg TEXT,
ADD COLUMN IF NOT EXISTS giudice TEXT;

-- Copia i dati esistenti dalle attività alle pratiche (solo per pratiche giudiziali)
UPDATE practices 
SET 
  autorita_giudiziaria = (
    SELECT a.autorita_giudiziaria 
    FROM activities a 
    WHERE a.pratica_id = practices.id 
    AND a.autorita_giudiziaria IS NOT NULL 
    AND a.autorita_giudiziaria != ''
    LIMIT 1
  ),
  rg = (
    SELECT a.rg 
    FROM activities a 
    WHERE a.pratica_id = practices.id 
    AND a.rg IS NOT NULL 
    AND a.rg != ''
    LIMIT 1
  ),
  giudice = (
    SELECT a.giudice 
    FROM activities a 
    WHERE a.pratica_id = practices.id 
    AND a.giudice IS NOT NULL 
    AND a.giudice != ''
    LIMIT 1
  )
WHERE tipo_procedura = 'GIUDIZIALE';

-- Rimuovi i campi giudiziali dalla tabella activities
ALTER TABLE activities 
DROP COLUMN IF EXISTS autorita_giudiziaria,
DROP COLUMN IF EXISTS rg,
DROP COLUMN IF EXISTS giudice;

-- Aggiungi commenti per documentare i nuovi campi
COMMENT ON COLUMN practices.autorita_giudiziaria IS 'Autorità giudiziaria competente per la pratica (solo per pratiche giudiziali)';
COMMENT ON COLUMN practices.rg IS 'Numero di ruolo generale (solo per pratiche giudiziali)';
COMMENT ON COLUMN practices.giudice IS 'Nome del giudice competente (solo per pratiche giudiziali)';
