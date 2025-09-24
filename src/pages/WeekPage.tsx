import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Task } from '../lib/calendar-utils'
import { Button } from '../components/ui/button'
import { WeeklyCalendar } from '../components/dashboard/WeeklyCalendar'
import { TaskDialog } from '../components/dashboard/TaskDialog'
import { CategoryFilter } from '../components/ui/CategoryFilter'
import { PartyFilter } from '../components/ui/PartyFilter'
import { Footer } from '../components/ui/Footer'
import { ArrowLeft, Calendar } from 'lucide-react'

interface WeekPageProps {
  user: User
  onBackToDashboard: () => void
  onNavigateToMonth: () => void
}

export function WeekPage({ user, onBackToDashboard, onNavigateToMonth }: WeekPageProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedParty, setSelectedParty] = useState('all')

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
        urgent: taskData.urgent,
        note: taskData.note || null,
        cliente: taskData.cliente || null,
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


  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsTaskDialogOpen(true)
  }

  const handleTaskMove = async (taskId: string, newDate: string) => {
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
      console.error('Error moving task:', error)
    }
  }

  // Filter tasks by category and party
  const getFilteredTasks = () => {
    let filtered = tasks

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(task => task.attivita === selectedCategory)
    }

    // Filter by cliente/controparte
    if (selectedParty !== 'all') {
      if (selectedParty.startsWith('cliente-')) {
        const clienteName = selectedParty.replace('cliente-', '')
        filtered = filtered.filter(task => task.cliente === clienteName)
      } else if (selectedParty.startsWith('controparte-')) {
        const controparteName = selectedParty.replace('controparte-', '')
        filtered = filtered.filter(task => task.controparte === controparteName)
      }
    }

    return filtered
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 mr-8">
            <Button onClick={onBackToDashboard} variant="outline" size="sm">
              <ArrowLeft className="h-3 w-3 mr-1" />
              Torna a Dashboard
            </Button>
            <Button onClick={onNavigateToMonth} variant="outline" size="sm" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300">
              <Calendar className="h-3 w-3 mr-1" />
              Mese
            </Button>
          </div>
          <div className="flex-1 flex justify-center">
            <h1 className="text-xl font-bold text-gray-900">Calendario Settimanale</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-4">
              <CategoryFilter 
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
              <PartyFilter 
                selectedParty={selectedParty}
                onPartyChange={setSelectedParty}
                tasks={tasks}
              />
            </div>
          </div>
        </div>
      </div>

      
      <WeeklyCalendar 
        tasks={getFilteredTasks()} 
        onTaskClick={handleTaskClick}
        onTaskMove={handleTaskMove}
      />

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        task={selectedTask}
        onSave={handleTaskSave}
      />
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
