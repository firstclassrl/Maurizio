-- Script per correggere la pratica 2025/006
-- Assegna un cliente e controparti alla pratica

-- Prima, vediamo quali clienti sono disponibili
SELECT id, ragione, nome, cognome FROM clients WHERE user_id = (SELECT id FROM auth.users LIMIT 1);

-- Sostituisci 'CLIENTE_ID_QUI' con l'ID del cliente che vuoi assegnare
-- Sostituisci 'CONTRAPARTE_ID_QUI' con l'ID della controparte che vuoi assegnare

UPDATE practices 
SET 
  cliente_id = 'CLIENTE_ID_QUI',  -- Sostituisci con l'ID del cliente
  controparti_ids = ARRAY['CONTRAPARTE_ID_QUI']  -- Sostituisci con l'ID della controparte
WHERE numero = '2025/006';

-- Verifica l'aggiornamento
SELECT 
  p.numero,
  p.cliente_id,
  p.controparti_ids,
  c.ragione as cliente_nome,
  c.nome as cliente_nome_persona,
  c.cognome as cliente_cognome
FROM practices p
LEFT JOIN clients c ON p.cliente_id = c.id
WHERE p.numero = '2025/006';
