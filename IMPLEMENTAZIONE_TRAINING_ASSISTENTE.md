# 🔧 IMPLEMENTAZIONE PRATICA TRAINING ASSISTENTE

## 📝 **PATTERN IMPLEMENTATI**

### **1. Pattern Temporali Avanzati**

```typescript
// Aggiungere a QuestionParser.ts
private patterns = {
  // ... pattern esistenti ...
  
  scadenze_imminenti: [
    /quando\s+scade\s+(?:la\s+)?prossima\s+(?:pratica|scadenza)/i,
    /quali\s+scadenze\s+(?:ho\s+)?(?:questa\s+settimana|oggi|domani)/i,
    /cosa\s+scade\s+(?:oggi|domani|questa\s+settimana)/i,
    /mostrami\s+(?:le\s+)?scadenze\s+(?:urgenti|imminenti)/i,
    /quali\s+pratiche\s+scadono\s+(?:entro\s+)?(\d+\s+giorni?|questa\s+settimana)/i,
    /ho\s+scadenze\s+(?:oggi|domani)/i,
    /quando\s+è\s+(?:la\s+)?prossima\s+scadenza\s+(?:critica|importante)/i
  ],
  
  udienze_appuntamenti: [
    /quando\s+è\s+(?:la\s+)?prossima\s+udienza/i,
    /quali\s+udienze\s+(?:ho\s+)?(?:questa\s+settimana|oggi|domani)/i,
    /quando\s+devo\s+andare\s+in\s+tribunale/i,
    /mostrami\s+(?:tutti\s+gli\s+)?appuntamenti\s+(?:di\s+oggi|questa\s+settimana)/i,
    /quando\s+è\s+l'udienza\s+(?:di|per)\s+(.+)/i,
    /mostrami\s+il\s+calendario\s+delle\s+udienze/i,
    /quali\s+appuntamenti\s+ho\s+con\s+i\s+clienti/i,
    /quando\s+è\s+(?:la\s+)?prossima\s+conciliazione/i
  ],
  
  calcoli_termini: [
    /calcola\s+(\d+)\s+giorni?\s+(?:da\s+oggi|dal\s+(\d{1,2}\/\d{1,2}\/\d{4}))/i,
    /quando\s+scade\s+(?:la\s+)?comparsa\s+conclusionale/i,
    /calcola\s+il\s+termine\s+(?:per\s+l'|per\s+il\s+)?(appello|ricorso|opposizione)/i,
    /quanto\s+tempo\s+ho\s+per\s+(?:il\s+)?(ricorso|appello|comparsa)/i,
    /calcola\s+(\d+)\s+giorni?\s+dal\s+(\d{1,2}\/\d{1,2}\/\d{4})/i,
    /quando\s+devo\s+depositare\s+(?:la\s+)?(comparsa|ricorso|appello)/i,
    /calcola\s+(\d+)\s+giorni?\s+per\s+(?:la\s+)?(cassazione|notifica)/i,
    /quando\s+scade\s+(?:la\s+)?prescrizione/i
  ]
}
```

### **2. Pattern Clienti Avanzati**

```typescript
// Aggiungere pattern per clienti
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
  /trovami\s+(.+)/i
]
```

### **3. Pattern Pratiche Avanzate**

```typescript
// Aggiungere pattern per pratiche
pratiche_info: [
  /mostrami\s+(?:tutte\s+le\s+)?pratiche/i,
  /quali\s+pratiche\s+ho\s+in\s+corso/i,
  /dammi\s+dettagli\s+della\s+pratica\s+(.+)/i,
  /mostrami\s+le\s+pratiche\s+di\s+(.+)/i,
  /quali\s+sono\s+le\s+mie\s+pratiche\s+attive/i,
  /mostrami\s+la\s+pratica\s+(.+)/i,
  /dammi\s+informazioni\s+sulla\s+pratica\s+(.+)/i,
  /mostrami\s+(?:tutte\s+le\s+)?pratiche\s+(?:giudiziali|stragiudiziali)/i,
  /quali\s+pratiche\s+(?:giudiziali|stragiudiziali)\s+ho/i
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
  /quali\s+attività\s+sono\s+in\s+ritardo/i
]
```

### **4. Pattern Attività Specifiche**

```typescript
// Aggiungere pattern per ricorsi
ricorsi: [
  /quando\s+devo\s+fare\s+ricorso\s+(?:per|di)\s+(.+)/i,
  /quali\s+ricorsi\s+ho\s+in\s+corso/i,
  /quando\s+scade\s+(?:il\s+)?ricorso\s+(?:di|per)\s+(.+)/i,
  /mostrami\s+(?:tutti\s+i\s+)?ricorsi/i,
  /quando\s+è\s+(?:il\s+)?ricorso\s+(?:per|di)\s+(.+)/i,
  /quali\s+ricorsi\s+scadono\s+(?:questa\s+settimana|oggi|domani)/i,
  /mostrami\s+i\s+ricorsi\s+urgenti/i,
  /quando\s+devo\s+depositare\s+(?:il\s+)?ricorso/i,
  /quali\s+ricorsi\s+ho\s+da\s+fare/i,
  /mostrami\s+le\s+scadenze\s+dei\s+ricorsi/i
],

// Aggiungere pattern per pagamenti
pagamenti: [
  /quando\s+devo\s+riscuotere\s+(?:per|da)\s+(.+)/i,
  /quali\s+pagamenti\s+sono\s+in\s+scadenza/i,
  /quando\s+scadono\s+i\s+pagamenti\s+(?:di|per)\s+(.+)/i,
  /mostrami\s+(?:tutti\s+i\s+)?pagamenti/i,
  /quando\s+devo\s+fatturare\s+(.+)/i,
  /quali\s+pagamenti\s+ho\s+da\s+riscuotere/i,
  /mostrami\s+le\s+fatture\s+in\s+scadenza/i,
  /quando\s+è\s+(?:il\s+)?pagamento\s+(?:di|per)\s+(.+)/i,
  /quali\s+pagamenti\s+sono\s+in\s+ritardo/i,
  /mostrami\s+le\s+scadenze\s+di\s+pagamento/i
]
```

### **5. Pattern Ricerca Avanzata**

```typescript
// Aggiungere pattern per filtri temporali
filtri_temporali: [
  /mostrami\s+le\s+attività\s+(?:di\s+oggi|domani|questa\s+settimana)/i,
  /quali\s+attività\s+ho\s+(?:oggi|domani|il\s+(.+))/i,
  /mostrami\s+le\s+attività\s+(?:del\s+mese|di\s+(.+))/i,
  /quali\s+attività\s+ho\s+(?:in\s+(.+)|nel\s+periodo\s+(.+))/i,
  /mostrami\s+le\s+attività\s+(?:passate|in\s+futuro)/i
],

// Aggiungere pattern per filtri stato
filtri_stato: [
  /mostrami\s+le\s+attività\s+(?:da\s+fare|completate|urgenti|in\s+ritardo)/i,
  /quali\s+attività\s+(?:sono\s+completate|hanno\s+priorità\s+alta|sono\s+bloccate)/i,
  /mostrami\s+le\s+attività\s+(?:pendenti|in\s+corso|sospese)/i,
  /quali\s+attività\s+richiedono\s+attenzione/i
],

// Aggiungere pattern per filtri categoria
filtri_categoria: [
  /mostrami\s+(?:solo\s+)?(?:le\s+udienze|scadenze\s+processuali|attività\s+stragiudiziali)/i,
  /quali\s+(?:appuntamenti|attività\s+giudiziali|scadenze)\s+ho/i,
  /mostrami\s+(?:solo\s+)?(?:i\s+ricorsi|notifiche|conciliazioni|perizie)/i
]
```

### **6. Pattern Statistiche**

```typescript
// Aggiungere pattern per contatori
contatori: [
  /quante\s+(?:pratiche|clienti|attività|udienze|ricorsi|scadenze)\s+ho/i,
  /mostrami\s+(?:le\s+statistiche|il\s+riepilogo\s+del\s+mese)/i,
  /quali\s+sono\s+i\s+numeri\s+(?:di\s+oggi|del\s+mese)/i,
  /mostrami\s+il\s+dashboard/i
],

// Aggiungere pattern per analisi
analisi: [
  /qual\s+è\s+(?:la\s+mia\s+)?attività\s+più\s+frequente/i,
  /quale\s+cliente\s+ha\s+più\s+pratiche/i,
  /quali\s+sono\s+(?:le\s+mie\s+)?pratiche\s+(?:più\s+vecchie|più\s+urgenti)/i,
  /qual\s+è\s+(?:il\s+mio\s+)?carico\s+di\s+lavoro/i,
  /mostrami\s+(?:le\s+statistiche\s+mensili|l'analisi\s+delle\s+attività)/i,
  /quali\s+pratiche\s+sono\s+in\s+ritardo/i,
  /qual\s+è\s+(?:la\s+mia\s+)?produttività/i,
  /mostrami\s+i\s+trend\s+delle\s+scadenze/i
]
```

### **7. Pattern Operativi**

```typescript
// Aggiungere pattern per cosa fare
cosa_fare: [
  /cosa\s+devo\s+fare\s+(?:oggi|ora)/i,
  /qual\s+è\s+(?:la\s+mia\s+)?prossima\s+attività/i,
  /quali\s+sono\s+(?:le\s+mie\s+)?priorità/i,
  /cosa\s+è\s+più\s+urgente/i,
  /quale\s+attività\s+devo\s+fare\s+prima/i,
  /mostrami\s+(?:la\s+mia\s+)?agenda/i,
  /qual\s+è\s+(?:il\s+mio\s+)?piano\s+per\s+oggi/i,
  /cosa\s+devo\s+preparare/i,
  /quali\s+documenti\s+devo\s+preparare/i,
  /mostrami\s+(?:la\s+mia\s+)?to-do\s+list/i
],

// Aggiungere pattern per pianificazione
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
  /come\s+gestisco\s+le\s+scadenze/i
]
```

### **8. Pattern Emergenze**

```typescript
// Aggiungere pattern per emergenze
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
  /quali\s+sono\s+i\s+rischi\s+imminenti/i
],

// Aggiungere pattern per controlli
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
  /mostrami\s+(?:lo\s+)?stato\s+generale/i
]
```

### **9. Query Engine Avanzato**

```typescript
// Aggiungere a SupabaseQueryEngine.ts
private async queryScadenzeImminenti(question: ParsedQuestion, userId: string): Promise<QueryResult> {
  const today = new Date()
  const nextWeek = new Date()
  nextWeek.setDate(today.getDate() + 7)
  
  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      practices!inner(
        *,
        clients!inner(*)
      )
    `)
    .eq('user_id', userId)
    .eq('stato', 'todo')
    .gte('data', format(today, 'yyyy-MM-dd'))
    .lte('data', format(nextWeek, 'yyyy-MM-dd'))
    .order('data', { ascending: true })
    .order('ora', { ascending: true })

  if (error) throw error

  return {
    type: 'success',
    data: data || [],
    count: data?.length || 0
  }
}

private async queryUdienzeAppuntamenti(question: ParsedQuestion, userId: string): Promise<QueryResult> {
  const { cliente } = question.entities
  const today = new Date()
  
  let query = supabase
    .from('activities')
    .select(`
      *,
      practices!inner(
        *,
        clients!inner(*)
      )
    `)
    .eq('user_id', userId)
    .in('categoria', ['Udienza', 'Appuntamento'])
    .gte('data', format(today, 'yyyy-MM-dd'))

  if (cliente) {
    query = query.or(`
      practices.clients.ragione.ilike.%${cliente}%,
      practices.clients.nome.ilike.%${cliente}%,
      practices.clients.cognome.ilike.%${cliente}%
    `)
  }

  const { data, error } = await query
    .order('data', { ascending: true })
    .order('ora', { ascending: true })

  if (error) throw error

  return {
    type: 'success',
    data: data || [],
    count: data?.length || 0
  }
}

private async queryStatistiche(question: ParsedQuestion, userId: string): Promise<QueryResult> {
  // Query per statistiche generali
  const [practicesCount, clientsCount, activitiesCount, urgentCount] = await Promise.all([
    supabase.from('practices').select('id', { count: 'exact' }).eq('user_id', userId),
    supabase.from('clients').select('id', { count: 'exact' }).eq('user_id', userId),
    supabase.from('activities').select('id', { count: 'exact' }).eq('user_id', userId),
    supabase.from('activities').select('id', { count: 'exact' }).eq('user_id', userId).eq('stato', 'todo')
  ])

  const stats = {
    pratiche: practicesCount.count || 0,
    clienti: clientsCount.count || 0,
    attivita: activitiesCount.count || 0,
    urgenti: urgentCount.count || 0
  }

  return {
    type: 'success',
    data: stats,
    count: 1
  }
}
```

### **10. Response Formatter Avanzato**

```typescript
// Aggiungere a ResponseFormatter.ts
private formatScadenzeImminenti(scadenze: any[]): string {
  if (scadenze.length === 0) {
    return '📅 Nessuna scadenza imminente trovata.'
  }

  let response = `📅 **Scadenze Imminenti (${scadenze.length} trovate):**\n\n`
  
  scadenze.forEach((scadenza, index) => {
    const practice = scadenza.practices
    const client = practice?.clients
    const clientName = client?.ragione || (client?.nome || '') + ' ' + (client?.cognome || '')
    const date = new Date(scadenza.data).toLocaleDateString('it-IT')
    const time = scadenza.ora || 'Orario non specificato'
    const isUrgent = new Date(scadenza.data) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 giorni
    
    response += (index + 1) + '. **' + (scadenza.attivita || 'Attività') + '**'
    if (isUrgent) response += ' 🚨'
    response += '\n'
    response += '   📅 ' + date + ' alle ' + time + '\n'
    response += '   👤 ' + clientName + '\n'
    response += '   📋 Pratica: ' + (practice?.numero || 'N/A') + '\n'
    if (scadenza.note) {
      response += '   📝 Note: ' + scadenza.note + '\n'
    }
    response += '\n'
  })

  return response
}

private formatStatistiche(stats: any): string {
  return `📊 **Statistiche Generali:**\n\n` +
         `📋 **Pratiche:** ${stats.pratiche}\n` +
         `👥 **Clienti:** ${stats.clienti}\n` +
         `📝 **Attività:** ${stats.attivita}\n` +
         `🚨 **Urgenti:** ${stats.urgenti}\n\n` +
         `💡 **Consiglio:** ${stats.urgenti > 0 ? 'Hai attività urgenti da completare!' : 'Tutto sotto controllo!'}`
}

private formatCosaFare(attivita: any[]): string {
  if (attivita.length === 0) {
    return '✅ Non hai attività urgenti da fare oggi!'
  }

  let response = `📋 **Cosa Devi Fare Oggi:**\n\n`
  
  attivita.slice(0, 5).forEach((att, index) => {
    const practice = att.practices
    const client = practice?.clients
    const clientName = client?.ragione || (client?.nome || '') + ' ' + (client?.cognome || '')
    const time = att.ora || 'Orario non specificato'
    const priority = att.priorita > 7 ? '🔴' : att.priorita > 4 ? '🟡' : '🟢'
    
    response += (index + 1) + '. ' + priority + ' **' + (att.attivita || 'Attività') + '**\n'
    response += '   🕐 ' + time + '\n'
    response += '   👤 ' + clientName + '\n'
    if (att.note) {
      response += '   📝 ' + att.note + '\n'
    }
    response += '\n'
  })

  if (attivita.length > 5) {
    response += `... e altre ${attivita.length - 5} attività.\n`
  }

  return response
}
```

---

## 🚀 **IMPLEMENTAZIONE GRADUALE**

### **Settimana 1: Pattern Base**
1. Implementare pattern temporali
2. Aggiungere query per scadenze e udienze
3. Testare con domande semplici

### **Settimana 2: Clienti e Pratiche**
1. Implementare pattern per clienti
2. Aggiungere query per pratiche
3. Gestire ricerche per nome

### **Settimana 3: Attività Specifiche**
1. Implementare pattern per ricorsi/pagamenti
2. Aggiungere query specializzate
3. Testare riconoscimento avanzato

### **Settimana 4: Ottimizzazione**
1. Aggiungere pattern complessi
2. Implementare statistiche
3. Test finale e deploy

**L'assistente diventerà un vero "co-pilota legale"!** 🧠⚖️
