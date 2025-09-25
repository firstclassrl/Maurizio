import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Task } from '../lib/calendar-utils'
import { Button } from '../components/ui/button'
import { MonthlyCalendar } from '../components/dashboard/MonthlyCalendar'
import { TaskDialog } from '../components/dashboard/TaskDialog'
import { CategoryFilter } from '../components/ui/CategoryFilter'
import { PartyFilter } from '../components/ui/PartyFilter'
import { Footer } from '../components/ui/Footer'
import { ArrowLeft, CalendarDays } from 'lucide-react'

interface MonthPageProps {
  user: User
  onBackToDashboard: () => void
  onNavigateToWeek: () => void
}

export function MonthPage({ user, onBackToDashboard, onNavigateToWeek }: MonthPageProps) {
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
      console.log('MonthPage: Loading tasks for user:', user.id)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('scadenza', { ascending: true })

      if (error) {
        console.error('MonthPage: Error loading tasks:', error)
        // Se la tabella tasks non esiste, mostra un array vuoto
        if (error.code === 'PGRST116' || error.message.includes('relation "public.tasks" does not exist')) {
          console.warn('MonthPage: Tasks table does not exist, showing empty list')
          setTasks([])
          return
        }
        throw error
      }

      console.log('MonthPage: Loaded tasks:', data)
      setTasks(data || [])
    } catch (error) {
      console.error('MonthPage: Error loading tasks:', error)
      setTasks([])
    }
  }

  const handleTaskSave = async (taskData: Partial<Task>) => {
    try {
      console.log('MonthPage handleTaskSave called with:', taskData)
      
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
      
      console.log('MonthPage mappedData:', mappedData)

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-blue-50 shadow-sm border-b border-blue-200">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 mr-8">
            <Button onClick={onBackToDashboard} variant="outline" size="sm">
              <ArrowLeft className="h-3 w-3 mr-1" />
              Torna a Dashboard
            </Button>
            <Button onClick={onNavigateToWeek} variant="outline" size="sm" className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300">
              <CalendarDays className="h-3 w-3 mr-1" />
              Settimana
            </Button>
          </div>
          <div className="flex-1 flex justify-center">
            <h1 className="text-xl font-bold text-gray-900">Calendario Mensile</h1>
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

      {/* Main Content */}
      <div className="flex-1">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-500 text-lg mb-2">Nessuna attività trovata</p>
              <p className="text-gray-400 text-sm">
                Le attività appariranno qui quando verranno create dalla Dashboard
              </p>
            </div>
          </div>
        ) : (
          <MonthlyCalendar 
            tasks={getFilteredTasks()} 
            onTaskClick={handleTaskClick}
            userId={user.id}
            onTaskUpdate={loadTasks}
          />
        )}
      </div>

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
