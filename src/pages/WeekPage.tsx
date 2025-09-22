import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Task } from '../lib/calendar-utils'
import { Button } from '../components/ui/button'
import { WeeklyCalendar } from '../components/dashboard/WeeklyCalendar'
import { TaskDialog } from '../components/dashboard/TaskDialog'
import { ArrowLeft, Plus } from 'lucide-react'

interface WeekPageProps {
  user: User
  onBackToDashboard: () => void
}

export function WeekPage({ user, onBackToDashboard }: WeekPageProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('scadenza', { ascending: true })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }

  const handleTaskSave = async (taskData: Partial<Task>) => {
    try {
      console.log('WeekPage handleTaskSave called with:', taskData)
      
      // Map categoria to attivita for database compatibility
      const mappedData = {
        pratica: taskData.pratica,
        attivita: taskData.categoria || taskData.attivita,
        scadenza: taskData.scadenza,
        stato: taskData.stato,
        priorita: taskData.priorita,
        note: taskData.note || null,
        parte: taskData.parte || null,
        controparte: taskData.controparte || null,
        user_id: user.id
      }
      
      console.log('WeekPage mappedData:', mappedData)

      if (selectedTask) {
        // Update existing task
        const { error } = await supabase
          .from('tasks')
          .update({
            ...mappedData,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedTask.id)

        if (error) throw error
      } else {
        // Create new task
        const { error } = await supabase
          .from('tasks')
          .insert(mappedData)

        if (error) throw error
      }

      await loadTasks()
      setIsTaskDialogOpen(false)
      setSelectedTask(null)
    } catch (error) {
      console.error('Error saving task:', error)
    }
  }

  const handleNewTask = () => {
    setSelectedTask(null)
    setIsTaskDialogOpen(true)
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsTaskDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button onClick={onBackToDashboard} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna a Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Calendario Settimanale</h1>
          <Button onClick={handleNewTask} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuova Attività
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <WeeklyCalendar tasks={tasks} onTaskClick={handleTaskClick} />
      </div>

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        task={selectedTask}
        onSave={handleTaskSave}
      />
    </div>
  )
}
