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
import { WeekendToggle } from '../components/settings/WeekendToggle'
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
      console.log('MonthPage: Loading activities for user:', user.id)
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          practices!inner(
            numero,
            cliente_id,
            controparti_ids,
            clients!practices_cliente_id_fkey(
              ragione,
              nome,
              cognome
            )
          )
        `)
        .eq('user_id', user.id)
        .order('data', { ascending: true })

      if (error) {
        console.error('MonthPage: Error loading activities:', error)
        setTasks([])
        return
      }

      console.log('MonthPage: Loaded activities:', data)

      // Convert activities to tasks format for compatibility
      const convertedTasks = (data || []).map(activity => {
        // Get practice number
        const practiceNumber = activity.practices?.numero || 'N/A'
        
        // Get client name
        const client = activity.practices?.clients
        const clientName = client ? (client.ragione || `${client.nome || ''} ${client.cognome || ''}`.trim()) : null
        
        // Get counterparties (for now, just show the first one if any)
        const counterparties = activity.practices?.controparti_ids || []
        const counterpartyName = counterparties.length > 0 ? 'Controparte' : null // TODO: Load actual counterparty names
        
        return {
          id: activity.id,
          user_id: activity.user_id,
          pratica: practiceNumber,
          attivita: activity.attivita,
          scadenza: activity.data,
          ora: activity.ora,
          stato: activity.stato,
          urgent: activity.urgent || false, // Use urgent field directly
          note: activity.note,
          cliente: clientName,
          controparte: counterpartyName,
          categoria: activity.categoria,
          evaso: activity.stato === 'done',
          created_at: activity.created_at,
          updated_at: activity.updated_at
        }
      })

      console.log('MonthPage: Converted tasks:', convertedTasks)
      setTasks(convertedTasks)
    } catch (error) {
      console.error('MonthPage: Error loading activities:', error)
      setTasks([])
    }
  }

  const handleTaskSave = async (taskData: Partial<Task>) => {
    try {
      console.log('MonthPage handleTaskSave called with:', taskData)
      
      // Map to activities table format
      const mappedData = {
        attivita: taskData.attivita,
        data: taskData.scadenza,
        ora: taskData.ora,
        stato: taskData.stato,
        urgent: taskData.urgent || false,
        note: taskData.note || null,
        categoria: taskData.categoria,
        user_id: user.id
      }
      
      console.log('MonthPage mappedData:', mappedData)

      if (selectedTask) {
        // Update existing activity
        const { error } = await supabase
          .from('activities')
          .update({
            ...mappedData,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedTask.id)

        if (error) throw error
      } else {
        // Create new activity
        const { error } = await supabase
          .from('activities')
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

      {/* Weekend Settings */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <WeekendToggle />
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
