// Sistema di Intelligenza Artificiale per classificare le attività legali
// e determinare quando applicare il calcolatore di scadenze

export interface ActivityAnalysis {
  needsCalculator: boolean
  activityType: 'event' | 'deadline' | 'mixed'
  description: string
  suggestedCalculation?: {
    tipoScadenza: string
    giorniTermine: number
    dataInizio?: string // Campo da cui calcolare
  }
  displayInfo?: {
    primaryDate: string
    secondaryDate?: string
    primaryLabel: string
    secondaryLabel?: string
  }
}

export const analyzeActivity = (categoria: string, pratica: string): ActivityAnalysis => {
  const categoriaLower = categoria.toLowerCase()
  const praticaLower = pratica.toLowerCase()

  // EVENTI FISSI (non necessitano calcolatore)
  if (categoriaLower.includes('udienza')) {
    return {
      needsCalculator: false,
      activityType: 'event',
      description: 'Udienza: evento fisso nel calendario giudiziario',
      displayInfo: {
        primaryDate: 'data_udienza',
        primaryLabel: 'Data Udienza'
      }
    }
  }

  if (categoriaLower.includes('conciliazione') || praticaLower.includes('conciliazione')) {
    return {
      needsCalculator: false,
      activityType: 'event',
      description: 'Conciliazione: evento fisso nel calendario',
      displayInfo: {
        primaryDate: 'data_conciliazione',
        primaryLabel: 'Data Conciliazione'
      }
    }
  }

  if (categoriaLower.includes('perizia') || praticaLower.includes('perizia')) {
    return {
      needsCalculator: false,
      activityType: 'event',
      description: 'Perizia: evento fisso nel calendario',
      displayInfo: {
        primaryDate: 'data_perizia',
        primaryLabel: 'Data Perizia'
      }
    }
  }

  // SCADENZE PROCESSUALI (necessitano calcolatore)
  if (categoriaLower.includes('scadenza') && categoriaLower.includes('atto')) {
    return {
      needsCalculator: true,
      activityType: 'deadline',
      description: 'Scadenza per deposito atto processuale',
      suggestedCalculation: {
        tipoScadenza: 'termini_processuali_civili',
        giorniTermine: 90,
        dataInizio: 'data_notifica'
      },
      displayInfo: {
        primaryDate: 'data_scadenza',
        secondaryDate: 'data_notifica',
        primaryLabel: 'Scadenza Deposito',
        secondaryLabel: 'Data Notifica'
      }
    }
  }

  if (categoriaLower.includes('memoria') || praticaLower.includes('memoria')) {
    return {
      needsCalculator: true,
      activityType: 'deadline',
      description: 'Scadenza per deposito memoria difensiva',
      suggestedCalculation: {
        tipoScadenza: 'memorie_repliche',
        giorniTermine: 30,
        dataInizio: 'data_notifica'
      },
      displayInfo: {
        primaryDate: 'data_scadenza',
        secondaryDate: 'data_notifica',
        primaryLabel: 'Scadenza Memoria',
        secondaryLabel: 'Data Notifica'
      }
    }
  }

  if (categoriaLower.includes('impugnazione') || praticaLower.includes('impugnazione')) {
    return {
      needsCalculator: true,
      activityType: 'deadline',
      description: 'Scadenza per presentazione impugnazione',
      suggestedCalculation: {
        tipoScadenza: 'impugnazioni_civili',
        giorniTermine: 30,
        dataInizio: 'data_notifica'
      },
      displayInfo: {
        primaryDate: 'data_scadenza',
        secondaryDate: 'data_notifica',
        primaryLabel: 'Scadenza Impugnazione',
        secondaryLabel: 'Data Notifica'
      }
    }
  }

  if (categoriaLower.includes('esecuzione') || praticaLower.includes('esecuzione')) {
    return {
      needsCalculator: true,
      activityType: 'deadline',
      description: 'Scadenza per atti esecutivi',
      suggestedCalculation: {
        tipoScadenza: 'esecuzioni_mobiliari',
        giorniTermine: 30,
        dataInizio: 'data_notifica'
      },
      displayInfo: {
        primaryDate: 'data_scadenza',
        secondaryDate: 'data_notifica',
        primaryLabel: 'Scadenza Esecuzione',
        secondaryLabel: 'Data Notifica'
      }
    }
  }

  // ATTIVITÀ PROCESSUALI (necessitano calcolatore per preparazione)
  if (categoriaLower.includes('attivita') && categoriaLower.includes('processuale')) {
    return {
      needsCalculator: true,
      activityType: 'mixed',
      description: 'Attività processuale con scadenza per preparazione',
      suggestedCalculation: {
        tipoScadenza: 'termini_183_190',
        giorniTermine: 20,
        dataInizio: 'data_notifica'
      },
      displayInfo: {
        primaryDate: 'data_scadenza',
        secondaryDate: 'data_notifica',
        primaryLabel: 'Scadenza Preparazione',
        secondaryLabel: 'Data Notifica'
      }
    }
  }

  // CASI SPECIALI (analisi per parole chiave)
  if (praticaLower.includes('deposito') || praticaLower.includes('presentazione')) {
    return {
      needsCalculator: true,
      activityType: 'deadline',
      description: 'Scadenza per deposito/presentazione documenti',
      suggestedCalculation: {
        tipoScadenza: 'termini_processuali_civili',
        giorniTermine: 30,
        dataInizio: 'data_notifica'
      },
      displayInfo: {
        primaryDate: 'data_scadenza',
        secondaryDate: 'data_notifica',
        primaryLabel: 'Scadenza Deposito',
        secondaryLabel: 'Data Notifica'
      }
    }
  }

  if (praticaLower.includes('ricorso') || praticaLower.includes('appello')) {
    return {
      needsCalculator: true,
      activityType: 'deadline',
      description: 'Scadenza per presentazione ricorso/appello',
      suggestedCalculation: {
        tipoScadenza: 'impugnazioni_civili',
        giorniTermine: 30,
        dataInizio: 'data_notifica'
      },
      displayInfo: {
        primaryDate: 'data_scadenza',
        secondaryDate: 'data_notifica',
        primaryLabel: 'Scadenza Ricorso',
        secondaryLabel: 'Data Notifica'
      }
    }
  }

  // DEFAULT: Attività generica senza calcolatore
  return {
    needsCalculator: false,
    activityType: 'event',
    description: 'Attività generica senza scadenze calcolabili',
    displayInfo: {
      primaryDate: 'data_evento',
      primaryLabel: 'Data Evento'
    }
  }
}

// Funzione per ottenere il testo descrittivo per l'utente
export const getActivityDescription = (analysis: ActivityAnalysis): string => {
  if (analysis.needsCalculator) {
    return `🤖 AI Riconosciuto: ${analysis.description}. Il calcolatore può aiutarti a determinare la scadenza.`
  } else {
    return `📅 Evento fisso: ${analysis.description}. Non necessita calcolo di scadenze.`
  }
}

// Funzione per ottenere l'icona appropriata
export const getActivityIcon = (analysis: ActivityAnalysis): string => {
  switch (analysis.activityType) {
    case 'event':
      return '📅'
    case 'deadline':
      return '⏰'
    case 'mixed':
      return '🔄'
    default:
      return '📋'
  }
}
