# 👥 GUIDA ALLA GESTIONE CLIENTI

## 📋 Panoramica

La nuova funzionalità di **Gestione Clienti** permette di gestire in modo completo le informazioni dei clienti dello studio legale, con supporto per diversi tipi di entità e informazioni dettagliate.

## 🚀 Caratteristiche Principali

### ✅ Tipologie di Cliente Supportate
- **Persona fisica** - Clienti individuali
- **Società** - Società per azioni, a responsabilità limitata, etc.
- **Società di persone** - S.n.c., s.a.s., etc.
- **Enti pubblici** - Pubblica amministrazione
- **Associazioni** - Associazioni no-profit
- **Consorzi** - Consorzi di imprese
- **Cooperative** - Società cooperative
- **E molte altre...** (vedi lista completa nel form)

### 📝 Informazioni Gestite
- **Dati anagrafici**: Nome, cognome, titolo, sesso, data e luogo di nascita
- **Dati fiscali**: Partita IVA
- **Indirizzi multipli**: Con nomi personalizzati (es. "Sede legale", "Indirizzo fatturazione")
- **Contatti multipli**: Email, telefono, PEC, cellulare, fax, sito web
- **Informazioni PA**: Codici destinatario per la pubblica amministrazione
- **Note e sigle**: Informazioni aggiuntive

## 🎯 Come Utilizzare

### 1. **Accesso alla Gestione Clienti**
- Dalla Dashboard principale, clicca sul pulsante **"CLIENTI"** (icona utenti)
- Disponibile sia nella versione mobile che desktop

### 2. **Creare un Nuovo Cliente**
1. Clicca su **"Nuovo Cliente"**
2. Compila il form con le informazioni richieste:
   - **Tipologia**: Seleziona il tipo di cliente
   - **Alternativa**: Spunta se è un cliente alternativo
   - **Ragione**: Nome/ragione sociale del cliente
3. Compila le **Informazioni Personali** (se persona fisica)
4. Aggiungi **Indirizzi** cliccando "Aggiungi Indirizzo"
5. Aggiungi **Contatti** cliccando "Aggiungi Contatto"
6. Inserisci eventuali **Note** e **Sigla**
7. Clicca **"Crea Cliente"**

### 3. **Gestire Indirizzi**
- Ogni cliente può avere **indirizzi multipli**
- Assegna un **Nome Campo** per identificare l'indirizzo (es. "Sede legale", "Indirizzo fatturazione")
- L'indirizzo con Nome Campo **"Indirizzo"** sarà utilizzato come indirizzo di fatturazione

### 4. **Gestire Contatti**
- Ogni cliente può avere **contatti multipli**
- Seleziona il **Tipo** di contatto (Email, Telefono, PEC, etc.)
- Assegna un **Nome Campo** per contatti speciali
- Il contatto con Nome Campo **"Email PEC"** sarà utilizzato come PEC di default

### 5. **Cercare e Filtrare**
- Utilizza la **barra di ricerca** per trovare clienti per:
  - Nome/Ragione sociale
  - Cognome
  - Tipologia
- I risultati si aggiornano in tempo reale

### 6. **Modificare un Cliente**
- Clicca sull'icona **Modifica** (matita) nella card del cliente
- Modifica le informazioni necessarie
- Clicca **"Aggiorna Cliente"**

### 7. **Eliminare un Cliente**
- Clicca sull'icona **Elimina** (cestino) nella card del cliente
- Conferma l'eliminazione nel dialog

## 🗄️ Database

### Migrazione Richiesta
Prima di utilizzare la gestione clienti, è necessario applicare la migrazione del database:

```sql
-- File: supabase/migrations/20250124_create_clients_table.sql
-- Questa migrazione crea la tabella 'clients' con tutti i campi necessari
```

### Struttura Dati
- **Tabella**: `clients`
- **Campi principali**: `tipologia`, `ragione`, `cognome`, `nome`, `partita_iva`
- **Campi JSON**: `indirizzi`, `contatti` (per flessibilità)
- **Sicurezza**: Row Level Security (RLS) abilitata
- **Indici**: Ottimizzati per ricerche rapide

## 🎨 Interfaccia Utente

### Layout Responsive
- **Mobile**: Layout verticale con card impilate
- **Desktop**: Griglia a 3 colonne con card compatte

### Informazioni Visualizzate
Ogni card cliente mostra:
- **Icona**: Diversa per persona fisica vs entità
- **Nome/Ragione sociale**
- **Tipologia** (badge)
- **Contatto principale** (email/telefono)
- **Indirizzo principale**
- **Data creazione**
- **Badge "Alternativa"** (se applicabile)

### Pulsanti di Azione
- **Modifica**: Icona matita
- **Elimina**: Icona cestino (rossa)

## ⚠️ Note Importanti

### Regole di Business
1. **Indirizzo fatturazione**: L'indirizzo con Nome Campo "Indirizzo" sarà utilizzato per la fatturazione
2. **Email PEC**: Il contatto con Nome Campo "Email PEC" sarà l'indirizzo PEC di default
3. **Categorie**: Non è possibile selezionare più di una tipologia alla volta
4. **Sicurezza**: Ogni utente vede solo i propri clienti

### Limitazioni
- **Ricerca**: Attualmente supporta ricerca per testo libero
- **Esportazione**: Non ancora implementata
- **Importazione**: Non ancora implementata
- **Validazione**: Validazione base dei campi obbligatori

## 🔧 Sviluppo Tecnico

### File Creati/Modificati
- `src/data/clientTypes.ts` - Costanti per tipologie
- `src/types/client.ts` - Interfacce TypeScript
- `src/components/clients/ClientForm.tsx` - Form di creazione/modifica
- `src/components/ui/textarea.tsx` - Componente textarea
- `src/pages/ClientsPage.tsx` - Pagina principale
- `src/App.tsx` - Navigazione aggiornata
- `src/pages/DashboardPage.tsx` - Pulsante navigazione aggiunto
- `supabase/migrations/20250124_create_clients_table.sql` - Migrazione DB

### Tecnologie Utilizzate
- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React

## 🚀 Prossimi Sviluppi

### Funzionalità Pianificate
- [ ] **Integrazione con le pratiche**: Collegamento clienti-pratiche
- [ ] **Esportazione**: Export in Excel/PDF
- [ ] **Importazione**: Import da file CSV
- [ ] **Validazione avanzata**: Controllo partita IVA, email, etc.
- [ ] **Storico modifiche**: Tracciamento delle modifiche
- [ ] **Filtri avanzati**: Per tipologia, data creazione, etc.
- [ ] **Ricerca avanzata**: Ricerca per indirizzo, contatti, etc.

### Miglioramenti UI/UX
- [ ] **Drag & Drop**: Per riordinare indirizzi/contatti
- [ ] **Anteprima**: Anteprima dati cliente
- [ ] **Template**: Template per tipologie comuni
- [ ] **Validazione real-time**: Feedback immediato
- [ ] **Shortcuts**: Tasti di scelta rapida

---

**Versione**: 1.0.0  
**Data**: 2025-01-24  
**Autore**: Sistema Planner Legale
