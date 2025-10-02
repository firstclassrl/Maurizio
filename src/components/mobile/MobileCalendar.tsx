import React, { useState } from 'react'
import { Task } from '../../lib/calendar-utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { useWeekendSettings } from '../../contexts/WeekendSettingsContext'
import { formatTimeWithoutSeconds } from '../../lib/time-utils'

interface MobileCalendarProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  onDateChange?: (taskId: string, newDate: string) => void
}

export function MobileCalendar({ tasks, onTaskClick, onDateChange }: MobileCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const { showWeekend } = useWeekendSettings()

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

  // Get the first day of the month
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1)
  }

  // Get all days to display in the calendar grid
  const getCalendarDays = (date: Date) => {
    const firstDay = getFirstDayOfMonth(date)
    
    // Start from Monday of the week containing the first day
    const startDate = new Date(firstDay)
    const dayOfWeek = firstDay.getDay()
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    startDate.setDate(firstDay.getDate() - daysToSubtract)
    
    const days = []
    const currentDate = new Date(startDate)
    
    if (showWeekend) {
      // Show full weeks (6 weeks = 42 days)
      for (let i = 0; i < 42; i++) {
        const day = new Date(currentDate)
        days.push(day)
        currentDate.setDate(currentDate.getDate() + 1)
      }
    } else {
      // Show only weekdays - generate exactly 5 weeks of weekdays (25 days)
      let weekdaysAdded = 0
      while (weekdaysAdded < 25) {
        const day = new Date(currentDate)
        if (day.getDay() >= 1 && day.getDay() <= 5) {
          days.push(day)
          weekdaysAdded++
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
    }
    
    return days
  }

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return tasks.filter(task => task.scadenza === dateStr)
  }

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() - 1)
    setCurrentMonth(newMonth)
  }

  // Navigate to next month
  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + 1)
    setCurrentMonth(newMonth)
  }

  // Check if date is current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth()
  }

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const calendarDays = getCalendarDays(currentMonth)
  const dayNames = showWeekend 
    ? ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
    : ['Lun', 'Mar', 'Mer', 'Gio', 'Ven']

  return (
    <div className="mobile-calendar">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={goToPreviousMonth}
          className="mobile-button p-2 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="mobile-heading text-gray-900">
          {format(currentMonth, 'MMMM yyyy', { locale: it })}
        </h2>
        <button 
          onClick={goToNextMonth}
          className="mobile-button p-2 text-gray-600 hover:text-gray-900"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Day names header */}
      <div className={`grid gap-1 mb-2 ${showWeekend ? 'grid-cols-7' : 'grid-cols-5'}`}>
        {dayNames.map((dayName) => (
          <div key={dayName} className="text-center text-xs font-medium text-gray-600 py-2">
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={`grid gap-1 ${showWeekend ? 'grid-cols-7' : 'grid-cols-5'}`}>
        {calendarDays.map((day, index) => {
          const dayTasks = getTasksForDate(day)
          const isCurrentMonthDay = isCurrentMonth(day)
          const isTodayDay = isToday(day)
          
          return (
            <div 
              key={index}
              className={`
                min-h-[60px] p-1 border border-gray-200 rounded-lg
                ${isCurrentMonthDay ? 'bg-white' : 'bg-gray-50'}
                ${isTodayDay ? 'ring-2 ring-blue-500' : ''}
              `}
            >
              <div className="text-center mb-1">
                <span className={`
                  text-xs font-medium
                  ${isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'}
                  ${isTodayDay ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto' : ''}
                `}>
                  {day.getDate()}
                </span>
              </div>
              
              {/* Tasks */}
              <div className="space-y-1">
                {dayTasks.slice(0, 2).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick?.(task)}
                    className={`
                      text-xs p-1 rounded cursor-pointer truncate
                      ${getTaskColor(task)}
                      ${task.urgent ? 'ring-1 ring-red-500' : ''}
                    `}
                  >
                    <div className="font-medium truncate">{task.attivita}</div>
                    {task.ora && (
                      <div className="text-xs opacity-75">
                        {formatTimeWithoutSeconds(task.ora)}
                      </div>
                    )}
                  </div>
                ))}
                {dayTasks.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayTasks.length - 2} altre
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
