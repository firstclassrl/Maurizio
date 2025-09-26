import { useState } from 'react'
import { supabase } from './supabase'
import { Practice, Activity, Client } from '../types'

// Cache per evitare ricaricamenti
const cache = {
  clients: new Map<string, { data: Client[], timestamp: number }>(),
  practices: new Map<string, { data: Practice[], timestamp: number }>(),
  activities: new Map<string, { data: Activity[], timestamp: number }>()
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minuti

// Funzione per verificare se la cache è valida
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION
}

// Funzione per ottenere l'utente corrente (cached)
let currentUser: any = null
let userTimestamp = 0

export const getCurrentUser = async () => {
  if (currentUser && isCacheValid(userTimestamp)) {
    return currentUser
  }
  
  const { data: { user } } = await supabase.auth.getUser()
  currentUser = user
  userTimestamp = Date.now()
  return user
}

// Ottimizzazione 1: Caricamento clienti ottimizzato
export const loadClientsOptimized = async (userId: string): Promise<Client[]> => {
  const cacheKey = `clients_${userId}`
  const cached = cache.clients.get(cacheKey)
  
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data
  }

  const { data, error } = await supabase
    .from('clients')
    .select('id, ragione, nome, cognome, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(500) // Limite ragionevole

  if (error) throw error

  const clients = data || []
  cache.clients.set(cacheKey, { data: clients, timestamp: Date.now() })
  
  return clients
}

// Ottimizzazione 2: Caricamento pratiche con JOIN ottimizzato
export const loadPracticesOptimized = async (userId: string): Promise<Practice[]> => {
  const cacheKey = `practices_${userId}`
  const cached = cache.practices.get(cacheKey)
  
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data
  }

  // Query ottimizzata: un solo JOIN per caricare tutto
  const { data: practicesData, error: practicesError } = await supabase
    .from('practices')
    .select(`
      id,
      numero,
      cliente_id,
      controparti_ids,
      tipo_procedura,
      autorita_giudiziaria,
      rg,
      giudice,
      created_at,
      updated_at,
      clients!practices_cliente_id_fkey(
        id,
        ragione,
        nome,
        cognome
      )
    `)
    .eq('user_id', userId)
    .order('numero', { ascending: false })
    .limit(1000)

  if (practicesError) throw practicesError

  // Carica tutte le controparti in una sola query
  const allCounterpartyIds = new Set<string>()
  practicesData?.forEach(practice => {
    if (practice.controparti_ids) {
      practice.controparti_ids.forEach((id: string) => allCounterpartyIds.add(id))
    }
  })

  let counterpartyMap = new Map<string, Client>()
  if (allCounterpartyIds.size > 0) {
    const { data: counterpartiesData } = await supabase
      .from('clients')
      .select('id, ragione, nome, cognome')
      .in('id', Array.from(allCounterpartyIds))

    counterpartiesData?.forEach(client => {
      counterpartyMap.set(client.id, client)
    })
  }

  // Costruisci le pratiche con le controparti
  const practices: Practice[] = (practicesData || []).map(practice => ({
    ...practice,
    counterparties: practice.controparti_ids
      ?.map(id => counterpartyMap.get(id))
      .filter(Boolean) as Client[] || []
  }))

  cache.practices.set(cacheKey, { data: practices, timestamp: Date.now() })
  
  return practices
}

// Ottimizzazione 3: Caricamento attività con JOIN ottimizzato
export const loadActivitiesOptimized = async (userId: string, filters?: {
  stato?: 'todo' | 'done'
  limit?: number
  orderBy?: string
}): Promise<Activity[]> => {
  const cacheKey = `activities_${userId}_${JSON.stringify(filters || {})}`
  const cached = cache.activities.get(cacheKey)
  
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data
  }

  let query = supabase
    .from('activities')
    .select(`
      id,
      pratica_id,
      categoria,
      attivita,
      data,
      ora,
      note,
      stato,
      urgent,
      created_at,
      updated_at,
      practices!inner(
        numero,
        cliente_id,
        controparti_ids,
        tipo_procedura,
        clients!practices_cliente_id_fkey(
          id,
          ragione,
          nome,
          cognome
        )
      )
    `)
    .eq('user_id', userId)

  if (filters?.stato) {
    query = query.eq('stato', filters.stato)
  }

  query = query
    .order(filters?.orderBy || 'data', { ascending: true })
    .limit(filters?.limit || 1000)

  const { data: activitiesData, error } = await query

  if (error) throw error

  // Carica controparti in batch
  const allCounterpartyIds = new Set<string>()
  activitiesData?.forEach(activity => {
    const counterparties = activity.practices?.controparti_ids || []
    counterparties.forEach((id: string) => allCounterpartyIds.add(id))
  })

  let counterpartyNames: Record<string, string> = {}
  if (allCounterpartyIds.size > 0) {
    const { data: counterpartyData } = await supabase
      .from('clients')
      .select('id, ragione, nome, cognome')
      .in('id', Array.from(allCounterpartyIds))

    counterpartyData?.forEach(client => {
      const name = client.ragione || `${client.nome || ''} ${client.cognome || ''}`.trim()
      counterpartyNames[client.id] = name
    })
  }

  // Converti in formato Task per compatibilità
  const activities: Activity[] = (activitiesData || []).map(activity => {
    const cliente = activity.practices?.clients
    const clienteName = cliente ? (cliente.ragione || `${cliente.nome || ''} ${cliente.cognome || ''}`.trim()) : null
    
    const controparti = activity.practices?.controparti_ids
      ?.map((id: string) => counterpartyNames[id])
      .filter(Boolean)
      .join(', ') || null

    return {
      id: activity.id,
      user_id: userId,
      pratica: activity.practices?.numero || '',
      attivita: activity.attivita,
      scadenza: activity.data,
      ora: activity.ora,
      categoria: activity.categoria,
      note: activity.note,
      stato: activity.stato,
      urgent: activity.urgent,
      cliente: clienteName,
      controparte: controparti,
      created_at: activity.created_at,
      updated_at: activity.updated_at
    } as any
  })

  cache.activities.set(cacheKey, { data: activities, timestamp: Date.now() })
  
  return activities
}

// Ottimizzazione 4: Caricamento attività di una pratica specifica
export const loadPracticeActivitiesOptimized = async (practiceId: string): Promise<Activity[]> => {
  const cacheKey = `practice_activities_${practiceId}`
  const cached = cache.activities.get(cacheKey)
  
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data
  }

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('pratica_id', practiceId)
    .order('data', { ascending: true })
    .limit(100)

  if (error) throw error

  const activities = data || []
  cache.activities.set(cacheKey, { data: activities, timestamp: Date.now() })
  
  return activities
}

// Funzione per invalidare la cache
export const invalidateCache = (type?: 'clients' | 'practices' | 'activities') => {
  if (type) {
    cache[type].clear()
  } else {
    cache.clients.clear()
    cache.practices.clear()
    cache.activities.clear()
  }
}

// Funzione per precaricare i dati essenziali
export const preloadEssentialData = async (userId: string) => {
  try {
    // Carica clienti e pratiche in parallelo
    await Promise.all([
      loadClientsOptimized(userId),
      loadPracticesOptimized(userId)
    ])
  } catch (error) {
    console.error('Errore nel precaricamento:', error)
  }
}

// Hook per gestire il loading ottimizzato
export const useOptimizedLoading = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeWithLoading = async <T>(operation: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await operation()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, executeWithLoading }
}
