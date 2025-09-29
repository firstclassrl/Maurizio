import { supabase } from '../supabase'
import { Intent } from './IntentAnalyzer'
import { format } from 'date-fns'

export interface QueryResult {
  type: 'success' | 'error' | 'not_found'
  data?: any[]
  message?: string
  count?: number
}

export class IntelligentQueryEngine {
  
  async execute(intent: Intent, userId: string): Promise<QueryResult> {
    try {
      console.log('IntelligentQueryEngine: Executing intent:', intent)
      
      // ROUTING INTELLIGENTE BASATO SU INTENT
      switch (intent.category) {
        case 'temporal':
          return await this.queryTemporal(intent, userId)
        case 'client':
          return await this.queryClient(intent, userId)
        case 'practice':
          return await this.queryPractice(intent, userId)
        case 'activity':
          return await this.queryActivity(intent, userId)
        case 'calculation':
          return await this.queryCalculation(intent, userId)
        case 'search':
          return await this.querySearch(intent, userId)
        default:
          return await this.queryGeneral(intent, userId)
      }
    } catch (error) {
      console.error('IntelligentQueryEngine error:', error)
      return {
        type: 'error',
        message: `Errore durante l'esecuzione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
      }
    }
  }
  
  private async queryTemporal(intent: Intent, userId: string): Promise<QueryResult> {
    const { timeScope, entities } = intent
    
    // COSTRUZIONE QUERY DINAMICA
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
      .eq('stato', 'todo')
    
    // FILTRI TEMPORALI INTELLIGENTI
    if (timeScope === 'today') {
      const today = format(new Date(), 'yyyy-MM-dd')
      query = query.eq('data', today)
    } else if (timeScope === 'tomorrow') {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      query = query.eq('data', format(tomorrow, 'yyyy-MM-dd'))
    } else if (timeScope === 'week') {
      const today = new Date()
      const weekEnd = new Date()
      weekEnd.setDate(today.getDate() + 7)
      query = query
        .gte('data', format(today, 'yyyy-MM-dd'))
        .lte('data', format(weekEnd, 'yyyy-MM-dd'))
    } else if (timeScope === 'urgent') {
      // Query per attività urgenti (prossimi 3 giorni)
      const today = new Date()
      const urgentEnd = new Date()
      urgentEnd.setDate(today.getDate() + 3)
      query = query
        .gte('data', format(today, 'yyyy-MM-dd'))
        .lte('data', format(urgentEnd, 'yyyy-MM-dd'))
    }
    
    // FILTRI ENTITÀ
    if (entities.client) {
      query = query.or(`practices.clients.ragione.ilike.%${entities.client}%,practices.clients.nome.ilike.%${entities.client}%,practices.clients.cognome.ilike.%${entities.client}%`)
    }
    
    if (entities.activity) {
      query = query.ilike('attivita', `%${entities.activity}%`)
    }
    
    // ORDINAMENTO INTELLIGENTE
    if (timeScope === 'urgent' || entities.urgency === 'critical') {
      query = query.order('data', { ascending: true }).order('ora', { ascending: true })
    } else {
      query = query.order('data', { ascending: true })
    }
    
    const { data, error } = await query.limit(20)
    
    if (error) {
      console.error('Temporal query error:', error)
      // Fallback a query semplice
      return await this.querySimple(intent, userId)
    }
    
    return {
      type: 'success',
      data: data || [],
      count: data?.length || 0
    }
  }
  
  private async queryClient(intent: Intent, userId: string): Promise<QueryResult> {
    const { entities } = intent
    
    let query = supabase
      .from('practices')
      .select(`
        *,
        clients!inner(*)
      `)
      .eq('user_id', userId)
    
    if (entities.client) {
      query = query.or(`clients.ragione.ilike.%${entities.client}%,clients.nome.ilike.%${entities.client}%,clients.cognome.ilike.%${entities.client}%`)
    }
    
    const { data, error } = await query.limit(10)
    
    if (error) {
      console.error('Client query error:', error)
      return {
        type: 'error',
        message: 'Errore nella ricerca clienti'
      }
    }
    
    return {
      type: 'success',
      data: data || [],
      count: data?.length || 0
    }
  }
  
  private async queryPractice(intent: Intent, userId: string): Promise<QueryResult> {
    const { entities } = intent
    
    let query = supabase
      .from('practices')
      .select(`
        *,
        clients!inner(*),
        activities(*)
      `)
      .eq('user_id', userId)
    
    if (entities.practice) {
      query = query.eq('numero', entities.practice)
    }
    
    const { data, error } = await query.limit(5)
    
    if (error) {
      console.error('Practice query error:', error)
      return {
        type: 'error',
        message: 'Errore nella ricerca pratiche'
      }
    }
    
    return {
      type: 'success',
      data: data || [],
      count: data?.length || 0
    }
  }
  
  private async queryActivity(intent: Intent, userId: string): Promise<QueryResult> {
    // Simile a queryTemporal ma più specifico per attività
    return await this.queryTemporal(intent, userId)
  }
  
  private async queryCalculation(intent: Intent, userId: string): Promise<QueryResult> {
    // Logica per calcoli termini
    return {
      type: 'success',
      data: [],
      message: 'Calcolo termini - da implementare'
    }
  }
  
  private async querySearch(intent: Intent, userId: string): Promise<QueryResult> {
    // Ricerca globale intelligente
    const { entities } = intent
    
    // Query su tutte le tabelle rilevanti
    const [activitiesResult, practicesResult, clientsResult] = await Promise.all([
      this.searchActivities(intent, userId),
      this.searchPractices(intent, userId),
      this.searchClients(intent, userId)
    ])
    
    const combinedData = [
      ...(activitiesResult.data || []),
      ...(practicesResult.data || []),
      ...(clientsResult.data || [])
    ]
    
    return {
      type: 'success',
      data: combinedData,
      count: combinedData.length
    }
  }
  
  private async queryGeneral(intent: Intent, userId: string): Promise<QueryResult> {
    // Query generale basata sul contesto
    return await this.queryTemporal(intent, userId)
  }
  
  private async querySimple(intent: Intent, userId: string): Promise<QueryResult> {
    // Query semplificata senza join per fallback
    let query = supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .eq('stato', 'todo')
      .limit(10)
    
    const { data, error } = await query
    
    if (error) {
      return {
        type: 'error',
        message: 'Errore nella query semplificata'
      }
    }
    
    return {
      type: 'success',
      data: data || [],
      count: data?.length || 0
    }
  }
  
  private async searchActivities(intent: Intent, userId: string): Promise<QueryResult> {
    const { entities } = intent
    
    let query = supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
    
    if (entities.activity) {
      query = query.ilike('attivita', `%${entities.activity}%`)
    }
    
    const { data, error } = await query.limit(5)
    
    return {
      type: error ? 'error' : 'success',
      data: error ? [] : (data || []),
      count: error ? 0 : (data?.length || 0)
    }
  }
  
  private async searchPractices(intent: Intent, userId: string): Promise<QueryResult> {
    const { entities } = intent
    
    let query = supabase
      .from('practices')
      .select('*')
      .eq('user_id', userId)
    
    if (entities.practice) {
      query = query.eq('numero', entities.practice)
    }
    
    const { data, error } = await query.limit(5)
    
    return {
      type: error ? 'error' : 'success',
      data: error ? [] : (data || []),
      count: error ? 0 : (data?.length || 0)
    }
  }
  
  private async searchClients(intent: Intent, userId: string): Promise<QueryResult> {
    const { entities } = intent
    
    let query = supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
    
    if (entities.client) {
      query = query.or(`ragione.ilike.%${entities.client}%,nome.ilike.%${entities.client}%,cognome.ilike.%${entities.client}%`)
    }
    
    const { data, error } = await query.limit(5)
    
    return {
      type: error ? 'error' : 'success',
      data: error ? [] : (data || []),
      count: error ? 0 : (data?.length || 0)
    }
  }
}
