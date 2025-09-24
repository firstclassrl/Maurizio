# 🚨 APPLICA MIGRAZIONE URGENT - RISOLVE ERRORE CREAZIONE ATTIVITÀ

## ❌ PROBLEMA ATTUALE
L'applicazione mostra l'errore:
```
Errore nella creazione dell'attività: Could not find the 'urgent' column of 'tasks' in the schema cache
```

## ✅ SOLUZIONE
Devi applicare la migrazione `20250125_update_tasks_table_urgent.sql` al database Supabase di produzione.

## 📋 ISTRUZIONI STEP-BY-STEP

### METODO 1: Dashboard Supabase (RACCOMANDATO)

1. **Vai al Dashboard Supabase**
   - Apri https://supabase.com/dashboard
   - Accedi al tuo account
   - Seleziona il progetto LexAgenda

2. **Apri SQL Editor**
   - Nel menu laterale, clicca su "SQL Editor"
   - Clicca su "New query"

3. **Copia e Incolla la Migrazione**
   ```sql
   -- Migration to update tasks and activities tables: replace priorita with urgent column
   -- This migration adds the urgent column and removes the priorita column from both tables

   -- Update tasks table
   -- First, add the new urgent column
   ALTER TABLE tasks 
   ADD COLUMN IF NOT EXISTS urgent BOOLEAN DEFAULT false;

   -- Update existing records: convert priorita >= 8 to urgent = true
   UPDATE tasks 
   SET urgent = (priorita >= 8)
   WHERE priorita IS NOT NULL;

   -- Remove the old priorita column
   ALTER TABLE tasks 
   DROP COLUMN IF EXISTS priorita;

   -- Add a comment to document the change
   COMMENT ON COLUMN tasks.urgent IS 'Boolean flag indicating if the task is urgent (true) or normal (false). Replaces the old priorita numeric system.';

   -- Update activities table (if it exists)
   -- First, add the new urgent column
   ALTER TABLE activities 
   ADD COLUMN IF NOT EXISTS urgent BOOLEAN DEFAULT false;

   -- Update existing records: convert priorita >= 8 to urgent = true
   UPDATE activities 
   SET urgent = (priorita >= 8)
   WHERE priorita IS NOT NULL;

   -- Remove the old priorita column
   ALTER TABLE activities 
   DROP COLUMN IF EXISTS priorita;

   -- Add a comment to document the change
   COMMENT ON COLUMN activities.urgent IS 'Boolean flag indicating if the activity is urgent (true) or normal (false). Replaces the old priorita numeric system.';
   ```

4. **Esegui la Migrazione**
   - Clicca su "Run" o premi Ctrl+Enter
   - Attendi che la migrazione sia completata

5. **Verifica il Risultato**
   - Dovresti vedere messaggi di successo
   - La migrazione aggiungerà la colonna `urgent` e rimuoverà `priorita`

### METODO 2: Supabase CLI (OPZIONALE)

Se hai Supabase CLI installato:

```bash
# Login a Supabase
supabase login

# Collega il progetto (sostituisci con il tuo project ID)
supabase link --project-ref YOUR_PROJECT_ID

# Applica la migrazione
supabase db push
```

## ✅ VERIFICA POST-MIGRAZIONE

1. **Testa la Creazione Attività**
   - Vai su LexAgenda
   - Prova a creare una nuova attività
   - L'errore dovrebbe essere risolto

2. **Verifica Database**
   - Nel SQL Editor di Supabase, esegui:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'tasks' 
   AND column_name IN ('urgent', 'priorita');
   ```
   - Dovresti vedere solo `urgent` (boolean), non `priorita`

## 🎯 RISULTATO ATTESO

Dopo aver applicato la migrazione:
- ✅ La colonna `urgent` esisterà nella tabella `tasks`
- ✅ La colonna `priorita` sarà rimossa
- ✅ L'errore di creazione attività sarà risolto
- ✅ L'applicazione funzionerà correttamente

## 🚨 IMPORTANTE

- **Backup**: Prima di applicare la migrazione, fai un backup del database
- **Test**: Testa in un ambiente di sviluppo se possibile
- **Monitoraggio**: Controlla i log dopo l'applicazione

## 📞 SUPPORTO

Se incontri problemi:
1. Controlla i log di Supabase per errori
2. Verifica che la migrazione sia stata applicata completamente
3. Testa la creazione di una nuova attività

---

**Questa migrazione risolverà definitivamente l'errore di creazione attività!** 🎉
