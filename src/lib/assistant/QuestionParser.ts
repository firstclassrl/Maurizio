export interface ParsedQuestion {
  type: 'udienza' | 'scadenza' | 'cliente' | 'pratica' | 'attivita' | 'appuntamento' | 'ricorso' | 'pagamenti' | 'scadenze_imminenti' | 'udienze_appuntamenti' | 'calcoli_termini' | 'clienti_info' | 'ricerca_clienti' | 'pratiche_info' | 'attivita_pratica' | 'filtri_temporali' | 'filtri_stato' | 'filtri_categoria' | 'contatori' | 'analisi' | 'cosa_fare' | 'pianificazione' | 'emergenze' | 'controlli' | 'ricorsi_specializzati' | 'pagamenti_specializzati' | 'calcoli_avanzati' | 'termini_processuali' | 'prescrizioni' | 'decadenze' | 'comandi_vocali' | 'ricerca_intelligente' | 'suggerimenti' | 'workflow' | 'produttivita' | 'alert_sistema' | 'backup_restore' | 'statistiche_avanzate' | 'previsioni' | 'ottimizzazione' | 'generale'
  entities: {
    cliente?: string
    pratica?: string
    data?: string
    periodo?: 'oggi' | 'domani' | 'settimana' | 'mese'
    attivita?: string
    numero?: string
    tipo?: string
    filtro?: string
    termine?: string
    giorni?: number
    data_riferimento?: string
    tipo_ricorso?: string
    tipo_pagamento?: string
    importo?: string
    comando?: string
    azione?: string
    priorita?: string
    categoria_speciale?: string
  }
  originalText: string
}

export class QuestionParser {
  private patterns = {
    udienza: [
      /quando\s+(?:è|ha)\s+(?:l'|la\s+)?udienza\s+(?:di|per)\s+(.+)/i,
      /udienza\s+(?:di|per)\s+(.+)/i,
      /quando\s+(?:vado|devo andare)\s+(?:in\s+)?tribunale\s+(?:per|per\s+)?(.+)/i,
      // Pattern per "quando ricorso farmap?" - interpretato come udienza
      /quando\s+(?:ci\s+sarà|sarà|è)\s+(?:il\s+)?ricorso\s+(?:di|per|del\s+cliente\s+)?(.+)/i,
      /quando\s+(?:ci\s+sarà|sarà|è)\s+(?:il\s+)?ricorso\s+(?:della|dello)\s+(.+)/i
    ],
    scadenza: [
      /quali\s+pratiche\s+(?:scadono|sono in scadenza)\s+(?:questa|la\s+)?(.+)/i,
      /pratiche\s+(?:in\s+)?scadenza\s+(?:questa|la\s+)?(.+)/i,
      /cosa\s+(?:scade|è in scadenza)\s+(?:questa|la\s+)?(.+)/i
    ],
    cliente: [
      /chi\s+(?:è\s+)?(?:il\s+)?cliente\s+(?:della\s+)?(?:pratica\s+)?(.+)/i,
      /cliente\s+(?:della\s+)?(?:pratica\s+)?(.+)/i,
      /informazioni\s+(?:sul\s+)?(?:cliente\s+)?(.+)/i,
      /ricorso\s+(?:per|di)\s+(?:il\s+)?cliente\s+(.+)/i,
      /quando\s+(?:devo|faccio)\s+(?:fare\s+)?ricorso\s+(?:per|di)\s+(.+)/i,
      /ricorso\s+(?:per|di)\s+(.+)/i
    ],
    pratica: [
      /pratica\s+(.+)/i,
      /informazioni\s+(?:sulla\s+)?(?:pratica\s+)?(.+)/i,
      /dettagli\s+(?:della\s+)?(?:pratica\s+)?(.+)/i
    ],
    attivita: [
      /attività\s+(?:di|per)\s+(.+)/i,
      /cosa\s+(?:devo fare|fare)\s+(?:per|con)\s+(.+)/i,
      /compiti\s+(?:per|di)\s+(.+)/i
    ],
    appuntamento: [
      /appuntamento\s+(?:di|con)\s+(.+)/i,
      /quando\s+(?:ho|devo)\s+(?:un\s+)?appuntamento\s+(?:con|di)\s+(.+)/i,
      /incontro\s+(?:con|di)\s+(.+)/i
    ],
    ricorso: [
      // Pattern più specifici per ricorsi (non udienze)
      /quando\s+(?:devo|faccio|fare)\s+(?:fare\s+)?ricorso\s+(?:per|di|del\s+cliente\s+)?(.+)/i,
      /ricorso\s+(?:per|di|del\s+cliente\s+)?(.+)/i,
      /quando\s+(?:scade|è in scadenza)\s+(?:il\s+)?ricorso\s+(?:per|di|del\s+cliente\s+)?(.+)/i,
      /scadenza\s+(?:del\s+)?ricorso\s+(?:per|di|del\s+cliente\s+)?(.+)/i,
      /quando\s+(?:devo|faccio|fare)\s+(?:fare\s+)?ricorso\s+(?:della|dello)\s+(.+)/i,
      /ricorso\s+(?:della|dello)\s+(.+)/i,
      // Pattern per "ricordo" (errore di digitazione comune)
      /quando\s+(?:devo|faccio|fare)\s+(?:fare\s+)?ricordo\s+(?:per|di|del\s+cliente\s+)?(.+)/i,
      /ricordo\s+(?:per|di|del\s+cliente\s+)?(.+)/i,
      /quando\s+(?:devo|faccio|fare)\s+(?:fare\s+)?ricordo\s+(?:della|dello)\s+(.+)/i,
      /ricordo\s+(?:della|dello)\s+(.+)/i
    ],
    pagamenti: [
      /quando\s+(?:ci\s+sarà|sarà|è)\s+(?:il\s+)?pagamenti?\s+(?:di|per|del\s+cliente\s+)?(.+)/i,
      /scadenza\s+(?:dei\s+)?pagamenti?\s+(?:di|per|del\s+cliente\s+)?(.+)/i,
      /quando\s+(?:scadono|sono in scadenza)\s+(?:i\s+)?pagamenti?\s+(?:di|per|del\s+cliente\s+)?(.+)/i,
      /pagamenti?\s+(?:di|per|del\s+cliente\s+)?(.+)/i
    ],
    
    // NUOVI PATTERN FASE 1 - TEMPORALI
    scadenze_imminenti: [
      /quando\s+scade\s+(?:la\s+)?prossima\s+(?:pratica|scadenza)/i,
      /quali\s+scadenze\s+(?:ho\s+)?(?:questa\s+settimana|oggi|domani)/i,
      /cosa\s+scade\s+(?:oggi|domani|questa\s+settimana)/i,
      /mostrami\s+(?:le\s+)?scadenze\s+(?:urgenti|imminenti)/i,
      /quali\s+pratiche\s+scadono\s+(?:entro\s+)?(\d+\s+giorni?|questa\s+settimana)/i,
      /ho\s+scadenze\s+(?:oggi|domani)/i,
      /quando\s+è\s+(?:la\s+)?prossima\s+scadenza\s+(?:critica|importante)/i,
      /mostrami\s+le\s+scadenze\s+(?:di\s+)?questa\s+settimana/i,
      /quali\s+sono\s+le\s+scadenze\s+più\s+urgenti/i,
      /cosa\s+devo\s+fare\s+entro\s+fine\s+mese/i,
      /che\s+scadenze\s+ho\s+oggi/i,
      /che\s+scadenza\s+ho\s+oggi/i,
      /scadenze\s+di\s+oggi/i,
      /scadenza\s+di\s+oggi/i,
      /scadenze\s+oggi/i,
      /scadenza\s+oggi/i
    ],
    
    udienze_appuntamenti: [
      /quando\s+è\s+(?:la\s+)?prossima\s+udienza/i,
      /quali\s+udienze\s+(?:ho\s+)?(?:questa\s+settimana|oggi|domani)/i,
      /quando\s+devo\s+andare\s+in\s+tribunale/i,
      /mostrami\s+(?:tutti\s+gli\s+)?appuntamenti\s+(?:di\s+oggi|questa\s+settimana)/i,
      /quando\s+è\s+l'udienza\s+(?:di|per)\s+(.+)/i,
      /mostrami\s+il\s+calendario\s+delle\s+udienze/i,
      /quali\s+appuntamenti\s+ho\s+con\s+i\s+clienti/i,
      /quando\s+è\s+(?:la\s+)?prossima\s+conciliazione/i,
      /mostrami\s+le\s+udienze\s+(?:del\s+mese|di\s+(.+))/i,
      /quando\s+è\s+l'udienza\s+in\s+(.+)/i
    ],
    
    calcoli_termini: [
      /calcola\s+(\d+)\s+giorni?\s+(?:da\s+oggi|dal\s+(\d{1,2}\/\d{1,2}\/\d{4}))/i,
      /quando\s+scade\s+(?:la\s+)?comparsa\s+conclusionale/i,
      /calcola\s+il\s+termine\s+(?:per\s+l'|per\s+il\s+)?(appello|ricorso|opposizione)/i,
      /quanto\s+tempo\s+ho\s+per\s+(?:il\s+)?(ricorso|appello|comparsa)/i,
      /calcola\s+(\d+)\s+giorni?\s+dal\s+(\d{1,2}\/\d{1,2}\/\d{4})/i,
      /quando\s+devo\s+depositare\s+(?:la\s+)?(comparsa|ricorso|appello)/i,
      /calcola\s+(\d+)\s+giorni?\s+per\s+(?:la\s+)?(cassazione|notifica)/i,
      /quando\s+scade\s+(?:la\s+)?prescrizione/i,
      /calcola\s+(?:il\s+)?termine\s+(?:per\s+)?(.+)/i,
      /quanto\s+tempo\s+ho\s+per\s+(.+)/i,
      // Pattern aggiuntivi dall'app per termini processuali
      /quando\s+scade\s+(?:la\s+)?memoria/i,
      /quanto\s+tempo\s+per\s+(?:la\s+)?memoria/i,
      /quando\s+scade\s+(?:il\s+)?ricorso/i,
      /quanto\s+tempo\s+per\s+(?:il\s+)?ricorso/i,
      /quando\s+scade\s+(?:la\s+)?notifica/i,
      /quanto\s+tempo\s+per\s+(?:la\s+)?notifica/i,
      /quando\s+scade\s+(?:la\s+)?prova/i,
      /quanto\s+tempo\s+per\s+(?:la\s+)?prova/i,
      /quando\s+scade\s+(?:il\s+)?reclamo/i,
      /quanto\s+tempo\s+per\s+(?:il\s+)?reclamo/i,
      /quando\s+scade\s+(?:l'|la\s+)?impugnazione/i,
      /quanto\s+tempo\s+per\s+(?:l'|la\s+)?impugnazione/i,
      /quando\s+scade\s+(?:l'|la\s+)?esecuzione/i,
      /quanto\s+tempo\s+per\s+(?:l'|la\s+)?esecuzione/i,
      /calcola\s+(?:il\s+)?termine\s+(?:processuale\s+)?(?:per\s+)?(.+)/i,
      /quanti\s+giorni\s+(?:processuali\s+)?per\s+(.+)/i,
      /termine\s+(?:processuale\s+)?(?:per\s+)?(.+)/i,
      /scadenza\s+(?:processuale\s+)?(?:per\s+)?(.+)/i,
      /quando\s+devo\s+(?:presentare|depositare|notificare)\s+(.+)/i,
      /quanto\s+tempo\s+ho\s+per\s+(?:presentare|depositare|notificare)\s+(.+)/i
    ],
    
    // NUOVI PATTERN FASE 1 - CLIENTI
    clienti_info: [
      /mostrami\s+(?:tutti\s+i\s+)?clienti/i,
      /chi\s+è\s+(?:il\s+)?cliente\s+(?:della\s+)?(?:pratica\s+)?(.+)/i,
      /quali\s+sono\s+i\s+miei\s+clienti/i,
      /mostrami\s+i\s+dati\s+del\s+cliente\s+(.+)/i,
      /chi\s+è\s+(.+)/i,
      /mostrami\s+la\s+lista\s+completa\s+dei\s+clienti/i,
      /quali\s+clienti\s+ho/i,
      /dammi\s+informazioni\s+su\s+(.+)/i,
      /mostrami\s+i\s+clienti\s+con\s+partita\s+iva/i,
      /chi\s+sono\s+i\s+miei\s+clienti\s+principali/i
    ],
    
    ricerca_clienti: [
      /cerca\s+(?:il\s+)?cliente\s+(.+)/i,
      /trovami\s+(?:il\s+)?cliente\s+con\s+p\.iva\s+(.+)/i,
      /cerca\s+(.+)/i,
      /trovami\s+tutti\s+i\s+clienti\s+(.+)/i,
      /mostrami\s+i\s+clienti\s+(?:persona\s+fisica|società|ditta)/i,
      /cerca\s+il\s+cliente\s+di\s+(.+)/i,
      /mostrami\s+i\s+clienti\s+con\s+nome\s+(.+)/i,
      /trovami\s+(.+)/i,
      /cerca\s+clienti\s+con\s+(.+)/i,
      /filtra\s+i\s+clienti\s+per\s+(.+)/i
    ],
    
    // NUOVI PATTERN FASE 1 - PRATICHE
    pratiche_info: [
      /mostrami\s+(?:tutte\s+le\s+)?pratiche/i,
      /quali\s+pratiche\s+ho\s+in\s+corso/i,
      /dammi\s+dettagli\s+della\s+pratica\s+(.+)/i,
      /mostrami\s+le\s+pratiche\s+di\s+(.+)/i,
      /quali\s+sono\s+le\s+mie\s+pratiche\s+attive/i,
      /mostrami\s+la\s+pratica\s+(.+)/i,
      /dammi\s+informazioni\s+sulla\s+pratica\s+(.+)/i,
      /mostrami\s+(?:tutte\s+le\s+)?pratiche\s+(?:giudiziali|stragiudiziali)/i,
      /quali\s+pratiche\s+(?:giudiziali|stragiudiziali)\s+ho/i,
      /mostrami\s+le\s+pratiche\s+con\s+(.+)/i
    ],
    
    attivita_pratica: [
      /quali\s+attività\s+ha\s+la\s+pratica\s+(.+)/i,
      /mostrami\s+le\s+attività\s+di\s+(.+)/i,
      /cosa\s+devo\s+fare\s+per\s+(.+)/i,
      /mostrami\s+il\s+piano\s+attività\s+di\s+(.+)/i,
      /quali\s+sono\s+le\s+prossime\s+attività\s+di\s+(.+)/i,
      /mostrami\s+lo\s+stato\s+della\s+pratica\s+(.+)/i,
      /cosa\s+c'è\s+da\s+fare\s+per\s+(.+)/i,
      /mostrami\s+le\s+attività\s+pendenti/i,
      /quali\s+attività\s+sono\s+in\s+ritardo/i,
      /mostrami\s+le\s+attività\s+(?:di\s+oggi|questa\s+settimana)/i
    ],
    
    // NUOVI PATTERN FASE 1 - FILTRI
    filtri_temporali: [
      /mostrami\s+le\s+attività\s+(?:di\s+oggi|domani|questa\s+settimana)/i,
      /quali\s+attività\s+ho\s+(?:oggi|domani|il\s+(.+))/i,
      /mostrami\s+le\s+attività\s+(?:del\s+mese|di\s+(.+))/i,
      /quali\s+attività\s+ho\s+(?:in\s+(.+)|nel\s+periodo\s+(.+))/i,
      /mostrami\s+le\s+attività\s+(?:passate|in\s+futuro)/i,
      /quali\s+attività\s+ho\s+(?:questa\s+settimana|questo\s+mese)/i,
      /mostrami\s+le\s+attività\s+del\s+(\d{1,2}\/\d{1,2}\/\d{4})/i,
      /quali\s+attività\s+ho\s+(?:dopo|prima)\s+(?:di|del)\s+(.+)/i
    ],
    
    filtri_stato: [
      /mostrami\s+le\s+attività\s+(?:da\s+fare|completate|urgenti|in\s+ritardo)/i,
      /quali\s+attività\s+(?:sono\s+completate|hanno\s+priorità\s+alta|sono\s+bloccate)/i,
      /mostrami\s+le\s+attività\s+(?:pendenti|in\s+corso|sospese)/i,
      /quali\s+attività\s+richiedono\s+attenzione/i,
      /mostrami\s+(?:le\s+)?attività\s+(?:urgenti|critiche|importanti)/i,
      /quali\s+attività\s+(?:ho\s+completato|sono\s+finite)/i,
      /mostrami\s+le\s+attività\s+(?:da\s+iniziare|da\s+completare)/i
    ],
    
    filtri_categoria: [
      /mostrami\s+(?:solo\s+)?(?:le\s+udienze|scadenze\s+processuali|attività\s+stragiudiziali)/i,
      /quali\s+(?:appuntamenti|attività\s+giudiziali|scadenze)\s+ho/i,
      /mostrami\s+(?:solo\s+)?(?:i\s+ricorsi|notifiche|conciliazioni|perizie)/i,
      /quali\s+(?:udienze|scadenze|appuntamenti)\s+ho/i,
      /mostrami\s+(?:solo\s+)?(?:le\s+attività\s+processuali|le\s+attività\s+da\s+svolgere)/i,
      /filtra\s+(?:per\s+)?(?:categoria|tipo)\s+(.+)/i
    ],
    
    // NUOVI PATTERN FASE 1 - STATISTICHE
    contatori: [
      /quante\s+(?:pratiche|clienti|attività|udienze|ricorsi|scadenze)\s+ho/i,
      /mostrami\s+(?:le\s+statistiche|il\s+riepilogo\s+del\s+mese)/i,
      /quali\s+sono\s+i\s+numeri\s+(?:di\s+oggi|del\s+mese)/i,
      /mostrami\s+il\s+dashboard/i,
      /quanti\s+(?:clienti|pratiche|attività)\s+ho\s+(?:in\s+totale|oggi)/i,
      /mostrami\s+(?:il\s+)?conteggio\s+(?:delle\s+)?(.+)/i
    ],
    
    analisi: [
      /qual\s+è\s+(?:la\s+mia\s+)?attività\s+più\s+frequente/i,
      /quale\s+cliente\s+ha\s+più\s+pratiche/i,
      /quali\s+sono\s+(?:le\s+mie\s+)?pratiche\s+(?:più\s+vecchie|più\s+urgenti)/i,
      /qual\s+è\s+(?:il\s+mio\s+)?carico\s+di\s+lavoro/i,
      /mostrami\s+(?:le\s+statistiche\s+mensili|l'analisi\s+delle\s+attività)/i,
      /quali\s+pratiche\s+sono\s+in\s+ritardo/i,
      /qual\s+è\s+(?:la\s+mia\s+)?produttività/i,
      /mostrami\s+i\s+trend\s+delle\s+scadenze/i,
      /quale\s+(?:cliente|pratica)\s+richiede\s+più\s+attenzione/i,
      /mostrami\s+(?:l'|gli\s+)?analisi\s+(?:dei\s+)?(.+)/i
    ],
    
    // NUOVI PATTERN FASE 1 - OPERATIVE
    cosa_fare: [
      /cosa\s+devo\s+fare\s+(?:oggi|ora)/i,
      /attivita\s+di\s+oggi/i,
      /attività\s+di\s+oggi/i,
      /qual\s+è\s+(?:la\s+mia\s+)?prossima\s+attività/i,
      /quali\s+sono\s+(?:le\s+mie\s+)?priorità/i,
      /cosa\s+è\s+più\s+urgente/i,
      /quale\s+attività\s+devo\s+fare\s+prima/i,
      /mostrami\s+(?:la\s+mia\s+)?agenda/i,
      /qual\s+è\s+(?:il\s+mio\s+)?piano\s+per\s+oggi/i,
      /cosa\s+devo\s+preparare/i,
      /quali\s+documenti\s+devo\s+preparare/i,
      /mostrami\s+(?:la\s+mia\s+)?to-do\s+list/i,
      /qual\s+è\s+(?:la\s+mia\s+)?prossima\s+priorità/i,
      /cosa\s+non\s+posso\s+dimenticare/i,
      // Pattern specifici per IMpegni
      /impegni\s+di\s+oggi/i,
      /impegno\s+di\s+oggi/i,
      /impegni\s+oggi/i,
      /impegno\s+oggi/i,
      /cosa\s+ho\s+oggi/i,
      /quali\s+impegni\s+ho\s+oggi/i,
      /quale\s+impegno\s+ho\s+oggi/i,
      /programma\s+di\s+oggi/i,
      /agenda\s+di\s+oggi/i,
      /calendario\s+di\s+oggi/i,
      /appuntamenti\s+di\s+oggi/i,
      /appuntamento\s+di\s+oggi/i,
      /riunioni\s+di\s+oggi/i,
      /riunione\s+di\s+oggi/i,
      /meeting\s+di\s+oggi/i,
      // Pattern aggiuntivi dall'app
      /quali\s+scadenze\s+ho\s+oggi/i,
      /cosa\s+scade\s+oggi/i,
      /quale\s+termine\s+scade\s+oggi/i,
      /cosa\s+devo\s+presentare\s+oggi/i,
      /quale\s+atto\s+devo\s+fare\s+oggi/i,
      /cosa\s+devo\s+depositare\s+oggi/i,
      /quale\s+memoria\s+devo\s+preparare/i,
      /cosa\s+devo\s+notificare\s+oggi/i,
      /quale\s+ricorso\s+devo\s+fare/i,
      /cosa\s+devo\s+impugnare/i,
      /quale\s+prova\s+devo\s+proporre/i,
      /cosa\s+devo\s+chiedere\s+in\s+tribunale/i
    ],
    
    pianificazione: [
      /come\s+organizzo\s+(?:la\s+settimana|il\s+calendario)/i,
      /qual\s+è\s+(?:il\s+mio\s+)?calendario/i,
      /come\s+distribuisco\s+(?:il\s+)?carico\s+di\s+lavoro/i,
      /quali\s+appuntamenti\s+posso\s+spostare/i,
      /come\s+ottimizzo\s+il\s+tempo/i,
      /mostrami\s+(?:la\s+)?pianificazione/i,
      /qual\s+è\s+(?:il\s+mio\s+)?schedule/i,
      /come\s+organizzo\s+le\s+priorità/i,
      /mostrami\s+(?:il\s+)?piano\s+settimanale/i,
      /come\s+gestisco\s+le\s+scadenze/i,
      /come\s+pianifico\s+(?:la\s+)?settimana/i,
      /mostrami\s+(?:la\s+)?strategia\s+(?:per\s+)?(.+)/i
    ],
    
    // NUOVI PATTERN FASE 1 - EMERGENZE
    emergenze: [
      /cosa\s+è\s+(?:scaduto\s+oggi|scaduto)/i,
      /quali\s+sono\s+(?:le\s+)?emergenze/i,
      /cosa\s+devo\s+fare\s+subito/i,
      /quali\s+scadenze\s+ho\s+perso/i,
      /mostrami\s+le\s+attività\s+critiche/i,
      /cosa\s+richiede\s+attenzione\s+immediata/i,
      /quali\s+sono\s+(?:le\s+)?priorità\s+assolute/i,
      /mostrami\s+(?:le\s+)?situazioni\s+urgenti/i,
      /cosa\s+non\s+posso\s+rimandare/i,
      /quali\s+sono\s+i\s+rischi\s+imminenti/i,
      /cosa\s+è\s+(?:critico|urgente|importante)/i,
      /mostrami\s+(?:le\s+)?emergenze\s+(?:di\s+oggi|questa\s+settimana)/i
    ],
    
    controlli: [
      /ho\s+dimenticato\s+qualcosa/i,
      /cosa\s+devo\s+controllare/i,
      /quali\s+verifiche\s+devo\s+fare/i,
      /mostrami\s+(?:i\s+)?controlli\s+da\s+fare/i,
      /ho\s+tutto\s+sotto\s+controllo/i,
      /quali\s+sono\s+(?:i\s+)?punti\s+critici/i,
      /mostrami\s+(?:le\s+)?verifiche\s+urgenti/i,
      /cosa\s+devo\s+monitorare/i,
      /quali\s+sono\s+(?:i\s+)?rischi/i,
      /mostrami\s+(?:lo\s+)?stato\s+generale/i,
      /cosa\s+devo\s+verificare/i,
      /mostrami\s+(?:i\s+)?controlli\s+(?:di\s+)?(.+)/i
    ],

    // NUOVI PATTERN FASE 2 - SPECIALIZZAZIONE RICORSI
    ricorsi_specializzati: [
      /quando\s+(?:devo|faccio|fare)\s+(?:il\s+)?ricorso\s+(?:per\s+l'|per\s+il\s+)?(appello|opposizione|cassazione)\s+(?:di|per)\s+(.+)/i,
      /ricorso\s+(?:per\s+l'|per\s+il\s+)?(appello|opposizione|cassazione)\s+(?:di|per)\s+(.+)/i,
      /quando\s+scade\s+(?:il\s+)?ricorso\s+(?:per\s+l'|per\s+il\s+)?(appello|opposizione|cassazione)\s+(?:di|per)\s+(.+)/i,
      /termine\s+(?:per\s+)?(?:il\s+)?ricorso\s+(?:per\s+l'|per\s+il\s+)?(appello|opposizione|cassazione)/i,
      /quanto\s+tempo\s+ho\s+per\s+(?:il\s+)?ricorso\s+(?:per\s+l'|per\s+il\s+)?(appello|opposizione|cassazione)/i,
      /quando\s+devo\s+depositare\s+(?:il\s+)?ricorso\s+(?:per\s+l'|per\s+il\s+)?(appello|opposizione|cassazione)/i,
      /scadenza\s+(?:del\s+)?ricorso\s+(?:per\s+l'|per\s+il\s+)?(appello|opposizione|cassazione)/i,
      /ricorso\s+(?:in\s+)?(appello|opposizione|cassazione)\s+(?:di|per)\s+(.+)/i,
      /quando\s+(?:è|ha)\s+(?:il\s+)?ricorso\s+(?:per\s+l'|per\s+il\s+)?(appello|opposizione|cassazione)\s+(?:di|per)\s+(.+)/i,
      /mostrami\s+(?:i\s+)?ricorsi\s+(?:in\s+)?(appello|opposizione|cassazione)/i
    ],

    // NUOVI PATTERN FASE 2 - SPECIALIZZAZIONE PAGAMENTI
    pagamenti_specializzati: [
      /quando\s+(?:devo|faccio)\s+(?:il\s+)?pagamento\s+(?:di|per)\s+(.+)/i,
      /scadenza\s+(?:del\s+)?pagamento\s+(?:di|per)\s+(.+)/i,
      /quanto\s+(?:devo|faccio)\s+pagare\s+(?:per|di)\s+(.+)/i,
      /importo\s+(?:del\s+)?pagamento\s+(?:di|per)\s+(.+)/i,
      /quando\s+scade\s+(?:il\s+)?pagamento\s+(?:di|per)\s+(.+)/i,
      /pagamento\s+(?:di|per)\s+(.+)/i,
      /quando\s+(?:è|ha)\s+(?:il\s+)?pagamento\s+(?:di|per)\s+(.+)/i,
      /mostrami\s+(?:i\s+)?pagamenti\s+(?:di|per)\s+(.+)/i,
      /quale\s+è\s+(?:l'|il\s+)?importo\s+(?:del\s+)?pagamento\s+(?:di|per)\s+(.+)/i,
      /quando\s+devo\s+pagare\s+(?:per|di)\s+(.+)/i
    ],

    // NUOVI PATTERN FASE 2 - CALCOLI AVANZATI
    calcoli_avanzati: [
      /calcola\s+(\d+)\s+giorni?\s+(?:da\s+oggi|dal\s+(\d{1,2}\/\d{1,2}\/\d{4}))/i,
      /calcola\s+(\d+)\s+mesi?\s+(?:da\s+oggi|dal\s+(\d{1,2}\/\d{1,2}\/\d{4}))/i,
      /calcola\s+(\d+)\s+anni?\s+(?:da\s+oggi|dal\s+(\d{1,2}\/\d{1,2}\/\d{4}))/i,
      /quando\s+scade\s+(?:tra\s+)?(\d+)\s+(?:giorni?|mesi?|anni?)/i,
      /data\s+(?:di\s+)?scadenza\s+(?:tra\s+)?(\d+)\s+(?:giorni?|mesi?|anni?)/i,
      /quando\s+è\s+(?:il\s+)?(\d{1,2}\/\d{1,2}\/\d{4})\s+\+\s+(\d+)\s+(?:giorni?|mesi?|anni?)/i,
      /calcola\s+(?:la\s+)?data\s+(?:di\s+)?scadenza\s+(?:tra\s+)?(\d+)\s+(?:giorni?|mesi?|anni?)/i,
      /quando\s+scade\s+(?:il\s+)?(\d{1,2}\/\d{1,2}\/\d{4})\s+\+\s+(\d+)\s+(?:giorni?|mesi?|anni?)/i,
      /calcola\s+(?:la\s+)?data\s+(?:di\s+)?scadenza\s+(?:dal\s+)?(\d{1,2}\/\d{1,2}\/\d{4})\s+\+\s+(\d+)\s+(?:giorni?|mesi?|anni?)/i,
      /quando\s+è\s+(?:il\s+)?(\d{1,2}\/\d{1,2}\/\d{4})\s+\+\s+(\d+)\s+(?:giorni?|mesi?|anni?)/i
    ],

    // NUOVI PATTERN FASE 2 - TERMINI PROCESSUALI
    termini_processuali: [
      /termine\s+(?:per\s+)?(?:la\s+)?comparsa\s+(?:conclusionale|di\s+risposta)/i,
      /quando\s+scade\s+(?:la\s+)?comparsa\s+(?:conclusionale|di\s+risposta)/i,
      /termine\s+(?:per\s+)?(?:la\s+)?notifica\s+(?:di\s+)?(?:atto|sentenza)/i,
      /quando\s+devo\s+notificare\s+(?:l'|la\s+)?(?:atto|sentenza)/i,
      /termine\s+(?:per\s+)?(?:l'|la\s+)?prova\s+(?:testimoniale|peritale|documentale)/i,
      /quando\s+scade\s+(?:la\s+)?prova\s+(?:testimoniale|peritale|documentale)/i,
      /termine\s+(?:per\s+)?(?:l'|la\s+)?memoria\s+(?:di\s+)?(?:replica|trittico)/i,
      /quando\s+devo\s+depositare\s+(?:la\s+)?memoria\s+(?:di\s+)?(?:replica|trittico)/i,
      /termine\s+(?:per\s+)?(?:l'|la\s+)?proposta\s+(?:di\s+)?(?:concordato|composizione)/i,
      /quando\s+scade\s+(?:la\s+)?proposta\s+(?:di\s+)?(?:concordato|composizione)/i
    ],

    // NUOVI PATTERN FASE 2 - PRESCRIZIONI E DECADENZE
    prescrizioni: [
      /quando\s+scade\s+(?:la\s+)?prescrizione\s+(?:di|per)\s+(.+)/i,
      /termine\s+(?:di\s+)?prescrizione\s+(?:di|per)\s+(.+)/i,
      /quando\s+è\s+(?:la\s+)?prescrizione\s+(?:di|per)\s+(.+)/i,
      /prescrizione\s+(?:di|per)\s+(.+)/i,
      /quanto\s+tempo\s+ho\s+per\s+(?:la\s+)?prescrizione\s+(?:di|per)\s+(.+)/i,
      /scadenza\s+(?:della\s+)?prescrizione\s+(?:di|per)\s+(.+)/i,
      /quando\s+devo\s+fare\s+(?:la\s+)?prescrizione\s+(?:di|per)\s+(.+)/i,
      /mostrami\s+(?:le\s+)?prescrizioni\s+(?:di|per)\s+(.+)/i,
      /quale\s+è\s+(?:il\s+)?termine\s+(?:di\s+)?prescrizione\s+(?:di|per)\s+(.+)/i,
      /quando\s+scade\s+(?:la\s+)?prescrizione\s+(?:breve|ordinaria|lunga)/i
    ],

    decadenze: [
      /quando\s+scade\s+(?:la\s+)?decadenza\s+(?:di|per)\s+(.+)/i,
      /termine\s+(?:di\s+)?decadenza\s+(?:di|per)\s+(.+)/i,
      /quando\s+è\s+(?:la\s+)?decadenza\s+(?:di|per)\s+(.+)/i,
      /decadenza\s+(?:di|per)\s+(.+)/i,
      /quanto\s+tempo\s+ho\s+per\s+(?:la\s+)?decadenza\s+(?:di|per)\s+(.+)/i,
      /scadenza\s+(?:della\s+)?decadenza\s+(?:di|per)\s+(.+)/i,
      /quando\s+devo\s+fare\s+(?:la\s+)?decadenza\s+(?:di|per)\s+(.+)/i,
      /mostrami\s+(?:le\s+)?decadenze\s+(?:di|per)\s+(.+)/i,
      /quale\s+è\s+(?:il\s+)?termine\s+(?:di\s+)?decadenza\s+(?:di|per)\s+(.+)/i,
      /quando\s+scade\s+(?:la\s+)?decadenza\s+(?:breve|ordinaria|lunga)/i
    ],

    // NUOVI PATTERN FASE 3 - COMANDI VOCALI AVANZATI
    comandi_vocali: [
      /hey\s+(?:assistente|ai|assistant)/i,
      /ok\s+(?:assistente|ai|assistant)/i,
      /ascolta/i,
      /parla/i,
      /dimmi/i,
      /aiutami/i,
      /cosa\s+puoi\s+fare/i,
      /quali\s+(?:sono\s+i\s+)?comandi/i,
      /mostrami\s+(?:i\s+)?comandi/i,
      /che\s+comandi\s+hai/i,
      /come\s+(?:funzioni|funziona)/i,
      /spiegami\s+(?:come\s+)?(?:funzioni|funziona)/i,
      /cosa\s+soi\s+capace\s+di\s+fare/i,
      /quali\s+(?:sono\s+le\s+)?funzionalità/i,
      /mostrami\s+(?:le\s+)?funzionalità/i
    ],

    // NUOVI PATTERN FASE 3 - RICERCA INTELLIGENTE
    ricerca_intelligente: [
      /cerca\s+(?:tutto\s+)?(?:quello\s+che\s+)?(?:riguarda|riguarda)\s+(.+)/i,
      /trova\s+(?:tutto\s+)?(?:quello\s+che\s+)?(?:riguarda|riguarda)\s+(.+)/i,
      /mostrami\s+(?:tutto\s+)?(?:quello\s+che\s+)?(?:riguarda|riguarda)\s+(.+)/i,
      /ricerca\s+(?:avanzata\s+)?(?:per\s+)?(.+)/i,
      /filtra\s+(?:per\s+)?(.+)/i,
      /seleziona\s+(?:tutto\s+)?(?:quello\s+che\s+)?(?:riguarda|riguarda)\s+(.+)/i,
      /estrae\s+(?:tutto\s+)?(?:quello\s+che\s+)?(?:riguarda|riguarda)\s+(.+)/i,
      /elenca\s+(?:tutto\s+)?(?:quello\s+che\s+)?(?:riguarda|riguarda)\s+(.+)/i,
      /raggruppa\s+(?:per\s+)?(.+)/i,
      /ordina\s+(?:per\s+)?(.+)/i
    ],

    // NUOVI PATTERN FASE 3 - SUGGERIMENTI INTELLIGENTI
    suggerimenti: [
      /cosa\s+mi\s+suggerisci/i,
      /che\s+cosa\s+dovrei\s+fare/i,
      /cosa\s+consigli/i,
      /hai\s+(?:dei\s+)?suggerimenti/i,
      /dammi\s+(?:dei\s+)?suggerimenti/i,
      /consigliami/i,
      /aiutami\s+a\s+decidere/i,
      /cosa\s+faresti\s+al\s+mio\s+posto/i,
      /qual\s+è\s+(?:la\s+)?migliore\s+strategia/i,
      /come\s+posso\s+migliorare/i,
      /cosa\s+devo\s+ottimizzare/i,
      /hai\s+(?:dei\s+)?consigli/i,
      /cosa\s+mi\s+raccomandi/i,
      /che\s+cosa\s+mi\s+proponi/i
    ],

    // NUOVI PATTERN FASE 3 - WORKFLOW E AUTOMAZIONE
    workflow: [
      /crea\s+(?:un\s+)?workflow\s+(?:per\s+)?(.+)/i,
      /automatizza\s+(?:la\s+)?(.+)/i,
      /schedula\s+(?:la\s+)?(.+)/i,
      /programma\s+(?:la\s+)?(.+)/i,
      /imposta\s+(?:un\s+)?(?:promemoria|reminder)\s+(?:per\s+)?(.+)/i,
      /ricorda\s+di\s+(.+)/i,
      /notifica\s+(?:quando\s+)?(.+)/i,
      /avvisami\s+(?:quando\s+)?(.+)/i,
      /crea\s+(?:una\s+)?sequenza\s+(?:per\s+)?(.+)/i,
      /organizza\s+(?:il\s+)?lavoro\s+(?:per\s+)?(.+)/i,
      /gestisci\s+(?:il\s+)?processo\s+(?:di\s+)?(.+)/i,
      /ottimizza\s+(?:il\s+)?flusso\s+(?:di\s+)?(.+)/i
    ],

    // NUOVI PATTERN FASE 3 - PRODUTTIVITÀ
    produttivita: [
      /come\s+(?:aumentare|migliorare)\s+(?:la\s+)?produttività/i,
      /come\s+(?:essere\s+più\s+)?efficiente/i,
      /come\s+(?:risparmiare|ottimizzare)\s+(?:il\s+)?tempo/i,
      /come\s+(?:organizzare\s+)?meglio\s+(?:il\s+)?lavoro/i,
      /come\s+(?:gestire\s+)?meglio\s+(?:le\s+)?priorità/i,
      /come\s+(?:essere\s+più\s+)?veloce/i,
      /come\s+(?:lavorare\s+)?meglio/i,
      /come\s+(?:essere\s+più\s+)?organizzato/i,
      /come\s+(?:gestire\s+)?meglio\s+(?:lo\s+)?stress/i,
      /come\s+(?:bilanciare\s+)?meglio\s+(?:il\s+)?carico\s+di\s+lavoro/i,
      /come\s+(?:delegare\s+)?meglio/i,
      /come\s+(?:collaborare\s+)?meglio/i
    ],

    // NUOVI PATTERN FASE 3 - ALERT E SISTEMA
    alert_sistema: [
      /attiva\s+(?:gli\s+)?alert/i,
      /disattiva\s+(?:gli\s+)?alert/i,
      /configura\s+(?:gli\s+)?alert/i,
      /imposta\s+(?:gli\s+)?alert/i,
      /notifiche\s+(?:di\s+)?sistema/i,
      /avvisi\s+(?:di\s+)?sistema/i,
      /controlli\s+(?:di\s+)?sistema/i,
      /verifica\s+(?:il\s+)?sistema/i,
      /stato\s+(?:del\s+)?sistema/i,
      /salute\s+(?:del\s+)?sistema/i,
      /monitora\s+(?:il\s+)?sistema/i,
      /diagnostica\s+(?:il\s+)?sistema/i
    ],

    // NUOVI PATTERN FASE 3 - BACKUP E RESTORE
    backup_restore: [
      /backup\s+(?:dei\s+)?dati/i,
      /salva\s+(?:i\s+)?dati/i,
      /esporta\s+(?:i\s+)?dati/i,
      /importa\s+(?:i\s+)?dati/i,
      /ripristina\s+(?:i\s+)?dati/i,
      /restore\s+(?:dei\s+)?dati/i,
      /sincronizza\s+(?:i\s+)?dati/i,
      /aggiorna\s+(?:i\s+)?dati/i,
      /pulisci\s+(?:i\s+)?dati/i,
      /ottimizza\s+(?:i\s+)?dati/i,
      /comprimi\s+(?:i\s+)?dati/i,
      /archivia\s+(?:i\s+)?dati/i
    ],

    // NUOVI PATTERN FASE 3 - STATISTICHE AVANZATE
    statistiche_avanzate: [
      /statistiche\s+(?:dettagliate|avanzate|complete)/i,
      /analisi\s+(?:dettagliata|avanzata|completa)/i,
      /report\s+(?:dettagliato|avanzato|completo)/i,
      /dashboard\s+(?:avanzata|completa)/i,
      /metriche\s+(?:dettagliate|avanzate)/i,
      /kpi\s+(?:key\s+performance\s+indicators?)/i,
      /performance\s+(?:analysis|analisi)/i,
      /trend\s+(?:analysis|analisi)/i,
      /benchmark/i,
      /confronto\s+(?:delle\s+)?performance/i,
      /valutazione\s+(?:delle\s+)?performance/i,
      /misurazione\s+(?:delle\s+)?performance/i
    ],

    // NUOVI PATTERN FASE 3 - PREVISIONI
    previsioni: [
      /previsioni\s+(?:per\s+)?(.+)/i,
      /prevedi\s+(.+)/i,
      /cosa\s+(?:succederà|accadrà)\s+(?:in\s+)?(.+)/i,
      /come\s+(?:sarà|andrà)\s+(.+)/i,
      /quale\s+è\s+(?:la\s+)?previsione\s+(?:per\s+)?(.+)/i,
      /forecast\s+(?:per\s+)?(.+)/i,
      /proiezioni\s+(?:per\s+)?(.+)/i,
      /scenari\s+(?:per\s+)?(.+)/i,
      /cosa\s+(?:mi\s+)?aspetto\s+(?:per\s+)?(.+)/i,
      /quali\s+(?:sono\s+)?le\s+aspettative\s+(?:per\s+)?(.+)/i,
      /come\s+(?:evolverà|si\s+evolverà)\s+(.+)/i,
      /quale\s+è\s+(?:la\s+)?tendenza\s+(?:per\s+)?(.+)/i
    ],

    // NUOVI PATTERN FASE 3 - OTTIMIZZAZIONE
    ottimizzazione: [
      /ottimizza\s+(.+)/i,
      /migliora\s+(.+)/i,
      /perfeziona\s+(.+)/i,
      /affina\s+(.+)/i,
      /raffina\s+(.+)/i,
      /tuning\s+(?:di\s+)?(.+)/i,
      /ottimizzazione\s+(?:di\s+)?(.+)/i,
      /miglioramento\s+(?:di\s+)?(.+)/i,
      /performance\s+(?:di\s+)?(.+)/i,
      /efficienza\s+(?:di\s+)?(.+)/i,
      /velocità\s+(?:di\s+)?(.+)/i,
      /rendimento\s+(?:di\s+)?(.+)/i
    ]
  }

  private periodPatterns = {
    oggi: /oggi/i,
    domani: /domani/i,
    settimana: /(?:questa|la\s+)?settimana/i,
    mese: /(?:questo|il\s+)?mese/i
  }

  parse(text: string): ParsedQuestion {
    const lowerText = text.toLowerCase().trim()
    
    // Check for period keywords first
    let periodo: 'oggi' | 'domani' | 'settimana' | 'mese' | undefined
    for (const [key, pattern] of Object.entries(this.periodPatterns)) {
      if (pattern.test(lowerText)) {
        periodo = key as any
        break
      }
    }

    // Check each question type
    for (const [type, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        const match = text.match(pattern)
        if (match) {
          const entities: ParsedQuestion['entities'] = { periodo }
          
          // Extract entity from the match
          if (match[1]) {
            const entity = match[1].trim()
            
          // Determine if it's a client name or practice number
          if (/^\d{4}\/\d{3}$/.test(entity) || /^pratica\s+\d{4}\/\d{3}$/i.test(entity)) {
            entities.pratica = entity.replace(/^pratica\s+/i, '')
          } else {
            // Clean up client name - remove common words
            const cleanName = entity
              .replace(/\b(il\s+|la\s+|lo\s+|i\s+|le\s+|gli\s+)\b/gi, '')
              .replace(/\b(cliente|cliente\s+)\b/gi, '')
              .replace(/\b(per|di|del|della|dei|delle)\b/gi, '')
              .trim()
            entities.cliente = cleanName
          }
          }

          // Extract specific activity type if mentioned
          if (type === 'ricorso' || lowerText.includes('ricorso') || lowerText.includes('ricordo')) {
            entities.attivita = 'ricorso'
          } else if (lowerText.includes('pagamenti')) {
            entities.attivita = 'pagamenti'
          } else if (lowerText.includes('udienza')) {
            entities.attivita = 'udienza'
          }

          // Log per debugging
          console.log(`QuestionParser: Parsed "${text}" as type "${type}" with entities:`, entities)

          return {
            type: type as ParsedQuestion['type'],
            entities,
            originalText: text
          }
        }
      }
    }

    // Fallback: check for general keywords
    if (this.isGeneralQuestion(text)) {
      return {
        type: 'generale',
        entities: { periodo },
        originalText: text
      }
    }

    // Default fallback
    return {
      type: 'generale',
      entities: {},
      originalText: text
    }
  }

  private isGeneralQuestion(text: string): boolean {
    const generalKeywords = [
      'aiuto', 'help', 'cosa', 'come', 'dove', 'perché', 'quando', 'chi', 'quale', 'quali',
      'mostra', 'mostrami', 'lista', 'elenco', 'tutti', 'tutte'
    ]
    
    const lowerText = text.toLowerCase()
    return generalKeywords.some(keyword => lowerText.includes(keyword))
  }

  // Helper method to extract client names from text
  extractClientNames(text: string): string[] {
    const clientPatterns = [
      /(?:di|per|con)\s+([A-Za-z\s]+(?:Srl|S\.p\.A\.|S\.r\.l\.|S\.p\.A|S\.r\.l|S\.a\.s\.|S\.a\.s))/i,
      /(?:di|per|con)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/,
      /(?:di|per|con)\s+([A-Za-z]+)/i
    ]

    const names: string[] = []
    for (const pattern of clientPatterns) {
      const matches = text.matchAll(new RegExp(pattern.source, 'gi'))
      for (const match of matches) {
        if (match[1] && !names.includes(match[1].trim())) {
          names.push(match[1].trim())
        }
      }
    }

    return names
  }

  // Helper method to extract practice numbers
  extractPracticeNumbers(text: string): string[] {
    const practicePattern = /\b(\d{4}\/\d{3})\b/g
    const matches = Array.from(text.matchAll(practicePattern))
    return matches.map(match => match[1])
  }
}
