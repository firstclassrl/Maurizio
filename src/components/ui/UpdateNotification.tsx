import React from 'react'
import { Button } from './button'
import { RefreshCw, X } from 'lucide-react'

interface UpdateNotificationProps {
  isVisible: boolean
  isUpdating: boolean
  onUpdate: () => void
  onDismiss: () => void
}

export function UpdateNotification({ 
  isVisible, 
  isUpdating, 
  onUpdate, 
  onDismiss 
}: UpdateNotificationProps) {
  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-orange-200 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <RefreshCw className={`h-5 w-5 text-orange-600 ${isUpdating ? 'animate-spin' : ''}`} />
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Aggiornamento disponibile
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            È disponibile una nuova versione dell'applicazione con miglioramenti e correzioni.
          </p>
          
          <div className="flex gap-2">
            <Button
              onClick={onUpdate}
              disabled={isUpdating}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white text-xs"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Aggiornamento...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Aggiorna ora
                </>
              )}
            </Button>
            
            <Button
              onClick={onDismiss}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Più tardi
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
