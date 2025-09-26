import { useState, useEffect, useCallback } from 'react'
import { 
  loadClientsOptimized, 
  loadPracticesOptimized, 
  loadActivitiesOptimized,
  preloadEssentialData,
  invalidateCache,
  getCurrentUser
} from '../lib/supabase-optimized'
import { Practice, Activity, Client } from '../types'

interface UseOptimizedDataReturn {
  clients: Client[]
  practices: Practice[]
  activities: Activity[]
  loading: boolean
  error: string | null
  refreshClients: () => Promise<void>
  refreshPractices: () => Promise<void>
  refreshActivities: (filters?: any) => Promise<void>
  refreshAll: () => Promise<void>
  invalidateCache: () => void
}

export const useOptimizedData = (): UseOptimizedDataReturn => {
  const [clients, setClients] = useState<Client[]>([])
  const [practices, setPractices] = useState<Practice[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = (err: any) => {
    console.error('Errore nel caricamento dati:', err)
    setError(err instanceof Error ? err.message : 'Errore sconosciuto')
  }

  const refreshClients = useCallback(async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const clientsData = await loadClientsOptimized(user.id)
      setClients(clientsData)
    } catch (err) {
      handleError(err)
    }
  }, [])

  const refreshPractices = useCallback(async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const practicesData = await loadPracticesOptimized(user.id)
      setPractices(practicesData)
    } catch (err) {
      handleError(err)
    }
  }, [])

  const refreshActivities = useCallback(async (filters?: any) => {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const activitiesData = await loadActivitiesOptimized(user.id, filters)
      setActivities(activitiesData)
    } catch (err) {
      handleError(err)
    }
  }, [])

  const refreshAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const user = await getCurrentUser()
      if (!user) return

      // Carica tutto in parallelo per massima velocità
      await Promise.all([
        refreshClients(),
        refreshPractices(),
        refreshActivities()
      ])
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }, [refreshClients, refreshPractices, refreshActivities])

  const handleInvalidateCache = useCallback(() => {
    invalidateCache()
  }, [])

  // Caricamento iniziale
  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  return {
    clients,
    practices,
    activities,
    loading,
    error,
    refreshClients,
    refreshPractices,
    refreshActivities,
    refreshAll,
    invalidateCache: handleInvalidateCache
  }
}

// Hook specifico per le pratiche con cache intelligente
export const useOptimizedPractices = () => {
  const [practices, setPractices] = useState<Practice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPractices = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const user = await getCurrentUser()
      if (!user) return

      const practicesData = await loadPracticesOptimized(user.id)
      setPractices(practicesData)
    } catch (err) {
      console.error('Errore nel caricamento pratiche:', err)
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPractices()
  }, [loadPractices])

  return {
    practices,
    loading,
    error,
    refresh: loadPractices
  }
}

// Hook per precaricamento intelligente
export const usePreloadData = () => {
  const [preloaded, setPreloaded] = useState(false)

  const preload = useCallback(async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return

      await preloadEssentialData(user.id)
      setPreloaded(true)
    } catch (err) {
      console.error('Errore nel precaricamento:', err)
    }
  }, [])

  useEffect(() => {
    preload()
  }, [preload])

  return { preloaded }
}
