/**
 * Performance Monitor per LexAgenda
 * Monitora le performance dell'assistente AI e dell'app
 */

export interface PerformanceMetrics {
  queryTime: number
  responseTime: number
  memoryUsage: number
  timestamp: Date
  queryType: string
  success: boolean
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetrics[] = []
  private maxMetrics = 100 // Mantieni solo gli ultimi 100 metrici

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startQuery(queryType: string): () => void {
    const startTime = performance.now()
    const startMemory = this.getMemoryUsage()

    return () => {
      const endTime = performance.now()
      const endMemory = this.getMemoryUsage()
      
      const metric: PerformanceMetrics = {
        queryTime: endTime - startTime,
        responseTime: endTime - startTime,
        memoryUsage: endMemory - startMemory,
        timestamp: new Date(),
        queryType,
        success: true
      }

      this.addMetric(metric)
      this.logPerformance(metric)
    }
  }

  private addMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric)
    
    // Mantieni solo gli ultimi N metrici
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize || 0
    }
    return 0
  }

  private logPerformance(metric: PerformanceMetrics): void {
    // Log solo in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Performance [${metric.queryType}]:`, {
        queryTime: `${metric.queryTime.toFixed(2)}ms`,
        memoryDelta: `${(metric.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
        timestamp: metric.timestamp.toISOString()
      })
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  getAverageQueryTime(queryType?: string): number {
    const filtered = queryType 
      ? this.metrics.filter(m => m.queryType === queryType)
      : this.metrics

    if (filtered.length === 0) return 0

    const total = filtered.reduce((sum, m) => sum + m.queryTime, 0)
    return total / filtered.length
  }

  getPerformanceSummary(): {
    totalQueries: number
    averageQueryTime: number
    slowestQueryType: string
    fastestQueryType: string
    successRate: number
  } {
    if (this.metrics.length === 0) {
      return {
        totalQueries: 0,
        averageQueryTime: 0,
        slowestQueryType: 'N/A',
        fastestQueryType: 'N/A',
        successRate: 100
      }
    }

    const totalQueries = this.metrics.length
    const averageQueryTime = this.getAverageQueryTime()
    
    // Raggruppa per tipo di query
    const queryTypes = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.queryType]) {
        acc[metric.queryType] = []
      }
      acc[metric.queryType].push(metric.queryTime)
      return acc
    }, {} as Record<string, number[]>)

    // Trova il tipo più lento e più veloce
    let slowestQueryType = 'N/A'
    let fastestQueryType = 'N/A'
    let slowestTime = 0
    let fastestTime = Infinity

    Object.entries(queryTypes).forEach(([type, times]) => {
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
      if (avgTime > slowestTime) {
        slowestTime = avgTime
        slowestQueryType = type
      }
      if (avgTime < fastestTime) {
        fastestTime = avgTime
        fastestQueryType = type
      }
    })

    const successfulQueries = this.metrics.filter(m => m.success).length
    const successRate = (successfulQueries / totalQueries) * 100

    return {
      totalQueries,
      averageQueryTime,
      slowestQueryType,
      fastestQueryType,
      successRate
    }
  }

  clearMetrics(): void {
    this.metrics = []
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()
