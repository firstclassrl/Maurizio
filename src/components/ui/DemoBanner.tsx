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
  console.log('=== DEMO BANNER RENDER ===')
  console.log('DemoBanner render:', { isDemoUser, isPopulating, hasOnRepopulate: !!onRepopulate, hasOnClear: !!onClear })
  console.log('onRepopulate function:', onRepopulate)
  
  if (!isDemoUser) {
    console.log('DemoBanner: not a demo user, returning null')
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 mb-4 rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <div className="text-xs opacity-75">DEMO BANNER RENDERED</div>
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
              size="sm"
              onClick={() => {
                console.log('Ricarica Dati button clicked!')
                console.log('onRepopulate function:', onRepopulate)
                if (onRepopulate) {
                  console.log('Calling onRepopulate...')
                  alert('CALLING onRepopulate function!')
                  onRepopulate()
                } else {
                  console.error('onRepopulate is undefined!')
                  alert('ERROR: onRepopulate is undefined!')
                }
              }}
              disabled={isPopulating}
              className="bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 text-xs font-medium"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Ricarica Dati
            </Button>
          )}
          {onClear && (
            <Button
              size="sm"
              onClick={onClear}
              disabled={isPopulating}
              className="bg-white text-red-600 hover:bg-red-50 border border-red-200 text-xs font-medium"
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
