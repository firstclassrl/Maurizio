import { useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Task, buildMonthGrid, buildWeekGrid, getWeekDayNames, CalendarDay } from '../../lib/calendar-utils'
import { Calendar as CalendarIcon } from 'lucide-react'

interface CalendarProps {
  currentDate: Date
  viewMode: 'month' | 'week'
  tasks: Task[]
  onDateChange: (taskId: string, newDate: string) => void
}

export function Calendar({ currentDate, viewMode, tasks, onDateChange }: CalendarProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  const weekDays = getWeekDayNames()
  const calendarData = viewMode === 'month' 
    ? buildMonthGrid(currentDate, tasks)
    : [buildWeekGrid(currentDate, tasks)]

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault()
    if (draggedTask) {
      const newDateString = format(targetDate, 'yyyy-MM-dd')
      onDateChange(draggedTask.id, newDateString)
      setDraggedTask(null)
    }
  }

  const TaskCard = ({ task }: { task: Task }) => {
    const isOverdue = new Date(task.scadenza) < new Date() && task.stato === 'todo'
    
    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, task)}
        className={`p-2 rounded text-xs cursor-move transition-all hover:shadow-md ${
          task.stato === 'done'
            ? 'bg-green-100 text-green-800 border border-green-200'
            : isOverdue
            ? 'bg-red-100 text-red-800 border border-red-200'
            : 'bg-blue-100 text-blue-800 border border-blue-200'
        }`}
        title={`${task.pratica} - ${task.attivita}`}
      >
        {/* RIGA 1: Numero pratica - attivita' - Cliente - Controparte - categoria attivita' - semaforo rosso */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1 flex-1 text-xs">
            <span className="text-gray-600">
              Pratica: <span className="font-semibold text-gray-900">{task.pratica}</span>
            </span>
            <span className="text-gray-600">
              attivita': <span className="font-bold text-gray-900">{task.attivita}</span>
            </span>
            {task.cliente && (
              <span className="text-gray-600">
                Cliente: <span className="font-bold text-gray-900">{task.cliente}</span>
              </span>
            )}
            {task.controparte && (
              <span className="text-gray-600">
                Controparte: <span className="font-bold text-gray-900">{task.controparte}</span>
              </span>
            )}
            <span className="text-xs px-1 py-0.5 rounded-full bg-gray-200 text-gray-800 border border-gray-300">
              {task.categoria}
            </span>
          </div>
          {/* Semaforo rosso per scadenze */}
          {isOverdue && (
            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
          )}
        </div>
        
        {/* RIGA 2: ora - data - note - eventuale urgente */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 flex-1 text-xs">
            {task.ora && (
              <span className="text-gray-600">
                ora: <span className="font-medium text-gray-900">{task.ora}</span>
              </span>
            )}
            <span className="text-gray-600">
              data: <span className="font-medium text-gray-900">{new Date(task.scadenza).toLocaleDateString('it-IT')}</span>
            </span>
            {task.note && (
              <span className="text-gray-600">
                note: <span className="font-medium text-gray-900 italic">{task.note}</span>
              </span>
            )}
          </div>
          {task.urgent && (
            <span className="px-1 py-0.5 rounded text-xs font-medium bg-red-200 text-red-800">
              URGENTE
            </span>
          )}
        </div>
      </div>
    )
  }

  const CalendarDayCell = ({ day }: { day: CalendarDay }) => (
    <div
      className={`min-h-[120px] p-2 border border-gray-200 transition-colors ${
        day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
      } ${
        day.isToday ? 'bg-blue-50 border-blue-300' : ''
      } ${
        day.isPast && !day.isToday ? 'bg-gray-50' : ''
      }`}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, day.date)}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${
          day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
        } ${
          day.isToday ? 'text-blue-600 font-bold' : ''
        }`}>
          {day.dayNumber}
        </span>
        {day.tasks.length > 0 && (
          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {day.tasks.length}
          </div>
        )}
      </div>
      
      <div className="space-y-1 calendar-day-cards max-h-20 overflow-y-auto">
        {day.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Calendario {viewMode === 'month' ? 'Mensile' : 'Settimanale'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 bg-gray-100 rounded">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="space-y-1">
            {calendarData.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIndex) => (
                  <CalendarDayCell key={`${weekIndex}-${dayIndex}`} day={day} />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 pt-4 border-t text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
              <span>Da fare</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
              <span>Completato</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
              <span>Scaduto</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-50 border border-blue-300 rounded"></div>
              <span>Oggi</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            💡 Trascina le attività per cambiare la data di scadenza
          </p>
        </div>
      </CardContent>
    </Card>
  )
}