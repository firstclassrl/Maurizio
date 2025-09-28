# 🧠 PIANO TRAINING ASSISTENTE VOCALE LEXAGENDA

## 📊 **ANALISI STRUTTURA APP**

### **🗄️ Database Tables:**
- **`profiles`**: Utenti (id, email, full_name)
- **`clients`**: Clienti (tipologia, ragione, contatti, indirizzi, partita_iva)
- **`practices`**: Pratiche (numero, cliente_id, controparti_ids, tipo_procedura, autorita_giudiziaria, rg, giudice)
- **`activities`**: Attività (categoria, attivita, data, ora, note, stato, priorita)
- **`tasks`**: Task legacy (pratica, attivita, scadenza, stato, priorita)
- **`events`**: Eventi Google Calendar (title, description, start_datetime, end_datetime)
- **`calcoli_termini`**: Calcoli termini processuali (data_inizio, termine, data_scadenza)

### **📋 Categorie Attività:**
**STRAGIUDIZIALE:**
- Appuntamento
- Scadenza  
- Attività da Svolgere

**GIUDIZIALE:**
- Udienza
- Scadenza Processuale
- Attività Processuale

### **⚖️ Termini Processuali (30+ tipi):**
- Comparsa conclusionale (20 giorni)
- Appello civile (30 giorni)
- Ricorso cassazione (60 giorni)
- Opposizione decreto (40 giorni)
- E molti altri...

### **👥 Tipologie Clienti:**
- Persona fisica
- Persona Giuridica
- Ditta Individuale
- Altro ente

---

## 🎯 **PIANO TRAINING COMPLETO**

### **1. 📅 DOMANDE TEMPORALI**

#### **A. Scadenze Imminenti**
```
"Quando scade la prossima pratica?"
"Quali scadenze ho questa settimana?"
"Cosa scade domani?"
"Mostrami le scadenze urgenti"
"Quali pratiche scadono entro 7 giorni?"
"Ho scadenze oggi?"
"Quando è la prossima scadenza critica?"
"Mostrami le scadenze di questa settimana"
"Quali sono le scadenze più urgenti?"
"Cosa devo fare entro fine mese?"
```

#### **B. Udienze e Appuntamenti**
```
"Quando è la prossima udienza?"
"Quali udienze ho questa settimana?"
"Quando devo andare in tribunale?"
"Mostrami tutti gli appuntamenti di oggi"
"Quali udienze ho domani?"
"Quando è l'udienza di [CLIENTE]?"
"Mostrami il calendario delle udienze"
"Quali appuntamenti ho con i clienti?"
"Quando è la prossima conciliazione?"
"Mostrami le udienze del mese"
```

#### **C. Calcoli Termini**
```
"Calcola 20 giorni da oggi"
"Quando scade la comparsa conclusionale?"
"Calcola il termine per l'appello"
"Quanto tempo ho per il ricorso?"
"Calcola 30 giorni dal 15 gennaio"
"Quando devo depositare la comparsa?"
"Calcola il termine per l'opposizione"
"Quanto tempo ho per la notifica?"
"Calcola 60 giorni per la cassazione"
"Quando scade la prescrizione?"
```

### **2. 👥 DOMANDE CLIENTI**

#### **A. Informazioni Clienti**
```
"Mostrami tutti i clienti"
"Chi è il cliente della pratica 2025/001?"
"Quali sono i miei clienti?"
"Mostrami i dati del cliente [NOME]"
"Chi è [NOME_CLIENTE]?"
"Mostrami la lista completa dei clienti"
"Quali clienti ho?"
"Dammi informazioni su [CLIENTE]"
"Mostrami i clienti con partita IVA"
"Chi sono i miei clienti principali?"
```

#### **B. Ricerca Clienti**
```
"Cerca il cliente [NOME]"
"Trovami il cliente con P.IVA [NUMERO]"
"Cerca [RAGIONE_SOCIALE]"
"Trovami tutti i clienti [TIPOLOGIA]"
"Mostrami i clienti persona fisica"
"Trovami i clienti società"
"Cerca il cliente di [PRATICA]"
"Mostrami i clienti con nome [NOME]"
"Trovami [COGNOME]"
"Cerca clienti con [FILTRO]"
```

### **3. 📋 DOMANDE PRATICHE**

#### **A. Informazioni Pratiche**
```
"Mostrami tutte le pratiche"
"Quali pratiche ho in corso?"
"Dammi dettagli della pratica [NUMERO]"
"Mostrami le pratiche di [CLIENTE]"
"Quali sono le mie pratiche attive?"
"Mostrami la pratica [2025/001]"
"Dammi informazioni sulla pratica [NUMERO]"
"Mostrami tutte le pratiche giudiziali"
"Quali pratiche stragiudiziali ho?"
"Mostrami le pratiche con [FILTRO]"
```

#### **B. Attività per Pratica**
```
"Quali attività ha la pratica [NUMERO]?"
"Mostrami le attività di [PRATICA]"
"Cosa devo fare per [PRATICA]?"
"Mostrami il piano attività di [NUMERO]"
"Quali sono le prossime attività di [PRATICA]?"
"Mostrami lo stato della pratica [NUMERO]"
"Cosa c'è da fare per [CLIENTE]?"
"Mostrami le attività pendenti"
"Quali attività sono in ritardo?"
"Mostrami le attività di oggi"
```

### **4. ⚖️ DOMANDE SPECIFICHE ATTIVITÀ**

#### **A. Ricorsi**
```
"Quando devo fare ricorso per [CLIENTE]?"
"Quali ricorsi ho in corso?"
"Quando scade il ricorso di [PRATICA]?"
"Mostrami tutti i ricorsi"
"Quando è il ricorso per [CLIENTE]?"
"Quali ricorsi scadono questa settimana?"
"Mostrami i ricorsi urgenti"
"Quando devo depositare il ricorso?"
"Quali ricorsi ho da fare?"
"Mostrami le scadenze dei ricorsi"
```

#### **B. Pagamenti**
```
"Quando devo riscuotere per [CLIENTE]?"
"Quali pagamenti sono in scadenza?"
"Quando scadono i pagamenti di [PRATICA]?"
"Mostrami tutti i pagamenti"
"Quando devo fatturare [CLIENTE]?"
"Quali pagamenti ho da riscuotere?"
"Mostrami le fatture in scadenza"
"Quando è il pagamento di [CLIENTE]?"
"Quali pagamenti sono in ritardo?"
"Mostrami le scadenze di pagamento"
```

#### **C. Udienze Specifiche**
```
"Quando è l'udienza di [CLIENTE]?"
"Quali udienze ho questa settimana?"
"Quando devo andare in tribunale per [PRATICA]?"
"Mostrami tutte le udienze"
"Quando è la prossima udienza importante?"
"Quali udienze ho domani?"
"Mostrami le udienze del mese"
"Quando è l'udienza in [TRIBUNALE]?"
"Quali udienze sono urgenti?"
"Mostrami il calendario delle udienze"
```

### **5. 🔍 DOMANDE RICERCA AVANZATA**

#### **A. Filtri Temporali**
```
"Mostrami le attività di oggi"
"Quali attività ho domani?"
"Mostrami le attività di questa settimana"
"Quali attività ho il [GIORNO]?"
"Mostrami le attività del mese"
"Quali attività ho in [MESE]?"
"Mostrami le attività di [ANNO]"
"Quali attività ho nel periodo [DATA1-DATA2]?"
"Mostrami le attività passate"
"Quali attività ho in futuro?"
```

#### **B. Filtri per Stato**
```
"Mostrami le attività da fare"
"Quali attività sono completate?"
"Mostrami le attività urgenti"
"Quali attività sono in ritardo?"
"Mostrami le attività pendenti"
"Quali attività hanno priorità alta?"
"Mostrami le attività bloccate"
"Quali attività sono in corso?"
"Mostrami le attività sospese"
"Quali attività richiedono attenzione?"
```

#### **C. Filtri per Categoria**
```
"Mostrami solo le udienze"
"Quali scadenze processuali ho?"
"Mostrami le attività stragiudiziali"
"Quali appuntamenti ho?"
"Mostrami le attività giudiziali"
"Quali scadenze ho?"
"Mostrami solo i ricorsi"
"Quali notifiche devo fare?"
"Mostrami le conciliazioni"
"Quali perizie ho?"
```

### **6. 📊 DOMANDE STATISTICHE**

#### **A. Contatori e Riepiloghi**
```
"Quante pratiche ho in corso?"
"Quanti clienti ho?"
"Quante attività ho oggi?"
"Mostrami le statistiche"
"Quante udienze ho questa settimana?"
"Quanti ricorsi ho da fare?"
"Mostrami il riepilogo del mese"
"Quante scadenze ho?"
"Quali sono i numeri di oggi?"
"Mostrami il dashboard"
```

#### **B. Analisi Performance**
```
"Qual è la mia attività più frequente?"
"Quale cliente ha più pratiche?"
"Quali sono le mie pratiche più vecchie?"
"Mostrami le pratiche più urgenti"
"Qual è il mio carico di lavoro?"
"Mostrami le statistiche mensili"
"Quali pratiche sono in ritardo?"
"Mostrami l'analisi delle attività"
"Qual è la mia produttività?"
"Mostrami i trend delle scadenze"
```

### **7. 🎯 DOMANDE OPERATIVE**

#### **A. Cosa Fare**
```
"Cosa devo fare oggi?"
"Qual è la mia prossima attività?"
"Quali sono le mie priorità?"
"Cosa è più urgente?"
"Quale attività devo fare prima?"
"Mostrami la mia agenda"
"Qual è il mio piano per oggi?"
"Cosa devo preparare?"
"Quali documenti devo preparare?"
"Mostrami la mia to-do list"
```

#### **B. Pianificazione**
```
"Come organizzo la settimana?"
"Qual è il mio calendario?"
"Come distribuisco il carico di lavoro?"
"Quali appuntamenti posso spostare?"
"Come ottimizzo il tempo?"
"Mostrami la pianificazione"
"Qual è il mio schedule?"
"Come organizzo le priorità?"
"Mostrami il piano settimanale"
"Come gestisco le scadenze?"
```

### **8. 🔧 DOMANDE TECNICHE**

#### **A. Calcolatore Termini**
```
"Calcola il termine per [ATTIVITÀ]"
"Quanto tempo ho per [AZIONE]?"
"Calcola [NUMERO] giorni da [DATA]"
"Quando scade secondo il codice?"
"Calcola la prescrizione"
"Qual è il termine legale per [AZIONE]?"
"Calcola con sospensione feriale"
"Quando è il termine ultimo?"
"Calcola il termine processuale"
"Mostrami il calcolo dei termini"
```

#### **B. Procedure Legali**
```
"Qual è la procedura per [AZIONE]?"
"Come faccio [PROCEDURA]?"
"Quali sono i passaggi per [PROCESSO]?"
"Mostrami la procedura legale"
"Come procedo con [PRATICA]?"
"Qual è il protocollo per [AZIONE]?"
"Mostrami i requisiti per [PROCEDURA]?"
"Come gestisco [SITUAZIONE]?"
"Qual è la sequenza corretta?"
"Mostrami le best practices"
```

### **9. 🚨 DOMANDE URGENTI**

#### **A. Emergenze**
```
"Cosa è scaduto oggi?"
"Quali sono le emergenze?"
"Cosa devo fare subito?"
"Quali scadenze ho perso?"
"Mostrami le attività critiche"
"Cosa richiede attenzione immediata?"
"Quali sono le priorità assolute?"
"Mostrami le situazioni urgenti"
"Cosa non posso rimandare?"
"Quali sono i rischi imminenti?"
```

#### **B. Controlli**
```
"Ho dimenticato qualcosa?"
"Cosa devo controllare?"
"Quali verifiche devo fare?"
"Mostrami i controlli da fare"
"Ho tutto sotto controllo?"
"Quali sono i punti critici?"
"Mostrami le verifiche urgenti"
"Cosa devo monitorare?"
"Quali sono i rischi?"
"Mostrami lo stato generale"
```

### **10. 📱 DOMANDE MOBILE**

#### **A. Accesso Rapido**
```
"Mostrami la dashboard"
"Apri il calendario"
"Mostrami le notifiche"
"Quali sono le mie attività?"
"Mostrami lo stato generale"
"Apri la lista clienti"
"Mostrami le pratiche"
"Apri il calcolatore"
"Mostrami le statistiche"
"Apri le impostazioni"
```

#### **B. Comandi Vocali**
```
"Crea nuova pratica"
"Aggiungi attività"
"Modifica [PRATICA]"
"Elimina [ATTIVITÀ]"
"Segna come completato"
"Cambia priorità"
"Aggiungi nota"
"Salva modifiche"
"Annulla operazione"
"Conferma azione"
```

---

## 🎯 **STRATEGIA DI IMPLEMENTAZIONE**

### **Fase 1: Pattern Base (Settimana 1)**
- Implementare pattern per domande temporali
- Gestire scadenze e udienze
- Pattern per clienti e pratiche

### **Fase 2: Specializzazione (Settimana 2)**
- Aggiungere pattern per ricorsi e pagamenti
- Implementare calcoli termini
- Gestire ricerche avanzate

### **Fase 3: Intelligenza Avanzata (Settimana 3)**
- Pattern per domande operative
- Gestione emergenze
- Comandi vocali complessi

### **Fase 4: Ottimizzazione (Settimana 4)**
- Migliorare riconoscimento
- Aggiungere pattern complessi
- Test e perfezionamento

---

## 📈 **METRICHE DI SUCCESSO**

### **Riconoscimento:**
- 95% delle domande riconosciute correttamente
- <2 secondi per risposta
- 0 errori su domande comuni

### **Copertura:**
- 100% delle funzionalità app coperte
- 80+ pattern diversi implementati
- Supporto per 500+ varianti di domande

### **Usabilità:**
- Risposte pertinenti e precise
- Gestione errori elegante
- Interfaccia vocale fluida

---

## 🚀 **PROSSIMI PASSI**

1. **Implementare pattern base** per domande temporali
2. **Aggiungere gestione clienti** e pratiche
3. **Sviluppare pattern specializzati** per ricorsi/pagamenti
4. **Implementare calcoli termini** automatici
5. **Aggiungere ricerca avanzata** con filtri
6. **Sviluppare comandi vocali** operativi
7. **Testare e ottimizzare** tutti i pattern
8. **Deploy e monitoraggio** performance

**L'assistente diventerà un vero "co-pilota legale" intelligente!** 🧠⚖️
