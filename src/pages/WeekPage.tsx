import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Task } from '../lib/calendar-utils'
import { Button } from '../components/ui/button'
import { WeeklyCalendar } from '../components/dashboard/WeeklyCalendar'
import { TaskDialog } from '../components/dashboard/TaskDialog'
import { CategoryFilter } from '../components/ui/CategoryFilter'
import { PartyFilter } from '../components/ui/PartyFilter'
import { ArrowLeft, Plus } from 'lucide-react'

interface WeekPageProps {
  user: User
  onBackToDashboard: () => void
  onNavigateToMonth: () => void
  onNavigateToDay: () => void
}

export function WeekPage({ user, onBackToDashboard, onNavigateToMonth, onNavigateToDay }: WeekPageProps) {
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

  // Filter tasks by category and party
  const getFilteredTasks = () => {
    let filtered = tasks

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(task => task.attivita === selectedCategory)
    }

    // Filter by party/controparte
    if (selectedParty !== 'all') {
      if (selectedParty.startsWith('parte-')) {
        const partyName = selectedParty.replace('parte-', '')
        filtered = filtered.filter(task => task.parte === partyName)
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
        {/* Filter Section */}
        <div className="mb-6 flex gap-4">
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

        {/* Legend */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Legenda Colori</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Scadenza Atto Processuale</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Udienza</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Attività Processuale</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-cyan-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Appuntamento in Studio</span>
            </div>
          </div>
        </div>
        
        <WeeklyCalendar 
          tasks={getFilteredTasks()} 
          onTaskClick={handleTaskClick}
          onNavigateToMonth={onNavigateToMonth}
          onNavigateToDay={onNavigateToDay}
        />
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
