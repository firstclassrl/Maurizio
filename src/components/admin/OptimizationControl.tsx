import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { 
  setOptimizationConfig, 
  getOptimizationConfig, 
  resetOptimizationConfig,
  enableOptimizationsGradually,
  emergencyDisable
} from '../../lib/optimization-toggle'
import { PerformanceMonitor } from './PerformanceMonitor'

export function OptimizationControl() {
  const [config, setConfig] = useState(getOptimizationConfig())

  useEffect(() => {
    // Aggiorna config ogni 5 secondi
    const interval = setInterval(() => {
      setConfig(getOptimizationConfig())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleToggleOptimizedQueries = () => {
    const newConfig = {
      ...config,
      useOptimizedQueries: !config.useOptimizedQueries
    }
    setOptimizationConfig(newConfig)
    setConfig(newConfig)
  }

  const handleToggleCache = () => {
    const newConfig = {
      ...config,
      useCache: !config.useCache
    }
    setOptimizationConfig(newConfig)
    setConfig(newConfig)
  }

  const handleToggleLogging = () => {
    const newConfig = {
      ...config,
      enableLogging: !config.enableLogging
    }
    setOptimizationConfig(newConfig)
    setConfig(newConfig)
  }

  const handleEmergencyDisable = () => {
    emergencyDisable()
    setConfig(getOptimizationConfig())
  }

  const handleReset = () => {
    resetOptimizationConfig()
    setConfig(getOptimizationConfig())
  }

  const handleGradualEnable = () => {
    enableOptimizationsGradually()
    setConfig(getOptimizationConfig())
  }

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Controllo Ottimizzazioni
          <Badge variant={config.useOptimizedQueries || config.useCache ? "default" : "secondary"}>
            {config.useOptimizedQueries || config.useCache ? "ATTIVE" : "DISATTIVE"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Stato Attuale */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Query Ottimizzate</h4>
            <Badge variant={config.useOptimizedQueries ? "default" : "outline"}>
              {config.useOptimizedQueries ? "✅ ABILITATE" : "❌ DISABILITATE"}
            </Badge>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Cache</h4>
            <Badge variant={config.useCache ? "default" : "outline"}>
              {config.useCache ? "✅ ABILITATA" : "❌ DISABILITATA"}
            </Badge>
          </div>
        </div>

        {/* Controlli */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Query Ottimizzate</h4>
              <p className="text-sm text-gray-600">Usa JOIN ottimizzati invece di query N+1</p>
            </div>
            <Button
              variant={config.useOptimizedQueries ? "default" : "outline"}
              onClick={handleToggleOptimizedQueries}
            >
              {config.useOptimizedQueries ? "Disabilita" : "Abilita"}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Cache</h4>
              <p className="text-sm text-gray-600">Cache in-memory per ridurre query database</p>
            </div>
            <Button
              variant={config.useCache ? "default" : "outline"}
              onClick={handleToggleCache}
            >
              {config.useCache ? "Disabilita" : "Abilita"}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Logging</h4>
              <p className="text-sm text-gray-600">Mostra log dettagliati in console</p>
            </div>
            <Button
              variant={config.enableLogging ? "default" : "outline"}
              onClick={handleToggleLogging}
            >
              {config.enableLogging ? "Disabilita" : "Abilita"}
            </Button>
          </div>
        </div>

        {/* Statistiche Cache */}
        {config.useCache && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Configurazione Cache</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Durata TTL:</span>
                <span className="ml-2 font-medium">{config.cacheDuration / 1000}s</span>
              </div>
              <div>
                <span className="text-gray-600">Max Size:</span>
                <span className="ml-2 font-medium">{config.maxCacheSize}</span>
              </div>
            </div>
          </div>
        )}

        {/* Azioni Rapide */}
        <div className="space-y-2">
          <h4 className="font-medium">Azioni Rapide</h4>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGradualEnable}
              disabled={config.useOptimizedQueries && config.useCache}
            >
              🚀 Abilitazione Graduale
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              🔄 Reset
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEmergencyDisable}
            >
              🚨 Disabilita Tutto
            </Button>
          </div>
        </div>

        {/* Istruzioni */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">📋 Istruzioni</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. <strong>Inizia con "Abilitazione Graduale"</strong> per testare in sicurezza</li>
            <li>2. <strong>Monitora i log</strong> in console per verificare il funzionamento</li>
            <li>3. <strong>Se ci sono problemi</strong>, usa "Disabilita Tutto" per tornare al comportamento normale</li>
            <li>4. <strong>Dopo 24-48 ore</strong> di test, puoi abilitare manualmente tutte le ottimizzazioni</li>
          </ol>
        </div>

      </CardContent>
      </Card>

      {/* Monitoraggio Performance */}
      <PerformanceMonitor />
    </div>
  )
}
