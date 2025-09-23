# 🗄️ ISTRUZIONI PER APPLICARE LA MIGRAZIONE DATABASE

## ⚠️ IMPORTANTE
Prima di utilizzare l'app con i nuovi campi Cliente e Controparte, devi applicare la migrazione del database.

## 📋 Passaggi per Applicare la Migrazione

### 1. Accedi al Dashboard Supabase
- Vai su [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Accedi al tuo account
- Seleziona il progetto "Maurizio" (o il nome del tuo progetto)

### 2. Vai alla Sezione SQL Editor
- Nel menu laterale, clicca su "SQL Editor"
- Clicca su "New query"

### 3. Esegui la Migrazione
Copia e incolla questo codice SQL:

```sql
-- Add new fields to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS note TEXT,
ADD COLUMN IF NOT EXISTS cliente TEXT,
ADD COLUMN IF NOT EXISTS controparte TEXT;

-- Add comments for documentation
COMMENT ON COLUMN tasks.note IS 'Additional notes for the task';
COMMENT ON COLUMN tasks.cliente IS 'Client involved in the case';
COMMENT ON COLUMN tasks.controparte IS 'Opposing party in the case';
```

### 4. Esegui la Query
- Clicca sul pulsante "Run" (▶️)
- Verifica che la query sia stata eseguita con successo
- Dovresti vedere un messaggio di conferma

### 5. Verifica la Struttura della Tabella
Per verificare che i campi siano stati aggiunti, esegui questa query:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;
```

Dovresti vedere i nuovi campi:
- `note` (TEXT, nullable)
- `cliente` (TEXT, nullable) 
- `controparte` (TEXT, nullable)

## ✅ Dopo l'Applicazione della Migrazione

Una volta applicata la migrazione:

1. **I campi Cliente e Controparte saranno salvati nel database**
2. **Le attività esistenti mostreranno "Non specificata" per questi campi**
3. **Le nuove attività potranno essere salvate con Cliente e Controparte**
4. **La visualizzazione migliorata sarà completamente funzionale**

## 🎨 Nuova Visualizzazione

Dopo la migrazione, vedrai:

### Dashboard
- **Sezione dedicata** per Cliente e Controparte
- **Layout a griglia** con etichette chiare
- **Sfondo grigio** per distinguere le informazioni
- **Campi evidenziati** con bordi bianchi

### Calendari
- **Visualizzazione compatta** ma chiara
- **Etichette "PARTE" e "CONTRAPARTE"** sempre visibili
- **Layout responsive** per mobile e desktop

## 🚨 Risoluzione Problemi

### Se la migrazione fallisce:
1. Verifica di avere i permessi di amministratore
2. Controlla che la tabella `tasks` esista
3. Assicurati che non ci siano conflitti con nomi di colonne esistenti

### Se i campi non si salvano:
1. Verifica che la migrazione sia stata applicata correttamente
2. Controlla la console del browser per errori
3. Verifica che l'utente abbia i permessi di scrittura

## 📞 Supporto

Se hai problemi con la migrazione, contatta il supporto tecnico con:
- Screenshot del messaggio di errore
- Nome del progetto Supabase
- Versione dell'app (1.4.7)

---

**Versione App:** 1.4.7  
**Data Migrazione:** 2025-01-21  
**Campi Aggiunti:** note, cliente, controparte
