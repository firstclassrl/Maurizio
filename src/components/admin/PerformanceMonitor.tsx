import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { usePerformanceMonitoring } from '../../hooks/usePerformanceMonitoring'
import { Activity, Clock, Database, TrendingUp, Play, Pause, Trash2 } from 'lucide-react'

export function PerformanceMonitor() {
  const {
    performanceData,
    startMonitoring,
    stopMonitoring,
    resetMetrics,
    getPerformanceStats
  } = usePerformanceMonitoring()

  const [showLogs, setShowLogs] = useState(false)
  const stats = getPerformanceStats()

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600'
    if (value <= thresholds.warning) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCacheHitRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600'
    if (rate >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monitoraggio Performance
            <Badge variant={performanceData.isMonitoring ? "default" : "secondary"}>
              {performanceData.isMonitoring ? "Attivo" : "Inattivo"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controlli */}
          <div className="flex gap-2">
            <Button
              onClick={performanceData.isMonitoring ? stopMonitoring : startMonitoring}
              variant={performanceData.isMonitoring ? "destructive" : "default"}
              size="sm"
            >
              {performanceData.isMonitoring ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Ferma
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Avvia
                </>
              )}
            </Button>
            <Button
              onClick={resetMetrics}
              variant="outline"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={() => setShowLogs(!showLogs)}
              variant="outline"
              size="sm"
            >
              <Activity className="h-4 w-4 mr-2" />
              {showLogs ? 'Nascondi' : 'Mostra'} Log
            </Button>
          </div>

          {/* Statistiche */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalQueries}</div>
              <div className="text-sm text-gray-600">Query Totali</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getPerformanceColor(stats.averageQueryTime, { good: 200, warning: 500 })}`}>
                {stats.averageQueryTime}ms
              </div>
              <div className="text-sm text-gray-600">Tempo Medio</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getCacheHitRateColor(stats.cacheHitRate)}`}>
                {stats.cacheHitRate}%
              </div>
              <div className="text-sm text-gray-600">Cache Hit Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.cacheHits}</div>
              <div className="text-sm text-gray-600">Cache Hits</div>
            </div>
          </div>

          {/* Dettagli Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Database Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cache Misses:</span>
                  <span className="text-sm font-medium">{stats.cacheMisses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tempo Totale:</span>
                  <span className="text-sm font-medium">{stats.totalQueryTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ultimo Aggiornamento:</span>
                  <span className="text-sm font-medium">
                    {stats.lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Analisi Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status Cache:</span>
                  <Badge variant={stats.cacheHitRate >= 70 ? "default" : "destructive"}>
                    {stats.cacheHitRate >= 70 ? "Ottimo" : "Da Migliorare"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status Query:</span>
                  <Badge variant={stats.averageQueryTime <= 300 ? "default" : "destructive"}>
                    {stats.averageQueryTime <= 300 ? "Veloce" : "Lento"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Efficienza:</span>
                  <Badge variant={stats.cacheHitRate >= 80 && stats.averageQueryTime <= 200 ? "default" : "secondary"}>
                    {stats.cacheHitRate >= 80 && stats.averageQueryTime <= 200 ? "Alta" : "Media"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Logs */}
          {showLogs && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Log Attività (Ultimi 50)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {performanceData.logs.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nessun log disponibile
                    </p>
                  ) : (
                    performanceData.logs.map((log, index) => (
                      <div
                        key={index}
                        className="text-xs font-mono bg-gray-50 p-2 rounded border-l-2 border-blue-200"
                      >
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
