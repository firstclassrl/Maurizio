import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Task } from '../lib/calendar-utils'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { TaskList } from '../components/dashboard/TaskList'
import { Calendar } from '../components/dashboard/Calendar'
import { TaskDialog } from '../components/dashboard/TaskDialog'

interface DashboardPageProps {
  user: User
}

export function DashboardPage({ user }: DashboardPageProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'done'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)

  useEffect(() => {
    loadTasks()
  }, [])

  // Filter tasks based on status and search query
  useEffect(() => {
    let filtered = tasks

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.stato === statusFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(task => 
        task.pratica.toLowerCase().includes(query) ||
        task.attivita.toLowerCase().includes(query)
      )
    }

    setFilteredTasks(filtered)
  }, [tasks, statusFilter, searchQuery])

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

  const handleTaskDelete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error
      await loadTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleTaskEdit = (task: Task) => {
    setSelectedTask(task)
    setIsTaskDialogOpen(true)
  }

  const handleNewTask = () => {
    setSelectedTask(null)
    setIsTaskDialogOpen(true)
  }

  const handleDateChange = async (taskId: string, newDate: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          scadenza: newDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)

      if (error) throw error
      await loadTasks()
    } catch (error) {
      console.error('Error updating task date:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onNewTask={handleNewTask}
        onLogout={handleLogout}
        tasks={filteredTasks}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task List */}
          <div className="space-y-4">
            <TaskList
              tasks={filteredTasks}
              onEdit={handleTaskEdit}
              onDelete={handleTaskDelete}
            />
          </div>

          {/* Calendar */}
          <div className="space-y-4">
            <Calendar
              currentDate={currentDate}
              viewMode={viewMode}
              tasks={filteredTasks}
              onDateChange={handleDateChange}
            />
          </div>
        </div>
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