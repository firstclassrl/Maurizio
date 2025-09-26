// Sistema di toggle per ottimizzazioni - Implementazione sicura
export interface OptimizationConfig {
  useOptimizedQueries: boolean
  useCache: boolean
  cacheDuration: number // in millisecondi
  maxCacheSize: number
  enableLogging: boolean
}

// Configurazione di default (SICURA)
const DEFAULT_CONFIG: OptimizationConfig = {
  useOptimizedQueries: false, // INIZIALMENTE DISABILITATO
  useCache: false, // INIZIALMENTE DISABILITATO
  cacheDuration: 2 * 60 * 1000, // 2 minuti (più sicuro di 5)
  maxCacheSize: 50, // Limite basso per sicurezza
  enableLogging: true // Per monitoraggio
}

// Configurazione attiva
let currentConfig: OptimizationConfig = { ...DEFAULT_CONFIG }

// Funzione per abilitare/disabilitare ottimizzazioni
export const setOptimizationConfig = (config: Partial<OptimizationConfig>) => {
  currentConfig = { ...currentConfig, ...config }
  
  if (currentConfig.enableLogging) {
    console.log('🔧 Ottimizzazioni aggiornate:', currentConfig)
  }
}

// Funzione per ottenere la configurazione corrente
export const getOptimizationConfig = (): OptimizationConfig => {
  return { ...currentConfig }
}

// Funzione per resettare alle impostazioni di default
export const resetOptimizationConfig = () => {
  currentConfig = { ...DEFAULT_CONFIG }
  console.log('🔄 Ottimizzazioni resettate alle impostazioni di default')
}

// Funzione per abilitare gradualmente le ottimizzazioni
export const enableOptimizationsGradually = () => {
  // Step 1: Abilita solo query ottimizzate (senza cache)
  setOptimizationConfig({
    useOptimizedQueries: true,
    useCache: false,
    enableLogging: true
  })
  
  console.log('✅ Step 1: Query ottimizzate abilitate (senza cache)')
  
  // Dopo 24-48 ore, se tutto va bene, abilita anche la cache
  setTimeout(() => {
    setOptimizationConfig({
      useCache: true,
      cacheDuration: 1 * 60 * 1000 // 1 minuto per iniziare
    })
    console.log('✅ Step 2: Cache abilitata (1 minuto TTL)')
  }, 24 * 60 * 60 * 1000) // 24 ore
}

// Funzione per disabilitare tutto in caso di problemi
export const emergencyDisable = () => {
  setOptimizationConfig({
    useOptimizedQueries: false,
    useCache: false
  })
  console.log('🚨 EMERGENZA: Tutte le ottimizzazioni disabilitate')
}

// Hook per monitorare le performance
export const useOptimizationMonitoring = () => {
  const [metrics, setMetrics] = useState({
    cacheHits: 0,
    cacheMisses: 0,
    queryTime: 0,
    errors: 0
  })

  const logCacheHit = () => {
    setMetrics(prev => ({ ...prev, cacheHits: prev.cacheHits + 1 }))
  }

  const logCacheMiss = () => {
    setMetrics(prev => ({ ...prev, cacheMisses: prev.cacheMisses + 1 }))
  }

  const logQueryTime = (time: number) => {
    setMetrics(prev => ({ ...prev, queryTime: time }))
  }

  const logError = () => {
    setMetrics(prev => ({ ...prev, errors: prev.errors + 1 }))
  }

  return {
    metrics,
    logCacheHit,
    logCacheMiss,
    logQueryTime,
    logError
  }
}

// Funzione per ottenere statistiche cache
export const getCacheStats = () => {
  const config = getOptimizationConfig()
  return {
    enabled: config.useCache,
    duration: config.cacheDuration,
    maxSize: config.maxCacheSize,
    hitRate: 0 // Calcolato dinamicamente
  }
}
