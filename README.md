# Legal Planner - Sistema di Gestione Pratiche Legali

Un'applicazione web professionale per studi legali che permette di gestire pratiche, attività e scadenze con un'interfaccia intuitiva e funzionalità avanzate.

## 🚀 Caratteristiche Principali

- **Gestione Completa**: Traccia pratiche, attività e scadenze in un'unica piattaforma
- **Vista Calendario**: Visualizzazione mensile e settimanale con drag & drop
- **Autenticazione Sicura**: Login tramite email/password con Supabase Auth
- **Import/Export**: Importazione CSV e esportazione ICS per integrazioni
- **Responsive Design**: Ottimizzato per desktop, tablet e mobile
- **Filtraggio Avanzato**: Ricerca per testo, filtri per stato e priorità
- **Drag & Drop**: Sposta facilmente le attività tra le date

## 🛠 Stack Tecnologico

- **Frontend**: Vite, React 18, TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Autenticazione**: Supabase Auth (Magic Links)
- **Date Management**: date-fns
- **Deployment**: Pronto per Netlify

## 📋 Prerequisiti

- Node.js 18+ 
- Account Supabase
- Git

## 🔧 Setup e Installazione

### 1. Clone del Repository

```bash
git clone <repository-url>
cd legal-planner
```

### 2. Installazione Dipendenze

```bash
npm install
```

### 3. Configurazione Supabase

#### Opzione A: Supabase Cloud (Raccomandato)

1. **Crea un progetto**: Vai su [Supabase](https://supabase.com) e crea un nuovo progetto
2. **Ottieni le credenziali**: Vai su Settings > API per ottenere:
   - Project URL
   - Anon public key
3. **Configura l'autenticazione**: 
   - Vai su Authentication > Settings
   - Disabilita "Enable email confirmations" se vuoi login immediato
   - Aggiungi il tuo dominio in "Site URL" e "Redirect URLs"

#### Opzione B: Supabase Locale (Sviluppo)

```bash
# Installa Supabase CLI
npm install -g supabase

# Inizializza progetto locale
supabase init

# Avvia Supabase locale
supabase start
```

### 4. Configurazione Variabili d'Ambiente

Copia il file `.env.example` in `.env.local`:

```bash
cp .env.example .env.local
```

Modifica `.env.local` con i tuoi valori:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Setup Database

#### Metodo 1: Dashboard Supabase (Cloud)

1. Vai su SQL Editor nel dashboard Supabase
2. Copia e incolla il contenuto di `supabase/migrations/001_create_legal_planner_schema.sql`
3. Esegui la query

#### Metodo 2: CLI Supabase (Locale)

```bash
# Applica le migrazioni
supabase db push

# Oppure applica manualmente
supabase db reset
```

### 6. Dati di Test (Opzionale)

Per aggiungere dati di esempio:

1. Crea un utente tramite l'applicazione
2. Ottieni l'UUID utente dalla tabella `auth.users`
3. Modifica `supabase/seed.sql` sostituendo `your-user-id-here`
4. Esegui il seed nel SQL Editor

## 🚀 Avvio Sviluppo

```bash
# Avvia il server di sviluppo
npm run dev

# Se usi Supabase locale, avvia anche:
supabase start
```

L'applicazione sarà disponibile su `http://localhost:5173`

## 📱 Utilizzo

### Login
1. **Registrazione**: Clicca su "Non hai un account? Registrati"
   - Inserisci email e password (minimo 6 caratteri)
   - Clicca "Crea Account"
2. **Login**: Inserisci email e password esistenti
3. **Accesso immediato**: Nessuna conferma email richiesta (configurabile)

### Dashboard
- **Lista Attività**: Visualizza, ordina e gestisci tutte le attività
- **Calendario**: Vista mensile/settimanale con drag & drop
- **Filtri**: Cerca per testo, filtra per stato
- **Azioni**: Aggiungi, modifica, elimina attività

### Import/Export
- **Import CSV**: Carica attività da file CSV
- **Export ICS**: Esporta scadenze per calendari esterni

## 🏗 Build e Deploy

### Build Locale

```bash
npm run build
npm run preview
```

### Deploy su Netlify

1. Connetti il repository a Netlify
2. Configura le variabili d'ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Build command: `npm run build`
4. Publish directory: `dist`

### Configurazione Netlify

Crea un file `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🔧 Configurazione Avanzata

### Supabase RLS (Row Level Security)

Il sistema utilizza RLS per garantire che ogni utente acceda solo ai propri dati:

```sql
-- Esempio di policy RLS
CREATE POLICY "Users can read own tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

### Personalizzazione Autenticazione

Per modificare le impostazioni di autenticazione:

1. **Dashboard Supabase** > Authentication > Settings
2. **Configurazioni disponibili**:
   - Email confirmations (on/off)
   - Password requirements
   - Session timeout
   - Redirect URLs

### Database Locale vs Cloud

**Sviluppo Locale:**
- Usa `supabase start` per database locale
- Dati non persistenti tra restart
- Ideale per sviluppo e test

**Produzione Cloud:**
- Database persistente
- Backup automatici
- Scaling automatico
- Monitoraggio avanzato

## 🧪 Testing

```bash
# Esegui i test
npm test

# Test in modalità watch
npm run test:watch
```

## 📊 Schema Database

### Tabella `profiles`
- `id`: UUID (PK, riferimento a auth.users)
- `email`: Text (unique)
- `full_name`: Text (nullable)
- `created_at`: Timestamp

### Tabella `tasks`
- `id`: UUID (PK, auto-generated)
- `user_id`: UUID (FK a profiles)
- `pratica`: Text (nome pratica/cliente)
- `attivita`: Text (descrizione attività)
- `scadenza`: Date (data scadenza)
- `stato`: Text ('todo'|'done')
- `priorita`: Integer (0-10)
- `created_at`: Timestamp
- `updated_at`: Timestamp

## 🔒 Sicurezza

- **Row Level Security (RLS)**: Ogni utente accede solo ai propri dati
- **Autenticazione**: Magic links sicuri tramite Supabase
- **Validazione**: Input validation sia client che server-side
- **HTTPS**: Comunicazioni crittografate

## 🤝 Contributi

1. Fork del progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push del branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📝 Licenza

Questo progetto è sotto licenza MIT. Vedi il file `LICENSE` per dettagli.

## 🆘 Supporto

Per problemi o domande:

1. Controlla la documentazione
2. Cerca negli issues esistenti
3. Crea un nuovo issue con dettagli del problema

## 🔄 Roadmap

- [x] Autenticazione email/password
- [x] CRUD completo attività
- [x] Calendario drag & drop
- [x] Filtri e ricerca
- [ ] Import/Export CSV/ICS
- [ ] Notifiche scadenze
- [ ] Report e statistiche
- [ ] Integrazione calendari esterni
- [ ] App mobile
- [ ] API pubbliche

---

Sviluppato con ❤️ per professionisti legali# Trigger deploy
