# 🚨 URGENTE - ESEGUI QUESTO PER RISOLVERE IL PROBLEMA

## Il problema è che i campi mancanti nel database!

I log mostrano che i campi `codice_fiscale`, `cliente`, `controparte`, `altri` non esistono nel database.

## SOLUZIONE IMMEDIATA:

### 1. VAI AL DASHBOARD SUPABASE
- Apri [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Accedi al tuo progetto
- Vai a **SQL Editor** → **New query**

### 2. COPIA E INCOLLA QUESTO CODICE:

```sql
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
```

### 3. CLICCA "RUN"

### 4. VERIFICA IL RISULTATO
Dovresti vedere una tabella con tutti i campi della tabella `clients`, inclusi i nuovi:
- `codice_fiscale`
- `denominazione` 
- `cliente`
- `controparte`
- `altri`

## DOPO AVER ESEGUITO LO SCRIPT:

1. **Ricarica l'applicazione**
2. **Prova a salvare un cliente** con codice fiscale e ruoli
3. **Dovrebbe funzionare!**

## SE NON FUNZIONA ANCORA:

Controlla i log della console - dovresti vedere i campi `codice_fiscale`, `cliente`, `controparte`, `altri` nell'oggetto "Dati da salvare".

---

**IMPORTANTE:** Questo script è sicuro e non cancella dati esistenti. Aggiunge solo i campi mancanti.
