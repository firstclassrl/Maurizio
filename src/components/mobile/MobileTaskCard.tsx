import React from 'react'
import { Clock, AlertTriangle, CheckCircle, Circle } from 'lucide-react'
import { MobileCard } from './MobileCard'
import { Task } from '../../lib/calendar-utils'
import { formatTimeWithoutSeconds } from '../../lib/time-utils'

interface MobileTaskCardProps {
  task: Task
  onClick: () => void
}

export function MobileTaskCard({ task, onClick }: MobileTaskCardProps) {
  const getStatusIcon = (task: Task) => {
    if (task.stato === 'done') {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    if (task.urgent) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />
    }
    return <Circle className="h-4 w-4 text-gray-400" />
  }

  const getStatusColor = (task: Task) => {
    if (task.stato === 'done') {
      return 'border-l-green-500'
    }
    if (task.urgent) {
      return 'border-l-red-500'
    }
    if (task.stato === 'todo' && new Date(task.scadenza) < new Date()) {
      return 'border-l-orange-500'
    }
    return 'border-l-gray-300'
  }

  const getCategoryBorder = (category?: string) => {
    switch (category) {
      case 'Appuntamento':
        return 'border-gray-200'
      case 'Scadenza':
        return 'border-orange-200'
      case 'Attività da Svolgere':
        return 'border-blue-200'
      case 'Udienza':
        return 'border-green-200'
      case 'Scadenza Processuale':
        return 'border-red-200'
      case 'Attività Processuale':
        return 'border-yellow-200'
      default:
        return 'border-gray-200'
    }
  }

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case 'Appuntamento':
        return 'bg-gray-100 text-gray-800'
      case 'Scadenza':
        return 'bg-orange-100 text-orange-800'
      case 'Attività da Svolgere':
        return 'bg-blue-100 text-blue-800'
      case 'Udienza':
        return 'bg-green-100 text-green-800'
      case 'Scadenza Processuale':
        return 'bg-red-100 text-red-800'
      case 'Attività Processuale':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm border-2 ${getCategoryBorder(task.categoria)} p-4 mb-3 cursor-pointer transition-colors`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="mobile-text font-medium text-gray-900 mb-1 line-clamp-2">
            {task.attivita}
          </h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">
            {task.pratica}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          {getStatusIcon(task)}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {formatTimeWithoutSeconds(task.ora)}
          </span>
        </div>
        {task.categoria && (
          <span className={`text-xs px-2 py-1 rounded-full ${getCategoryBadge(task.categoria)}`}>
            {task.categoria}
          </span>
        )}
      </div>
    </div>
  )
}
