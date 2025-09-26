import { supabase } from './supabase'
import { getOptimizationConfig } from './optimization-toggle'

// Versione SICURA del sistema di ottimizzazione
// Rispetta sempre i toggle e ha fallback garantito

// Cache sicura con limiti
const safeCache = {
  clients: new Map<string, { data: any[], timestamp: number }>(),
  practices: new Map<string, { data: any[], timestamp: number }>(),
  activities: new Map<string, { data: any[], timestamp: number }>()
}

// Funzione per pulire cache se supera i limiti
const cleanupCache = (cacheType: keyof typeof safeCache) => {
  const config = getOptimizationConfig()
  const cache = safeCache[cacheType]
  
  if (cache.size > config.maxCacheSize) {
    // Rimuovi le entry più vecchie
    const entries = Array.from(cache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    const toRemove = entries.slice(0, Math.floor(config.maxCacheSize / 2))
    toRemove.forEach(([key]) => cache.delete(key))
    
    console.log(`🧹 Cache ${cacheType} pulita: rimossi ${toRemove.length} elementi`)
  }
}

// Funzione per verificare se la cache è valida
const isCacheValid = (timestamp: number): boolean => {
  const config = getOptimizationConfig()
  return Date.now() - timestamp < config.cacheDuration
}

// Funzione per ottenere dati dalla cache (se abilitata)
const getFromCache = <T>(cacheType: keyof typeof safeCache, key: string): T | null => {
  const config = getOptimizationConfig()
  
  if (!config.useCache) {
    return null // Cache disabilitata
  }
  
  const cached = safeCache[cacheType].get(key)
  if (cached && isCacheValid(cached.timestamp)) {
    if (config.enableLogging) {
      console.log(`✅ Cache HIT: ${cacheType}/${key}`)
    }
    return cached.data as T
  }
  
  if (config.enableLogging) {
    console.log(`❌ Cache MISS: ${cacheType}/${key}`)
  }
  return null
}

// Funzione per salvare dati nella cache (se abilitata)
const saveToCache = <T>(cacheType: keyof typeof safeCache, key: string, data: T): void => {
  const config = getOptimizationConfig()
  
  if (!config.useCache) {
    return // Cache disabilitata
  }
  
  safeCache[cacheType].set(key, {
    data: data as any[],
    timestamp: Date.now()
  })
  
  cleanupCache(cacheType)
  
  if (config.enableLogging) {
    console.log(`💾 Cache SAVED: ${cacheType}/${key}`)
  }
}

// Funzione per invalidare cache
export const invalidateSafeCache = (cacheType?: keyof typeof safeCache) => {
  if (cacheType) {
    safeCache[cacheType].clear()
    console.log(`🗑️ Cache ${cacheType} invalidata`)
  } else {
    Object.keys(safeCache).forEach(key => {
      safeCache[key as keyof typeof safeCache].clear()
    })
    console.log('🗑️ Tutta la cache invalidata')
  }
}

// Caricamento clienti SICURO
export const loadClientsSafe = async (userId: string): Promise<any[]> => {
  const config = getOptimizationConfig()
  const cacheKey = `clients_${userId}`
  
  // Prova cache prima (se abilitata)
  const cached = getFromCache('clients', cacheKey)
  if (cached) {
    return cached
  }
  
  // Fallback: query normale
  try {
    const startTime = Date.now()
    
    const { data, error } = await supabase
      .from('clients')
      .select('id, ragione, nome, cognome, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) throw error

    const clients = data || []
    
    // Salva in cache (se abilitata)
    saveToCache('clients', cacheKey, clients)
    
    const queryTime = Date.now() - startTime
    if (config.enableLogging) {
      console.log(`⏱️ Query clienti completata in ${queryTime}ms`)
    }
    
    return clients
  } catch (error) {
    console.error('❌ Errore caricamento clienti:', error)
    return [] // Fallback sicuro
  }
}

// Caricamento pratiche SICURO
export const loadPracticesSafe = async (userId: string): Promise<any[]> => {
  const config = getOptimizationConfig()
  const cacheKey = `practices_${userId}`
  
  // Prova cache prima (se abilitata)
  const cached = getFromCache('practices', cacheKey)
  if (cached) {
    return cached
  }
  
  try {
    const startTime = Date.now()
    
    if (config.useOptimizedQueries) {
      // Query ottimizzata (se abilitata)
      return await loadPracticesOptimizedSafe(userId, cacheKey, startTime)
    } else {
      // Query normale (fallback sicuro)
      return await loadPracticesNormalSafe(userId, cacheKey, startTime)
    }
  } catch (error) {
    console.error('❌ Errore caricamento pratiche:', error)
    return [] // Fallback sicuro
  }
}

// Query ottimizzata per pratiche (se abilitata)
const loadPracticesOptimizedSafe = async (userId: string, cacheKey: string, startTime: number): Promise<any[]> => {
  const config = getOptimizationConfig()
  
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
    .limit(1000)

  if (practicesError) throw practicesError

  // Carica controparti in batch
  const allCounterpartyIds = new Set<string>()
  practicesData?.forEach((practice: any) => {
    if (practice.controparti_ids) {
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

  // Costruisci le pratiche con le controparti
  const practices: any[] = (practicesData || []).map((practice: any) => ({
    ...practice,
    counterparties: practice.controparti_ids
      ?.map((id: string) => counterpartyMap.get(id))
      .filter(Boolean) || []
  }))

  // Salva in cache (se abilitata)
  saveToCache('practices', cacheKey, practices)
  
  const queryTime = Date.now() - startTime
  if (config.enableLogging) {
    console.log(`⏱️ Query pratiche ottimizzata completata in ${queryTime}ms`)
  }
  
  return practices
}

// Query normale per pratiche (fallback sicuro)
const loadPracticesNormalSafe = async (userId: string, cacheKey: string, startTime: number): Promise<any[]> => {
  const config = getOptimizationConfig()
  
  // Query normale (come prima)
  const { data: practicesData, error: practicesError } = await supabase
    .from('practices')
    .select(`
      *,
      clients!practices_cliente_id_fkey(*)
    `)
    .eq('user_id', userId)
    .order('numero', { ascending: false })

  if (practicesError) throw practicesError

  // Carica controparti per ogni pratica (come prima)
  const practicesWithCounterparties = await Promise.all(
    (practicesData || []).map(async (practice: any) => {
      if (practice.controparti_ids && practice.controparti_ids.length > 0) {
        const { data: counterpartiesData } = await supabase
          .from('clients')
          .select('*')
          .in('id', practice.controparti_ids)
        
        return {
          ...practice,
          counterparties: counterpartiesData || []
        }
      }
      return {
        ...practice,
        counterparties: []
      }
    })
  )

  // Salva in cache (se abilitata)
  saveToCache('practices', cacheKey, practicesWithCounterparties)
  
  const queryTime = Date.now() - startTime
  if (config.enableLogging) {
    console.log(`⏱️ Query pratiche normale completata in ${queryTime}ms`)
  }
  
  return practicesWithCounterparties
}

// Hook sicuro per i dati
export const useSafeData = () => {
  const [clients, setClients] = useState<any[]>([])
  const [practices, setPractices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = async (userId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // Carica tutto in parallelo (sempre sicuro)
      const [clientsData, practicesData] = await Promise.all([
        loadClientsSafe(userId),
        loadPracticesSafe(userId)
      ])
      
      setClients(clientsData)
      setPractices(practicesData)
    } catch (err) {
      console.error('❌ Errore caricamento dati:', err)
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }

  const refresh = (userId: string) => {
    // Invalida cache e ricarica
    invalidateSafeCache()
    loadData(userId)
  }

  return {
    clients,
    practices,
    loading,
    error,
    loadData,
    refresh
  }
}
