import { Intent } from './IntentAnalyzer'
import { QueryResult } from './IntelligentQueryEngine'

export class IntelligentResponseFormatter {
  
  format(intent: Intent, result: QueryResult): string {
    if (result.type === 'error') {
      return `❌ ${result.message}`
    }

    if (result.type === 'not_found') {
      return `ℹ️ ${result.message}`
    }

    // FORMATTAZIONE INTELLIGENTE BASATA SU INTENT
    switch (intent.category) {
      case 'temporal':
        return this.formatTemporalResponse(intent, result)
      case 'client':
        return this.formatClientResponse(intent, result)
      case 'practice':
        return this.formatPracticeResponse(intent, result)
      case 'activity':
        return this.formatActivityResponse(intent, result)
      case 'calculation':
        return this.formatCalculationResponse(intent, result)
      case 'search':
        return this.formatSearchResponse(intent, result)
      default:
        return this.formatGeneralResponse(intent, result)
    }
  }
  
  private formatTemporalResponse(intent: Intent, result: QueryResult): string {
    const { timeScope, entities } = intent
    const activities = result.data || []
    
    if (activities.length === 0) {
      const timeLabel = this.getTimeLabel(timeScope)
      return `✅ **Nessun impegno ${timeLabel}**\n\nPuoi dedicarti ad altre attività.`
    }
    
    let response = `📅 **${this.getTimeLabel(timeScope).toUpperCase()}:**\n\n`
    
    // Raggruppa per data
    const groupedByDate = this.groupByDate(activities)
    
    Object.entries(groupedByDate).forEach(([date, items]: [string, any[]]) => {
      const dateLabel = this.formatDate(date)
      response += `🟢 **${dateLabel}:**\n\n`
      
      items.forEach((item, index) => {
        const practice = item.practices
        const client = practice?.clients
        const clientName = this.getClientName(client)
        const time = item.ora || 'Orario da definire'
        
        response += `${index + 1}. 🕐 **${time}** - ${item.attivita || 'Attività'}\n`
        response += `   👤 Cliente: ${clientName}\n`
        if (item.note) {
          response += `   📝 ${item.note}\n`
        }
        response += '\n'
      })
    })
    
    return response
  }
  
  private formatClientResponse(intent: Intent, result: QueryResult): string {
    const clients = result.data || []
    
    if (clients.length === 0) {
      return `ℹ️ Nessun cliente trovato.`
    }
    
    let response = `👥 **CLIENTI TROVATI:**\n\n`
    
    clients.forEach((client, index) => {
      const clientName = this.getClientName(client)
      response += `${index + 1}. **${clientName}**\n`
      if (client.email) {
        response += `   📧 ${client.email}\n`
      }
      if (client.telefono) {
        response += `   📞 ${client.telefono}\n`
      }
      response += '\n'
    })
    
    return response
  }
  
  private formatPracticeResponse(intent: Intent, result: QueryResult): string {
    const practices = result.data || []
    
    if (practices.length === 0) {
      return `ℹ️ Nessuna pratica trovata.`
    }
    
    let response = `📋 **PRATICHE TROVATE:**\n\n`
    
    practices.forEach((practice, index) => {
      const client = practice.clients
      const clientName = this.getClientName(client)
      
      response += `${index + 1}. **${practice.numero}** - ${practice.tipo || 'Pratica'}\n`
      response += `   👤 Cliente: ${clientName}\n`
      response += `   📅 Data: ${this.formatDate(practice.data_creazione)}\n`
      if (practice.stato) {
        response += `   📊 Stato: ${practice.stato}\n`
      }
      response += '\n'
    })
    
    return response
  }
  
  private formatActivityResponse(intent: Intent, result: QueryResult): string {
    // Simile a formatTemporalResponse ma più specifico per attività
    return this.formatTemporalResponse(intent, result)
  }
  
  private formatCalculationResponse(intent: Intent, result: QueryResult): string {
    return `🧮 **CALCOLO TERMINI**\n\nFunzionalità in sviluppo per calcoli automatici.`
  }
  
  private formatSearchResponse(intent: Intent, result: QueryResult): string {
    const items = result.data || []
    
    if (items.length === 0) {
      return `🔍 **RICERCA**\n\nNessun risultato trovato.`
    }
    
    let response = `🔍 **RISULTATI RICERCA:**\n\n`
    
    // Raggruppa per tipo
    const grouped = this.groupByType(items)
    
    Object.entries(grouped).forEach(([type, items]: [string, any[]]) => {
      const typeLabel = this.getTypeLabel(type)
      response += `**${typeLabel}:**\n\n`
      
      items.slice(0, 3).forEach((item, index) => {
        response += `${index + 1}. ${this.formatSearchItem(item, type)}\n\n`
      })
    })
    
    return response
  }
  
  private formatGeneralResponse(intent: Intent, result: QueryResult): string {
    const activities = result.data || []
    
    if (activities.length === 0) {
      return `ℹ️ Nessuna informazione disponibile.`
    }
    
    let response = `📊 **INFORMAZIONI:**\n\n`
    
    activities.slice(0, 5).forEach((item, index) => {
      response += `${index + 1}. ${item.attivita || 'Attività'}\n`
      if (item.data) {
        response += `   📅 ${this.formatDate(item.data)}\n`
      }
      response += '\n'
    })
    
    return response
  }
  
  // METODI DI UTILITÀ
  private getTimeLabel(timeScope?: string): string {
    switch (timeScope) {
      case 'today': return 'per oggi'
      case 'tomorrow': return 'per domani'
      case 'week': return 'per questa settimana'
      case 'month': return 'per questo mese'
      case 'urgent': return 'urgenti'
      default: return 'programmati'
    }
  }
  
  private getClientName(client: any): string {
    if (!client) return 'Non specificato'
    return client.ragione || `${client.nome || ''} ${client.cognome || ''}`.trim() || 'Cliente'
  }
  
  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('it-IT')
    } catch {
      return dateString
    }
  }
  
  private groupByDate(activities: any[]): Record<string, any[]> {
    return activities.reduce((groups, activity) => {
      const date = activity.data
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(activity)
      return groups
    }, {})
  }
  
  private groupByType(items: any[]): Record<string, any[]> {
    return items.reduce((groups, item) => {
      let type = 'activity' // default
      
      if (item.ragione || item.nome) type = 'client'
      else if (item.numero && item.tipo) type = 'practice'
      else if (item.attivita) type = 'activity'
      
      if (!groups[type]) {
        groups[type] = []
      }
      groups[type].push(item)
      return groups
    }, {})
  }
  
  private getTypeLabel(type: string): string {
    switch (type) {
      case 'client': return '👥 Clienti'
      case 'practice': return '📋 Pratiche'
      case 'activity': return '📅 Attività'
      default: return '📊 Elementi'
    }
  }
  
  private formatSearchItem(item: any, type: string): string {
    switch (type) {
      case 'client':
        return `${this.getClientName(item)}${item.email ? ` (${item.email})` : ''}`
      case 'practice':
        return `${item.numero} - ${this.getClientName(item.clients)}`
      case 'activity':
        return `${item.attivita} - ${this.formatDate(item.data)}`
      default:
        return item.attivita || item.numero || this.getClientName(item)
    }
  }
}
