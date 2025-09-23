import { useState } from 'react'
import { Task } from '../../lib/calendar-utils'
import { Button } from '../ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMobile } from '../../hooks/useMobile'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { supabase } from '../../lib/supabase'

interface MonthlyCalendarProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  userId: string
  onTaskUpdate?: () => void
}

export function MonthlyCalendar({ tasks, onTaskClick, userId, onTaskUpdate }: MonthlyCalendarProps) {
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

  // Get the first day of the month
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1)
  }

  // Get all days to display in the calendar grid (only weekdays for business calendar)
  const getCalendarDays = (date: Date) => {
    const firstDay = getFirstDayOfMonth(date)
    
    // Start from Monday of the week containing the first day
    const startDate = new Date(firstDay)
    const dayOfWeek = firstDay.getDay()
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    startDate.setDate(firstDay.getDate() - daysToSubtract)
    
    const days = []
    const currentDate = new Date(startDate)
    
    // Generate 35 days (5 weeks) to fill the calendar, but only include weekdays
    for (let i = 0; i < 35; i++) {
      const day = new Date(currentDate)
      // Only include Monday to Friday (1-5)
      if (day.getDay() >= 1 && day.getDay() <= 5) {
        days.push(day)
      }
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
  const dayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven']

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result
    const sourceDate = calendarDays[parseInt(source.droppableId)]
    const destinationDate = calendarDays[parseInt(destination.droppableId)]

    if (sourceDate.toDateString() === destinationDate.toDateString()) return

    const task = tasks.find(t => t.id === result.draggableId)
    if (!task) return

    try {
      const newDate = destinationDate.toISOString().split('T')[0]
      
      const { error } = await supabase
        .from('tasks')
        .update({ 
          scadenza: newDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .eq('user_id', userId)

      if (error) throw error

      // Trigger parent update
      if (onTaskUpdate) {
        onTaskUpdate()
      }
    } catch (error) {
      console.error('Error updating task date:', error)
    }
  }

  return (
    <div className="bg-white w-full">
      {/* Header with navigation */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={goToPreviousMonth} variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-lg font-semibold text-gray-800">
              {formatMonthYear(currentMonth)}
            </div>
            <Button onClick={goToCurrentMonth} variant="outline" size="sm">
              Oggi
            </Button>
            <Button onClick={goToNextMonth} variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>


      {/* Main Calendar Grid - Full Width */}
      <div className="px-2 py-4">
        {isMobile ? (
          // Mobile Layout - Vertical
          <div className="space-y-4">
            {/* Day names header */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {dayNames.map((dayName) => (
                <div key={dayName} className="text-center text-sm font-medium text-gray-600 py-2 bg-gray-50 rounded">
                  {dayName}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-5 gap-2">
                {calendarDays.map((day, index) => {
                  const dayTasks = getTasksForDate(day)
                  const isCurrentMonthDay = isCurrentMonth(day)
                  const isTodayDay = isToday(day)
                  
                  return (
                    <Droppable key={index} droppableId={index.toString()}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`border border-gray-200 rounded-lg p-2 min-h-[120px] ${
                            !isCurrentMonthDay ? 'bg-gray-50 text-gray-400' : 'bg-white'
                          } ${snapshot.isDraggingOver ? 'bg-blue-50 border-blue-300' : ''}`}
                        >
                          <div className="text-center mb-2">
                            <div className={`text-sm font-medium ${
                              isTodayDay 
                                ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' 
                                : ''
                            }`}>
                              {day.getDate()}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            {dayTasks.slice(0, 2).map((task, taskIndex) => (
                              <Draggable key={task.id} draggableId={task.id} index={taskIndex}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`text-xs p-2 rounded border cursor-pointer hover:shadow-md transition-shadow ${
                                      task.stato === 'done' 
                                        ? 'bg-green-100 text-green-800 border-green-200' 
                                        : getTaskColor(task)
                                    } ${snapshot.isDragging ? 'opacity-50' : ''}`}
                                    onClick={() => onTaskClick?.(task)}
                                  >
                                    <div className="flex items-start gap-2">
                                           <div className="flex-shrink-0 mt-1">
                                             <div className={`w-2 h-2 rounded-full ${
                                               task.stato === 'done' ? 'bg-green-500' : 'bg-red-500'
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
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            {dayTasks.length > 2 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{dayTasks.length - 2}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Droppable>
                  )
                })}
              </div>
            </DragDropContext>
          </div>
        ) : (
          // Desktop Layout - Grid like in screenshots
          <div>
            {/* Day names header */}
            <div className="grid grid-cols-5 gap-1 mb-4">
              {dayNames.map((dayName) => (
                <div key={dayName} className="text-center text-sm font-medium text-gray-600 py-3 bg-gray-50 rounded-lg">
                  {dayName}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-5 gap-1 h-full">
                {calendarDays.map((day, index) => {
                  const dayTasks = getTasksForDate(day)
                  const isCurrentMonthDay = isCurrentMonth(day)
                  const isTodayDay = isToday(day)
                  
                  return (
                    <Droppable key={index} droppableId={index.toString()}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`border border-gray-200 rounded-lg p-4 min-h-[200px] ${
                            !isCurrentMonthDay ? 'bg-gray-50 text-gray-400' : 'bg-white'
                          } ${snapshot.isDraggingOver ? 'bg-blue-50 border-blue-300' : ''}`}
                        >
                          <div className="text-center mb-4">
                            <div className={`text-xl font-bold ${
                              isTodayDay 
                                ? 'bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto' 
                                : 'text-gray-800'
                            }`}>
                              {day.getDate()}
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            {dayTasks.slice(0, 4).map((task, taskIndex) => (
                              <Draggable key={task.id} draggableId={task.id} index={taskIndex}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`text-xs p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                                      task.stato === 'done' 
                                        ? 'bg-green-100 text-green-800 border-green-200' 
                                        : getTaskColor(task)
                                    } ${snapshot.isDragging ? 'opacity-50' : ''}`}
                                    onClick={() => onTaskClick?.(task)}
                                  >
                                    <div className="flex items-start gap-3">
                                           <div className="flex-shrink-0 mt-1">
                                             <div className={`w-3 h-3 rounded-full ${
                                               task.stato === 'done' ? 'bg-green-500' : 'bg-red-500'
                                             }`}></div>
                                           </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm mb-1">{task.pratica}</div>
                                        <div className="text-xs text-gray-600 mb-1">
                                          <span className="text-gray-900 font-bold">{task.parte || 'N/A'}</span> - <span className="text-gray-900 font-bold">{task.controparte || 'N/A'}</span>
                                        </div>
                                        <div className="text-xs opacity-80 mb-1">{task.attivita}</div>
                                        {isUrgentTask(task.priorita) && (
                                          <div className="text-xs text-red-600 font-bold">URGENTE</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            {dayTasks.length > 4 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{dayTasks.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Droppable>
                  )
                })}
              </div>
            </DragDropContext>
          </div>
        )}
      </div>
    </div>
  )
}
