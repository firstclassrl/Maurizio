import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Task } from '../lib/calendar-utils'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent } from '../components/ui/card'
import { TaskDialog } from '../components/dashboard/TaskDialog'
import { WeeklyCalendar } from '../components/dashboard/WeeklyCalendar'
import { MonthlyCalendar } from '../components/dashboard/MonthlyCalendar'
import { Plus, LogOut } from 'lucide-react'

interface DashboardPageProps {
  user: User
}

export function DashboardPage({ user }: DashboardPageProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [currentView, setCurrentView] = useState<'dashboard' | 'calendar'>('dashboard')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)

  // Form fields for new task
  const [newPratica, setNewPratica] = useState('')
  const [newAttivita, setNewAttivita] = useState('')
  const [newScadenza, setNewScadenza] = useState('')
  const [newOra, setNewOra] = useState('')

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

  const handleQuickAdd = async () => {
    if (!newPratica.trim() || !newAttivita.trim() || !newScadenza.trim()) {
      alert('Per favore compila tutti i campi obbligatori')
      return
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          pratica: newPratica.trim(),
          attivita: newAttivita.trim(),
          scadenza: newScadenza,
          stato: 'todo',
          priorita: 5
        })

      if (error) throw error

      // Clear form
      setNewPratica('')
      setNewAttivita('')
      setNewScadenza('')
      setNewOra('')
      await loadTasks()
    } catch (error) {
      console.error('Error adding task:', error)
      alert('Errore durante l\'aggiunta della pratica')
    }
  }


  const handleNewTask = () => {
    setSelectedTask(null)
    setIsTaskDialogOpen(true)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
  }

  const handleViewModeChange = (mode: 'month' | 'week') => {
    setViewMode(mode)
    setCurrentView('calendar')
  }

  // Get today's tasks
  const getTodayTasks = () => {
    const today = new Date().toISOString().split('T')[0]
    return tasks.filter(task => task.scadenza === today)
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with logout */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Legal Planner</h1>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="flex mb-6">
          <button
            onClick={() => handleViewModeChange('month')}
            className={`px-8 py-3 text-white font-medium rounded-l-lg ${
              viewMode === 'month' && currentView === 'calendar'
                ? 'bg-blue-900' 
                : 'bg-green-800 hover:bg-green-700'
            }`}
          >
            PER MESE
          </button>
          <button
            onClick={() => handleViewModeChange('week')}
            className={`px-8 py-3 text-white font-medium rounded-r-lg ${
              viewMode === 'week' && currentView === 'calendar'
                ? 'bg-blue-900' 
                : 'bg-green-800 hover:bg-green-700'
            }`}
          >
            PER SETTIMANA
          </button>
        </div>

        {/* Quick Add Form */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Aggiungi Nuova Pratica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="pratica">Pratica</Label>
                <Input
                  id="pratica"
                  value={newPratica}
                  onChange={(e) => setNewPratica(e.target.value)}
                  placeholder="Nome della pratica"
                />
              </div>
              <div>
                <Label htmlFor="attivita">Attività</Label>
                <Input
                  id="attivita"
                  value={newAttivita}
                  onChange={(e) => setNewAttivita(e.target.value)}
                  placeholder="Descrizione attività"
                />
              </div>
              <div>
                <Label htmlFor="scadenza">Scadenza</Label>
                <Input
                  id="scadenza"
                  type="date"
                  value={newScadenza}
                  onChange={(e) => setNewScadenza(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ora">Ora (opzionale)</Label>
                <Input
                  id="ora"
                  type="time"
                  value={newOra}
                  onChange={(e) => setNewOra(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={handleQuickAdd} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Pratica
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Today's Tasks Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">GLI IMPEGNI PER OGGI</h3>
            {getTodayTasks().length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nessun impegno per oggi! 🎉
              </p>
            ) : (
              <div className="space-y-3">
                {getTodayTasks().map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{task.pratica}</div>
                      <div className="text-sm text-gray-600">{task.attivita}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.stato === 'done' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {task.stato === 'done' ? 'Completato' : 'Da fare'}
                      </span>
                      <Button
                        onClick={() => {
                          setSelectedTask(task)
                          setIsTaskDialogOpen(true)
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Modifica
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calendar Section - Only show when calendar view is active */}
        {currentView === 'calendar' && (
          <div className="bg-purple-800 rounded-lg">
            {/* Header */}
            <div className="bg-purple-800 px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                {viewMode === 'month' ? 'CALENDARIO MENSILE' : 'CALENDARIO SETTIMANALE'}
              </h2>
              <Button
                onClick={handleNewTask}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-purple-700"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            {/* Calendar Content */}
            <div className="bg-white rounded-b-lg p-6">
              {viewMode === 'month' ? (
                <MonthlyCalendar tasks={tasks} onBackToDashboard={handleBackToDashboard} />
              ) : (
                <WeeklyCalendar tasks={tasks} onBackToDashboard={handleBackToDashboard} />
              )}
            </div>
          </div>
        )}
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