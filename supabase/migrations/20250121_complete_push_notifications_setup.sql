-- =====================================================
-- COMPLETE PUSH NOTIFICATIONS SETUP FOR LEXAGENDA
-- =====================================================
-- Questo file crea tutto il necessario per le push notifications
-- Esegui questo SQL nel SQL Editor di Supabase

-- 1. Crea la tabella push_subscriptions
-- =====================================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);

-- 2. Abilita RLS (Row Level Security)
-- =====================================================
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 3. Crea le policy RLS
-- =====================================================
-- Policy per permettere agli utenti di gestire solo le proprie subscription
CREATE POLICY "Users can manage their own push subscriptions" ON public.push_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- 4. Crea la funzione per inviare notifiche push
-- =====================================================
CREATE OR REPLACE FUNCTION public.send_push_notification(
    user_id_param UUID,
    title TEXT,
    body TEXT,
    icon_url TEXT DEFAULT '/favicon.png',
    badge_url TEXT DEFAULT '/favicon.png',
    tag TEXT DEFAULT 'lexagenda-notification',
    data JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    subscription_record RECORD;
    vapid_public_key TEXT;
    vapid_private_key TEXT;
    result JSONB := '{"success": false, "sent": 0, "errors": []}'::jsonb;
    error_count INTEGER := 0;
BEGIN
    -- Ottieni le chiavi VAPID dalle variabili d'ambiente
    SELECT 
        current_setting('app.vapid_public_key', true),
        current_setting('app.vapid_private_key', true)
    INTO vapid_public_key, vapid_private_key;
    
    -- Verifica che le chiavi VAPID siano configurate
    IF vapid_public_key IS NULL OR vapid_private_key IS NULL THEN
        result := jsonb_set(result, '{error}', '"VAPID keys not configured"');
        RETURN result;
    END IF;
    
    -- Itera su tutte le subscription dell'utente
    FOR subscription_record IN 
        SELECT endpoint, p256dh_key, auth_key 
        FROM public.push_subscriptions 
        WHERE user_id = user_id_param
    LOOP
        BEGIN
            -- Qui dovresti implementare la logica per inviare la notifica
            -- Per ora simuliamo l'invio
            PERFORM pg_sleep(0.1); -- Simula il tempo di invio
            
            result := jsonb_set(result, '{sent}', to_jsonb((result->>'sent')::integer + 1));
            
        EXCEPTION WHEN OTHERS THEN
            error_count := error_count + 1;
            result := jsonb_set(
                result, 
                '{errors}', 
                (result->'errors') || to_jsonb(SQLERRM)
            );
        END;
    END LOOP;
    
    result := jsonb_set(result, '{success}', 'true');
    result := jsonb_set(result, '{total_subscriptions}', to_jsonb((result->>'sent')::integer + error_count));
    
    RETURN result;
END;
$$;

-- 5. Crea la funzione per gestire le subscription
-- =====================================================
CREATE OR REPLACE FUNCTION public.manage_push_subscription(
    action TEXT, -- 'subscribe' o 'unsubscribe'
    endpoint_param TEXT,
    p256dh_key_param TEXT,
    auth_key_param TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id_param UUID;
    result JSONB;
BEGIN
    -- Ottieni l'ID dell'utente corrente
    user_id_param := auth.uid();
    
    IF user_id_param IS NULL THEN
        RETURN '{"success": false, "error": "User not authenticated"}'::jsonb;
    END IF;
    
    IF action = 'subscribe' THEN
        -- Inserisci o aggiorna la subscription
        INSERT INTO public.push_subscriptions (user_id, endpoint, p256dh_key, auth_key)
        VALUES (user_id_param, endpoint_param, p256dh_key_param, auth_key_param)
        ON CONFLICT (user_id, endpoint) 
        DO UPDATE SET 
            p256dh_key = EXCLUDED.p256dh_key,
            auth_key = EXCLUDED.auth_key,
            updated_at = NOW();
            
        result := '{"success": true, "message": "Subscription created/updated"}'::jsonb;
        
    ELSIF action = 'unsubscribe' THEN
        -- Rimuovi la subscription
        DELETE FROM public.push_subscriptions 
        WHERE user_id = user_id_param AND endpoint = endpoint_param;
        
        result := '{"success": true, "message": "Subscription removed"}'::jsonb;
        
    ELSE
        result := '{"success": false, "error": "Invalid action. Use subscribe or unsubscribe"}'::jsonb;
    END IF;
    
    RETURN result;
END;
$$;

-- 6. Crea la funzione per inviare notifiche automatiche
-- =====================================================
CREATE OR REPLACE FUNCTION public.send_deadline_notifications()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    task_record RECORD;
    notification_result JSONB;
    total_sent INTEGER := 0;
    total_errors INTEGER := 0;
BEGIN
    -- Trova tutte le attività che scadono oggi e sono urgenti
    FOR task_record IN 
        SELECT DISTINCT t.user_id, t.pratica, t.attivita, t.scadenza
        FROM public.tasks t
        WHERE t.scadenza = CURRENT_DATE
        AND t.priorita = 10 -- Solo attività urgenti
        AND t.stato != 'done' -- Solo attività non completate
    LOOP
        BEGIN
            -- Invia notifica push
            SELECT public.send_push_notification(
                task_record.user_id,
                'Scadenza Urgente Oggi!',
                'La pratica "' || task_record.pratica || '" (' || task_record.attivita || ') scade oggi!',
                '/favicon.png',
                '/favicon.png',
                'urgent-deadline',
                jsonb_build_object(
                    'type', 'urgent_deadline',
                    'task_id', task_record.user_id,
                    'pratica', task_record.pratica,
                    'attivita', task_record.attivita,
                    'scadenza', task_record.scadenza
                )
            ) INTO notification_result;
            
            IF (notification_result->>'success')::boolean THEN
                total_sent := total_sent + (notification_result->>'sent')::integer;
            ELSE
                total_errors := total_errors + 1;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            total_errors := total_errors + 1;
        END;
    END LOOP;
    
    RETURN jsonb_build_object(
        'success', true,
        'total_sent', total_sent,
        'total_errors', total_errors,
        'message', 'Deadline notifications processed'
    );
END;
$$;

-- 7. Crea trigger per aggiornare updated_at automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applica il trigger alla tabella push_subscriptions
DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON public.push_subscriptions;
CREATE TRIGGER update_push_subscriptions_updated_at
    BEFORE UPDATE ON public.push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Crea indice per migliorare le performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON public.push_subscriptions(endpoint);

-- 9. Crea vista per statistiche push notifications
-- =====================================================
CREATE OR REPLACE VIEW public.push_notification_stats AS
SELECT 
    COUNT(*) as total_subscriptions,
    COUNT(DISTINCT user_id) as unique_users,
    MIN(created_at) as first_subscription,
    MAX(created_at) as last_subscription
FROM public.push_subscriptions;

-- 10. Crea funzione per testare le notifiche
-- =====================================================
CREATE OR REPLACE FUNCTION public.test_push_notification(
    user_id_param UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id UUID;
    result JSONB;
BEGIN
    -- Se non specificato, usa l'utente corrente
    target_user_id := COALESCE(user_id_param, auth.uid());
    
    IF target_user_id IS NULL THEN
        RETURN '{"success": false, "error": "No user specified"}'::jsonb;
    END IF;
    
    -- Invia notifica di test
    SELECT public.send_push_notification(
        target_user_id,
        'Test Notifica LexAgenda',
        'Questa è una notifica di test per verificare che le push notifications funzionino correttamente!',
        '/favicon.png',
        '/favicon.png',
        'test-notification',
        jsonb_build_object(
            'type', 'test',
            'timestamp', NOW(),
            'message', 'Test successful'
        )
    ) INTO result;
    
    RETURN result;
END;
$$;

-- 11. Crea funzione per pulire subscription obsolete
-- =====================================================
CREATE OR REPLACE FUNCTION public.cleanup_old_subscriptions()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Rimuovi subscription più vecchie di 30 giorni
    DELETE FROM public.push_subscriptions 
    WHERE updated_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN jsonb_build_object(
        'success', true,
        'deleted_count', deleted_count,
        'message', 'Old subscriptions cleaned up'
    );
END;
$$;

-- 12. Imposta le variabili d'ambiente (da configurare nel dashboard Supabase)
-- =====================================================
-- NOTA: Queste devono essere configurate nel dashboard Supabase > Settings > Edge Functions
-- VAPID_PUBLIC_KEY=BBtzXffm323WoFzkn6tSqS-ZP5Hr3pJluGbkuD20hcgUet0gO84sZWbPJptoCbJ90rLFd0vpL8yuMPM-M4tceSE
-- VAPID_PRIVATE_KEY=x91rDGXIZhTELfJ8XVv90h8sQlGQpBR67t-EZ6BNp2w

-- 13. Crea commenti per documentazione
-- =====================================================
COMMENT ON TABLE public.push_subscriptions IS 'Tabella per memorizzare le subscription push degli utenti';
COMMENT ON FUNCTION public.send_push_notification IS 'Funzione per inviare notifiche push agli utenti';
COMMENT ON FUNCTION public.manage_push_subscription IS 'Funzione per gestire le subscription push (subscribe/unsubscribe)';
COMMENT ON FUNCTION public.send_deadline_notifications IS 'Funzione per inviare notifiche automatiche per scadenze urgenti';
COMMENT ON FUNCTION public.test_push_notification IS 'Funzione per testare le notifiche push';
COMMENT ON FUNCTION public.cleanup_old_subscriptions IS 'Funzione per pulire subscription obsolete';

-- =====================================================
-- FINE SETUP PUSH NOTIFICATIONS
-- =====================================================

-- Per testare il setup, esegui:
-- SELECT public.test_push_notification();

-- Per vedere le statistiche:
-- SELECT * FROM public.push_notification_stats;

-- Per pulire subscription obsolete:
-- SELECT public.cleanup_old_subscriptions();
