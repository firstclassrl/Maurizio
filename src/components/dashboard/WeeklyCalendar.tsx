import { useState } from 'react'
import { Task } from '../../lib/calendar-utils'
import { Button } from '../ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMobile } from '../../hooks/useMobile'

interface WeeklyCalendarProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  onNavigateToMonth?: () => void
  onNavigateToDay?: () => void
}

export function WeeklyCalendar({ tasks, onTaskClick, onNavigateToMonth, onNavigateToDay }: WeeklyCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
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
      case 'APPUNTAMENTO IN STUDIO':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Check if task is urgent
  const isUrgentTask = (priorita: number) => {
    return priorita === 10
  }

  // Get the start of the week (Monday)
  const getWeekStart = (date: Date) => {
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(date.setDate(diff))
  }

  // Get all days of the current week (only weekdays for business calendar)
  const getWeekDays = (startDate: Date) => {
    const days = []
    for (let i = 0; i < 5; i++) { // Only Monday to Friday
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      days.push(day)
    }
    return days
  }

  const weekStart = getWeekStart(new Date(currentWeek))
  const weekDays = getWeekDays(weekStart)

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

  // Go to current week
  const goToCurrentWeek = () => {
    setCurrentWeek(new Date())
  }

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString('it-IT', { weekday: 'short' })
  }

  const formatDayNumber = (date: Date) => {
    return date.getDate()
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
  }


  return (
    <div className="bg-white">
      {/* Header with navigation and controls */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        {/* Filters Row */}
        <div className="flex items-center gap-4 mb-4">
          <select className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
            <option>Tutte le tipologie</option>
            <option>SCADENZA ATTO PROCESSUALE</option>
            <option>UDIENZA</option>
            <option>ATTIVITA' PROCESSUALE</option>
            <option>APPUNTAMENTO IN STUDIO</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
            <option>Tutte le categorie</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
            <option>Avvocato Maurizio</option>
          </select>
          <input 
            type="text" 
            placeholder="Filtra per autorità..." 
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
          />
        </div>
        
        {/* Checkboxes Row */}
        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" />
            Mostra evasi/non evasi
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" />
            Mostra da evadere/non evadere
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" />
            Mostra weekend
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" />
            Mostra tutto
          </label>
        </div>
        
        {/* Navigation Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button onClick={goToPreviousWeek} variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-lg font-semibold text-gray-800">
              {formatDayName(weekStart)} {formatDayNumber(weekStart)}/{weekStart.getMonth() + 1}
            </div>
            <Button onClick={goToCurrentWeek} variant="outline" size="sm">
              Oggi
            </Button>
            <Button onClick={goToNextWeek} variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Stampa</Button>
            <Button variant="outline" size="sm">Sincronizza</Button>
            <Button variant="outline" size="sm">Aggiungi</Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Impegni passati non evasi: {tasks.filter(task => new Date(task.scadenza) < new Date() && task.stato !== 'done').length}
          </div>
          <Button variant="outline" size="sm">Legenda</Button>
        </div>
      </div>

      {/* Calendar Title */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {weekStart.getDate()} - {weekDays[weekDays.length - 1].getDate()} {formatMonthYear(currentWeek).split(' ')[0]} {currentWeek.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onNavigateToMonth}
              className="bg-blue-100 text-blue-800 hover:bg-blue-200"
            >
              Mese
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-green-100 text-green-800"
            >
              Settimana
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onNavigateToDay}
            >
              Giorno
            </Button>
            <Button variant="outline" size="sm">Vai al giorno</Button>
          </div>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="p-4">
        {isMobile ? (
          // Mobile Layout - Vertical
          <div className="space-y-4">
            {weekDays.map((day, index) => {
              const dayTasks = getTasksForDate(day)
              const isToday = day.toDateString() === new Date().toDateString()
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg bg-white">
                  <div className="bg-gray-50 border-b border-gray-200 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`text-lg font-bold ${
                          isToday ? 'bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center' : 'text-gray-800'
                        }`}>
                          {formatDayNumber(day)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800 capitalize">
                            {formatDayName(day)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {day.toLocaleDateString('it-IT', { month: 'short' })}
                          </div>
                        </div>
                      </div>
                      {dayTasks.length > 0 && (
                        <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {dayTasks.length} attività
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-3 space-y-2">
                    {dayTasks.length === 0 ? (
                      <div className="text-center text-gray-400 text-sm py-4">
                        Nessuna attività
                      </div>
                    ) : (
                      dayTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-3 rounded border cursor-pointer hover:shadow-md transition-shadow ${
                            task.stato === 'done' 
                              ? 'bg-green-50 text-green-800 border-green-200' 
                              : getTaskColor(task)
                          }`}
                          onClick={() => onTaskClick?.(task)}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{task.pratica}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                <span>Parte: <span className="text-gray-900 font-bold">{task.parte || 'N/A'}</span></span>
                                <span className="text-gray-400 mx-1">•</span>
                                <span>Controparte: <span className="text-gray-900 font-bold">{task.controparte || 'N/A'}</span></span>
                              </div>
                              <div className="text-xs opacity-80 mt-1">{task.attivita}</div>
                              {isUrgentTask(task.priorita) && (
                                <div className="text-xs text-red-600 font-bold mt-1">URGENTE</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          // Desktop Layout - Grid like in screenshots
          <div className="grid grid-cols-5 gap-4">
            {weekDays.map((day, index) => {
              const dayTasks = getTasksForDate(day)
              const isToday = day.toDateString() === new Date().toDateString()
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg bg-white">
                  <div className="bg-gray-50 border-b border-gray-200 p-3">
                    <div className="text-center">
                      <div className={`text-lg font-bold ${
                        isToday ? 'bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto' : 'text-gray-800'
                      }`}>
                        {formatDayNumber(day)}
                      </div>
                      <div className="text-sm text-gray-600 capitalize mt-1">
                        {formatDayName(day)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 space-y-2">
                    {dayTasks.length === 0 ? (
                      <div className="text-center text-gray-400 text-sm py-4">
                        Nessuna attività
                      </div>
                    ) : (
                      dayTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-2 rounded border cursor-pointer hover:shadow-md transition-shadow ${
                            task.stato === 'done' 
                              ? 'bg-green-50 text-green-800 border-green-200' 
                              : getTaskColor(task)
                          }`}
                          onClick={() => onTaskClick?.(task)}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 mt-1">
                              <div className={`w-2 h-2 rounded-full ${
                                task.attivita === 'SCADENZA ATTO PROCESSUALE' ? 'bg-red-500' :
                                task.attivita === 'UDIENZA' ? 'bg-green-500' :
                                task.attivita === 'ATTIVITA\' PROCESSUALE' ? 'bg-yellow-500' :
                                'bg-gray-400'
                              }`}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-xs truncate">{task.pratica}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                <span className="text-gray-900 font-bold">{task.parte || 'N/A'}</span> - <span className="text-gray-900 font-bold">{task.controparte || 'N/A'}</span>
                              </div>
                              <div className="text-xs opacity-80 mt-1 truncate">{task.attivita}</div>
                              {isUrgentTask(task.priorita) && (
                                <div className="text-xs text-red-600 font-bold mt-1">URGENTE</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
