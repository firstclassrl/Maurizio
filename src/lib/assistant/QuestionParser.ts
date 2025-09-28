export interface ParsedQuestion {
  type: 'udienza' | 'scadenza' | 'cliente' | 'pratica' | 'attivita' | 'appuntamento' | 'generale'
  entities: {
    cliente?: string
    pratica?: string
    data?: string
    periodo?: 'oggi' | 'domani' | 'settimana' | 'mese'
  }
  originalText: string
}

export class QuestionParser {
  private patterns = {
    udienza: [
      /quando\s+(?:è|ha)\s+(?:l'|la\s+)?udienza\s+(?:di|per)\s+(.+)/i,
      /udienza\s+(?:di|per)\s+(.+)/i,
      /quando\s+(?:vado|devo andare)\s+(?:in\s+)?tribunale\s+(?:per|per\s+)?(.+)/i
    ],
    scadenza: [
      /quali\s+pratiche\s+(?:scadono|sono in scadenza)\s+(?:questa|la\s+)?(.+)/i,
      /pratiche\s+(?:in\s+)?scadenza\s+(?:questa|la\s+)?(.+)/i,
      /cosa\s+(?:scade|è in scadenza)\s+(?:questa|la\s+)?(.+)/i
    ],
    cliente: [
      /chi\s+(?:è\s+)?(?:il\s+)?cliente\s+(?:della\s+)?(?:pratica\s+)?(.+)/i,
      /cliente\s+(?:della\s+)?(?:pratica\s+)?(.+)/i,
      /informazioni\s+(?:sul\s+)?(?:cliente\s+)?(.+)/i
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
              entities.cliente = entity
            }
          }

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
