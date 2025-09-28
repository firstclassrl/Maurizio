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
import { ChatAssistant } from '../components/assistant/ChatAssistant'
import { OptionsModal } from '../components/ui/OptionsModal'
import { SimpleClientForm } from '../components/clients/SimpleClientForm'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { Plus, Trash2, Users, AlertTriangle, FileText, FolderOpen } from 'lucide-react'
import { formatTimeWithoutSeconds } from '../lib/time-utils'

interface DashboardPageProps {
  user: User
  onNavigateToMonth: () => void
  onNavigateToWeek: () => void
  onNavigateToOverdue: () => void
  onNavigateToCalcolatore: () => void
  onNavigateToClients: () => void
  onNavigateToStorage: () => void
  onNavigateToPracticeArchive: () => void
}

export function DashboardPage({ user, onNavigateToMonth, onNavigateToWeek, onNavigateToOverdue, onNavigateToCalcolatore, onNavigateToClients, onNavigateToStorage, onNavigateToPracticeArchive }: DashboardPageProps) {
  const { toasts, removeToast, showSuccess, showError } = useToast()
  const isMobile = useMobile()

  const [clients, setClients] = useState<Client[]>([])

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
  const [isClientFormOpen, setIsClientFormOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isNewActivityWizardOpen, setIsNewActivityWizardOpen] = useState(false)
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false)
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false)
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [initialAssistantQuery, setInitialAssistantQuery] = useState<string>('')
  const [urgentTasks, setUrgentTasks] = useState<Task[]>([])
  const [showUrgentTasks, setShowUrgentTasks] = useState(false)
  

  useEffect(() => {
    const loadData = async () => {
      await loadClients()
      await loadTasks()
    }
    loadData()
  }, [])

  // Reload data when page becomes visible (user navigates back to this page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadClients()
        loadTasks()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Reload tasks when clients change
  useEffect(() => {
    if (clients.length > 0) {
      loadTasks()
    }
  }, [clients])

  const loadTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }


      // Load activities with practice and client information - optimized query
      const { data: activitiesData, error } = await supabase
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
        .limit(1000) // Limit to prevent excessive data loading

      if (error) {
        setTasks([])
        return
      }


      // Get all unique counterparty IDs from all practices
      const allCounterpartyIds = new Set<string>()
      activitiesData?.forEach(activity => {
        const counterparties = activity.practices?.controparti_ids || []
        counterparties.forEach((id: string) => allCounterpartyIds.add(id))
      })

      // Load counterparty names
      let counterpartyNames: Record<string, string> = {}
      if (allCounterpartyIds.size > 0) {
        const { data: counterpartyData } = await supabase
          .from('clients')
          .select('id, ragione, nome, cognome')
          .in('id', Array.from(allCounterpartyIds))

        counterpartyData?.forEach(client => {
          const name = client.ragione || `${client.nome || ''} ${client.cognome || ''}`.trim()
          counterpartyNames[client.id] = name
        })
      }

      // Convert activities to tasks format for compatibility
      const convertedTasks = (activitiesData || []).map(activity => {
        // Get practice number
        const practiceNumber = activity.practices?.numero || 'N/A'
        
        // Get client name
        const client = activity.practices?.clients
        const clientName = client ? (client.ragione || `${client.nome || ''} ${client.cognome || ''}`.trim()) : null
        
        // Get counterparty names
        const counterparties = activity.practices?.controparti_ids || []
        const counterpartyName = counterparties.length > 0 
          ? counterparties.map((id: string) => counterpartyNames[id]).filter(Boolean).join(', ')
          : null
        
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

      setTasks(convertedTasks)
    } catch (error) {
      setTasks([])
    }
  }



  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) {
        throw error
      }
      
      // Parsa i campi JSON che potrebbero essere stringhe
      const parsedClients = (data || []).map(client => {
        let indirizzi = []
        let contatti = []
        
        try {
          indirizzi = Array.isArray(client.indirizzi) ? client.indirizzi : 
                     (typeof client.indirizzi === 'string' ? JSON.parse(client.indirizzi) : [])
        } catch (e) {
          indirizzi = []
        }
        
        try {
          contatti = Array.isArray(client.contatti) ? client.contatti : 
                    (typeof client.contatti === 'string' ? JSON.parse(client.contatti) : [])
        } catch (e) {
          contatti = []
        }
        
        return {
          ...client,
          indirizzi,
          contatti,
          // Mappa i campi del database ai nomi camelCase del form
          dataNascita: client.data_nascita,
          luogoNascita: client.luogo_nascita,
          partitaIva: client.partita_iva,
          codiceFiscale: client.codice_fiscale,
          codiceDestinatario: client.codice_destinatario,
          codiceDestinatarioPA: client.codice_destinatario_pa
        }
      })
      
      setClients(parsedClients)
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }

  const loadUrgentTasks = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data: activities, error } = await supabase
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
        .eq('stato', 'todo')
        .or(`urgent.eq.true,data.lt.${today}`)
        .order('data', { ascending: true })
        .limit(200) // Limit urgent tasks to prevent excessive loading

      if (error) {
        throw error
      }
      

      // Get all unique counterparty IDs from all practices
      const allCounterpartyIds = new Set<string>()
      activities?.forEach(activity => {
        const counterparties = activity.practices?.controparti_ids || []
        counterparties.forEach((id: string) => allCounterpartyIds.add(id))
      })

      // Load counterparty names
      let counterpartyNames: Record<string, string> = {}
      if (allCounterpartyIds.size > 0) {
        const { data: counterpartyData } = await supabase
          .from('clients')
          .select('id, ragione, nome, cognome')
          .in('id', Array.from(allCounterpartyIds))

        counterpartyData?.forEach(client => {
          const name = client.ragione || `${client.nome || ''} ${client.cognome || ''}`.trim()
          counterpartyNames[client.id] = name
        })
      }

      // Convert activities to tasks format for compatibility
      const convertedTasks: Task[] = (activities || []).map(activity => {
        // Get practice number
        const practiceNumber = activity.practices?.numero || 'N/A'
        
        // Get client name
        const client = activity.practices?.clients
        const clientName = client ? (client.ragione || `${client.nome || ''} ${client.cognome || ''}`.trim()) : null
        
        // Get counterparty names
        const counterparties = activity.practices?.controparti_ids || []
        const counterpartyName = counterparties.length > 0 
          ? counterparties.map((id: string) => counterpartyNames[id]).filter(Boolean).join(', ')
          : null
        
        return {
          id: activity.id,
          user_id: activity.user_id,
          pratica: practiceNumber,
          attivita: activity.attivita,
          scadenza: activity.data,
          ora: activity.ora,
          categoria: activity.categoria,
          note: activity.note,
          stato: activity.stato,
          urgent: activity.urgent || false, // Use urgent field directly
          cliente: clientName,
          controparte: counterpartyName,
          evaso: activity.stato === 'done',
          created_at: activity.created_at,
          updated_at: activity.updated_at
        }
      })

      setUrgentTasks(convertedTasks)
    } catch (error) {
      setUrgentTasks([])
    }
  }

  // Funzione per filtrare le attività di oggi
  const getTodayTasks = () => {
    const today = new Date().toISOString().split('T')[0]
    const todayTasks = tasks.filter(task => task.scadenza === today && !task.evaso)
    return todayTasks
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
      
      // Update activities table
      const { error } = await supabase
        .from('activities')
        .update({
          attivita: updatedTask.attivita,
          data: updatedTask.scadenza,
          ora: updatedTask.ora,
          stato: updatedTask.stato,
          urgent: updatedTask.urgent || false,
          note: updatedTask.note,
          categoria: updatedTask.categoria
        })
        .eq('id', updatedTask.id)
        .eq('user_id', user.id)

      if (error) throw error

      await loadTasks() // Reload tasks from database
      setIsTaskDialogOpen(false)
      setSelectedTask(null)
      showSuccess('Successo', 'Attività aggiornata con successo')
    } catch (error) {
      showError('Errore', 'Errore nell\'aggiornamento dell\'attività')
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
        .from('activities')
        .delete()
        .eq('id', taskToDelete.id)

      if (error) throw error

      setTasks(prev => prev.filter(task => task.id !== taskToDelete.id))
      setIsConfirmDialogOpen(false)
      setTaskToDelete(null)
      showError('Attività Eliminata', `Attività "${taskToDelete.attivita}" eliminata con successo`)
    } catch (error) {
      setTasks([])
    }
  }

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      const matchesCategory = selectedCategory === 'all' || task.categoria === selectedCategory
      
      let matchesParty = true
      if (selectedParty !== 'all') {
        if (selectedParty.startsWith('cliente-')) {
          const clienteName = selectedParty.replace('cliente-', '')
          matchesParty = task.cliente === clienteName
        } else if (selectedParty.startsWith('controparte-')) {
          const controparteName = selectedParty.replace('controparte-', '')
          matchesParty = task.controparte === controparteName
        } else {
          // Fallback per compatibilità con vecchi valori
          matchesParty = Boolean((selectedParty === 'cliente' && task.cliente) ||
                        (selectedParty === 'controparte' && task.controparte))
        }
      }
      
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
      showSuccess('Successo', 'Appuntamento aggiunto con successo')
    } catch (error) {
    }
  }

  const handleClientFormSuccess = async () => {
    setIsClientFormOpen(false)
    setSelectedClient(null)
    await loadClients()
    await loadTasks()
  }

  const openNewClientForm = () => {
    setSelectedClient(null)
    setIsClientFormOpen(true)
  }


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <DashboardHeader
        onAssistantOpen={(query) => {
          if (query) {
            setInitialAssistantQuery(query)
            setIsAssistantOpen(true)
          } else {
            setInitialAssistantQuery('')
            setIsAssistantOpen(true)
          }
        }}
        onOptionsOpen={() => setIsOptionsModalOpen(true)}
        onNavigateToWeek={onNavigateToWeek}
        onNavigateToMonth={onNavigateToMonth}
        onNavigateToCalcolatore={onNavigateToCalcolatore}
      />

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

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
            <OverdueCounter userId={user.id} onClick={onNavigateToOverdue} />
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
                  onClick={openNewClientForm}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuova Parte
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
                  className="bg-purple-600 hover:bg-purple-700 text-white"
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
                  Pratiche
                </Button>

                <Button
                  onClick={onNavigateToClients}
                  className="bg-white hover:bg-gray-50 text-orange-600 border border-orange-600"
                  size="sm"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Parti
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
              <div className="space-y-2">
                {getFilteredTasks().map((task) => (
                  <div
                    key={task.id}
                    className={`p-2 rounded-lg border-2 hover:shadow-md transition-shadow cursor-pointer ${getCategoryColor(task.categoria)}`}
                    onClick={() => handleTaskClick(task)}
                  >
                    {/* RIGA 1: Pratica - Cliente - Controparte */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3 text-xs flex-wrap">
                        <span className="text-gray-600">
                          Pratica: <span className="font-semibold text-gray-900">{task.pratica}</span>
                        </span>
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
                    
                    {/* RIGA 2: Data - Ora - Attività - Note */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs flex-wrap">
                        <span className="text-gray-600">
                          Data: <span className="font-medium text-gray-900">{new Date(task.scadenza).toLocaleDateString('it-IT')}</span>
                        </span>
                        {task.ora && (
                          <span className="text-gray-600">
                            Ora: <span className="font-medium text-gray-900">{formatTimeWithoutSeconds(task.ora)}</span>
                          </span>
                        )}
                        <span className="text-gray-600">
                          Attività: <span className="font-bold text-gray-900">{task.attivita}</span>
                        </span>
                        {task.note && (
                          <span className="text-gray-600">
                            Note: <span className="font-medium text-gray-900 italic">{task.note}</span>
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
        message={`Sei sicuro di voler eliminare l'attività "${taskToDelete?.attivita}" dalla pratica "${taskToDelete?.pratica}"?`}
      />

      <NewActivityWizard
        key={isNewActivityWizardOpen ? 'open' : 'closed'}
        open={isNewActivityWizardOpen}
        onOpenChange={(open) => {
          setIsNewActivityWizardOpen(open)
        }}
        clients={clients}
        onPracticeCreated={(practice) => {
          showSuccess('Pratica creata', `La pratica ${practice.numero} è stata creata con successo!`)
          loadClients()
        }}
        onActivityCreated={async (activity) => {
          await loadClients()
          await loadTasks()
          showSuccess('Attività Creata', `Attività "${activity.attivita}" creata con successo`)
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
                    className={`p-2 rounded-lg border-2 hover:shadow-md transition-shadow cursor-pointer ${getCategoryColor(task.categoria)}`}
                    onClick={() => {
                      setSelectedTask(task)
                      setIsTaskDialogOpen(true)
                      setShowUrgentTasks(false)
                    }}
                  >
                    {/* RIGA 1: Pratica - Cliente - Controparte */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3 text-xs flex-wrap">
                        <span className="text-gray-600">
                          Pratica: <span className="font-semibold text-gray-900">{task.pratica}</span>
                        </span>
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
                    
                    {/* RIGA 2: Data - Ora - Attività - Note */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs flex-wrap">
                        <span className="text-gray-600">
                          Data: <span className="font-medium text-gray-900">{new Date(task.scadenza).toLocaleDateString('it-IT')}</span>
                        </span>
                        {task.ora && (
                          <span className="text-gray-600">
                            Ora: <span className="font-medium text-gray-900">{formatTimeWithoutSeconds(task.ora)}</span>
                          </span>
                        )}
                        <span className="text-gray-600">
                          Attività: <span className="font-bold text-gray-900">{task.attivita}</span>
                        </span>
                        {task.note && (
                          <span className="text-gray-600">
                            Note: <span className="font-medium text-gray-900 italic">{task.note}</span>
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
        onActivityCreated={async (activity) => {
          await loadClients()
          await loadTasks() // Reload tasks to show the new activity
          showSuccess('Attività Aggiunta', `Attività "${activity.attivita}" aggiunta con successo`)
        }}
      />

      <OptionsModal
        open={isOptionsModalOpen}
        onOpenChange={setIsOptionsModalOpen}
        user={user}
        onNavigateToStorage={onNavigateToStorage}
      />

      <SimpleClientForm
        isOpen={isClientFormOpen}
        onClose={() => setIsClientFormOpen(false)}
        onSuccess={handleClientFormSuccess}
        client={selectedClient}
      />

      {/* Chat Assistant Modal */}
      {isAssistantOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl h-[80vh] bg-white rounded-lg shadow-xl">
            <ChatAssistant
              userId={user.id}
              initialQuery={initialAssistantQuery}
              onClose={() => {
                setIsAssistantOpen(false)
                setInitialAssistantQuery('')
              }}
            />
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Footer */}
      <Footer />
    </div>
  )
}