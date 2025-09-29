export interface Intent {
  type: 'query' | 'action' | 'info'
  category: 'temporal' | 'client' | 'practice' | 'activity' | 'deadline' | 'calculation' | 'search' | 'general'
  timeScope?: 'today' | 'tomorrow' | 'week' | 'month' | 'specific_date' | 'urgent'
  entities: {
    client?: string
    practice?: string
    activity?: string
    date?: string
    urgency?: 'low' | 'medium' | 'high' | 'critical'
  }
  confidence: number
}

export class IntentAnalyzer {
  
  // ANALISI SEMANTICA INTELLIGENTE
  analyzeIntent(text: string): Intent {
    const lowerText = text.toLowerCase()
    
    // 1. ANALISI TEMPORALE
    const timeScope = this.extractTimeScope(lowerText)
    
    // 2. ANALISI DELLE INTENZIONI
    const intent = this.detectIntent(lowerText)
    
    // 3. ESTRATTORE ENTITÀ INTELLIGENTE
    const entities = this.extractEntities(lowerText)
    
    // 4. CALCOLO CONFIDENCE
    const confidence = this.calculateConfidence(intent, entities, timeScope)
    
    return {
      type: intent.type,
      category: intent.category,
      timeScope,
      entities,
      confidence
    }
  }
  
  private extractTimeScope(text: string): 'today' | 'tomorrow' | 'week' | 'month' | 'specific_date' | 'urgent' | undefined {
    // Analisi temporale intelligente
    if (this.containsWords(text, ['oggi', 'adesso', 'ora', 'immediatamente'])) return 'today'
    if (this.containsWords(text, ['domani', 'prossimo', 'seguente'])) return 'tomorrow'
    if (this.containsWords(text, ['settimana', 'settimane', 'giorni'])) return 'week'
    if (this.containsWords(text, ['mese', 'mensile', 'mensili'])) return 'month'
    if (this.containsWords(text, ['urgente', 'subito', 'critico', 'emergenza'])) return 'urgent'
    
    // Analisi date specifiche
    if (/\d{1,2}[\/\-]\d{1,2}[\/\-]?\d{2,4}/.test(text)) return 'specific_date'
    
    return undefined
  }
  
  private detectIntent(text: string): { type: 'query' | 'action' | 'info', category: string } {
    // INTENZIONI DI QUERY (domande)
    if (this.isQuery(text)) {
      if (this.containsWords(text, ['quando', 'che ora', 'a che ora', 'orario'])) {
        return { type: 'query', category: 'temporal' }
      }
      if (this.containsWords(text, ['chi', 'cliente', 'controparte', 'parte'])) {
        return { type: 'query', category: 'client' }
      }
      if (this.containsWords(text, ['pratica', 'caso', 'procedimento', 'causa'])) {
        return { type: 'query', category: 'practice' }
      }
      if (this.containsWords(text, ['cosa', 'quale', 'quali', 'attività', 'impegno', 'scadenza'])) {
        return { type: 'query', category: 'activity' }
      }
      if (this.containsWords(text, ['quanto', 'calcola', 'termine', 'giorni'])) {
        return { type: 'query', category: 'calculation' }
      }
      return { type: 'query', category: 'general' }
    }
    
    // INTENZIONI DI AZIONE (comandi)
    if (this.isAction(text)) {
      return { type: 'action', category: 'activity' }
    }
    
    // INTENZIONI DI INFORMAZIONE (richieste di info)
    return { type: 'info', category: 'general' }
  }
  
  private extractEntities(text: string) {
    const entities: any = {}
    
    // Estrazione clienti intelligente
    const clientPatterns = [
      /(?:cliente|per|di)\s+([A-Z][a-zA-Z\s&\.]+)/g,
      /([A-Z][a-zA-Z\s&\.]+)\s+(?:srl|spa|sas|snc)/gi
    ]
    
    for (const pattern of clientPatterns) {
      const matches = text.match(pattern)
      if (matches) {
        entities.client = matches[0].replace(/(?:cliente|per|di)\s+/gi, '').trim()
        break
      }
    }
    
    // Estrazione pratiche
    const practicePatterns = [
      /pratica\s+(\d+\/\d+)/gi,
      /caso\s+(\d+\/\d+)/gi,
      /(\d{4}\/\d+)/g
    ]
    
    for (const pattern of practicePatterns) {
      const matches = text.match(pattern)
      if (matches) {
        entities.practice = matches[0]
        break
      }
    }
    
    // Estrazione attività
    // supporta semplici plurali e variazioni (udienza/udienze, scadenza/scadenze, ecc.)
    const activityKeywords = ['udienza', 'udienze', 'ricorso', 'memoria', 'notifica', 'pagamento', 'scadenza', 'scadenze', 'appuntamento', 'appuntamenti']
    for (const keyword of activityKeywords) {
      if (text.includes(keyword)) {
        // normalizza al singolare più comune per le query
        entities.activity = keyword.replace(/e?s$/,'')
        break
      }
    }
    
    // Analisi urgenza
    if (this.containsWords(text, ['urgente', 'critico', 'emergenza', 'subito'])) {
      entities.urgency = 'critical'
    } else if (this.containsWords(text, ['importante', 'priorità', 'prima'])) {
      entities.urgency = 'high'
    } else if (this.containsWords(text, ['normale', 'standard'])) {
      entities.urgency = 'medium'
    } else {
      entities.urgency = 'low'
    }
    
    return entities
  }
  
  private isQuery(text: string): boolean {
    const questionWords = ['cosa', 'quando', 'dove', 'chi', 'come', 'perché', 'quale', 'quali', 'quanto']
    return questionWords.some(word => text.includes(word)) || text.includes('?')
  }
  
  private isAction(text: string): boolean {
    const actionWords = ['crea', 'aggiungi', 'elimina', 'modifica', 'cancella', 'salva', 'calcola']
    return actionWords.some(word => text.includes(word))
  }
  
  private containsWords(text: string, words: string[]): boolean {
    return words.some(word => text.includes(word))
  }
  
  private calculateConfidence(intent: any, entities: any, timeScope: any): number {
    let confidence = 0.5 // Base confidence
    
    // Boost per entities trovate
    if (entities.client) confidence += 0.2
    if (entities.practice) confidence += 0.2
    if (entities.activity) confidence += 0.2
    if (timeScope) confidence += 0.1
    
    return Math.min(confidence, 1.0)
  }
}
