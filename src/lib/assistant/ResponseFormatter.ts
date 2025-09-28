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
      case 'ricorso':
        return this.formatRicorsi(result.data || [])
      case 'pagamenti':
        return this.formatPagamenti(result.data || [])
      case 'scadenze_imminenti':
        return this.formatScadenzeImminenti(result.data || [])
      case 'udienze_appuntamenti':
        return this.formatUdienzeAppuntamenti(result.data || [])
      case 'calcoli_termini':
        return this.formatCalcoliTermini(result.data)
      case 'clienti_info':
        return this.formatClientiInfo(result.data || [])
      case 'ricerca_clienti':
        return this.formatRicercaClienti(result.data || [])
      case 'pratiche_info':
        return this.formatPraticheInfo(result.data || [])
      case 'attivita_pratica':
        return this.formatAttivitaPratica(result.data || [])
      case 'filtri_temporali':
        return this.formatFiltriTemporali(result.data || [])
      case 'filtri_stato':
        return this.formatFiltriStato(result.data || [])
      case 'filtri_categoria':
        return this.formatFiltriCategoria(result.data || [])
      case 'contatori':
        return this.formatContatori(result.data)
      case 'analisi':
        return this.formatAnalisi(result.data || [])
      case 'cosa_fare':
        return this.formatCosaFare(result.data || [])
      case 'pianificazione':
        return this.formatPianificazione(result.data || [])
      case 'emergenze':
        return this.formatEmergenze(result.data || [])
        case 'controlli':
          return this.formatControlli(result.data || [])
        case 'ricorsi_specializzati':
          return this.formatRicorsiSpecializzati(result.data || [])
        case 'pagamenti_specializzati':
          return this.formatPagamentiSpecializzati(result.data || [])
        case 'calcoli_avanzati':
          return this.formatCalcoliAvanzati(result.data)
        case 'termini_processuali':
          return this.formatTerminiProcessuali(result.data || [])
        case 'prescrizioni':
          return this.formatPrescrizioni(result.data || [])
        case 'decadenze':
          return this.formatDecadenze(result.data || [])
        case 'comandi_vocali':
          return this.formatComandiVocali(result.data)
        case 'ricerca_intelligente':
          return this.formatRicercaIntelligente(result.data)
        case 'suggerimenti':
          return this.formatSuggerimenti(result.data)
        case 'workflow':
          return this.formatWorkflow(result.data)
        case 'produttivita':
          return this.formatProduttivita(result.data)
        case 'alert_sistema':
          return this.formatAlertSistema(result.data)
        case 'backup_restore':
          return this.formatBackupRestore(result.data)
        case 'statistiche_avanzate':
          return this.formatStatisticheAvanzate(result.data)
        case 'previsioni':
          return this.formatPrevisioni(result.data)
        case 'ottimizzazione':
          return this.formatOttimizzazione(result.data)
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

  private formatRicorsi(ricorsi: any[]): string {
    if (ricorsi.length === 0) {
      return '⚖️ Nessun ricorso trovato.'
    }

    let response = `⚖️ **Ricorsi (${ricorsi.length} trovati):**\n\n`
    
    ricorsi.forEach((ricorso, index) => {
      const practice = ricorso.practices
      const client = practice?.clients
      const clientName = client?.ragione || (client?.nome || '') + ' ' + (client?.cognome || '')
      const date = new Date(ricorso.data).toLocaleDateString('it-IT')
      const time = ricorso.ora || 'Orario non specificato'
      
      response += (index + 1) + '. **' + (ricorso.attivita || 'Ricorso') + '**\n'
      response += '   📅 ' + date + ' alle ' + time + '\n'
      response += '   👤 ' + clientName + '\n'
      response += '   📋 Pratica: ' + (practice?.numero || 'N/A') + '\n'
      
      if (ricorso.note) {
        response += '   📝 Note: ' + ricorso.note + '\n'
      }
      response += '\n'
    })

    return response
  }

  private formatPagamenti(pagamenti: any[]): string {
    if (pagamenti.length === 0) {
      return '💰 Nessun pagamento trovato.'
    }

    let response = `💰 **Pagamenti (${pagamenti.length} trovati):**\n\n`
    
    pagamenti.forEach((pagamento, index) => {
      const practice = pagamento.practices
      const client = practice?.clients
      const clientName = client?.ragione || (client?.nome || '') + ' ' + (client?.cognome || '')
      const date = new Date(pagamento.data).toLocaleDateString('it-IT')
      const time = pagamento.ora || 'Orario non specificato'
      
      response += (index + 1) + '. **' + (pagamento.attivita || 'Pagamenti') + '**\n'
      response += '   📅 ' + date + ' alle ' + time + '\n'
      response += '   👤 ' + clientName + '\n'
      response += '   📋 Pratica: ' + (practice?.numero || 'N/A') + '\n'
      
      if (pagamento.note) {
        response += '   📝 Note: ' + pagamento.note + '\n'
      }
      response += '\n'
    })

    return response
  }

  // NUOVI FORMATTER FASE 1 - TEMPORALI
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

  private formatUdienzeAppuntamenti(udienze: any[]): string {
    if (udienze.length === 0) {
      return '⚖️ Nessuna udienza o appuntamento trovato.'
    }

    let response = `⚖️ **Udienze e Appuntamenti (${udienze.length} trovati):**\n\n`
    
    udienze.forEach((udienza, index) => {
      const practice = udienza.practices
      const client = practice?.clients
      const clientName = client?.ragione || (client?.nome || '') + ' ' + (client?.cognome || '')
      const date = new Date(udienza.data).toLocaleDateString('it-IT')
      const time = udienza.ora || 'Orario non specificato'
      
      response += (index + 1) + '. **' + (udienza.attivita || 'Appuntamento') + '**\n'
      response += '   📅 ' + date + ' alle ' + time + '\n'
      response += '   👤 ' + clientName + '\n'
      response += '   📋 Pratica: ' + (practice?.numero || 'N/A') + '\n'
      if (udienza.note) {
        response += '   📝 Note: ' + udienza.note + '\n'
      }
      response += '\n'
    })

    return response
  }

  private formatCalcoliTermini(data: any): string {
    if (data?.message) {
      return '🧮 ' + data.message
    }
    return '🧮 Calcolo termini non disponibile al momento.'
  }

  // NUOVI FORMATTER FASE 1 - CLIENTI
  private formatClientiInfo(clienti: any[]): string {
    if (clienti.length === 0) {
      return '👥 Nessun cliente trovato.'
    }

    let response = `👥 **Lista Clienti (${clienti.length} trovati):**\n\n`
    
    clienti.forEach((cliente, index) => {
      const name = cliente.ragione || (cliente.nome || '') + ' ' + (cliente.cognome || '')
      const piva = cliente.partita_iva ? ` (P.IVA: ${cliente.partita_iva})` : ''
      const tipo = cliente.tipologia ? ` - ${cliente.tipologia}` : ''
      
      response += (index + 1) + '. **' + name + '**' + piva + tipo + '\n'
      if (cliente.note) {
        response += '   📝 ' + cliente.note + '\n'
      }
      response += '\n'
    })

    return response
  }

  private formatRicercaClienti(clienti: any[]): string {
    if (clienti.length === 0) {
      return '🔍 Nessun cliente trovato con i criteri di ricerca.'
    }

    let response = `🔍 **Risultati Ricerca (${clienti.length} trovati):**\n\n`
    
    clienti.forEach((cliente, index) => {
      const name = cliente.ragione || (cliente.nome || '') + ' ' + (cliente.cognome || '')
      const piva = cliente.partita_iva ? ` (P.IVA: ${cliente.partita_iva})` : ''
      const tipo = cliente.tipologia ? ` - ${cliente.tipologia}` : ''
      
      response += (index + 1) + '. **' + name + '**' + piva + tipo + '\n'
      if (cliente.note) {
        response += '   📝 ' + cliente.note + '\n'
      }
      response += '\n'
    })

    return response
  }

  // NUOVI FORMATTER FASE 1 - PRATICHE
  private formatPraticheInfo(pratiche: any[]): string {
    if (pratiche.length === 0) {
      return '📋 Nessuna pratica trovata.'
    }

    let response = `📋 **Pratiche (${pratiche.length} trovate):**\n\n`
    
    pratiche.forEach((pratica, index) => {
      const client = pratica.clients
      const clientName = client?.ragione || (client?.nome || '') + ' ' + (client?.cognome || '')
      const tipo = pratica.tipo_procedura || 'N/A'
      
      response += (index + 1) + '. **Pratica ' + (pratica.numero || 'N/A') + '**\n'
      response += '   👤 Cliente: ' + clientName + '\n'
      response += '   ⚖️ Tipo: ' + tipo + '\n'
      if (pratica.descrizione) {
        response += '   📝 ' + pratica.descrizione + '\n'
      }
      response += '\n'
    })

    return response
  }

  private formatAttivitaPratica(attivita: any[]): string {
    if (attivita.length === 0) {
      return '📝 Nessuna attività trovata per questa pratica.'
    }

    let response = `📝 **Attività Pratica (${attivita.length} trovate):**\n\n`
    
    attivita.forEach((att, index) => {
      const practice = att.practices
      const client = practice?.clients
      const clientName = client?.ragione || (client?.nome || '') + ' ' + (client?.cognome || '')
      const date = new Date(att.data).toLocaleDateString('it-IT')
      const time = att.ora || 'Orario non specificato'
      
      response += (index + 1) + '. **' + (att.attivita || 'Attività') + '**\n'
      response += '   📅 ' + date + ' alle ' + time + '\n'
      response += '   👤 ' + clientName + '\n'
      response += '   📋 Pratica: ' + (practice?.numero || 'N/A') + '\n'
      if (att.note) {
        response += '   📝 Note: ' + att.note + '\n'
      }
      response += '\n'
    })

    return response
  }

  // NUOVI FORMATTER FASE 1 - FILTRI
  private formatFiltriTemporali(attivita: any[]): string {
    if (attivita.length === 0) {
      return '📅 Nessuna attività trovata per il periodo richiesto.'
    }

    let response = `📅 **Attività Filtro Temporale (${attivita.length} trovate):**\n\n`
    
    attivita.forEach((att, index) => {
      const practice = att.practices
      const client = practice?.clients
      const clientName = client?.ragione || (client?.nome || '') + ' ' + (client?.cognome || '')
      const date = new Date(att.data).toLocaleDateString('it-IT')
      const time = att.ora || 'Orario non specificato'
      
      response += (index + 1) + '. **' + (att.attivita || 'Attività') + '**\n'
      response += '   📅 ' + date + ' alle ' + time + '\n'
      response += '   👤 ' + clientName + '\n'
      response += '   📋 Pratica: ' + (practice?.numero || 'N/A') + '\n'
      if (att.note) {
        response += '   📝 Note: ' + att.note + '\n'
      }
      response += '\n'
    })

    return response
  }

  private formatFiltriStato(attivita: any[]): string {
    if (attivita.length === 0) {
      return '📊 Nessuna attività trovata per lo stato richiesto.'
    }

    let response = `📊 **Attività Filtro Stato (${attivita.length} trovate):**\n\n`
    
    attivita.forEach((att, index) => {
      const practice = att.practices
      const client = practice?.clients
      const clientName = client?.ragione || (client?.nome || '') + ' ' + (client?.cognome || '')
      const date = new Date(att.data).toLocaleDateString('it-IT')
      const stato = att.stato === 'done' ? '✅ Completata' : '⏳ Da fare'
      
      response += (index + 1) + '. **' + (att.attivita || 'Attività') + '** ' + stato + '\n'
      response += '   📅 ' + date + '\n'
      response += '   👤 ' + clientName + '\n'
      response += '   📋 Pratica: ' + (practice?.numero || 'N/A') + '\n'
      if (att.note) {
        response += '   📝 Note: ' + att.note + '\n'
      }
      response += '\n'
    })

    return response
  }

  private formatFiltriCategoria(attivita: any[]): string {
    if (attivita.length === 0) {
      return '🏷️ Nessuna attività trovata per la categoria richiesta.'
    }

    let response = `🏷️ **Attività Filtro Categoria (${attivita.length} trovate):**\n\n`
    
    attivita.forEach((att, index) => {
      const practice = att.practices
      const client = practice?.clients
      const clientName = client?.ragione || (client?.nome || '') + ' ' + (client?.cognome || '')
      const date = new Date(att.data).toLocaleDateString('it-IT')
      const categoria = att.categoria || 'N/A'
      
      response += (index + 1) + '. **' + (att.attivita || 'Attività') + '**\n'
      response += '   🏷️ Categoria: ' + categoria + '\n'
      response += '   📅 ' + date + '\n'
      response += '   👤 ' + clientName + '\n'
      response += '   📋 Pratica: ' + (practice?.numero || 'N/A') + '\n'
      if (att.note) {
        response += '   📝 Note: ' + att.note + '\n'
      }
      response += '\n'
    })

    return response
  }

  // NUOVI FORMATTER FASE 1 - STATISTICHE
  private formatContatori(stats: any): string {
    if (!stats) {
      return '📊 Statistiche non disponibili.'
    }

    return `📊 **Statistiche Generali:**\n\n` +
           `📋 **Pratiche:** ${stats.pratiche}\n` +
           `👥 **Clienti:** ${stats.clienti}\n` +
           `📝 **Attività:** ${stats.attivita}\n` +
           `🚨 **Urgenti:** ${stats.urgenti}\n\n` +
           `💡 **Consiglio:** ${stats.urgenti > 0 ? 'Hai attività urgenti da completare!' : 'Tutto sotto controllo!'}`
  }

  private formatAnalisi(attivita: any[]): string {
    if (attivita.length === 0) {
      return '📈 Nessuna attività recente per l\'analisi.'
    }

    let response = `📈 **Analisi Attività Recenti:**\n\n`
    
    attivita.slice(0, 5).forEach((att, index) => {
      const practice = att.practices
      const client = practice?.clients
      const clientName = client?.ragione || (client?.nome || '') + ' ' + (client?.cognome || '')
      const date = new Date(att.data).toLocaleDateString('it-IT')
      
      response += (index + 1) + '. **' + (att.attivita || 'Attività') + '**\n'
      response += '   📅 ' + date + '\n'
      response += '   👤 ' + clientName + '\n'
      response += '   📋 Pratica: ' + (practice?.numero || 'N/A') + '\n'
      response += '\n'
    })

    return response
  }

  // NUOVI FORMATTER FASE 1 - OPERATIVE
  private formatCosaFare(attivita: any[]): string {
    if (attivita.length === 0) {
      return '✅ Non hai attività urgenti da fare oggi!'
    }

    let response = `📋 **Cosa Devi Fare Oggi:**\n\n`
    
    attivita.forEach((att, index) => {
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

    return response
  }

  private formatPianificazione(attivita: any[]): string {
    if (attivita.length === 0) {
      return '📅 Non hai attività pianificate per questa settimana.'
    }

    let response = `📅 **Pianificazione Settimanale (${attivita.length} attività):**\n\n`
    
    attivita.forEach((att, index) => {
      const practice = att.practices
      const client = practice?.clients
      const clientName = client?.ragione || (client?.nome || '') + ' ' + (client?.cognome || '')
      const date = new Date(att.data).toLocaleDateString('it-IT')
      const time = att.ora || 'Orario non specificato'
      
      response += (index + 1) + '. **' + (att.attivita || 'Attività') + '**\n'
      response += '   📅 ' + date + ' alle ' + time + '\n'
      response += '   👤 ' + clientName + '\n'
      response += '   📋 Pratica: ' + (practice?.numero || 'N/A') + '\n'
      if (att.note) {
        response += '   📝 Note: ' + att.note + '\n'
      }
      response += '\n'
    })

    return response
  }

  private formatEmergenze(attivita: any[]): string {
    if (attivita.length === 0) {
      return '✅ Nessuna emergenza al momento!'
    }

    let response = `🚨 **Emergenze (${attivita.length} trovate):**\n\n`
    
    attivita.forEach((att, index) => {
      const practice = att.practices
      const client = practice?.clients
      const clientName = client?.ragione || (client?.nome || '') + ' ' + (client?.cognome || '')
      const date = new Date(att.data).toLocaleDateString('it-IT')
      const time = att.ora || 'Orario non specificato'
      
      response += (index + 1) + '. 🚨 **' + (att.attivita || 'Attività') + '**\n'
      response += '   📅 ' + date + ' alle ' + time + '\n'
      response += '   👤 ' + clientName + '\n'
      response += '   📋 Pratica: ' + (practice?.numero || 'N/A') + '\n'
      if (att.note) {
        response += '   📝 Note: ' + att.note + '\n'
      }
      response += '\n'
    })

    return response
  }

  private formatControlli(attivita: any[]): string {
    if (attivita.length === 0) {
      return '✅ Tutto sotto controllo! Nessuna attività in ritardo.'
    }

    let response = `⚠️ **Controlli - Attività in Ritardo (${attivita.length} trovate):**\n\n`
    
    attivita.forEach((att, index) => {
      const practice = att.practices
      const client = practice?.clients
      const clientName = client?.ragione || (client?.nome || '') + ' ' + (client?.cognome || '')
      const date = new Date(att.data).toLocaleDateString('it-IT')
      
      response += (index + 1) + '. ⚠️ **' + (att.attivita || 'Attività') + '**\n'
      response += '   📅 Scadenza: ' + date + '\n'
      response += '   👤 ' + clientName + '\n'
      response += '   📋 Pratica: ' + (practice?.numero || 'N/A') + '\n'
      if (att.note) {
        response += '   📝 Note: ' + att.note + '\n'
      }
      response += '\n'
    })

    return response
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

  // NUOVI FORMATTER FASE 2 - SPECIALIZZAZIONE
  private formatRicorsiSpecializzati(ricorsi: any[]): string {
    if (ricorsi.length === 0) {
      return '⚖️ Nessun ricorso specializzato trovato.'
    }

    let response = `⚖️ **Ricorsi Specializzati (${ricorsi.length} trovati):**\n\n`
    
    ricorsi.forEach((ricorso, index) => {
      const practice = ricorso.practices
      const client = practice?.clients
      const clientName = client?.ragione || (client?.nome || '') + ' ' + (client?.cognome || '')
      const date = new Date(ricorso.data).toLocaleDateString('it-IT')
      const time = ricorso.ora || 'Orario non specificato'
      const isUrgent = new Date(ricorso.data) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 giorni
      
      response += (index + 1) + '. **' + (ricorso.attivita || 'Ricorso') + '**'
      if (isUrgent) response += ' 🚨'
      response += '\n'
      response += '   📅 ' + date + ' alle ' + time + '\n'
      response += '   👤 ' + clientName + '\n'
      response += '   📋 Pratica: ' + (practice?.numero || 'N/A') + '\n'
      if (ricorso.note) {
        response += '   📝 Note: ' + ricorso.note + '\n'
      }
      response += '\n'
    })

    return response
  }

  private formatPagamentiSpecializzati(pagamenti: any[]): string {
    if (pagamenti.length === 0) {
      return '💰 Nessun pagamento specializzato trovato.'
    }

    let response = `💰 **Pagamenti Specializzati (${pagamenti.length} trovati):**\n\n`
    
    pagamenti.forEach((pagamento, index) => {
      const practice = pagamento.practices
      const client = practice?.clients
      const clientName = client?.ragione || (client?.nome || '') + ' ' + (client?.cognome || '')
      const date = new Date(pagamento.data).toLocaleDateString('it-IT')
      const time = pagamento.ora || 'Orario non specificato'
      const isUrgent = new Date(pagamento.data) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 giorni
      
      response += (index + 1) + '. **' + (pagamento.attivita || 'Pagamento') + '**'
      if (isUrgent) response += ' 🚨'
      response += '\n'
      response += '   📅 ' + date + ' alle ' + time + '\n'
      response += '   👤 ' + clientName + '\n'
      response += '   📋 Pratica: ' + (practice?.numero || 'N/A') + '\n'
      if (pagamento.note) {
        response += '   📝 Note: ' + pagamento.note + '\n'
      }
      response += '\n'
    })

    return response
  }

  private formatCalcoliAvanzati(data: any): string {
    if (data?.message) {
      return '🧮 **Calcolo Avanzato:**\n\n' + 
             '📊 ' + data.message + '\n' +
             '📅 Data riferimento: ' + data.data_riferimento + '\n' +
             '📈 Giorni: ' + data.giorni + '\n\n' +
             '💡 **Nota:** Il calcolatore termini avanzato sarà implementato nella prossima versione!'
    }
    return '🧮 Calcolo avanzato non disponibile al momento.'
  }

  private formatTerminiProcessuali(termini: any[]): string {
    if (termini.length === 0) {
      return '⚖️ Nessun termine processuale trovato.'
    }

    let response = `⚖️ **Termini Processuali (${termini.length} trovati):**\n\n`
    
    termini.forEach((termine, index) => {
      const practice = termine.practices
      const client = practice?.clients
      const clientName = client?.ragione || (client?.nome || '') + ' ' + (client?.cognome || '')
      const date = new Date(termine.data).toLocaleDateString('it-IT')
      const time = termine.ora || 'Orario non specificato'
      const isCritical = new Date(termine.data) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 giorni
      
      response += (index + 1) + '. **' + (termine.attivita || 'Termine Processuale') + '**'
      if (isCritical) response += ' ⚠️'
      response += '\n'
      response += '   📅 ' + date + ' alle ' + time + '\n'
      response += '   👤 ' + clientName + '\n'
      response += '   📋 Pratica: ' + (practice?.numero || 'N/A') + '\n'
      if (termine.note) {
        response += '   📝 Note: ' + termine.note + '\n'
      }
      response += '\n'
    })

    return response
  }

  private formatPrescrizioni(prescrizioni: any[]): string {
    if (prescrizioni.length === 0) {
      return '⏰ Nessuna prescrizione trovata.'
    }

    let response = `⏰ **Prescrizioni (${prescrizioni.length} trovate):**\n\n`
    
    prescrizioni.forEach((prescrizione, index) => {
      const practice = prescrizione.practices
      const client = practice?.clients
      const clientName = client?.ragione || (client?.nome || '') + ' ' + (client?.cognome || '')
      const date = new Date(prescrizione.data).toLocaleDateString('it-IT')
      const time = prescrizione.ora || 'Orario non specificato'
      const isUrgent = new Date(prescrizione.data) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 giorni
      
      response += (index + 1) + '. **' + (prescrizione.attivita || 'Prescrizione') + '**'
      if (isUrgent) response += ' ⚠️'
      response += '\n'
      response += '   📅 ' + date + ' alle ' + time + '\n'
      response += '   👤 ' + clientName + '\n'
      response += '   📋 Pratica: ' + (practice?.numero || 'N/A') + '\n'
      if (prescrizione.note) {
        response += '   📝 Note: ' + prescrizione.note + '\n'
      }
      response += '\n'
    })

    return response
  }

  private formatDecadenze(decadenze: any[]): string {
    if (decadenze.length === 0) {
      return '⏳ Nessuna decadenza trovata.'
    }

    let response = `⏳ **Decadenze (${decadenze.length} trovate):**\n\n`
    
    decadenze.forEach((decadenza, index) => {
      const practice = decadenza.practices
      const client = practice?.clients
      const clientName = client?.ragione || (client?.nome || '') + ' ' + (client?.cognome || '')
      const date = new Date(decadenza.data).toLocaleDateString('it-IT')
      const time = decadenza.ora || 'Orario non specificato'
      const isCritical = new Date(decadenza.data) <= new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 giorni
      
      response += (index + 1) + '. **' + (decadenza.attivita || 'Decadenza') + '**'
      if (isCritical) response += ' 🚨'
      response += '\n'
      response += '   📅 ' + date + ' alle ' + time + '\n'
      response += '   👤 ' + clientName + '\n'
      response += '   📋 Pratica: ' + (practice?.numero || 'N/A') + '\n'
      if (decadenza.note) {
        response += '   📝 Note: ' + decadenza.note + '\n'
      }
      response += '\n'
    })

    return response
  }

  // NUOVI FORMATTER FASE 3 - INTELLIGENZA AVANZATA
  private formatComandiVocali(data: any): string {
    if (!data?.comandi) {
      return '🎤 Comandi vocali non disponibili al momento.'
    }

    let response = data.message + '\n\n'
    data.comandi.forEach((comando: string, index: number) => {
      response += `${index + 1}. ${comando}\n`
    })

    response += '\n💡 **Suggerimento:** Puoi usare questi comandi sia scrivendo che parlando!'
    return response
  }

  private formatRicercaIntelligente(data: any): string {
    if (!data) {
      return '🔍 Ricerca intelligente non disponibile.'
    }

    const totalResults = data.activities.length + data.practices.length + data.clients.length
    
    let response = `🔍 **Ricerca Intelligente - ${totalResults} risultati trovati:**\n\n`

    if (data.activities.length > 0) {
      response += `📝 **Attività (${data.activities.length}):**\n`
      data.activities.slice(0, 3).forEach((activity: any, index: number) => {
        const practice = activity.practices
        const client = practice?.clients
        const clientName = client?.ragione || (client?.nome || '') + ' ' + (client?.cognome || '')
        const date = new Date(activity.data).toLocaleDateString('it-IT')
        
        response += `${index + 1}. **${activity.attivita}** - ${clientName} (${date})\n`
      })
      if (data.activities.length > 3) {
        response += `   ... e altre ${data.activities.length - 3} attività\n`
      }
      response += '\n'
    }

    if (data.practices.length > 0) {
      response += `📋 **Pratiche (${data.practices.length}):**\n`
      data.practices.slice(0, 3).forEach((practice: any, index: number) => {
        const client = practice.clients
        const clientName = client?.ragione || (client?.nome || '') + ' ' + (client?.cognome || '')
        
        response += `${index + 1}. **Pratica ${practice.numero}** - ${clientName}\n`
      })
      if (data.practices.length > 3) {
        response += `   ... e altre ${data.practices.length - 3} pratiche\n`
      }
      response += '\n'
    }

    if (data.clients.length > 0) {
      response += `👥 **Clienti (${data.clients.length}):**\n`
      data.clients.slice(0, 3).forEach((client: any, index: number) => {
        const name = client.ragione || (client.nome || '') + ' ' + (client.cognome || '')
        response += `${index + 1}. **${name}**\n`
      })
      if (data.clients.length > 3) {
        response += `   ... e altri ${data.clients.length - 3} clienti\n`
      }
    }

    return response
  }

  private formatSuggerimenti(data: any): string {
    if (!data) {
      return '💡 Suggerimenti non disponibili al momento.'
    }

    let response = '💡 **Suggerimenti Intelligenti:**\n\n'

    if (data.consigli && data.consigli.length > 0) {
      response += '🎯 **Consigli Personalizzati:**\n'
      data.consigli.forEach((consiglio: string, index: number) => {
        response += `${index + 1}. ${consiglio}\n`
      })
      response += '\n'
    }

    if (data.urgenti && data.urgenti.length > 0) {
      response += `⚡ **Attività Urgenti (${data.urgenti.length}):**\n`
      data.urgenti.slice(0, 3).forEach((activity: any, index: number) => {
        const date = new Date(activity.data).toLocaleDateString('it-IT')
        response += `${index + 1}. **${activity.attivita}** - ${date}\n`
      })
      response += '\n'
    }

    if (data.in_ritardo && data.in_ritardo.length > 0) {
      response += `🚨 **Attività in Ritardo (${data.in_ritardo.length}):**\n`
      data.in_ritardo.slice(0, 3).forEach((activity: any, index: number) => {
        const date = new Date(activity.data).toLocaleDateString('it-IT')
        response += `${index + 1}. **${activity.attivita}** - Scaduta il ${date}\n`
      })
      response += '\n'
    }

    if (data.prossime && data.prossime.length > 0) {
      response += `📅 **Prossime Attività (${data.prossime.length}):**\n`
      data.prossime.slice(0, 3).forEach((activity: any, index: number) => {
        const date = new Date(activity.data).toLocaleDateString('it-IT')
        response += `${index + 1}. **${activity.attivita}** - ${date}\n`
      })
    }

    return response
  }

  private formatWorkflow(data: any): string {
    if (!data) {
      return '🔄 Analisi workflow non disponibile.'
    }

    let response = '🔄 **Analisi Workflow:**\n\n'
    response += `📊 **Statistiche Generali:**\n`
    response += `   • Totale attività: ${data.total_activities}\n`
    response += `   • Per categoria: ${Object.keys(data.by_category).length} categorie\n`
    response += `   • Per stato: ${Object.keys(data.by_status).length} stati\n`
    response += `   • Per cliente: ${Object.keys(data.by_client).length} clienti\n\n`

    if (data.by_category && Object.keys(data.by_category).length > 0) {
      response += `📋 **Attività per Categoria:**\n`
      Object.entries(data.by_category).forEach(([category, count]) => {
        response += `   • ${category}: ${count} attività\n`
      })
      response += '\n'
    }

    if (data.by_status && Object.keys(data.by_status).length > 0) {
      response += `📊 **Attività per Stato:**\n`
      Object.entries(data.by_status).forEach(([status, count]) => {
        const statusIcon = status === 'done' ? '✅' : '⏳'
        response += `   ${statusIcon} ${status}: ${count} attività\n`
      })
      response += '\n'
    }

    return response
  }

  private formatProduttivita(data: any): string {
    if (!data) {
      return '📈 Analisi produttività non disponibile.'
    }

    let response = '📈 **Analisi Produttività:**\n\n'
    response += `📊 **Metriche Settimanali:**\n`
    response += `   • Attività completate: ${data.completate_settimana}\n`
    response += `   • Attività totali: ${data.totali_settimana}\n`
    response += `   • Attività in ritardo: ${data.in_ritardo}\n`
    response += `   • Tasso di completamento: ${data.tasso_completamento}%\n\n`

    if (data.suggerimenti && data.suggerimenti.length > 0) {
      response += `💡 **Suggerimenti per Migliorare:**\n`
      data.suggerimenti.forEach((suggerimento: string, index: number) => {
        response += `${index + 1}. ${suggerimento}\n`
      })
    }

    return response
  }

  private formatAlertSistema(data: any): string {
    if (!data) {
      return '🔔 Alert sistema non disponibili.'
    }

    let response = `🔔 **Stato Sistema: ${data.status.toUpperCase()}**\n\n`
    
    if (data.recommendations && data.recommendations.length > 0) {
      response += '📋 **Raccomandazioni Sistema:**\n'
      data.recommendations.forEach((rec: string, index: number) => {
        response += `${index + 1}. ${rec}\n`
      })
      response += '\n'
    }

    response += `⏰ Ultimo controllo: ${new Date(data.timestamp).toLocaleString('it-IT')}\n`

    return response
  }

  private formatBackupRestore(data: any): string {
    if (!data) {
      return '💾 Informazioni backup non disponibili.'
    }

    let response = data.message + '\n\n'
    response += `📊 **Stato:** ${data.status}\n`
    response += `⏰ **Ultimo backup:** ${new Date(data.last_backup).toLocaleString('it-IT')}\n\n`

    if (data.recommendations && data.recommendations.length > 0) {
      response += '💡 **Raccomandazioni:**\n'
      data.recommendations.forEach((rec: string, index: number) => {
        response += `${index + 1}. ${rec}\n`
      })
    }

    return response
  }

  private formatStatisticheAvanzate(data: any): string {
    if (!data) {
      return '📊 Statistiche avanzate non disponibili.'
    }

    let response = '📊 **Statistiche Avanzate:**\n\n'
    response += `📋 **Dati Generali:**\n`
    response += `   • Pratiche totali: ${data.total_practices}\n`
    response += `   • Clienti totali: ${data.total_clients}\n`
    response += `   • Attività totali: ${data.total_activities}\n`
    response += `   • Attività completate: ${data.completed_activities}\n`
    response += `   • Attività pendenti: ${data.pending_activities}\n`
    response += `   • Tasso di completamento: ${data.completion_rate}%\n\n`

    response += `📈 **Trend e Performance:**\n`
    response += `   • Crescita pratiche: ${data.trends.practices_growth}\n`
    response += `   • Tasso completamento: ${data.trends.completion_rate}\n`
    response += `   • Soddisfazione cliente: ${data.trends.client_satisfaction}\n`
    response += `   • Score produttività: ${data.productivity_score}\n`

    return response
  }

  private formatPrevisioni(data: any): string {
    if (!data) {
      return '🔮 Previsioni non disponibili.'
    }

    let response = '🔮 **Previsioni e Analisi Futura:**\n\n'

    if (data.previsioni && data.previsioni.length > 0) {
      response += '📈 **Previsioni Prossimo Mese:**\n'
      data.previsioni.forEach((prev: string, index: number) => {
        response += `${index + 1}. ${prev}\n`
      })
      response += '\n'
    }

    if (data.raccomandazioni && data.raccomandazioni.length > 0) {
      response += '🎯 **Raccomandazioni Strategiche:**\n'
      data.raccomandazioni.forEach((rec: string, index: number) => {
        response += `${index + 1}. ${rec}\n`
      })
      response += '\n'
    }

    if (data.prossimo_mese && data.prossimo_mese.length > 0) {
      response += `📅 **Attività Previste (${data.prossimo_mese.length}):**\n`
      data.prossimo_mese.slice(0, 5).forEach((activity: any, index: number) => {
        const practice = activity.practices
        const client = practice?.clients
        const clientName = client?.ragione || (client?.nome || '') + ' ' + (client?.cognome || '')
        const date = new Date(activity.data).toLocaleDateString('it-IT')
        
        response += `${index + 1}. **${activity.attivita}** - ${clientName} (${date})\n`
      })
      if (data.prossimo_mese.length > 5) {
        response += `   ... e altre ${data.prossimo_mese.length - 5} attività\n`
      }
    }

    return response
  }

  private formatOttimizzazione(data: any): string {
    if (!data) {
      return '⚡ Analisi ottimizzazione non disponibile.'
    }

    let response = '⚡ **Analisi Ottimizzazione e Performance:**\n\n'

    if (data.analisi_performance) {
      response += '📊 **Analisi Performance:**\n'
      response += `   • Tempo medio completamento: ${data.analisi_performance.tempo_medio_completamento}\n`
      response += `   • Tasso di efficienza: ${data.analisi_performance.tasso_efficienza}\n`
      response += `   • Bottleneck principale: ${data.analisi_performance.bottleneck_principale}\n\n`
    }

    if (data.ottimizzazioni_suggerite && data.ottimizzazioni_suggerite.length > 0) {
      response += '💡 **Ottimizzazioni Suggerite:**\n'
      data.ottimizzazioni_suggerite.forEach((opt: string, index: number) => {
        response += `${index + 1}. ${opt}\n`
      })
      response += '\n'
    }

    if (data.metriche_chiave) {
      response += '🎯 **Metriche Chiave di Miglioramento:**\n'
      response += `   • Velocità risposta: ${data.metriche_chiave.velocita_risposta}\n`
      response += `   • Accuratezza dati: ${data.metriche_chiave.accuratezza_dati}\n`
      response += `   • Soddisfazione cliente: ${data.metriche_chiave.soddisfazione_cliente}\n`
    }

    return response
  }

}
