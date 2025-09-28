import { supabase } from '../supabase'
import { ParsedQuestion } from './QuestionParser'

export interface QueryResult {
  type: 'success' | 'error' | 'not_found'
  data?: any[]
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
