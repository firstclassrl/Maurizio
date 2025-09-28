import { QueryResult } from './SupabaseQueryEngine'

export class ResponseFormatter {
  format(questionType: string, result: QueryResult, _entities?: any): string {
    if (result.type === 'error') {
      return `❌ ${result.message}`
    }

    if (result.type === 'not_found') {
      return `ℹ️ ${result.message}`
    }

    switch (questionType) {
      case 'udienza':
        return this.formatHearings(result.data || [])
      case 'scadenza':
        return this.formatDeadlines(result.data || [])
      case 'cliente':
        return this.formatClients(result.data || [])
      case 'pratica':
        return this.formatPractices(result.data || [])
      case 'attivita':
        return this.formatActivities(result.data || [])
      case 'appuntamento':
        return this.formatAppointments(result.data || [])
      case 'generale':
        return this.formatGeneral(result.data || [])
      default:
        return this.formatGeneral(result.data || [])
    }
  }

  private formatHearings(hearings: any[]): string {
    if (hearings.length === 0) {
      return '📅 Non ci sono udienze programmate.'
    }

    let response = '📅 **Udienze programmate:**\n\n'
    
    hearings.forEach((hearing, index) => {
      const practice = hearing.practices
      const client = practice?.clients
      const date = new Date(hearing.data).toLocaleDateString('it-IT')
      const time = hearing.ora || 'Orario non specificato'
      const court = practice?.autorita_giudiziaria || 'Tribunale non specificato'
      
      const clientName = client?.ragione || `${client?.nome || ''} ${client?.cognome || ''}`.trim()
      
      response += `${index + 1}. **${clientName}**\n`
      response += `   📅 ${date} alle ${time}\n`
      response += `   🏛️ ${court}\n`
      response += `   📋 Pratica: ${practice?.numero || 'N/A'}\n\n`
    })

    return response
  }

  private formatDeadlines(deadlines: any[]): string {
    if (deadlines.length === 0) {
      return '⏰ Non ci sono scadenze per il periodo richiesto.'
    }

    let response = `⏰ **Scadenze (${deadlines.length} attività):**\n\n`
    
    deadlines.forEach((deadline, index) => {
      const practice = deadline.practices
      const client = practice?.clients
      const date = new Date(deadline.data).toLocaleDateString('it-IT')
      const time = deadline.ora || 'Orario non specificato'
      
      const clientName = client?.ragione || `${client?.nome || ''} ${client?.cognome || ''}`.trim()
      
      response += `${index + 1}. **${deadline.attivita || 'Attività'}**\n`
      response += `   📅 ${date} alle ${time}\n`
      response += `   👤 ${clientName}\n`
      response += `   📋 Pratica: ${practice?.numero || 'N/A'}\n\n`
    })

    return response
  }

  private formatClients(clients: any[]): string {
    if (clients.length === 0) {
      return '👥 Nessun cliente trovato.'
    }

    let response = `👥 **Clienti (${clients.length} trovati):**\n\n`
    
    clients.forEach((client, index) => {
      const name = client.ragione || `${client.nome || ''} ${client.cognome || ''}`.trim()
      const piva = client.partita_iva ? ` - P.IVA: ${client.partita_iva}` : ''
      const cf = client.codice_fiscale ? ` - CF: ${client.codice_fiscale}` : ''
      
      response += `${index + 1}. **${name}**${piva}${cf}\n`
      
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

  private formatPractices(practices: any[]): string {
    if (practices.length === 0) {
      return '📋 Nessuna pratica trovata.'
    }

    let response = `📋 **Pratiche (${practices.length} trovate):**\n\n`
    
    practices.forEach((practice, index) => {
      const client = practice.clients
      const clientName = client?.ragione || `${client?.nome || ''} ${client?.cognome || ''}`.trim()
      const tipo = practice.tipo_procedura === 'GIUDIZIALE' ? '⚖️ Giudiziale' : '📄 Stragiudiziale'
      
      response += `${index + 1}. **Pratica ${practice.numero}**\n`
      response += `   👤 Cliente: ${clientName}\n`
      response += `   ${tipo}\n`
      
      if (practice.autorita_giudiziaria) {
        response += `   🏛️ ${practice.autorita_giudiziaria}\n`
      }
      if (practice.rg) {
        response += `   📝 R.G. ${practice.rg}\n`
      }
      if (practice.giudice) {
        response += `   👨‍⚖️ Giudice: ${practice.giudice}\n`
      }
      
      response += `   📅 Creata: ${new Date(practice.created_at).toLocaleDateString('it-IT')}\n\n`
    })

    return response
  }

  private formatActivities(activities: any[]): string {
    if (activities.length === 0) {
      return '📝 Nessuna attività trovata.'
    }

    let response = `📝 **Attività (${activities.length} trovate):**\n\n`
    
    activities.forEach((activity, index) => {
      const practice = activity.practices
      const client = practice?.clients
      const clientName = client?.ragione || `${client?.nome || ''} ${client?.cognome || ''}`.trim()
      const date = new Date(activity.data).toLocaleDateString('it-IT')
      const time = activity.ora || 'Orario non specificato'
      
      response += `${index + 1}. **${activity.attivita || 'Attività'}**\n`
      response += `   📅 ${date} alle ${time}\n`
      response += `   👤 ${clientName}\n`
      response += `   📋 Pratica: ${practice?.numero || 'N/A'}\n`
      
      if (activity.note) {
        response += `   📝 Note: ${activity.note}\n`
      }
      response += '\n'
    })

    return response
  }

  private formatAppointments(appointments: any[]): string {
    // For now, treat appointments as activities
    return this.formatActivities(appointments)
  }

  private formatGeneral(data: any[]): string {
    if (data.length === 0) {
      return '📊 Non ci sono dati recenti da mostrare.'
    }

    let response = '📊 **Riepilogo recente:**\n\n'
    
    data.forEach((item, index) => {
      const practice = item.practices
      const client = practice?.clients
      const clientName = client?.ragione || (client?.nome || '') + ' ' + (client?.cognome || '')
      const time = item.ora || 'Orario non specificato'
      const activityDate = new Date(item.data).toLocaleDateString('it-IT')
      
      response += (index + 1) + '. ' + (item.attivita || 'Attività') + '\n'
      response += '   📅 ' + activityDate + ' alle ' + time + '\n'
      response += '   👤 ' + clientName + ' (Pratica: ' + (practice?.numero || 'N/A') + ')\n\n'
    })

    return response
  }

}
