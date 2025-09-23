# Deployment Calcolatore Termini Processuali

## Prerequisiti

### 1. Database Migration
Prima di deployare l'app, esegui la migrazione del database:

```bash
# Applica la migrazione per la tabella calcoli_termini
supabase db push
```

Oppure esegui manualmente il file:
`supabase/migrations/20250123_create_calcoli_termini.sql`

### 2. Dipendenze
Installa le nuove dipendenze di test (opzionale):

```bash
npm install
```

## File Aggiunti/Modificati

### Nuovi File
- `src/utils/terminiProcessuali.ts` - Funzioni core di calcolo
- `src/data/terminiStandard.ts` - Database termini processuali
- `src/components/CalcolatoreTermini.tsx` - Componente principale
- `src/components/RisultatoCalcolo.tsx` - Componente risultati
- `src/hooks/useCalcolatoreTermini.tsx` - Hook per integrazione
- `src/pages/CalcolatoreTerminiPage.tsx` - Pagina dedicata
- `src/utils/__tests__/terminiProcessuali.test.ts` - Test cases
- `supabase/migrations/20250123_create_calcoli_termini.sql` - Migrazione DB
- `jest.config.js` - Configurazione test
- `src/setupTests.ts` - Setup test
- `CALCOLATORE_TERMINI_GUIDE.md` - Guida utente
- `CALCOLATORE_TERMINI_DEPLOYMENT.md` - Questo file

### File Modificati
- `src/App.tsx` - Aggiunta navigazione calcolatore
- `src/pages/DashboardPage.tsx` - Aggiunto pulsante TERMINI
- `package.json` - Aggiunte dipendenze test e script

## Verifica Pre-Deployment

### 1. Test Funzionali
```bash
# Esegui i test
npm run test

# Test con coverage
npm run test:coverage
```

### 2. Build
```bash
# Verifica che il build funzioni
npm run build
```

### 3. Linting
```bash
# Verifica che non ci siano errori di linting
npm run lint
```

## Deployment

### 1. Build Production
```bash
npm run build
```

### 2. Deploy su Supabase
```bash
# Deploy delle funzioni edge (se necessario)
supabase functions deploy

# Deploy del database
supabase db push
```

### 3. Deploy Frontend
Deploya la cartella `dist/` sul tuo hosting preferito.

## Post-Deployment

### 1. Verifica Funzionalità
- [ ] Accesso al calcolatore dalla dashboard
- [ ] Calcolo termini base (giorni, mesi, anni)
- [ ] Termini predefiniti funzionanti
- [ ] Integrazione con calendario
- [ ] Validazioni e error handling
- [ ] UI responsive (mobile/desktop)

### 2. Test Casi Specifici
- [ ] Comparsa conclusionale (20 giorni)
- [ ] Appello civile (30 giorni)
- [ ] Ricorso cassazione (60 giorni)
- [ ] Sospensione feriale agosto
- [ ] Regola sabato
- [ ] Festività nazionali

### 3. Verifica Database
```sql
-- Controlla che la tabella sia stata creata
SELECT * FROM calcoli_termini LIMIT 1;

-- Verifica le policy RLS
SELECT * FROM pg_policies WHERE tablename = 'calcoli_termini';
```

## Rollback (se necessario)

### 1. Rollback Database
```sql
-- Elimina la tabella (ATTENZIONE: perde i dati)
DROP TABLE IF EXISTS calcoli_termini CASCADE;
```

### 2. Rollback Frontend
Ripristina i file modificati dalla versione precedente:
- `src/App.tsx`
- `src/pages/DashboardPage.tsx`
- `package.json`

## Monitoraggio

### 1. Log Errori
Monitora i log per errori relativi al calcolatore:
- Errori di calcolo
- Problemi di validazione
- Errori di integrazione calendario

### 2. Performance
- Tempo di risposta calcoli
- Caricamento componenti
- Uso memoria

### 3. Utilizzo
- Numero calcoli effettuati
- Termini più utilizzati
- Errori di validazione comuni

## Aggiornamenti Futuri

### 1. Nuovi Termini
Per aggiungere nuovi termini processuali:
1. Modifica `src/data/terminiStandard.ts`
2. Aggiungi il nuovo termine all'array `TERMINI_PROCESSUALI`
3. Testa il nuovo termine
4. Deploy

### 2. Nuove Funzionalità
- Esportazione PDF
- Condivisione risultati
- Cronologia calcoli
- Notifiche push per scadenze

### 3. Miglioramenti UX
- Shortcuts tastiera
- Calcoli rapidi
- Widget dashboard
- Temi personalizzati

## Supporto

### Problemi Comuni
1. **Errore "Data non valida"**: Verifica formato data
2. **Calcolo errato**: Controlla opzioni sospensione/termine libero
3. **Integrazione calendario**: Verifica autenticazione utente
4. **Performance lenta**: Controlla dimensioni database

### Contatti
- **Sviluppo**: Abruzzo.AI
- **Supporto**: [email supporto]
- **Documentazione**: `CALCOLATORE_TERMINI_GUIDE.md`

---

**Versione**: 1.0.0  
**Data**: 23 Gennaio 2025  
**Compatibilità**: LexAgenda v1.9.3+
