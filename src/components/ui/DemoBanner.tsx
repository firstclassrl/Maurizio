import React from 'react'
import { Info, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from './button'

interface DemoBannerProps {
  isDemoUser: boolean
  isPopulating: boolean
  onRepopulate?: () => void
  onClear?: () => void
}

export function DemoBanner({ isDemoUser, isPopulating, onRepopulate, onClear }: DemoBannerProps) {
  if (!isDemoUser) return null

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 mb-4 rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Info className="h-5 w-5 text-blue-200" />
          <div>
            <h3 className="font-semibold text-sm">Versione Demo Beta Test</h3>
            <p className="text-xs text-blue-100 opacity-90">
              Questa è una versione demo con dati dimostrativi. Tutte le funzionalità sono disponibili per il test.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onRepopulate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRepopulate}
              disabled={isPopulating}
              className="text-white border-white hover:bg-white hover:text-blue-600 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Ricarica Dati
            </Button>
          )}
          {onClear && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              disabled={isPopulating}
              className="text-white border-white hover:bg-white hover:text-red-600 text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Pulisci
            </Button>
          )}
        </div>
      </div>
      {isPopulating && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Aggiornamento dati in corso...</span>
        </div>
      )}
    </div>
  )
}
