# Guida al Calcolatore Termini Processuali

## Introduzione

Il Calcolatore Termini Processuali di LexAgenda implementa le regole del Codice di Procedura Civile italiano per il calcolo preciso dei termini processuali. Questo strumento è essenziale per gli avvocati per calcolare correttamente le scadenze e evitare decadenza.

## Funzionalità Principali

### 1. Calcolo Termini ex Numeratio Dierum (Art. 155 c.p.c.)
- **Giorni**: Calcolo per giorni (es. 20 giorni per comparsa conclusionale)
- **Sospensione feriale**: Applicazione automatica della sospensione di agosto
- **Regola sabato**: Posticipazione automatica se la scadenza cade di sabato
- **Termine libero**: Opzione per termini che non posticipano per festività

### 2. Calcolo Termini ex Nominatione Dierum (Art. 155 c.p.c.)
- **Mesi**: Calcolo per mesi (es. 1 mese, 3 mesi)
- **Anni**: Calcolo per anni (es. 5 anni per prescrizione)
- **Gestione mesi con giorni diversi**: 31 gennaio + 1 mese = 28/29 febbraio

### 3. Termini Predefiniti
Database completo dei termini processuali più comuni:
- Comparsa conclusionale (20 giorni)
- Appello civile (30 giorni)
- Ricorso per cassazione (60 giorni)
- Opposizione a decreto ingiuntivo (40 giorni)
- E molti altri...

## Come Utilizzare il Calcolatore

### Accesso
1. Dalla Dashboard principale, clicca sul pulsante **"TERMINI"** (viola)
2. Oppure usa la navigazione rapida nell'header

### Calcolo Manuale
1. **Data di inizio**: Seleziona la data da cui iniziare il calcolo
2. **Tipo di calcolo**: Scegli tra Giorni, Mesi o Anni
3. **Valore**: Inserisci il numero di giorni/mesi/anni
4. **Opzioni**:
   - ✅ **Sospensione feriale**: Applica la sospensione di agosto
   - ✅ **Termine libero**: Non posticipa per festività
   - ✅ **Calcolo a ritroso**: Calcola la data di inizio partendo dalla scadenza
5. Clicca **"Calcola"**

### Calcolo con Termini Predefiniti
1. Attiva il toggle **"Usa termine predefinito"**
2. **Cerca** un termine specifico o **filtra per categoria**
3. **Seleziona** il termine desiderato
4. I campi si compilano automaticamente
5. Clicca **"Calcola"**

## Regole Implementate

### Sospensione Feriale (Art. 155 c.p.c.)
- **Periodo**: 1-31 agosto
- **Applicazione**: Automatica per tutti i termini processuali
- **Calcolo**: I giorni di agosto vengono aggiunti al termine

### Regola Sabato (Comma 5 Art. 155 c.p.c.)
- **Posticipazione**: Se la scadenza cade di sabato, viene posticipata al lunedì
- **Calcolo prudenziale**: Per calcoli a ritroso, anticipa al venerdì

### Festività Nazionali
Il calcolatore riconosce tutte le festività nazionali italiane:
- Capodanno, Epifania, Liberazione
- Festa del Lavoro, Festa della Repubblica
- Ferragosto, Ognissanti, Immacolata
- Natale, Santo Stefano
- Pasqua e Pasquetta (calcolo automatico)

### Termini Liberi
Alcuni termini (es. comparsa conclusionale) sono "liberi" e non posticipano per festività.

## Risultati e Note

### Visualizzazione Risultati
- **Data calcolata**: Data base del calcolo
- **Scadenza finale**: Data effettiva di scadenza
- **Giorni sospensione**: Giorni aggiunti per sospensione feriale
- **Note**: Spiegazioni dettagliate del calcolo

### Indicatori Visivi
- 🔴 **Urgente**: Scadenza entro 7 giorni
- 🟡 **Attenzione**: Scadenza entro 30 giorni
- 🟢 **Normale**: Scadenza oltre 30 giorni
- ⚠️ **Avvisi**: Date che cadono in festivi o sabati

## Integrazione con il Calendario

### Aggiunta Automatica
1. Dopo il calcolo, clicca **"Aggiungi al Calendario"**
2. La scadenza viene creata automaticamente
3. Categoria: "Scadenza Processuale"
4. Ora predefinita: 09:00

### Gestione Scadenze
- Le scadenze aggiunte appaiono nella dashboard
- Notifiche automatiche per scadenze imminenti
- Possibilità di modificare o eliminare

## Casi d'Uso Comuni

### 1. Comparsa Conclusionale
- **Termine**: 20 giorni
- **Tipo**: Termine libero
- **Sospensione**: Sì
- **Uso**: Dopo la fissazione dell'udienza

### 2. Appello Civile
- **Termine**: 30 giorni
- **Tipo**: Termine normale
- **Sospensione**: Sì
- **Uso**: Dalla notifica della sentenza

### 3. Ricorso per Cassazione
- **Termine**: 60 giorni
- **Tipo**: Termine normale
- **Sospensione**: Sì
- **Uso**: Dalla notifica della sentenza di appello

### 4. Opposizione a Decreto Ingiuntivo
- **Termine**: 40 giorni
- **Tipo**: Termine normale
- **Sospensione**: Sì
- **Uso**: Dalla notifica del decreto

## Validazioni e Sicurezza

### Controlli Automatici
- ✅ Data di inizio valida
- ✅ Valore termine positivo
- ✅ Limiti massimi rispettati
- ✅ Formato date corretto

### Limiti di Sicurezza
- **Giorni**: Massimo 3650 (10 anni)
- **Mesi**: Massimo 120 (10 anni)
- **Anni**: Massimo 10

## Note Legali

### Disclaimer
Questo calcolatore implementa le regole del CPC italiano ma:
- I risultati sono forniti a titolo informativo
- Non sostituisce la consulenza legale professionale
- È responsabilità dell'avvocato verificare i calcoli
- Le regole possono variare per casi specifici

### Riferimenti Normativi
- **Art. 155 c.p.c.**: Calcolo termini
- **Art. 183 c.p.c.**: Comparsa conclusionale
- **Art. 325 c.p.c.**: Appello
- **Art. 366 c.p.c.**: Cassazione
- **Art. 633 c.p.c.**: Opposizione decreto

## Supporto e Aggiornamenti

### Segnalazione Problemi
Se riscontri errori o hai suggerimenti:
1. Verifica la versione dell'app
2. Controlla i log di errore
3. Segnala il problema al supporto

### Aggiornamenti
Il calcolatore viene aggiornato regolarmente per:
- Nuove normative
- Correzioni di bug
- Miglioramenti UX
- Nuovi termini processuali

## Esempi Pratici

### Esempio 1: Comparsa Conclusionale
```
Data inizio: 15 gennaio 2024
Termine: 20 giorni (libero)
Sospensione: Sì
Risultato: 4 febbraio 2024
```

### Esempio 2: Appello con Sospensione
```
Data inizio: 15 luglio 2024
Termine: 30 giorni
Sospensione: Sì
Risultato: 14 febbraio 2025 (con giorni agosto aggiunti)
```

### Esempio 3: Calcolo a Ritroso
```
Scadenza: 15 marzo 2024
Termine: 30 giorni
Calcolo a ritroso: Sì
Risultato: 14 febbraio 2024
```

---

**LexAgenda v1.9.3** - Calcolatore Termini Processuali
*Created by Abruzzo.AI*
