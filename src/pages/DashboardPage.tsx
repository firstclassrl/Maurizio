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
import { Footer } from '../components/ui/Footer'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
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
import { Plus, LogOut, Calendar, CalendarDays, Trash2, Calculator, Settings, Users, AlertTriangle, FileText, FolderOpen } from 'lucide-react'
import { formatTimeWithoutSeconds } from '../lib/time-utils'

interface DashboardPageProps {
  user: User
  onNavigateToMonth: () => void
  onNavigateToWeek: () => void
  onNavigateToCalcolatore: () => void
  onNavigateToClients: () => void
  onNavigateToStorage: () => void
  onNavigateToPracticeArchive: () => void
}

export function DashboardPage({ user, onNavigateToMonth, onNavigateToWeek, onNavigateToCalcolatore, onNavigateToClients, onNavigateToStorage, onNavigateToPracticeArchive }: DashboardPageProps) {
  const { toasts, removeToast, showSuccess: showToastSuccess } = useToast()
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
      console.error('Errore nel caricamento delle attività:', error)
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
      console.error('Errore nel caricamento dei clienti:', error)
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
      console.error('Errore nel caricamento delle scadenze urgenti:', error)
    }
  }

  // Funzione per filtrare le attività di oggi
  const getTodayTasks = () => {
    const today = new Date().toISOString().split('T')[0]
    return tasks.filter(task => task.scadenza === today && !task.evaso)
  }

  const handleUrgentCounterClick = () => {
    loadUrgentTasks()
    setShowUrgentTasks(true)
  }

  const handleAddActivityClick = () => {
    setIsAddActivityModalOpen(true)
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
      console.error('Errore nell\'aggiornamento dell\'attività:', error)
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
      console.error('Errore nell\'eliminazione dell\'attività:', error)
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
      console.error('Errore nell\'aggiunta dell\'appuntamento:', error)
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


        {/* Today's Activities - Yellow Card */}
        {(
          <Card className="mb-6 border-2 border-yellow-300 bg-yellow-50">
            <CardContent className={isMobile ? "p-4" : "p-6"}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-yellow-800">Attività di Oggi</h3>
                <span className="text-sm text-yellow-700 bg-yellow-200 px-2 py-1 rounded-full">
                  {getTodayTasks().length} attività
                </span>
              </div>
              
              <div className="space-y-2">
                {getTodayTasks().length > 0 ? getTodayTasks().map((task) => (
                  <div
                    key={task.id}
                    className={`p-2 rounded-lg border hover:shadow-sm transition-shadow cursor-pointer ${
                      task.stato === 'done' 
                        ? 'bg-green-50 text-green-800 border-green-200' 
                        : getCategoryColor(task.categoria)
                    }`}
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {/* Semaforo unico all'inizio */}
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        task.evaso ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      
                      {/* Ora */}
                      {task.ora && (
                        <span className="font-medium text-gray-600 text-[10px] leading-tight flex-shrink-0">
                          {formatTimeWithoutSeconds(task.ora)}
                        </span>
                      )}
                      
                      {/* Cliente/Controparte */}
                      <span className="font-semibold text-gray-900 text-[10px] leading-tight flex-shrink-0">
                        {task.cliente || 'N/A'}
                        {task.controparte && ` / ${task.controparte}`}
                      </span>
                      
                      {/* Attività da svolgere */}
                      <span className="text-gray-600 text-[10px] leading-tight flex-1 min-w-0">
                        - {task.attivita}
                      </span>
                      
                      {/* Flag URGENTE */}
                      {task.urgent && (
                        <span className="text-red-600 font-semibold text-[10px] leading-tight flex-shrink-0">
                          URGENTE
                        </span>
                      )}
                    </div>
                  </div>
                )) : (
                  <p className="text-yellow-700 text-center py-4">
                    Nessuna attività per oggi
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* New Activity System */}
        <Card className="mb-6 border-2 border-black">
          <CardContent className={isMobile ? "p-4" : "p-6"}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Azioni</h3>
              
              <div className="flex gap-2">
                <Button
                  onClick={onNavigateToClients}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuovo Cliente
                </Button>
                
                <Button
                  onClick={() => setIsNewActivityWizardOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Nuova Pratica
                </Button>
            
                <Button
                  onClick={handleAddActivityClick}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Aggiungi Attività
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={onNavigateToPracticeArchive}
                  className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600"
                  size="sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Archivio Pratiche
                </Button>

                <Button
                  onClick={onNavigateToClients}
                  className="bg-white hover:bg-gray-50 text-orange-600 border border-orange-600"
                  size="sm"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Archivio Clienti
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Tasks Section */}
        <Card className="bg-purple-50 border-2 border-purple-500">
          <CardContent className={isMobile ? "p-4" : "p-6"}>
            <h3 className="text-lg font-semibold text-purple-900 text-center mb-2">Tutte le Attività</h3>
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
                    {/* RIGA 1: Numero pratica - Attività - Cliente/Controparte centrali - categoria attivita' - semaforo rosso */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1 text-xs">
                        <span className="text-gray-600">
                          Numero pratica: <span className="font-semibold text-gray-900">{task.pratica}</span>
                        </span>
                        <span className="text-gray-600">
                          Attività: <span className="font-bold text-gray-900">{task.attivita}</span>
                        </span>
                        <div className="flex items-center gap-3">
                          {task.cliente && (
                            <span className="text-gray-600">
                              Cliente: <span className="font-bold text-gray-900">{task.cliente}</span>
                            </span>
                          )}
                          {task.controparte && (
                            <span className="text-gray-600">
                              Controparte: <span className="font-bold text-gray-900">{task.controparte}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800 border border-gray-300">
                          {task.categoria}
                        </span>
                        {/* Semaforo rosso per scadenze */}
                        {new Date(task.scadenza) < new Date() && task.stato === 'todo' && (
                          <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                    
                    {/* RIGA 2: ora - data - note - eventuale urgente */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs">
                        {task.ora && (
                          <span className="text-gray-600">
                            ora: <span className="font-medium text-gray-900">{formatTimeWithoutSeconds(task.ora)}</span>
                          </span>
                        )}
                        <span className="text-gray-600">
                          data: <span className="font-medium text-gray-900">{new Date(task.scadenza).toLocaleDateString('it-IT')}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        {task.note && (
                          <span className="text-gray-600">
                            note: <span className="font-medium text-gray-900 italic">{task.note}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {task.urgent && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            URGENTE
                          </span>
                        )}
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
                    {/* RIGA 1: Numero pratica - Attività - Cliente/Controparte centrali - categoria attivita' - semaforo rosso */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1 text-xs">
                        <span className="text-gray-600">
                          Numero pratica: <span className="font-semibold text-gray-900">{task.pratica}</span>
                        </span>
                        <span className="text-gray-600">
                          Attività: <span className="font-bold text-gray-900">{task.attivita}</span>
                        </span>
                        <div className="flex items-center gap-3">
                          {task.cliente && (
                            <span className="text-gray-600">
                              Cliente: <span className="font-bold text-gray-900">{task.cliente}</span>
                            </span>
                          )}
                          {task.controparte && (
                            <span className="text-gray-600">
                              Controparte: <span className="font-bold text-gray-900">{task.controparte}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800 border border-gray-300">
                          {task.categoria}
                        </span>
                        {/* Semaforo rosso per scadenze */}
                        {new Date(task.scadenza) < new Date() && task.stato === 'todo' && (
                          <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                    
                    {/* RIGA 2: ora - data - note - eventuale urgente */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs">
                        {task.ora && (
                          <span className="text-gray-600">
                            ora: <span className="font-medium text-gray-900">{formatTimeWithoutSeconds(task.ora)}</span>
                          </span>
                        )}
                        <span className="text-gray-600">
                          data: <span className="font-medium text-gray-900">{new Date(task.scadenza).toLocaleDateString('it-IT')}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        {task.note && (
                          <span className="text-gray-600">
                            note: <span className="font-medium text-gray-900 italic">{task.note}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {task.urgent && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            URGENTE
                          </span>
                        )}
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
      
      {/* Footer */}
      <Footer absolute />
    </div>
  )
}