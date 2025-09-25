import React from 'react'
import { Task } from '../../lib/calendar-utils'
import { formatTimeWithoutSeconds } from '../../lib/time-utils'

interface ActivityTooltipProps {
  task: Task
  isVisible: boolean
  position: { x: number; y: number }
}

export const ActivityTooltip: React.FC<ActivityTooltipProps> = ({ 
  task, 
  isVisible, 
  position 
}) => {
  if (!isVisible) return null

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Appuntamento':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'Scadenza':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Attività da Svolgere':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Udienza':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Scadenza Processuale':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Attività Processuale':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm"
      style={{
        left: position.x + 10,
        top: position.y - 10,
        transform: 'translateY(-100%)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            task.stato === 'done' ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm font-medium text-gray-900">
            {task.pratica}
          </span>
        </div>
        {task.urgent && (
          <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded">
            URGENTE
          </span>
        )}
      </div>

      {/* Activity Title */}
      <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
        {task.attivita}
      </h3>

      {/* Category */}
      {task.categoria && (
        <div className="mb-2">
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getCategoryColor(task.categoria)}`}>
            {task.categoria}
          </span>
        </div>
      )}

      {/* Details */}
      <div className="space-y-1 text-xs text-gray-600">
        {/* Date and Time */}
        <div className="flex items-center gap-2">
          <span className="font-medium">📅</span>
          <span>{new Date(task.scadenza).toLocaleDateString('it-IT')}</span>
          {task.ora && (
            <>
              <span>•</span>
              <span>{formatTimeWithoutSeconds(task.ora)}</span>
            </>
          )}
        </div>

        {/* Client */}
        {task.cliente && (
          <div className="flex items-center gap-2">
            <span className="font-medium">👤</span>
            <span>{task.cliente}</span>
          </div>
        )}

        {/* Counterparty */}
        {task.controparte && (
          <div className="flex items-center gap-2">
            <span className="font-medium">⚖️</span>
            <span>{task.controparte}</span>
          </div>
        )}

        {/* Notes */}
        {task.note && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-start gap-2">
              <span className="font-medium">📝</span>
              <span className="line-clamp-3">{task.note}</span>
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="mt-3 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Stato: <span className={`font-medium ${
              task.stato === 'done' ? 'text-green-600' : 'text-orange-600'
            }`}>
              {task.stato === 'done' ? 'Completata' : 'Da fare'}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
