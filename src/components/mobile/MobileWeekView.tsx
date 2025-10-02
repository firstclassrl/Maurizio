import React, { useState } from 'react'
import { Task } from '../../lib/calendar-utils'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { it } from 'date-fns/locale'
import { useWeekendSettings } from '../../contexts/WeekendSettingsContext'
import { formatTimeWithoutSeconds } from '../../lib/time-utils'

interface MobileWeekViewProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  onDateChange?: (taskId: string, newDate: string) => void
}

export function MobileWeekView({ tasks, onTaskClick, onDateChange }: MobileWeekViewProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const { showWeekend, toggleWeekend } = useWeekendSettings()

  // Generate colors based on category (mantenendo i colori originali)
  const getTaskColor = (task: Task) => {
    switch (task.categoria) {
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

  // Get all days of the current week
  const getWeekDays = (date: Date) => {
    const start = startOfWeek(date, { locale: it, weekStartsOn: 1 }) // Monday
    const end = endOfWeek(date, { locale: it, weekStartsOn: 1 }) // Sunday
    const allDays = eachDayOfInterval({ start, end })
    
    if (showWeekend) {
      // Show full week (Monday to Sunday)
      return allDays
    } else {
      // Show only weekdays (Monday to Friday)
      return allDays.slice(0, 5)
    }
  }

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return tasks.filter(task => task.scadenza === dateStr)
  }

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() - 7)
    setCurrentWeek(newWeek)
  }

  // Navigate to next week
  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + 7)
    setCurrentWeek(newWeek)
  }

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const weekDays = getWeekDays(new Date(currentWeek))

  return (
    <div className="mobile-week-view">
      {/* Week Header */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={goToPreviousWeek}
          className="mobile-button p-2 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="mobile-heading text-gray-900">
          {format(weekDays[0], 'dd MMM', { locale: it })} - {format(weekDays[weekDays.length - 1], 'dd MMM yyyy', { locale: it })}
        </h2>
        <button 
          onClick={goToNextWeek}
          className="mobile-button p-2 text-gray-600 hover:text-gray-900"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>


      {/* Week days - Layout verticale */}
      <div className="space-y-3">
        {weekDays.map((day, index) => {
          const dayTasks = getTasksForDate(day)
          const isTodayDay = isToday(day)
          
          return (
            <div 
              key={index}
              className={`
                bg-white border border-gray-200 rounded-lg p-4
                ${isTodayDay ? 'ring-2 ring-blue-500' : ''}
              `}
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`
                    text-lg font-bold w-10 h-10 rounded-full flex items-center justify-center
                    ${isTodayDay ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}
                  `}>
                    {day.getDate()}
                  </div>
                  <div>
                    <div className={`
                      text-sm font-medium
                      ${isTodayDay ? 'text-blue-600' : 'text-gray-900'}
                    `}>
                      {format(day, 'EEEE', { locale: it })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(day, 'dd MMMM yyyy', { locale: it })}
                    </div>
                  </div>
                </div>
                {dayTasks.length > 0 && (
                  <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {dayTasks.length} attività
                  </div>
                )}
              </div>
              
              {/* Tasks */}
              <div className="space-y-2">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick?.(task)}
                    className={`
                      p-3 rounded-lg cursor-pointer border
                      ${getTaskColor(task)}
                      ${task.urgent ? 'ring-1 ring-red-500' : ''}
                    `}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-sm">{task.attivita}</div>
                      {task.urgent && (
                        <div className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                          Urgente
                        </div>
                      )}
                    </div>
                    {task.ora && (
                      <div className="text-xs opacity-75 mb-1">
                        🕐 {formatTimeWithoutSeconds(task.ora)}
                      </div>
                    )}
                    <div className="text-xs opacity-75 truncate">
                      📁 {task.pratica}
                    </div>
                  </div>
                ))}
                {dayTasks.length === 0 && (
                  <div className="text-sm text-gray-400 text-center py-4">
                    Nessuna attività
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
