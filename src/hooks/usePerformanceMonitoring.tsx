import { useState, useCallback } from 'react'

interface PerformanceMetrics {
  queryTime: number
  cacheHits: number
  cacheMisses: number
  totalQueries: number
  averageQueryTime: number
  lastUpdate: Date
}

interface PerformanceData {
  metrics: PerformanceMetrics
  logs: string[]
  isMonitoring: boolean
}

const initialMetrics: PerformanceMetrics = {
  queryTime: 0,
  cacheHits: 0,
  cacheMisses: 0,
  totalQueries: 0,
  averageQueryTime: 0,
  lastUpdate: new Date()
}

export function usePerformanceMonitoring() {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    metrics: initialMetrics,
    logs: [],
    isMonitoring: false
  })

  // Avvia il monitoraggio
  const startMonitoring = useCallback(() => {
    setPerformanceData(prev => ({
      ...prev,
      isMonitoring: true,
      logs: [...prev.logs, `[${new Date().toLocaleTimeString()}] Monitoraggio avviato`]
    }))
  }, [])

  // Ferma il monitoraggio
  const stopMonitoring = useCallback(() => {
    setPerformanceData(prev => ({
      ...prev,
      isMonitoring: false,
      logs: [...prev.logs, `[${new Date().toLocaleTimeString()}] Monitoraggio fermato`]
    }))
  }, [])

  // Registra una query
  const recordQuery = useCallback((queryTime: number, fromCache: boolean = false) => {
    setPerformanceData(prev => {
      const newMetrics = {
        ...prev.metrics,
        queryTime: prev.metrics.queryTime + queryTime,
        totalQueries: prev.metrics.totalQueries + 1,
        cacheHits: fromCache ? prev.metrics.cacheHits + 1 : prev.metrics.cacheHits,
        cacheMisses: !fromCache ? prev.metrics.cacheMisses + 1 : prev.metrics.cacheMisses,
        averageQueryTime: (prev.metrics.queryTime + queryTime) / (prev.metrics.totalQueries + 1),
        lastUpdate: new Date()
      }

      const logMessage = `[${new Date().toLocaleTimeString()}] Query: ${queryTime}ms ${fromCache ? '(CACHE HIT)' : '(CACHE MISS)'}`
      
      return {
        ...prev,
        metrics: newMetrics,
        logs: [...prev.logs.slice(-49), logMessage] // Mantieni solo gli ultimi 50 log
      }
    })
  }, [])

  // Aggiungi un log personalizzato
  const addLog = useCallback((message: string) => {
    setPerformanceData(prev => ({
      ...prev,
      logs: [...prev.logs.slice(-49), `[${new Date().toLocaleTimeString()}] ${message}`]
    }))
  }, [])

  // Reset delle metriche
  const resetMetrics = useCallback(() => {
    setPerformanceData(prev => ({
      ...prev,
      metrics: initialMetrics,
      logs: [...prev.logs, `[${new Date().toLocaleTimeString()}] Metriche reset`]
    }))
  }, [])

  // Calcola il cache hit rate
  const getCacheHitRate = useCallback(() => {
    const { cacheHits, totalQueries } = performanceData.metrics
    return totalQueries > 0 ? Math.round((cacheHits / totalQueries) * 100) : 0
  }, [performanceData.metrics])

  // Ottieni statistiche di performance
  const getPerformanceStats = useCallback(() => {
    const { metrics } = performanceData
    const cacheHitRate = getCacheHitRate()
    
    return {
      totalQueries: metrics.totalQueries,
      averageQueryTime: Math.round(metrics.averageQueryTime),
      cacheHitRate,
      cacheHits: metrics.cacheHits,
      cacheMisses: metrics.cacheMisses,
      totalQueryTime: Math.round(metrics.queryTime),
      lastUpdate: metrics.lastUpdate
    }
  }, [performanceData.metrics, getCacheHitRate])

  return {
    performanceData,
    startMonitoring,
    stopMonitoring,
    recordQuery,
    addLog,
    resetMetrics,
    getCacheHitRate,
    getPerformanceStats
  }
}
