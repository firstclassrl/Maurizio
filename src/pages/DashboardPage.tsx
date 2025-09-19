import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Task } from '../lib/calendar-utils'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent } from '../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { TaskDialog } from '../components/dashboard/TaskDialog'
import { Logo } from '../components/ui/Logo'
import { MessageModal } from '../components/ui/MessageModal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useMessage } from '../hooks/useMessage'
import { Plus, LogOut, Calendar, CalendarDays, RefreshCw, Trash2 } from 'lucide-react'

interface DashboardPageProps {
  user: User
  onNavigateToMonth: () => void
  onNavigateToWeek: () => void
}

export function DashboardPage({ user, onNavigateToMonth, onNavigateToWeek }: DashboardPageProps) {
  const { message, showError, showSuccess, hideMessage } = useMessage()
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)

  // Form fields for new task
  const [newPratica, setNewPratica] = useState('')
  const [newCategoria, setNewCategoria] = useState('')
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

  // Get category color for tasks
  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'SCADENZA ATTO PROCESSUALE':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'UDIENZA':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'ATTIVITA\' PROCESSUALE':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleTaskSave = async (taskData: Partial<Task>) => {
    try {
      // Map categoria to attivita for database compatibility
      const mappedData = {
        ...taskData,
        attivita: taskData.categoria || taskData.attivita,
        categoria: undefined // Remove categoria field
      }

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
          .insert({
            ...mappedData,
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
    if (!newPratica.trim() || !newCategoria.trim() || !newScadenza.trim()) {
      showError('Campi obbligatori', 'Per favore compila tutti i campi obbligatori')
      return
    }

    // Validate date is not in the past
    const selectedDate = new Date(newScadenza)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day
    
    if (selectedDate < today) {
      showError('Data non valida', 'Non è possibile creare pratiche con date precedenti a oggi')
      return
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          pratica: newPratica.trim(),
          attivita: newCategoria.trim(),
          scadenza: newScadenza,
          stato: 'todo',
          priorita: 5
        })

      if (error) throw error

      // Clear form
      setNewPratica('')
      setNewCategoria('')
      setNewScadenza('')
      setNewOra('')
      await loadTasks()
      showSuccess('Pratica aggiunta', 'La pratica è stata aggiunta con successo')
    } catch (error) {
      console.error('Error adding task:', error)
      showError('Errore', 'Errore durante l\'aggiunta della pratica')
    }
  }



  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task)
    setIsConfirmDialogOpen(true)
  }

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskToDelete.id)

      if (error) throw error

      await loadTasks()
      showSuccess('Attività eliminata', 'L\'attività è stata eliminata con successo')
    } catch (error) {
      console.error('Error deleting task:', error)
      showError('Errore', 'Errore durante l\'eliminazione dell\'attività')
    } finally {
      setIsConfirmDialogOpen(false)
      setTaskToDelete(null)
    }
  }

  const cancelDeleteTask = () => {
    setIsConfirmDialogOpen(false)
    setTaskToDelete(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }


  // Get today's tasks
  const getTodayTasks = () => {
    const today = new Date().toISOString().split('T')[0]
    return tasks.filter(task => task.scadenza === today)
  }

  // Get user's first name from email
  const getUserFirstName = () => {
    const email = user.email || ''
    const firstName = email.split('@')[0].split('.')[0]
    return firstName.charAt(0).toUpperCase() + firstName.slice(1)
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-slate-900 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo size={32} className="text-blue-300" />
            <h1 className="text-2xl font-bold text-white">LexAgenda</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={onNavigateToWeek} className="bg-green-600 hover:bg-green-700 text-white border-0" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              SETTIMANA
            </Button>
            <Button onClick={onNavigateToMonth} className="bg-blue-600 hover:bg-blue-700 text-white border-0" size="sm">
              <CalendarDays className="h-4 w-4 mr-2" />
              MESE
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Greeting Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Buongiorno Avvocato {getUserFirstName()}
          </h1>
          <p className="text-gray-600 mt-2">
            Ecco il riepilogo delle tue attività per oggi
          </p>
        </div>

        {/* Today's Tasks Section */}
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-yellow-800">GLI IMPEGNI PER OGGI</h3>
            {getTodayTasks().length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nessun impegno per oggi! 🎉
              </p>
            ) : (
              <div className="space-y-3">
                {getTodayTasks().map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-yellow-200">
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
                <Label htmlFor="categoria">Categoria Attività</Label>
                <Select value={newCategoria} onValueChange={setNewCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCADENZA ATTO PROCESSUALE">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        SCADENZA ATTO PROCESSUALE
                      </span>
                    </SelectItem>
                    <SelectItem value="UDIENZA">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                        UDIENZA
                      </span>
                    </SelectItem>
                    <SelectItem value="ATTIVITA' PROCESSUALE">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                        ATTIVITA' PROCESSUALE
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
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

        {/* All Tasks Section */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="bg-purple-800 h-1 w-full mb-4 rounded"></div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-purple-900">Tutte le Attività</h3>
              <Button onClick={loadTasks} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Ricarica
              </Button>
            </div>
            {tasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nessuna attività trovata. Aggiungi la tua prima pratica!
              </p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{task.pratica}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(task.attivita)}`}>
                          {task.attivita}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Scadenza: {new Date(task.scadenza).toLocaleDateString('it-IT')}
                      </div>
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
                      <Button
                        onClick={() => handleDeleteTask(task)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        task={selectedTask}
        onSave={handleTaskSave}
      />
      
      <MessageModal
        open={!!message}
        onClose={hideMessage}
        type={message?.type || 'info'}
        title={message?.title || ''}
        message={message?.message || ''}
      />
      
      <ConfirmDialog
        open={isConfirmDialogOpen}
        onClose={cancelDeleteTask}
        onConfirm={confirmDeleteTask}
        title="Conferma eliminazione"
        message={`Sei sicuro di voler eliminare l'attività "${taskToDelete?.pratica}"? Questa azione non può essere annullata.`}
        confirmText="Elimina"
        cancelText="Annulla"
        type="danger"
      />
    </div>
  )
}