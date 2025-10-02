-- Populate demo data for demo users (demo1@abruzzo.ai, demo2@abruzzo.ai, demo3@abruzzo.ai)
-- This script creates comprehensive demo data to showcase all features of LexAgenda

-- First, let's get the user IDs for demo users
DO $$
DECLARE
    demo1_user_id UUID;
    demo2_user_id UUID;
    demo3_user_id UUID;
    cliente1_id UUID;
    cliente2_id UUID;
    cliente3_id UUID;
    cliente4_id UUID;
    cliente5_id UUID;
    cliente6_id UUID;
    cliente7_id UUID;
    cliente8_id UUID;
    pratica1_id UUID;
    pratica2_id UUID;
    pratica3_id UUID;
    pratica4_id UUID;
    pratica5_id UUID;
    pratica6_id UUID;
    pratica7_id UUID;
    pratica8_id UUID;
    pratica9_id UUID;
    pratica10_id UUID;
    pratica11_id UUID;
    pratica12_id UUID;
BEGIN
    -- Get demo user IDs
    SELECT id INTO demo1_user_id FROM auth.users WHERE email = 'demo1@abruzzo.ai';
    SELECT id INTO demo2_user_id FROM auth.users WHERE email = 'demo2@abruzzo.ai';
    SELECT id INTO demo3_user_id FROM auth.users WHERE email = 'demo3@abruzzo.ai';

    -- Only proceed if demo users exist
    IF demo1_user_id IS NOT NULL THEN
        -- Clear existing demo data for demo1
        DELETE FROM activities WHERE user_id = demo1_user_id;
        DELETE FROM practices WHERE user_id = demo1_user_id;
        DELETE FROM clients WHERE user_id = demo1_user_id;
        DELETE FROM tasks WHERE user_id = demo1_user_id;

        -- Insert demo clients for demo1
        INSERT INTO clients (user_id, tipologia, alternativa, ragione, titolo, cognome, nome, sesso, data_nascita, luogo_nascita, partita_iva, indirizzi, contatti, codice_destinatario, codice_destinatario_pa, note, sigla)
        VALUES 
        (demo1_user_id, 'Persona fisica', false, 'Rossi Mario', 'Sig.', 'Rossi', 'Mario', 'M', '1980-05-15', 'Roma', NULL, 
         '[{"tipo": "RESIDENZA", "via": "Via Roma 123", "citta": "Roma", "cap": "00100", "provincia": "RM"}]'::jsonb,
         '[{"tipo": "TELEFONO", "valore": "+39 333 1234567"}, {"tipo": "EMAIL", "valore": "mario.rossi@email.com"}]'::jsonb,
         NULL, NULL, 'Cliente storico con molte pratiche', NULL)
        RETURNING id INTO cliente1_id;

        INSERT INTO clients (user_id, tipologia, alternativa, ragione, titolo, cognome, nome, sesso, data_nascita, luogo_nascita, partita_iva, indirizzi, contatti, codice_destinatario, codice_destinatario_pa, note, sigla)
        VALUES 
        (demo1_user_id, 'Ditta Individuale', false, 'Bianchi Giulia', 'Dott.ssa', 'Bianchi', 'Giulia', 'F', '1975-03-22', 'Milano', '12345678901',
         '[{"tipo": "SEDE", "via": "Corso Italia 45", "citta": "Milano", "cap": "20100", "provincia": "MI"}]'::jsonb,
         '[{"tipo": "TELEFONO", "valore": "+39 02 1234567"}, {"tipo": "EMAIL", "valore": "giulia.bianchi@studio.it"}]'::jsonb,
         NULL, NULL, 'Avvocato specializzata in diritto civile', NULL)
        RETURNING id INTO cliente2_id;

        INSERT INTO clients (user_id, tipologia, alternativa, ragione, titolo, cognome, nome, sesso, data_nascita, luogo_nascita, partita_iva, indirizzi, contatti, codice_destinatario, codice_destinatario_pa, note, sigla)
        VALUES 
        (demo1_user_id, 'Persona Giuridica', false, 'ACME S.r.l.', NULL, NULL, NULL, NULL, NULL, NULL, '09876543210',
         '[{"tipo": "SEDE", "via": "Via del Commercio 789", "citta": "Torino", "cap": "10100", "provincia": "TO"}]'::jsonb,
         '[{"tipo": "TELEFONO", "valore": "+39 011 9876543"}, {"tipo": "EMAIL", "valore": "info@acme.it"}]'::jsonb,
         NULL, NULL, 'Società di consulenza aziendale', NULL)
        RETURNING id INTO cliente3_id;

        INSERT INTO clients (user_id, tipologia, alternativa, ragione, titolo, cognome, nome, sesso, data_nascita, luogo_nascita, partita_iva, indirizzi, contatti, codice_destinatario, codice_destinatario_pa, note, sigla)
        VALUES 
        (demo1_user_id, 'Altro ente', false, 'Comune di Roma', NULL, NULL, NULL, NULL, NULL, NULL, NULL,
         '[{"tipo": "SEDE", "via": "Campidoglio 1", "citta": "Roma", "cap": "00186", "provincia": "RM"}]'::jsonb,
         '[{"tipo": "TELEFONO", "valore": "+39 06 0606"}, {"tipo": "EMAIL", "valore": "protocollo@comune.roma.it"}]'::jsonb,
         'COMROMA', 'COMROMA', 'Ente pubblico locale', NULL)
        RETURNING id INTO cliente4_id;

        -- Insert demo practices for demo1
        INSERT INTO practices (user_id, numero, cliente_id, controparti_ids, tipo_procedura, autorita_giudiziaria, rg, giudice)
        VALUES 
        (demo1_user_id, '2025/001', cliente1_id, '[]'::jsonb, 'GIUDIZIALE', 'Tribunale di Roma', 'RG 1234/2025', 'Dott. Rossi')
        RETURNING id INTO pratica1_id;

        INSERT INTO practices (user_id, numero, cliente_id, controparti_ids, tipo_procedura, autorita_giudiziaria, rg, giudice)
        VALUES 
        (demo1_user_id, '2025/002', cliente2_id, '[]'::jsonb, 'STRAGIUDIZIALE', NULL, NULL, NULL)
        RETURNING id INTO pratica2_id;

        INSERT INTO practices (user_id, numero, cliente_id, controparti_ids, tipo_procedura, autorita_giudiziaria, rg, giudice)
        VALUES 
        (demo1_user_id, '2025/003', cliente3_id, '[{"id": "' || cliente4_id || '", "denominazione": "Comune di Roma"}]'::jsonb, 'GIUDIZIALE', 'Tribunale di Torino', 'RG 5678/2025', 'Dott.ssa Bianchi')
        RETURNING id INTO pratica3_id;

        INSERT INTO practices (user_id, numero, cliente_id, controparti_ids, tipo_procedura, autorita_giudiziaria, rg, giudice)
        VALUES 
        (demo1_user_id, '2025/004', cliente4_id, '[]'::jsonb, 'STRAGIUDIZIALE', NULL, NULL, NULL)
        RETURNING id INTO pratica4_id;

        -- Insert demo activities for demo1 (spread across different dates)
        INSERT INTO activities (user_id, pratica_id, categoria, attivita, data, ora, autorita_giudiziaria, rg, giudice, note, stato, priorita)
        VALUES 
        (demo1_user_id, pratica1_id, 'Udienza', 'Prima udienza di comparizione', CURRENT_DATE + INTERVAL '3 days', '09:30', 'Tribunale di Roma', 'RG 1234/2025', 'Dott. Rossi', 'Udienza preliminare per definire le questioni', 'todo', 8),
        (demo1_user_id, pratica1_id, 'Scadenza', 'Scadenza per deposito memoria', CURRENT_DATE + INTERVAL '1 day', '17:00', NULL, NULL, NULL, 'Memoria difensiva da depositare', 'todo', 9),
        (demo1_user_id, pratica2_id, 'Appuntamento', 'Incontro con cliente per consulenza', CURRENT_DATE + INTERVAL '2 days', '14:00', NULL, NULL, NULL, 'Discussione strategia negoziale', 'todo', 6),
        (demo1_user_id, pratica3_id, 'Scadenza Processuale', 'Scadenza per ricorso', CURRENT_DATE + INTERVAL '5 days', '23:59', 'Tribunale di Torino', 'RG 5678/2025', 'Dott.ssa Bianchi', 'Ricorso contro provvedimento comunale', 'todo', 10),
        (demo1_user_id, pratica4_id, 'Attività da Svolgere', 'Redazione contratto', CURRENT_DATE + INTERVAL '7 days', '10:00', NULL, NULL, NULL, 'Contratto di fornitura servizi', 'todo', 7),
        (demo1_user_id, pratica1_id, 'Udienza', 'Udienza di merito', CURRENT_DATE + INTERVAL '14 days', '10:30', 'Tribunale di Roma', 'RG 1234/2025', 'Dott. Rossi', 'Udienza principale per decisione', 'todo', 9),
        (demo1_user_id, pratica2_id, 'Scadenza', 'Scadenza per risposta', CURRENT_DATE + INTERVAL '10 days', '18:00', NULL, NULL, NULL, 'Risposta alla richiesta di pagamento', 'todo', 8),
        (demo1_user_id, pratica3_id, 'Appuntamento', 'Conferenza con perito', CURRENT_DATE + INTERVAL '12 days', '15:30', NULL, NULL, NULL, 'Verifica tecnica immobile', 'todo', 6);

        -- Insert some completed activities
        INSERT INTO activities (user_id, pratica_id, categoria, attivita, data, ora, autorita_giudiziaria, rg, giudice, note, stato, priorita)
        VALUES 
        (demo1_user_id, pratica1_id, 'Attività Processuale', 'Deposito atto di citazione', CURRENT_DATE - INTERVAL '5 days', '16:30', 'Tribunale di Roma', 'RG 1234/2025', 'Dott. Rossi', 'Atto depositato correttamente', 'done', 8),
        (demo1_user_id, pratica2_id, 'Appuntamento', 'Primo incontro con cliente', CURRENT_DATE - INTERVAL '3 days', '11:00', NULL, NULL, NULL, 'Incontro positivo, cliente soddisfatto', 'done', 6);

        -- Insert legacy tasks for compatibility
        INSERT INTO tasks (user_id, attivita, pratica, scadenza, ora, stato, urgent, categoria, cliente, controparte, created_at, updated_at)
        VALUES 
        (demo1_user_id, 'Controllo scadenze mensili', 'Controllo generale', CURRENT_DATE + INTERVAL '1 day', '09:00', 'todo', true, 'Amministrativa', 'Ufficio', NULL, NOW(), NOW()),
        (demo1_user_id, 'Aggiornamento archivi', 'Amministrazione', CURRENT_DATE + INTERVAL '3 days', '14:00', 'todo', false, 'Amministrativa', 'Ufficio', NULL, NOW(), NOW()),
        (demo1_user_id, 'Riunione settimanale', 'Staff meeting', CURRENT_DATE + INTERVAL '5 days', '10:00', 'todo', false, 'Appuntamento', 'Team', NULL, NOW(), NOW());
    END IF;

    -- Repeat similar process for demo2
    IF demo2_user_id IS NOT NULL THEN
        -- Clear existing demo data for demo2
        DELETE FROM activities WHERE user_id = demo2_user_id;
        DELETE FROM practices WHERE user_id = demo2_user_id;
        DELETE FROM clients WHERE user_id = demo2_user_id;
        DELETE FROM tasks WHERE user_id = demo2_user_id;

        -- Insert demo clients for demo2
        INSERT INTO clients (user_id, tipologia, alternativa, ragione, titolo, cognome, nome, sesso, data_nascita, luogo_nascita, partita_iva, indirizzi, contatti, codice_destinatario, codice_destinatario_pa, note, sigla)
        VALUES 
        (demo2_user_id, 'Persona fisica', false, 'Verdi Alessandro', 'Avv.', 'Verdi', 'Alessandro', 'M', '1985-08-10', 'Firenze', NULL, 
         '[{"tipo": "RESIDENZA", "via": "Via Firenze 456", "citta": "Firenze", "cap": "50100", "provincia": "FI"}]'::jsonb,
         '[{"tipo": "TELEFONO", "valore": "+39 055 1234567"}, {"tipo": "EMAIL", "valore": "alessandro.verdi@studio.it"}]'::jsonb,
         NULL, NULL, 'Avvocato penalista', NULL)
        RETURNING id INTO cliente5_id;

        INSERT INTO clients (user_id, tipologia, alternativa, ragione, titolo, cognome, nome, sesso, data_nascita, luogo_nascita, partita_iva, indirizzi, contatti, codice_destinatario, codice_destinatario_pa, note, sigla)
        VALUES 
        (demo2_user_id, 'Persona Giuridica', false, 'TECHNOLOGY S.p.A.', NULL, NULL, NULL, NULL, NULL, NULL, '11223344556',
         '[{"tipo": "SEDE", "via": "Via della Tecnologia 999", "citta": "Milano", "cap": "20100", "provincia": "MI"}]'::jsonb,
         '[{"tipo": "TELEFONO", "valore": "+39 02 9999999"}, {"tipo": "EMAIL", "valore": "legal@technology.it"}]'::jsonb,
         NULL, NULL, 'Società tecnologica in espansione', NULL)
        RETURNING id INTO cliente6_id;

        -- Insert demo practices for demo2
        INSERT INTO practices (user_id, numero, cliente_id, controparti_ids, tipo_procedura, autorita_giudiziaria, rg, giudice)
        VALUES 
        (demo2_user_id, '2025/005', cliente5_id, '[]'::jsonb, 'GIUDIZIALE', 'Tribunale di Firenze', 'RG 9012/2025', 'Dott.ssa Neri')
        RETURNING id INTO pratica5_id;

        INSERT INTO practices (user_id, numero, cliente_id, controparti_ids, tipo_procedura, autorita_giudiziaria, rg, giudice)
        VALUES 
        (demo2_user_id, '2025/006', cliente6_id, '[]'::jsonb, 'STRAGIUDIZIALE', NULL, NULL, NULL)
        RETURNING id INTO pratica6_id;

        -- Insert demo activities for demo2
        INSERT INTO activities (user_id, pratica_id, categoria, attivita, data, ora, autorita_giudiziaria, rg, giudice, note, stato, priorita)
        VALUES 
        (demo2_user_id, pratica5_id, 'Udienza', 'Udienza preliminare', CURRENT_DATE + INTERVAL '4 days', '11:00', 'Tribunale di Firenze', 'RG 9012/2025', 'Dott.ssa Neri', 'Verifica ammissibilità ricorso', 'todo', 9),
        (demo2_user_id, pratica6_id, 'Appuntamento', 'Consulenza aziendale', CURRENT_DATE + INTERVAL '6 days', '16:00', NULL, NULL, NULL, 'Revisione contratti IT', 'todo', 7),
        (demo2_user_id, pratica5_id, 'Scadenza Processuale', 'Scadenza per memoria', CURRENT_DATE + INTERVAL '8 days', '18:00', 'Tribunale di Firenze', 'RG 9012/2025', 'Dott.ssa Neri', 'Memoria difensiva completa', 'todo', 8);

        -- Insert legacy tasks for demo2
        INSERT INTO tasks (user_id, attivita, pratica, scadenza, ora, stato, urgent, categoria, cliente, controparte, created_at, updated_at)
        VALUES 
        (demo2_user_id, 'Preparazione udienza', '2025/005', CURRENT_DATE + INTERVAL '2 days', '09:30', 'todo', true, 'Udienza', 'Verdi Alessandro', 'Tribunale', NOW(), NOW()),
        (demo2_user_id, 'Analisi documenti', '2025/006', CURRENT_DATE + INTERVAL '5 days', '14:30', 'todo', false, 'Attività da Svolgere', 'TECHNOLOGY S.p.A.', NULL, NOW(), NOW());
    END IF;

    -- Repeat similar process for demo3
    IF demo3_user_id IS NOT NULL THEN
        -- Clear existing demo data for demo3
        DELETE FROM activities WHERE user_id = demo3_user_id;
        DELETE FROM practices WHERE user_id = demo3_user_id;
        DELETE FROM clients WHERE user_id = demo3_user_id;
        DELETE FROM tasks WHERE user_id = demo3_user_id;

        -- Insert demo clients for demo3
        INSERT INTO clients (user_id, tipologia, alternativa, ragione, titolo, cognome, nome, sesso, data_nascita, luogo_nascita, partita_iva, indirizzi, contatti, codice_destinatario, codice_destinatario_pa, note, sigla)
        VALUES 
        (demo3_user_id, 'Persona fisica', false, 'Neri Francesca', 'Dott.ssa', 'Neri', 'Francesca', 'F', '1990-12-03', 'Napoli', NULL, 
         '[{"tipo": "RESIDENZA", "via": "Via Napoli 789", "citta": "Napoli", "cap": "80100", "provincia": "NA"}]'::jsonb,
         '[{"tipo": "TELEFONO", "valore": "+39 081 9876543"}, {"tipo": "EMAIL", "valore": "francesca.neri@email.com"}]'::jsonb,
         NULL, NULL, 'Imprenditrice nel settore moda', NULL)
        RETURNING id INTO cliente7_id;

        INSERT INTO clients (user_id, tipologia, alternativa, ragione, titolo, cognome, nome, sesso, data_nascita, luogo_nascita, partita_iva, indirizzi, contatti, codice_destinatario, codice_destinatario_pa, note, sigla)
        VALUES 
        (demo3_user_id, 'Altro ente', false, 'Regione Abruzzo', NULL, NULL, NULL, NULL, NULL, NULL, NULL,
         '[{"tipo": "SEDE", "via": "Via XXIV Maggio", "citta": "L''Aquila', "cap": "67100", "provincia": "AQ"}]'::jsonb,
         '[{"tipo": "TELEFONO", "valore": "+39 0862 345678"}, {"tipo": "EMAIL", "valore": "protocollo@regione.abruzzo.it"}]'::jsonb,
         'REGABR', 'REGABR', 'Amministrazione regionale', NULL)
        RETURNING id INTO cliente8_id;

        -- Insert demo practices for demo3
        INSERT INTO practices (user_id, numero, cliente_id, controparti_ids, tipo_procedura, autorita_giudiziaria, rg, giudice)
        VALUES 
        (demo3_user_id, '2025/007', cliente7_id, '[]'::jsonb, 'STRAGIUDIZIALE', NULL, NULL, NULL)
        RETURNING id INTO pratica7_id;

        INSERT INTO practices (user_id, numero, cliente_id, controparti_ids, tipo_procedura, autorita_giudiziaria, rg, giudice)
        VALUES 
        (demo3_user_id, '2025/008', cliente8_id, '[]'::jsonb, 'GIUDIZIALE', 'TAR Abruzzo', 'RG 3456/2025', 'Dott. Bianchi')
        RETURNING id INTO pratica8_id;

        -- Insert demo activities for demo3
        INSERT INTO activities (user_id, pratica_id, categoria, attivita, data, ora, autorita_giudiziaria, rg, giudice, note, stato, priorita)
        VALUES 
        (demo3_user_id, pratica7_id, 'Appuntamento', 'Consulenza commerciale', CURRENT_DATE + INTERVAL '1 day', '10:30', NULL, NULL, NULL, 'Supporto per nuova attività', 'todo', 7),
        (demo3_user_id, pratica8_id, 'Udienza', 'Udienza TAR', CURRENT_DATE + INTERVAL '9 days', '09:00', 'TAR Abruzzo', 'RG 3456/2025', 'Dott. Bianchi', 'Ricorso contro provvedimento regionale', 'todo', 9),
        (demo3_user_id, pratica7_id, 'Attività da Svolgere', 'Redazione statuto', CURRENT_DATE + INTERVAL '11 days', '15:00', NULL, NULL, NULL, 'Statuto società di capitali', 'todo', 8);

        -- Insert legacy tasks for demo3
        INSERT INTO tasks (user_id, attivita, pratica, scadenza, ora, stato, urgent, categoria, cliente, controparte, created_at, updated_at)
        VALUES 
        (demo3_user_id, 'Revisione contratti', '2025/007', CURRENT_DATE + INTERVAL '3 days', '11:00', 'todo', false, 'Attività da Svolgere', 'Neri Francesca', NULL, NOW(), NOW()),
        (demo3_user_id, 'Preparazione ricorso', '2025/008', CURRENT_DATE + INTERVAL '7 days', '16:00', 'todo', true, 'Scadenza Processuale', 'Regione Abruzzo', 'TAR', NOW(), NOW());
    END IF;

END $$;
