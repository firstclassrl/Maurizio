import { useState } from 'react'
import { Task } from '../../lib/calendar-utils'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface WeeklyCalendarProps {
  tasks: Task[]
}

export function WeeklyCalendar({ tasks }: WeeklyCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())

  // Get the start of the week (Monday)
  const getWeekStart = (date: Date) => {
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(date.setDate(diff))
  }

  // Get all days of the current week
  const getWeekDays = (startDate: Date) => {
    const days = []
    for (let i = 0; i < 7; i++) {
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
    return date.toLocaleDateString('it-IT', { weekday: 'long' })
  }

  const formatDayNumber = (date: Date) => {
    return date.getDate().toString().padStart(2, '0')
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">
            {formatMonthYear(currentWeek)}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={goToPreviousWeek} variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button onClick={goToCurrentWeek} variant="outline" size="sm">
              Oggi
            </Button>
            <Button onClick={goToNextWeek} variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const dayTasks = getTasksForDate(day)
            const isToday = day.toDateString() === new Date().toDateString()
            
            return (
              <div key={index} className="border rounded-lg p-3 min-h-[120px]">
                <div className="text-center mb-2">
                  <div className="text-sm text-gray-600 capitalize">
                    {formatDayName(day)}
                  </div>
                  <div className={`text-lg font-semibold ${
                    isToday ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''
                  }`}>
                    {formatDayNumber(day)}
                  </div>
                </div>
                
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={`text-xs p-1 rounded truncate ${
                        task.stato === 'done' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}
                      title={task.pratica + ' - ' + task.attivita}
                    >
                      {task.pratica}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayTasks.length - 3} altre
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
