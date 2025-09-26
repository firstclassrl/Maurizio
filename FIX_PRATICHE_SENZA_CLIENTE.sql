-- Script per correggere le pratiche senza cliente e controparti
-- Prima, vediamo quali clienti sono disponibili

-- 1. Visualizza tutti i clienti disponibili
SELECT 
  id, 
  ragione, 
  nome, 
  cognome,
  CASE 
    WHEN ragione IS NOT NULL AND ragione != '' THEN ragione
    ELSE CONCAT(COALESCE(nome, ''), ' ', COALESCE(cognome, ''))
  END as nome_completo
FROM clients 
ORDER BY created_at DESC;

-- 2. Visualizza le pratiche senza cliente
SELECT 
  id,
  numero,
  cliente_id,
  controparti_ids,
  tipo_procedura,
  created_at
FROM practices 
WHERE cliente_id IS NULL
ORDER BY numero DESC;

-- 3. Per correggere le pratiche, sostituisci 'CLIENTE_ID_QUI' con l'ID del cliente che vuoi assegnare
-- Esempio: se vuoi assegnare il cliente con ID 'abc123' alle pratiche 2025/006, 2025/005, 2025/004

/*
UPDATE practices 
SET 
  cliente_id = 'CLIENTE_ID_QUI',  -- Sostituisci con l'ID del cliente
  controparti_ids = ARRAY['CLIENTE_ID_QUI']  -- Opzionale: aggiungi anche come controparte
WHERE numero IN ('2025/006', '2025/005', '2025/004');

-- Verifica l'aggiornamento
SELECT 
  p.numero,
  p.cliente_id,
  p.controparti_ids,
  c.ragione as cliente_ragione,
  c.nome as cliente_nome,
  c.cognome as cliente_cognome,
  CASE 
    WHEN c.ragione IS NOT NULL AND c.ragione != '' THEN c.ragione
    ELSE CONCAT(COALESCE(c.nome, ''), ' ', COALESCE(c.cognome, ''))
  END as cliente_nome_completo
FROM practices p
LEFT JOIN clients c ON p.cliente_id = c.id
WHERE p.numero IN ('2025/006', '2025/005', '2025/004')
ORDER BY p.numero DESC;
*/
