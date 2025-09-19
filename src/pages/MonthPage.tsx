import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Task } from '../lib/calendar-utils'
import { Button } from '../components/ui/button'
import { MonthlyCalendar } from '../components/dashboard/MonthlyCalendar'
import { TaskDialog } from '../components/dashboard/TaskDialog'
import { ArrowLeft, Plus } from 'lucide-react'

interface MonthPageProps {
  user: User
  onBackToDashboard: () => void
}

export function MonthPage({ user, onBackToDashboard }: MonthPageProps) {
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
      if (selectedTask) {
        // Update existing task
        const { error } = await supabase
          .from('tasks')
          .update({
            ...taskData,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedTask.id)

        if (error) throw error
      } else {
        // Create new task
        const { error } = await supabase
          .from('tasks')
          .insert({
            ...taskData,
            user_id: user.id
          })

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button onClick={onBackToDashboard} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna a Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Calendario Mensile</h1>
          <Button onClick={handleNewTask} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuova Attività
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <MonthlyCalendar tasks={tasks} />
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
