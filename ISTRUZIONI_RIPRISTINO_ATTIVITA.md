# 🚨 ISTRUZIONI PER RIPRISTINARE LE ATTIVITÀ

## Problema
Le attività non sono visibili nella Dashboard perché la tabella `tasks` non esiste nel database di produzione.

## Soluzione
Eseguire lo script SQL per creare la tabella `tasks` nel database Supabase.

## Passaggi da seguire:

### 1. Accedi al Dashboard Supabase
- Vai su [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Accedi al tuo progetto

### 2. Vai alla sezione SQL Editor
- Nel menu laterale, clicca su "SQL Editor"
- Clicca su "New query"

### 3. Esegui lo script SQL
- Copia tutto il contenuto del file `CREATE_TASKS_TABLE.sql`
- Incollalo nell'editor SQL
- Clicca su "Run" per eseguire lo script

### 4. Verifica l'esecuzione
- Dovresti vedere il messaggio "Tabella tasks creata con successo"
- Se ci sono errori, controlla i log

### 5. Testa l'applicazione
- Ricarica la pagina dell'applicazione
- Le attività dovrebbero ora essere visibili nella Dashboard

## File da utilizzare:
- `CREATE_TASKS_TABLE.sql` - Script SQL per creare la tabella

## Note:
- Questo script crea la tabella `tasks` con tutti i campi necessari
- Abilita Row Level Security per la sicurezza
- Crea gli indici per migliorare le performance
- Aggiunge i trigger per aggiornare automaticamente i timestamp

## In caso di problemi:
1. Controlla i log di Supabase per eventuali errori
2. Verifica che l'utente abbia i permessi per creare tabelle
3. Contatta l'amministratore del database se necessario

## Dopo l'esecuzione:
- Le attività esistenti nelle pratiche dovrebbero essere visibili
- Potrai creare nuove attività dalla Dashboard
- Le pagine Mese e Settimana funzioneranno correttamente
