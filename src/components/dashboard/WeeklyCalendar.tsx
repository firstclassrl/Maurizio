import { useState } from 'react'
import { Task } from '../../lib/calendar-utils'
import { Button } from '../ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMobile } from '../../hooks/useMobile'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { format } from 'date-fns'
import { PracticeFilter } from '../ui/PracticeFilter'
import { formatTimeWithoutSeconds } from '../../lib/time-utils'
import { useWeekendSettings } from '../../hooks/useWeekendSettings'
import { useActivityTooltip } from '../../hooks/useActivityTooltip'
import { ActivityTooltip } from '../ui/ActivityTooltip'
import { WeekendToggleCompact } from '../settings/WeekendToggleCompact'

interface WeeklyCalendarProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  onTaskMove?: (taskId: string, newDate: string) => void
}

export function WeeklyCalendar({ tasks, onTaskClick, onTaskMove }: WeeklyCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedPractice, setSelectedPractice] = useState<string>('all')
  const isMobile = useMobile()
  const { showWeekend } = useWeekendSettings()
  const { tooltip, handleMouseEnter, handleMouseLeave } = useActivityTooltip(2000)

  // Generate colors based on category
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

  // Check if task is urgent
  const isUrgentTask = (urgent: boolean) => {
    return urgent
  }

  // Get the start of the week (Monday)
  const getWeekStart = (date: Date) => {
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(date.setDate(diff))
  }

  // Get all days of the current week (weekdays or full week based on settings)
  const getWeekDays = (startDate: Date) => {
    const days = []
    if (showWeekend) {
      // Show full week (Monday to Sunday)
      for (let i = 0; i < 7; i++) {
        const day = new Date(startDate)
        day.setDate(startDate.getDate() + i)
        days.push(day)
      }
    } else {
      // Show only weekdays (Monday to Friday)
      for (let i = 0; i < 5; i++) {
        const day = new Date(startDate)
        day.setDate(startDate.getDate() + i)
        days.push(day)
      }
    }
    return days
  }

  const weekStart = getWeekStart(new Date(currentWeek))
  const weekDays = getWeekDays(weekStart)

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return tasks.filter(task => {
      const matchesDate = task.scadenza === dateStr
      const matchesPractice = selectedPractice === 'all' || task.pratica === selectedPractice
      return matchesDate && matchesPractice
    })
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

  // Handle drag and drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onTaskMove) return

    const { draggableId, destination } = result
    const newDate = format(weekDays[parseInt(destination.droppableId)], 'yyyy-MM-dd')
    
    onTaskMove(draggableId, newDate)
  }



  return (
    <div className="bg-white w-full">
      {/* Header with navigation */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
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
          <div className="flex items-center gap-4">
            <WeekendToggleCompact />
            <PracticeFilter 
              selectedPractice={selectedPractice}
              onPracticeChange={setSelectedPractice}
              tasks={tasks}
            />
          </div>
        </div>
      </div>

      {/* Legend - Single Row */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="font-medium">Legenda Categorie:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
            <span>Appuntamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
            <span>Scadenza</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
            <span>Attività da Svolgere</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
            <span>Udienza</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
            <span>Scadenza Processuale</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
            <span>Attività Processuale</span>
          </div>
        </div>
      </div>


      {/* Main Calendar Grid - Full Width */}
      <div className="px-2 py-4">
        <DragDropContext onDragEnd={handleDragEnd}>
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
                  
                  <Droppable droppableId={index.toString()}>
                    {(provided) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="p-3 space-y-2 min-h-[100px]"
                      >
                        {dayTasks.length === 0 ? (
                          <div className="text-center text-gray-400 text-sm py-4">
                            Nessuna attività
                          </div>
                        ) : (
                          dayTasks.map((task, taskIndex) => (
                            <Draggable key={task.id} draggableId={task.id} index={taskIndex}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`p-1.5 rounded border cursor-pointer hover:shadow-md transition-shadow ${
                                    task.stato === 'done' 
                                      ? 'bg-green-50 text-green-800 border-green-200' 
                                      : getTaskColor(task)
                                  } ${snapshot.isDragging ? 'opacity-50' : ''}`}
                                  onClick={() => onTaskClick?.(task)}
                                  onMouseEnter={(e) => handleMouseEnter(task, e)}
                                  onMouseLeave={handleMouseLeave}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="flex-shrink-0">
                                      <div className={`w-2 h-2 rounded-full ${
                                        task.stato === 'done' ? 'bg-green-500' : 'bg-red-500'
                                      }`}></div>
                                    </div>
                                    <div className="flex-1 min-w-0 text-[10px] overflow-hidden">
                                      <div className="flex items-center gap-0.5 whitespace-nowrap">
                                        {task.ora && (
                                          <span className="font-medium text-gray-600 text-[10px] leading-tight">
                                            {formatTimeWithoutSeconds(task.ora)}
                                          </span>
                                        )}
                                        <span className="font-semibold text-gray-900 text-[10px] leading-tight">{task.cliente || 'N/A'}</span>
                                        {task.controparte && (
                                          <>
                                            <span className="text-gray-500 text-[10px] leading-tight">/</span>
                                            <span className="font-semibold text-gray-900 text-[10px] leading-tight">{task.controparte}</span>
                                          </>
                                        )}
                                        <span className="text-gray-600 text-[10px] leading-tight">- {task.attivita}</span>
                                        {isUrgentTask(task.urgent) && (
                                          <span className="text-red-600 font-semibold text-[10px] leading-tight">URGENTE</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        ) : (
          // Desktop Layout - Full width grid
          <div className={`grid gap-1 h-full ${showWeekend ? 'grid-cols-7' : 'grid-cols-5'}`}>
            {weekDays.map((day, index) => {
              const dayTasks = getTasksForDate(day)
              const isToday = day.toDateString() === new Date().toDateString()
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg bg-white min-h-[400px]">
                  <div className="bg-gray-50 border-b border-gray-200 p-4">
                    <div className="text-center">
                      <div className={`text-xl font-bold ${
                        isToday ? 'bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto' : 'text-gray-800'
                      }`}>
                        {formatDayNumber(day)}
                      </div>
                      <div className="text-sm text-gray-600 capitalize mt-2 font-medium">
                        {formatDayName(day)}
                      </div>
                    </div>
                  </div>
                  
                  <Droppable droppableId={index.toString()}>
                    {(provided) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="p-4 space-y-3 min-h-[300px]"
                      >
                        {dayTasks.length === 0 ? (
                          <div className="text-center text-gray-400 text-sm py-8">
                            Nessuna attività
                          </div>
                        ) : (
                          dayTasks.map((task, taskIndex) => (
                            <Draggable key={task.id} draggableId={task.id} index={taskIndex}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`p-1.5 rounded border cursor-pointer hover:shadow-md transition-shadow ${
                                    task.stato === 'done' 
                                      ? 'bg-green-50 text-green-800 border-green-200' 
                                      : getTaskColor(task)
                                  } ${snapshot.isDragging ? 'opacity-50' : ''}`}
                                  onClick={() => onTaskClick?.(task)}
                                  onMouseEnter={(e) => handleMouseEnter(task, e)}
                                  onMouseLeave={handleMouseLeave}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="flex-shrink-0">
                                      <div className={`w-2 h-2 rounded-full ${
                                        task.stato === 'done' ? 'bg-green-500' : 'bg-red-500'
                                      }`}></div>
                                    </div>
                                    <div className="flex-1 min-w-0 text-[10px] overflow-hidden">
                                      <div className="flex items-center gap-0.5 whitespace-nowrap">
                                        {task.ora && (
                                          <span className="font-medium text-gray-600 text-[10px] leading-tight">
                                            {formatTimeWithoutSeconds(task.ora)}
                                          </span>
                                        )}
                                        <span className="font-semibold text-gray-900 text-[10px] leading-tight">{task.cliente || 'N/A'}</span>
                                        {task.controparte && (
                                          <>
                                            <span className="text-gray-500 text-[10px] leading-tight">/</span>
                                            <span className="font-semibold text-gray-900 text-[10px] leading-tight">{task.controparte}</span>
                                          </>
                                        )}
                                        <span className="text-gray-600 text-[10px] leading-tight">- {task.attivita}</span>
                                        {isUrgentTask(task.urgent) && (
                                          <span className="text-red-600 font-semibold text-[10px] leading-tight">URGENTE</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        )}
        </DragDropContext>
      </div>

      {/* Activity Tooltip */}
      <ActivityTooltip
        task={tooltip.task!}
        isVisible={tooltip.isVisible}
        position={tooltip.position}
      />
    </div>
  )
}
