# 📅 Calcolatore Giorni Intercorrenti - Guida Utente

## Introduzione

Il **Calcolatore Giorni Intercorrenti** è una nuova funzionalità integrata nel Calcolatore Legale di LexAgenda che permette di calcolare i giorni tra due date, includendo giorni lavorativi, festivi e sospensione feriale.

## 🎯 Funzionalità Principali

### Calcolo Completo
- **Giorni Totali**: Calcola tutti i giorni tra due date (esclusi i giorni estremi)
- **Giorni Lavorativi**: Esclude sabati e festività nazionali
- **Giorni Festivi**: Conta le festività nel periodo
- **Sospensione Feriale**: Identifica i giorni di agosto nel periodo

### Caratteristiche Avanzate
- ✅ **Gestione Festività**: Riconosce tutte le festività nazionali italiane
- ✅ **Calcolo Pasqua**: Algoritmo automatico per Pasqua e Pasquetta
- ✅ **Sospensione Feriale**: Opzione per includere/escludere agosto
- ✅ **Validazioni**: Controlli automatici per date valide
- ✅ **Integrazione Calendario**: Aggiunta automatica del periodo

## 🚀 Come Utilizzare

### Accesso
1. Dalla Dashboard, clicca **"CALCOLATORE"** (pulsante viola)
2. Seleziona il tab **"Giorni Intercorrenti"**
3. Inserisci le due date e clicca "Calcola Giorni"

### Interfaccia
- **Data di inizio**: Prima data del periodo
- **Data di fine**: Ultima data del periodo
- **Sospensione feriale**: Toggle per includere giorni di agosto
- **Risultato**: Visualizzazione dettagliata con statistiche

## 📊 Esempi di Utilizzo

### Esempio 1: Periodo Standard
```
Data inizio: 1 gennaio 2024
Data fine: 31 gennaio 2024
Risultato: 30 giorni totali, 22 giorni lavorativi, 8 giorni festivi
```

### Esempio 2: Con Sospensione Feriale
```
Data inizio: 1 luglio 2024
Data fine: 31 agosto 2024
Risultato: 31 giorni totali, 22 giorni lavorativi, 31 giorni sospensione feriale
```

### Esempio 3: Periodo con Festività
```
Data inizio: 20 dicembre 2024
Data fine: 10 gennaio 2025
Risultato: 21 giorni totali, 15 giorni lavorativi, 6 giorni festivi
```

## 🏛️ Casi d'Uso Legali

### 1. **Calcolo Durata Procedimenti**
- Tempo trascorso tra notifica e scadenza
- Durata di un procedimento giudiziario
- Tempi di attesa per decisioni

### 2. **Termini di Prescrizione**
- Calcolo giorni per prescrizione breve (5 anni)
- Verifica scadenze prescrizionali
- Controllo decadenza diritti

### 3. **Periodi di Decadenza**
- Tempi per esercitare diritti
- Scadenze contrattuali
- Termini per reclami

### 4. **Calcoli Processuali**
- Tempo tra udienze
- Durata istruttoria
- Periodi di sospensione

## 📋 Dettagli Tecnici

### Algoritmo di Calcolo
1. **Ordinamento Date**: Le date vengono automaticamente ordinate
2. **Conteggio Giorni**: Calcola giorni tra le date (esclusi estremi)
3. **Classificazione**: Distingue tra lavorativi, festivi e sospensione
4. **Validazione**: Controlla date valide e logiche

### Festività Riconosciute
- **Fisse**: Capodanno, Epifania, Liberazione, Festa del Lavoro, Festa della Repubblica, Ferragosto, Ognissanti, Immacolata, Natale, Santo Stefano
- **Mobili**: Pasqua e Pasquetta (calcolo automatico con algoritmo di Gauss)

### Sospensione Feriale
- **Periodo**: 1-31 agosto
- **Applicazione**: Opzionale tramite toggle
- **Calcolo**: Giorni di agosto nel periodo selezionato

## 🎨 Interfaccia Utente

### Design
- **Layout Responsive**: Ottimizzato per mobile e desktop
- **Colori Intuitivi**: Verde per lavorativi, giallo per festivi, arancione per sospensione
- **Visualizzazione Chiara**: Statistiche principali evidenziate

### Navigazione
- **Tab System**: Facile passaggio tra funzionalità
- **Pulsanti Intuitivi**: Azioni chiare e immediate
- **Feedback Visivo**: Indicatori di stato e caricamento

## 🔧 Integrazione

### Calendario
- **Aggiunta Automatica**: Il periodo può essere aggiunto al calendario
- **Categoria**: "Scadenza Processuale"
- **Note**: Include statistiche del calcolo

### Database
- **Cronologia**: I calcoli vengono salvati per riferimento futuro
- **Sicurezza**: Policy RLS per protezione dati utente

## ⚠️ Note Importanti

### Validazioni
- ✅ Date obbligatorie
- ✅ Date valide (formato corretto)
- ✅ Date diverse (non possono essere uguali)
- ✅ Logica temporale (fine dopo inizio)

### Limitazioni
- **Periodo Massimo**: 10 anni (3650 giorni)
- **Date Estreme**: Escluse dal conteggio
- **Fuso Orario**: Utilizza fuso orario locale

### Disclaimer Legale
I risultati sono forniti a titolo informativo e non sostituiscono la consulenza legale professionale. È responsabilità dell'avvocato verificare i calcoli per casi specifici.

## 🆕 Aggiornamenti

### Versione 1.0.0
- ✅ Calcolo giorni intercorrenti base
- ✅ Gestione festività nazionali
- ✅ Sospensione feriale
- ✅ Integrazione calendario
- ✅ Interfaccia responsive

### Prossimi Aggiornamenti
- 📅 Calcolo giorni lavorativi esatti (escludendo sabati)
- 📊 Statistiche avanzate per periodo
- 📤 Esportazione risultati in PDF
- 🔄 Cronologia calcoli salvati

## 📞 Supporto

### Problemi Comuni
1. **Date non valide**: Verifica formato DD/MM/YYYY
2. **Date uguali**: Inserisci date diverse
3. **Periodo troppo lungo**: Riduci il range di date

### Contatti
- **Sviluppo**: Abruzzo.AI
- **Documentazione**: Guide complete incluse
- **Aggiornamenti**: Segui le release notes

---

**Versione**: 1.0.0  
**Data**: 23 Gennaio 2025  
**Compatibilità**: LexAgenda v1.9.3+  
**Sviluppato da**: Abruzzo.AI
