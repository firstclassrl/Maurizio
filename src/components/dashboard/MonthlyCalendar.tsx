import { useState } from 'react'
import { Task } from '../../lib/calendar-utils'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { ChevronLeft, ChevronRight, Home } from 'lucide-react'
import { useMobile } from '../../hooks/useMobile'

interface MonthlyCalendarProps {
  tasks: Task[]
  onBackToDashboard?: () => void
  onTaskClick?: (task: Task) => void
}

export function MonthlyCalendar({ tasks, onBackToDashboard, onTaskClick }: MonthlyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const isMobile = useMobile()

  // Generate colors based on category
  const getTaskColor = (task: Task) => {
    switch (task.attivita) {
      case 'SCADENZA ATTO PROCESSUALE':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'UDIENZA':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'ATTIVITA\' PROCESSUALE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Check if task is urgent
  const isUrgentTask = (priorita: number) => {
    return priorita === 10
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
    
    // Generate 42 days (6 weeks) to fill the calendar
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
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

  // Go to current month
  const goToCurrentMonth = () => {
    setCurrentMonth(new Date())
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth() && 
           date.getFullYear() === currentMonth.getFullYear()
  }

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString()
  }

  const calendarDays = getCalendarDays(currentMonth)
  const dayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">
            {formatMonthYear(currentMonth)}
          </CardTitle>
          <div className="flex items-center gap-2">
            {onBackToDashboard && (
              <Button onClick={onBackToDashboard} variant="outline" size="sm">
                <Home className="h-4 w-4 mr-1" />
                Dashboard
              </Button>
            )}
            <Button onClick={goToPreviousMonth} variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button onClick={goToCurrentMonth} variant="outline" size="sm">
              Oggi
            </Button>
            <Button onClick={goToNextMonth} variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          // Mobile Layout - Compact Grid
          <div>
            {/* Day names header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((dayName) => (
                <div key={dayName} className="text-center text-xs font-medium text-gray-600 py-1">
                  {dayName}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dayTasks = getTasksForDate(day)
                const isCurrentMonthDay = isCurrentMonth(day)
                const isTodayDay = isToday(day)
                
                return (
                  <div 
                    key={index} 
                    className={`border rounded p-1 min-h-[60px] ${
                      !isCurrentMonthDay ? 'bg-gray-50 text-gray-400' : 'bg-white'
                    }`}
                  >
                    <div className="text-center mb-1">
                      <div className={`text-xs font-medium ${
                        isTodayDay 
                          ? 'bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center mx-auto text-xs' 
                          : ''
                      }`}>
                        {day.getDate()}
                      </div>
                    </div>
                    
                    <div className="space-y-0.5">
                      {dayTasks.slice(0, 1).map((task) => (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded border cursor-pointer hover:shadow-md transition-shadow ${
                            task.stato === 'done' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : getTaskColor(task)
                          }`}
                          title={`${task.pratica} - ${task.attivita} - Parte: ${task.parte || 'N/A'} - Controparte: ${task.controparte || 'N/A'}`}
                          onClick={() => onTaskClick?.(task)}
                        >
                          <div className="font-medium truncate text-xs">{task.pratica}</div>
                          <div className="mt-1 p-1 bg-gray-50 rounded border">
                            <div className="grid grid-cols-2 gap-1 text-xs">
                              <div className="text-center">
                                <div className="text-gray-500 text-xs font-medium">PARTE</div>
                                <div className="text-gray-800 font-semibold bg-white px-1 py-0.5 rounded border text-xs truncate">
                                  {task.parte || 'N/A'}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-gray-500 text-xs font-medium">CONTRAPARTE</div>
                                <div className="text-gray-800 font-semibold bg-white px-1 py-0.5 rounded border text-xs truncate">
                                  {task.controparte || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </div>
                          {isUrgentTask(task.priorita) && (
                            <div className="text-xs text-red-600 font-bold">!</div>
                          )}
                        </div>
                      ))}
                      {dayTasks.length > 1 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayTasks.length - 1}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          // Desktop Layout - Original
          <div>
            {/* Day names header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((dayName) => (
                <div key={dayName} className="text-center text-sm font-medium text-gray-600 py-2">
                  {dayName}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dayTasks = getTasksForDate(day)
                const isCurrentMonthDay = isCurrentMonth(day)
                const isTodayDay = isToday(day)
                
                return (
                  <div 
                    key={index} 
                    className={`border rounded-lg p-2 min-h-[100px] ${
                      !isCurrentMonthDay ? 'bg-gray-50 text-gray-400' : 'bg-white'
                    }`}
                  >
                    <div className="text-center mb-1">
                      <div className={`text-sm font-medium ${
                        isTodayDay 
                          ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto' 
                          : ''
                      }`}>
                        {day.getDate()}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {dayTasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded border cursor-pointer hover:shadow-md transition-shadow ${
                            task.stato === 'done' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : getTaskColor(task)
                          }`}
                          title={`${task.pratica} - ${task.attivita} - Parte: ${task.parte || 'N/A'} - Controparte: ${task.controparte || 'N/A'}`}
                          onClick={() => onTaskClick?.(task)}
                        >
                          <div className="font-medium truncate text-xs">{task.pratica}</div>
                          <div className="text-xs opacity-80 truncate">{task.attivita}</div>
                          <div className="mt-1 p-1 bg-gray-50 rounded border">
                            <div className="grid grid-cols-2 gap-1 text-xs">
                              <div className="text-center">
                                <div className="text-gray-500 text-xs font-medium">PARTE</div>
                                <div className="text-gray-800 font-semibold bg-white px-1 py-0.5 rounded border text-xs truncate">
                                  {task.parte || 'N/A'}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-gray-500 text-xs font-medium">CONTRAPARTE</div>
                                <div className="text-gray-800 font-semibold bg-white px-1 py-0.5 rounded border text-xs truncate">
                                  {task.controparte || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </div>
                          {isUrgentTask(task.priorita) && (
                            <div className="text-xs text-red-600 font-bold">URGENTE</div>
                          )}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayTasks.length - 2}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
