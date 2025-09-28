import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { performanceMonitor, PerformanceMetrics } from '../../lib/performance-monitor'
import { BarChart3, Clock, Zap, Activity, TrendingUp, RefreshCw } from 'lucide-react'

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([])
  const [summary, setSummary] = useState<any>(null)

  const refreshMetrics = () => {
    const currentMetrics = performanceMonitor.getMetrics()
    const currentSummary = performanceMonitor.getPerformanceSummary()
    setMetrics(currentMetrics)
    setSummary(currentSummary)
  }

  useEffect(() => {
    refreshMetrics()
    // Aggiorna ogni 5 secondi
    const interval = setInterval(refreshMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(1)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatMemory = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(2)}MB`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">📊 Performance Dashboard</h2>
        <Button onClick={refreshMetrics} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Aggiorna
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Query Totali</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalQueries}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Medio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(summary.averageQueryTime)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasso Successo</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.successRate.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Query Più Lenta</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">{summary.slowestQueryType}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Metriche Recenti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.slice(-10).reverse().map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{metric.queryType}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {metric.timestamp.toLocaleTimeString('it-IT')}
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(metric.queryTime)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Activity className="h-3 w-3" />
                    <span>{formatMemory(metric.memoryUsage)}</span>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    metric.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {metric.success ? 'Success' : 'Error'}
                  </div>
                </div>
              </div>
            ))}
            {metrics.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nessuna metrica disponibile
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Query Type Performance */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Performance per Tipo Query</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(
              metrics.reduce((acc, metric) => {
                if (!acc[metric.queryType]) {
                  acc[metric.queryType] = []
                }
                acc[metric.queryType].push(metric.queryTime)
                return acc
              }, {} as Record<string, number[]>)
            ).map(([type, times]) => {
              const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
              const count = times.length
              
              return (
                <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="font-medium">{type}</div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span>{count} query</span>
                    <span>{formatTime(avgTime)} avg</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
