import { useState } from 'react'
import { supabase } from './supabase'

// Sistema di cache ottimizzato per performance
const cache = {
  clients: new Map<string, { data: any[], timestamp: number }>(),
  practices: new Map<string, { data: any[], timestamp: number }>(),
  activities: new Map<string, { data: any[], timestamp: number }>()
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minuti
const MAX_CACHE_SIZE = 50

// Funzione per pulire cache se supera i limiti
const cleanupCache = (cacheType: keyof typeof cache) => {
  const cacheMap = cache[cacheType]
  
  if (cacheMap.size > MAX_CACHE_SIZE) {
    // Rimuovi le entry più vecchie
    const entries = Array.from(cacheMap.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    const toRemove = entries.slice(0, Math.floor(MAX_CACHE_SIZE / 2))
    toRemove.forEach(([key]) => cacheMap.delete(key))
  }
}

// Funzione per verificare se la cache è valida
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION
}

// Funzione per ottenere dati dalla cache
const getFromCache = <T>(cacheType: keyof typeof cache, key: string): T | null => {
  const cached = cache[cacheType].get(key)
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data as T
  }
  return null
}

// Funzione per salvare dati nella cache
const saveToCache = <T>(cacheType: keyof typeof cache, key: string, data: T): void => {
  cache[cacheType].set(key, {
    data: data as any[],
    timestamp: Date.now()
  })
  
  cleanupCache(cacheType)
}

// Funzione per invalidare cache
export const invalidateCache = (cacheType?: keyof typeof cache) => {
  if (cacheType) {
    cache[cacheType].clear()
  } else {
    Object.keys(cache).forEach(key => {
      cache[key as keyof typeof cache].clear()
    })
  }
}

// Caricamento clienti ottimizzato
export const loadClientsSafe = async (userId: string): Promise<any[]> => {
  const cacheKey = `clients_${userId}`
  
  // Prova cache prima
  const cached = getFromCache<any[]>('clients', cacheKey)
  if (cached) {
    return cached
  }
  
  // Fallback: query normale
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('id, ragione, nome, cognome, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) throw error

    const clients = data || []
    
    // Salva in cache
    saveToCache('clients', cacheKey, clients)
    
    return clients
  } catch (error) {
    console.error('❌ Errore caricamento clienti:', error)
    return [] // Fallback sicuro
  }
}

// Caricamento pratiche ottimizzato
export const loadPracticesSafe = async (userId: string): Promise<any[]> => {
  const cacheKey = `practices_${userId}`
  
  // Prova cache prima
  const cached = getFromCache<any[]>('practices', cacheKey)
  if (cached) {
    return cached
  }
  
  try {
    // Query ottimizzata: un solo JOIN
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

    if (practicesError) throw practicesError

    // Carica controparti in batch
    const allCounterpartyIds = new Set<string>()
    practicesData?.forEach(practice => {
      if (practice.controparti_ids && practice.controparti_ids.length > 0) {
        practice.controparti_ids.forEach((id: string) => allCounterpartyIds.add(id))
      }
    })

    let counterpartyMap = new Map<string, any>()
    if (allCounterpartyIds.size > 0) {
      const { data: counterpartiesData } = await supabase
        .from('clients')
        .select('id, ragione, nome, cognome')
        .in('id', Array.from(allCounterpartyIds))

      counterpartiesData?.forEach((client: any) => {
        counterpartyMap.set(client.id, client)
      })
    }

    // Combina pratiche con controparti
    const practices = practicesData?.map(practice => ({
      ...practice,
      counterparties: practice.controparti_ids?.map((id: string) => counterpartyMap.get(id)).filter(Boolean) || []
    })) || []

    // Salva in cache
    saveToCache('practices', cacheKey, practices)
    
    return practices
  } catch (error) {
    console.error('❌ Errore caricamento pratiche:', error)
    return [] // Fallback sicuro
  }
}

// Caricamento attività ottimizzato
export const loadActivitiesSafe = async (userId: string): Promise<any[]> => {
  const cacheKey = `activities_${userId}`
  
  // Prova cache prima
  const cached = getFromCache<any[]>('activities', cacheKey)
  if (cached) {
    return cached
  }
  
  try {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        practices!inner(
          numero,
          cliente_id,
          controparti_ids,
          clients!practices_cliente_id_fkey(
            ragione,
            nome,
            cognome
          )
        )
      `)
      .eq('user_id', userId)
      .order('data', { ascending: true })
      .limit(1000)

    if (error) throw error

    const activities = data || []
    
    // Salva in cache
    saveToCache('activities', cacheKey, activities)
    
    return activities
  } catch (error) {
    console.error('❌ Errore caricamento attività:', error)
    return [] // Fallback sicuro
  }
}

// Hook sicuro per i dati
export const useSafeData = () => {
  const [clients, setClients] = useState<any[]>([])
  const [practices, setPractices] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = async (userId: string) => {
    try {
      setLoading(true)
      setError(null)

      // Carica tutti i dati in parallelo
      const [clientsData, practicesData, activitiesData] = await Promise.all([
        loadClientsSafe(userId),
        loadPracticesSafe(userId),
        loadActivitiesSafe(userId)
      ])

      setClients(clientsData)
      setPractices(practicesData)
      setActivities(activitiesData)
    } catch (err) {
      console.error('❌ Errore nel caricamento dei dati:', err)
      setError('Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    invalidateCache()
  }

  return {
    clients,
    practices,
    activities,
    loading,
    error,
    loadData,
    refresh
  }
}