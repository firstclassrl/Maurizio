import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Task } from '../lib/calendar-utils'
import { Client } from '../types/client'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { TaskDialog } from '../components/dashboard/TaskDialog'
import { AppuntamentoDialog } from '../components/dashboard/AppuntamentoDialog'
import { Logo } from '../components/ui/Logo'
import { MessageModal } from '../components/ui/MessageModal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useMessage } from '../hooks/useMessage'
import { useToast, ToastContainer } from '../components/ui/Toast'
import { STRAGIUDIZIALE_CATEGORIES, GIUDIZIALE_CATEGORIES } from '../types/practice'
import { useMobile } from '../hooks/useMobile'
import { UrgentCounter } from '../components/notifications/UrgentCounter'
import { OverdueCounter } from '../components/notifications/OverdueCounter'
import { CategoryFilter } from '../components/ui/CategoryFilter'
import { PartyFilter } from '../components/ui/PartyFilter'
import { PracticeFilter } from '../components/ui/PracticeFilter'
import { NewActivityWizard } from '../components/practice/NewActivityWizard'
import { AddActivityToExistingPractice } from '../components/practice/AddActivityToExistingPractice'
import { OptionsModal } from '../components/ui/OptionsModal'
import { Plus, LogOut, Calendar, CalendarDays, Trash2, Calculator, Settings, Users, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

interface DashboardPageProps {
  user: User
  onNavigateToMonth: () => void
  onNavigateToWeek: () => void
  onNavigateToCalcolatore: () => void
  onNavigateToClients: () => void
  onNavigateToStorage: () => void
}

export function DashboardPage({ user, onNavigateToMonth, onNavigateToWeek, onNavigateToCalcolatore, onNavigateToClients, onNavigateToStorage }: DashboardPageProps) {
  const { message, showError, hideMessage } = useMessage()
  const { toasts, removeToast, showSuccess: showToastSuccess, addToast } = useToast()
  const isMobile = useMobile()

  // Function to get category color
  const getCategoryColor = (categoria?: string) => {
    if (!categoria) return 'bg-gray-100 text-gray-800 border-gray-200'
    const allCategories = [...STRAGIUDIZIALE_CATEGORIES, ...GIUDIZIALE_CATEGORIES]
    const category = allCategories.find(cat => cat.value === categoria)
    return category?.color || 'bg-gray-100 text-gray-800 border-gray-200'
  }
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedParty, setSelectedParty] = useState<string>('all')
  const [selectedPractice, setSelectedPractice] = useState<string>('all')
  const [isAppuntamentoDialogOpen, setIsAppuntamentoDialogOpen] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [isNewActivityWizardOpen, setIsNewActivityWizardOpen] = useState(false)
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false)
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false)
  const [urgentTasks, setUrgentTasks] = useState<Task[]>([])
  const [showUrgentTasks, setShowUrgentTasks] = useState(false)

  useEffect(() => {
    loadTasks()
    loadClients()
  }, [])

  const loadTasks = async () => {
    try {
      // First try with evaso filter, fallback without it if column doesn't exist
      let { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('evaso', false) // Only load non-evased tasks
        .order('scadenza', { ascending: true })

      // If error due to missing evaso column, try without the filter
      if (error && error.message.includes('evaso')) {
        console.log('evaso column not found, loading all tasks')
        const fallbackResult = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('scadenza', { ascending: true })
        
        data = fallbackResult.data
        error = fallbackResult.error
      }

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Errore nel caricamento delle attività:', error)
      showError('Errore nel caricamento delle attività', 'Errore')
    }
  }


  const loadClients = async () => {
    try {
      console.log('Loading clients for user:', user.id)
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('ragione', { ascending: true })

      if (error) {
        console.error('Error loading clients:', error)
        throw error
      }
      
      console.log('Loaded clients:', data)
      setClients(data || [])
    } catch (error) {
      console.error('Errore nel caricamento dei clienti:', error)
      showError('Errore nel caricamento dei clienti', 'Errore')
    }
  }

  const loadUrgentTasks = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('stato', 'todo')
        .or(`urgent.eq.true,scadenza.lt.${today}`)
        .order('scadenza', { ascending: true })

      if (error) throw error
      setUrgentTasks(data || [])
    } catch (error) {
      console.error('Errore nel caricamento delle scadenze urgenti:', error)
      showError('Errore nel caricamento delle scadenze urgenti', 'Errore')
    }
  }

  const handleUrgentCounterClick = () => {
    loadUrgentTasks()
    setShowUrgentTasks(true)
  }

  const handleAddActivityClick = () => {
    setIsAddActivityModalOpen(true)
  }

  const handleToggleEvased = async (task: Task) => {
    try {
      const newEvasedStatus = !task.evaso
        const { error } = await supabase
          .from('tasks')
        .update({ evaso: newEvasedStatus })
        .eq('id', task.id)

      // If error due to missing evaso column, show info message
      if (error && error.message.includes('evaso')) {
        addToast({ 
          type: 'info', 
          title: 'Funzionalità in Sviluppo', 
          message: 'La colonna evaso non è ancora disponibile nel database. Contatta l\'amministratore.' 
        })
        return
      }

        if (error) throw error

      // Remove task from current list (it will go to storage)
      setTasks(tasks.filter(t => t.id !== task.id))
      
      const message = newEvasedStatus 
        ? 'Attività marcata come evasa e spostata nello storage'
        : 'Attività ripristinata nella lista principale'
      
      addToast({ type: 'success', title: 'Stato Aggiornato', message })
    } catch (error) {
      console.error('Error toggling evased status:', error)
      addToast({ type: 'error', title: 'Errore', message: 'Errore nell\'aggiornamento dello stato' })
    }
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsTaskDialogOpen(true)
  }

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updatedTask)
        .eq('id', updatedTask.id)

      if (error) throw error

      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ))
      setIsTaskDialogOpen(false)
      setSelectedTask(null)
      showToastSuccess('Successo', 'Attività aggiornata con successo')
    } catch (error) {
      console.error('Errore nell\'aggiornamento dell\'attività:', error)
      showError('Errore nell\'aggiornamento dell\'attività', 'Errore')
    }
  }

  const handleTaskDelete = (task: Task) => {
    setTaskToDelete(task)
    setIsConfirmDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!taskToDelete) return

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskToDelete.id)

      if (error) throw error

      setTasks(prev => prev.filter(task => task.id !== taskToDelete.id))
      setIsConfirmDialogOpen(false)
      setTaskToDelete(null)
      showToastSuccess('Successo', 'Attività eliminata con successo')
    } catch (error) {
      console.error('Errore nell\'eliminazione dell\'attività:', error)
      showError('Errore nell\'eliminazione dell\'attività', 'Errore')
    }
  }

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      const matchesCategory = selectedCategory === 'all' || task.categoria === selectedCategory
      const matchesParty = selectedParty === 'all' || 
        (selectedParty === 'cliente' && task.cliente) ||
        (selectedParty === 'controparte' && task.controparte)
      const matchesPractice = selectedPractice === 'all' || task.pratica === selectedPractice
      
      return matchesCategory && matchesParty && matchesPractice
    })
  }

  const handleSaveAppuntamento = async (appuntamento: {
    cliente: string;
    data: string;
    ora: string;
    note?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          pratica: `Appuntamento con ${appuntamento.cliente}`,
          attivita: `Appuntamento con ${appuntamento.cliente}`,
          categoria: 'Appuntamento',
          cliente: appuntamento.cliente,
          controparte: '',
          scadenza: appuntamento.data,
          ora: appuntamento.ora,
          note: appuntamento.note || '',
          stato: 'todo',
          urgent: false
        })

      if (error) throw error

      await loadTasks()
      showToastSuccess('Successo', 'Appuntamento aggiunto con successo')
    } catch (error) {
      console.error('Errore nell\'aggiunta dell\'appuntamento:', error)
      showError('Errore nell\'aggiunta dell\'appuntamento', 'Errore')
    }
  }


  const handleLogout = async () => {
    try {
    await supabase.auth.signOut()
    } catch (error) {
      console.error('Errore durante il logout:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-slate-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo className="h-8 w-auto" />
              <h1 className="ml-3 text-xl font-semibold text-white">
                LexAgenda
              </h1>
                </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={onNavigateToWeek}
                className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                size="sm"
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                Settimana
              </Button>
              
              <Button
                onClick={onNavigateToMonth}
                className="bg-green-600 hover:bg-green-700 text-white border-0"
                size="sm"
              >
                  <Calendar className="h-4 w-4 mr-2" />
                Mese
                </Button>
              
                      <Button
                onClick={onNavigateToCalcolatore}
                className="bg-purple-600 hover:bg-purple-700 text-white border-0"
                        size="sm"
                      >
                <Calculator className="h-4 w-4 mr-2" />
                CALCOLATORE
                      </Button>
              
                <Button
                onClick={onNavigateToClients}
                className="bg-orange-600 hover:bg-orange-700 text-white border-0"
                  size="sm"
                >
                <Users className="h-4 w-4 mr-2" />
                Clienti
                </Button>
            
                  <Button
                onClick={() => setIsOptionsModalOpen(true)}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Opzioni
                  </Button>
              
                  <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-white text-red-400 hover:bg-white hover:text-red-600"
              >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                  </Button>
                </div>
              </div>
              </div>
              </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Welcome Message and Counters */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-left">
            <h2 className="text-2xl font-semibold text-gray-800">
              Buongiorno Avvocato
            </h2>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString('it-IT', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
                </div>
                <div className="flex items-center gap-4">
            <UrgentCounter userId={user.id} onClick={handleUrgentCounterClick} />
            <OverdueCounter userId={user.id} />
                  </div>
        </div>


        {/* New Activity System */}
        <Card className="mb-6 border-2 border-black">
          <CardContent className={isMobile ? "p-4" : "p-6"}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Gestione Attività</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsNewActivityWizardOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                    <Plus className="h-4 w-4 mr-2" />
                  Nuova Pratica
                  </Button>
                
                <Button
                  onClick={handleAddActivityClick}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Attività
              </Button>
            </div>
              </div>
          </CardContent>
        </Card>

        {/* All Tasks Section */}
        <Card className="bg-purple-50 border-2 border-purple-500">
          <CardContent className={isMobile ? "p-4" : "p-6"}>
            <h3 className="text-lg font-semibold text-purple-900 text-center mb-4">Tutte le Attività</h3>
            <div className="bg-purple-800 h-1 w-full mb-4 rounded"></div>
            <div className={`flex items-center gap-4 mb-4 ${isMobile ? 'flex-col' : 'flex-row'}`}>
              <PracticeFilter 
                selectedPractice={selectedPractice}
                onPracticeChange={setSelectedPractice}
                tasks={tasks}
                className={isMobile ? "w-full" : ""}
              />
                  <CategoryFilter 
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                className={isMobile ? "w-full" : ""}
                  />
                  <PartyFilter 
                    selectedParty={selectedParty}
                    onPartyChange={setSelectedParty}
                    tasks={tasks}
                className={isMobile ? "w-full" : ""}
                  />
            </div>
            {getFilteredTasks().length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {selectedCategory === 'all' && selectedParty === 'all' && selectedPractice === 'all'
                  ? 'Nessuna attività trovata. Aggiungi la tua prima pratica!'
                  : `Nessuna attività trovata per i filtri selezionati.`
                }
              </p>
            ) : (
              <div className="space-y-3">
                {getFilteredTasks().map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border-2 hover:shadow-md transition-shadow cursor-pointer ${getCategoryColor(task.categoria)}`}
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">
                            {task.categoria}
                            </span>
                            {task.stato === 'done' && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Completata
                              </span>
                          )}
                          {/* Semaphore - Visual indicator only */}
                          <div className="flex items-center gap-1 ml-auto">
                            <div className={`p-1 rounded-full ${
                              task.evaso ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                              {task.evaso ? (
                                <CheckCircle2 className="h-4 w-4 text-white" />
                              ) : (
                                <XCircle className="h-4 w-4 text-white" />
                            )}
                          </div>
                            </div>
                          </div>
                        <h4 className="font-medium text-gray-900 mb-1">{task.pratica}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Cliente:</strong> {task.cliente}
                          {task.controparte && (
                            <span> | <strong>Controparte:</strong> {task.controparte}</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          <strong>Data:</strong> {new Date(task.scadenza).toLocaleDateString('it-IT')}
                        </p>
                          {task.note && (
                          <p className="text-sm text-gray-500 mt-1">
                            <strong>Note:</strong> {task.note}
                          </p>
                          )}
                        </div>
                          <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTaskDelete(task)
                            }}
                            variant="outline"
                            size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
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

      {/* Dialogs */}
      <TaskDialog
        task={selectedTask}
        open={isTaskDialogOpen}
        onOpenChange={(open) => {
          setIsTaskDialogOpen(open)
          if (!open) setSelectedTask(null)
        }}
        onSave={(task) => handleTaskUpdate(task as Task)}
      />

      <AppuntamentoDialog
        isOpen={isAppuntamentoDialogOpen}
        onClose={() => setIsAppuntamentoDialogOpen(false)}
        onSave={handleSaveAppuntamento}
      />
      
      <ConfirmDialog
        open={isConfirmDialogOpen}
        onClose={() => {
          setIsConfirmDialogOpen(false)
          setTaskToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="Conferma Eliminazione"
        message={`Sei sicuro di voler eliminare l'attività "${taskToDelete?.pratica}"?`}
      />

      <NewActivityWizard
        key={isNewActivityWizardOpen ? 'open' : 'closed'}
        open={isNewActivityWizardOpen}
        onOpenChange={(open) => {
          console.log('DashboardPage: onOpenChange called with:', open)
          setIsNewActivityWizardOpen(open)
        }}
        clients={clients}
        onActivityCreated={(activity) => {
          console.log('New activity created:', activity)
          loadTasks()
        }}
      />

      <OptionsModal
        open={isOptionsModalOpen}
        onOpenChange={setIsOptionsModalOpen}
        user={user}
      />
      
      <MessageModal
        open={!!message}
        type={message?.type || 'info'}
        title={message?.title || ''}
        message={message?.message || ''}
        onClose={hideMessage}
      />

      {/* Urgent Tasks Modal */}
      <Dialog open={showUrgentTasks} onOpenChange={setShowUrgentTasks}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Scadenze Urgenti
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            {urgentTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nessuna scadenza urgente trovata.
              </p>
            ) : (
              urgentTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border-2 hover:shadow-md transition-shadow cursor-pointer ${getCategoryColor(task.categoria)}`}
                    onClick={() => {
                      setSelectedTask(task)
                      setIsTaskDialogOpen(true)
                      setShowUrgentTasks(false)
                    }}
                  >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">
                          {task.categoria}
                        </span>
                        {task.urgent && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            URGENTE
                          </span>
                        )}
                        {/* Semaphore */}
                        <div className="flex items-center gap-1 ml-auto">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleEvased(task)
                            }}
                            className={`p-1 rounded-full transition-colors ${
                              task.evaso 
                                ? 'bg-green-500 hover:bg-green-600' 
                                : 'bg-red-500 hover:bg-red-600'
                            }`}
                            title={task.evaso ? 'Evasa - Click per ripristinare' : 'Non evasa - Click per marcare come evasa'}
                          >
                            {task.evaso ? (
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            ) : (
                              <XCircle className="h-4 w-4 text-white" />
                            )}
                          </button>
            </div>
              </div>
                      <h4 className="font-medium text-gray-900 mb-1">{task.pratica}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Cliente:</strong> {task.cliente}
                        {task.controparte && (
                          <span> | <strong>Controparte:</strong> {task.controparte}</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Data:</strong> {new Date(task.scadenza).toLocaleDateString('it-IT')}
                      </p>
                      {task.note && (
                        <p className="text-sm text-gray-500 mt-1">
                          <strong>Note:</strong> {task.note}
                        </p>
                      )}
              </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTaskDelete(task)
                        setShowUrgentTasks(false)
                      }}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
            </div>
              </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Activity to Existing Practice Modal */}
      <AddActivityToExistingPractice
        open={isAddActivityModalOpen}
        onOpenChange={setIsAddActivityModalOpen}
        clients={clients}
        onActivityCreated={(activity) => {
          console.log('Activity created from existing practice:', activity)
          loadTasks() // Reload tasks to show the new activity
        }}
      />

      <OptionsModal
        open={isOptionsModalOpen}
        onOpenChange={setIsOptionsModalOpen}
        user={user}
        onNavigateToStorage={onNavigateToStorage}
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}