import { supabase } from '../supabase'
import { ParsedQuestion } from './QuestionParser'
import { format } from 'date-fns'

export interface QueryResult {
  type: 'success' | 'error' | 'not_found'
  data?: any[] | any
  message?: string
  count?: number
}

export class SupabaseQueryEngine {
  async execute(question: ParsedQuestion, userId: string): Promise<QueryResult> {
    try {
      switch (question.type) {
        case 'udienza':
          return await this.queryHearings(question, userId)
        case 'scadenza':
          return await this.queryDeadlines(question, userId)
        case 'cliente':
          return await this.queryClient(question, userId)
        case 'pratica':
          return await this.queryPractice(question, userId)
        case 'attivita':
          return await this.queryActivities(question, userId)
        case 'appuntamento':
          return await this.queryAppointments(question, userId)
        case 'ricorso':
          return await this.queryRicorsi(question, userId)
        case 'pagamenti':
          return await this.queryPagamenti(question, userId)
        case 'scadenze_imminenti':
          return await this.queryScadenzeImminenti(question, userId)
        case 'udienze_appuntamenti':
          return await this.queryUdienzeAppuntamenti(question, userId)
        case 'calcoli_termini':
          return await this.queryCalcoliTermini(question, userId)
        case 'clienti_info':
          return await this.queryClientiInfo(question, userId)
        case 'ricerca_clienti':
          return await this.queryRicercaClienti(question, userId)
        case 'pratiche_info':
          return await this.queryPraticheInfo(question, userId)
        case 'attivita_pratica':
          return await this.queryAttivitaPratica(question, userId)
        case 'filtri_temporali':
          return await this.queryFiltriTemporali(question, userId)
        case 'filtri_stato':
          return await this.queryFiltriStato(question, userId)
        case 'filtri_categoria':
          return await this.queryFiltriCategoria(question, userId)
        case 'contatori':
          return await this.queryContatori(question, userId)
        case 'analisi':
          return await this.queryAnalisi(question, userId)
        case 'cosa_fare':
          return await this.queryCosaFare(question, userId)
        case 'pianificazione':
          return await this.queryPianificazione(question, userId)
        case 'emergenze':
          return await this.queryEmergenze(question, userId)
        case 'controlli':
          return await this.queryControlli(question, userId)
        case 'generale':
          return await this.queryGeneral(question, userId)
        default:
          return {
            type: 'error',
            message: 'Tipo di domanda non riconosciuto'
          }
      }
    } catch (error) {
      console.error('Query execution error:', error)
      return {
        type: 'error',
        message: 'Errore durante l\'esecuzione della query'
      }
    }
  }

  private async queryHearings(question: ParsedQuestion, userId: string): Promise<QueryResult> {
    const { cliente } = question.entities

    if (cliente) {
      // Search for hearings by client name
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
        .eq('practices.tipo_procedura', 'GIUDIZIALE')
        .ilike('practices.clients.ragione', `%${cliente}%`)
        .order('data', { ascending: true })

      if (error) throw error

      if (data && data.length > 0) {
        return {
          type: 'success',
          data: data,
          count: data.length
        }
      } else {
        return {
          type: 'not_found',
          message: `Nessuna udienza trovata per ${cliente}`
        }
      }
    }

    // Return all upcoming hearings
    const today = new Date().toISOString().split('T')[0]
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
      .eq('practices.tipo_procedura', 'GIUDIZIALE')
      .gte('data', today)
      .order('data', { ascending: true })

    if (error) throw error

    return {
      type: 'success',
      data: data || [],
      count: data?.length || 0
    }
  }

  private async queryDeadlines(question: ParsedQuestion, userId: string): Promise<QueryResult> {
    const { periodo } = question.entities
    
    let startDate: string
    let endDate: string
    const today = new Date()

    switch (periodo) {
      case 'oggi':
        startDate = endDate = today.toISOString().split('T')[0]
        break
      case 'domani':
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        startDate = endDate = tomorrow.toISOString().split('T')[0]
        break
      case 'settimana':
        startDate = today.toISOString().split('T')[0]
        const weekEnd = new Date(today)
        weekEnd.setDate(weekEnd.getDate() + 7)
        endDate = weekEnd.toISOString().split('T')[0]
        break
      case 'mese':
        startDate = today.toISOString().split('T')[0]
        const monthEnd = new Date(today)
        monthEnd.setMonth(monthEnd.getMonth() + 1)
        endDate = monthEnd.toISOString().split('T')[0]
        break
      default:
        startDate = today.toISOString().split('T')[0]
        const defaultEnd = new Date(today)
        defaultEnd.setDate(defaultEnd.getDate() + 7)
        endDate = defaultEnd.toISOString().split('T')[0]
    }

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
      .gte('data', startDate)
      .lte('data', endDate)
      .order('data', { ascending: true })

    if (error) throw error

    return {
      type: 'success',
      data: data || [],
      count: data?.length || 0
    }
  }

  private async queryClient(question: ParsedQuestion, userId: string): Promise<QueryResult> {
    const { pratica, cliente } = question.entities

    if (pratica) {
      // Get client for specific practice
      const { data, error } = await supabase
        .from('practices')
        .select(`
          *,
          clients!inner(*)
        `)
        .eq('user_id', userId)
        .eq('numero', pratica)
        .single()

      if (error) throw error

      if (data) {
        return {
          type: 'success',
          data: [data],
          count: 1
        }
      }
    }

    if (cliente) {
      // Search for client by name
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .or(`ragione.ilike.%${cliente}%,nome.ilike.%${cliente}%,cognome.ilike.%${cliente}%`)
        .limit(5)

      if (error) throw error

      return {
        type: 'success',
        data: data || [],
        count: data?.length || 0
      }
    }

    // Return all clients
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('ragione', { ascending: true })
      .limit(20)

    if (error) throw error

    return {
      type: 'success',
      data: data || [],
      count: data?.length || 0
    }
  }

  private async queryPractice(question: ParsedQuestion, userId: string): Promise<QueryResult> {
    const { pratica, cliente } = question.entities

    if (pratica) {
      // Get specific practice
      const { data, error } = await supabase
        .from('practices')
        .select(`
          *,
          clients!inner(*)
        `)
        .eq('user_id', userId)
        .eq('numero', pratica)
        .single()

      if (error) throw error

      if (data) {
        return {
          type: 'success',
          data: [data],
          count: 1
        }
      } else {
        return {
          type: 'not_found',
          message: `Pratica ${pratica} non trovata`
        }
      }
    }

    if (cliente) {
      // Get practices for specific client
      const { data, error } = await supabase
        .from('practices')
        .select(`
          *,
          clients!inner(*)
        `)
        .eq('user_id', userId)
        .ilike('clients.ragione', `%${cliente}%`)
        .order('numero', { ascending: false })

      if (error) throw error

      return {
        type: 'success',
        data: data || [],
        count: data?.length || 0
      }
    }

    // Return recent practices
    const { data, error } = await supabase
      .from('practices')
      .select(`
        *,
        clients!inner(*)
      `)
      .eq('user_id', userId)
      .order('numero', { ascending: false })
      .limit(10)

    if (error) throw error

    return {
      type: 'success',
      data: data || [],
      count: data?.length || 0
    }
  }

  private async queryActivities(question: ParsedQuestion, userId: string): Promise<QueryResult> {
    const { cliente, pratica } = question.entities

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

    if (pratica) {
      query = query.eq('practices.numero', pratica)
    }

    if (cliente) {
      query = query.ilike('practices.clients.ragione', `%${cliente}%`)
    }

    const { data, error } = await query
      .order('data', { ascending: true })
      .limit(20)

    if (error) throw error

    return {
      type: 'success',
      data: data || [],
      count: data?.length || 0
    }
  }

  private async queryAppointments(question: ParsedQuestion, userId: string): Promise<QueryResult> {
    // For now, return activities as appointments
    // In the future, this could be expanded to include actual appointments
    return await this.queryActivities(question, userId)
  }

  private async queryRicorsi(question: ParsedQuestion, userId: string): Promise<QueryResult> {
    const { cliente } = question.entities

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
      .ilike('attivita', '%ricorso%')

    if (cliente) {
      // Try multiple search strategies for client name
      query = query.or(`
        practices.clients.ragione.ilike.%${cliente}%,
        practices.clients.nome.ilike.%${cliente}%,
        practices.clients.cognome.ilike.%${cliente}%
      `)
    }

    const { data, error } = await query
      .order('data', { ascending: true })
      .limit(10)

    if (error) throw error

    return {
      type: 'success',
      data: data || [],
      count: data?.length || 0
    }
  }

  private async queryPagamenti(question: ParsedQuestion, userId: string): Promise<QueryResult> {
    const { cliente } = question.entities

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
      .ilike('attivita', '%pagamenti%')

    if (cliente) {
      // Try multiple search strategies for client name
      query = query.or(`
        practices.clients.ragione.ilike.%${cliente}%,
        practices.clients.nome.ilike.%${cliente}%,
        practices.clients.cognome.ilike.%${cliente}%
      `)
    }

    const { data, error } = await query
      .order('data', { ascending: true })
      .limit(10)

    if (error) throw error

    return {
      type: 'success',
      data: data || [],
      count: data?.length || 0
    }
  }

  // NUOVI METODI FASE 1 - TEMPORALI
  private async queryScadenzeImminenti(_question: ParsedQuestion, userId: string): Promise<QueryResult> {
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

  private async queryCalcoliTermini(_question: ParsedQuestion, _userId: string): Promise<QueryResult> {
    // Per ora restituiamo un messaggio generico
    // In futuro potremmo integrare il calcolatore termini
    return {
      type: 'success',
      data: { message: 'Calcolo termini non ancora implementato' },
      count: 1
    }
  }

  // NUOVI METODI FASE 1 - CLIENTI
  private async queryClientiInfo(question: ParsedQuestion, userId: string): Promise<QueryResult> {
    const { cliente } = question.entities

    let query = supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)

    if (cliente) {
      query = query.or(`
        ragione.ilike.%${cliente}%,
        nome.ilike.%${cliente}%,
        cognome.ilike.%${cliente}%
      `)
    }

    const { data, error } = await query
      .order('ragione', { ascending: true })
      .order('cognome', { ascending: true })

    if (error) throw error

    return {
      type: 'success',
      data: data || [],
      count: data?.length || 0
    }
  }

  private async queryRicercaClienti(question: ParsedQuestion, userId: string): Promise<QueryResult> {
    const { cliente, tipo } = question.entities

    let query = supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)

    if (cliente) {
      query = query.or(`
        ragione.ilike.%${cliente}%,
        nome.ilike.%${cliente}%,
        cognome.ilike.%${cliente}%,
        partita_iva.ilike.%${cliente}%
      `)
    }

    if (tipo) {
      query = query.eq('tipologia', tipo)
    }

    const { data, error } = await query
      .order('ragione', { ascending: true })

    if (error) throw error

    return {
      type: 'success',
      data: data || [],
      count: data?.length || 0
    }
  }

  // NUOVI METODI FASE 1 - PRATICHE
  private async queryPraticheInfo(question: ParsedQuestion, userId: string): Promise<QueryResult> {
    const { pratica, tipo } = question.entities

    let query = supabase
      .from('practices')
      .select(`
        *,
        clients!inner(*)
      `)
      .eq('user_id', userId)

    if (pratica) {
      query = query.eq('numero', pratica)
    }

    if (tipo) {
      query = query.eq('tipo_procedura', tipo.toUpperCase())
    }

    const { data, error } = await query
      .order('numero', { ascending: false })

    if (error) throw error

    return {
      type: 'success',
      data: data || [],
      count: data?.length || 0
    }
  }

  private async queryAttivitaPratica(question: ParsedQuestion, userId: string): Promise<QueryResult> {
    const { pratica, cliente } = question.entities

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

    if (pratica) {
      const { data: practiceData } = await supabase
        .from('practices')
        .select('id')
        .eq('user_id', userId)
        .eq('numero', pratica)
        .limit(1)

      if (practiceData && practiceData.length > 0) {
        query = query.eq('pratica_id', practiceData[0].id)
      }
    }

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

  // NUOVI METODI FASE 1 - FILTRI
  private async queryFiltriTemporali(question: ParsedQuestion, userId: string): Promise<QueryResult> {
    const { periodo } = question.entities
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

    switch (periodo) {
      case 'oggi':
        query = query.eq('data', format(today, 'yyyy-MM-dd'))
        break
      case 'domani':
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)
        query = query.eq('data', format(tomorrow, 'yyyy-MM-dd'))
        break
      case 'settimana':
        const nextWeek = new Date(today)
        nextWeek.setDate(today.getDate() + 7)
        query = query
          .gte('data', format(today, 'yyyy-MM-dd'))
          .lte('data', format(nextWeek, 'yyyy-MM-dd'))
        break
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

  private async queryFiltriStato(question: ParsedQuestion, userId: string): Promise<QueryResult> {
    const { filtro } = question.entities
    
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

    if (filtro) {
      switch (filtro.toLowerCase()) {
        case 'da fare':
        case 'urgenti':
        case 'in ritardo':
          query = query.eq('stato', 'todo')
          break
        case 'completate':
        case 'finite':
          query = query.eq('stato', 'done')
          break
      }
    }

    const { data, error } = await query
      .order('data', { ascending: true })

    if (error) throw error

    return {
      type: 'success',
      data: data || [],
      count: data?.length || 0
    }
  }

  private async queryFiltriCategoria(question: ParsedQuestion, userId: string): Promise<QueryResult> {
    const { filtro } = question.entities
    
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

    if (filtro) {
      switch (filtro.toLowerCase()) {
        case 'udienze':
          query = query.eq('categoria', 'Udienza')
          break
        case 'scadenze':
          query = query.eq('categoria', 'Scadenza Processuale')
          break
        case 'appuntamenti':
          query = query.eq('categoria', 'Appuntamento')
          break
        case 'ricorsi':
          query = query.ilike('attivita', '%ricorso%')
          break
      }
    }

    const { data, error } = await query
      .order('data', { ascending: true })

    if (error) throw error

    return {
      type: 'success',
      data: data || [],
      count: data?.length || 0
    }
  }

  // NUOVI METODI FASE 1 - STATISTICHE
  private async queryContatori(_question: ParsedQuestion, userId: string): Promise<QueryResult> {
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

  private async queryAnalisi(_question: ParsedQuestion, userId: string): Promise<QueryResult> {
    // Analisi base delle attività
    const { data: activities, error } = await supabase
      .from('activities')
      .select(`
        *,
        practices!inner(
          *,
          clients!inner(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error

    return {
      type: 'success',
      data: activities || [],
      count: activities?.length || 0
    }
  }

  // NUOVI METODI FASE 1 - OPERATIVE
  private async queryCosaFare(_question: ParsedQuestion, userId: string): Promise<QueryResult> {
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
      .order('priorita', { ascending: false })
      .order('data', { ascending: true })
      .limit(5)

    if (error) throw error

    return {
      type: 'success',
      data: data || [],
      count: data?.length || 0
    }
  }

  private async queryPianificazione(_question: ParsedQuestion, userId: string): Promise<QueryResult> {
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

  private async queryEmergenze(_question: ParsedQuestion, userId: string): Promise<QueryResult> {
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

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
      .lte('data', format(tomorrow, 'yyyy-MM-dd'))
      .order('priorita', { ascending: false })
      .order('data', { ascending: true })

    if (error) throw error

    return {
      type: 'success',
      data: data || [],
      count: data?.length || 0
    }
  }

  private async queryControlli(_question: ParsedQuestion, userId: string): Promise<QueryResult> {
    // Controlli base - attività in ritardo
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)

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
      .lt('data', format(yesterday, 'yyyy-MM-dd'))
      .order('data', { ascending: true })

    if (error) throw error

    return {
      type: 'success',
      data: data || [],
      count: data?.length || 0
    }
  }

  private async queryGeneral(_question: ParsedQuestion, userId: string): Promise<QueryResult> {
    // Return a summary of recent activities
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
      .gte('data', new Date().toISOString().split('T')[0])
      .order('data', { ascending: true })
      .limit(10)

    if (error) throw error

    return {
      type: 'success',
      data: data || [],
      count: data?.length || 0
    }
  }
}
