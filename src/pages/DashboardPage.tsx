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
import { ClientForm } from '../components/clients/ClientForm'
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
  const { toasts, removeToast, showSuccess, showError } = useToast()
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
  const [isClientFormOpen, setIsClientFormOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isClientLoading, setIsClientLoading] = useState(false)
  const [isNewActivityWizardOpen, setIsNewActivityWizardOpen] = useState(false)
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false)
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false)
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

      console.log('DashboardPage: Caricamento attività per utente:', user.id)

      // Load tasks directly from the tasks table - SOLUZIONE SEMPLIFICATA
      const { data: tasksData, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('scadenza', { ascending: true })

      if (error) {
        console.error('DashboardPage: Errore caricamento attività:', error)
        setTasks([])
        return
      }

      console.log('DashboardPage: Attività caricate:', tasksData)
      setTasks(tasksData || [])
    } catch (error) {
      console.error('DashboardPage: Errore nel caricamento delle attività:', error)
      setTasks([])
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
      
      // Parsa i campi JSON che potrebbero essere stringhe
      const parsedClients = (data || []).map(client => {
        let indirizzi = []
        let contatti = []
        
        try {
          indirizzi = Array.isArray(client.indirizzi) ? client.indirizzi : 
                     (typeof client.indirizzi === 'string' ? JSON.parse(client.indirizzi) : [])
        } catch (e) {
          console.warn('Errore parsing indirizzi per cliente', client.id, ':', e)
          indirizzi = []
        }
        
        try {
          contatti = Array.isArray(client.contatti) ? client.contatti : 
                    (typeof client.contatti === 'string' ? JSON.parse(client.contatti) : [])
        } catch (e) {
          console.warn('Errore parsing contatti per cliente', client.id, ':', e)
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
      
      console.log('Loaded clients:', parsedClients)
      setClients(parsedClients)
    } catch (error) {
      console.error('Errore nel caricamento dei clienti:', error)
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
            tipo_procedura
          )
        `)
        .eq('user_id', user.id)
        .eq('stato', 'todo')
        .or(`urgent.eq.true,data.lt.${today}`)
        .order('data', { ascending: true })

      if (error) throw error

      // Get client names for each practice
      const convertedTasks: Task[] = (activities || []).map(activity => {
        // Find the client for this practice
        const cliente = clients.find(c => c.id === activity.practices.cliente_id)
        const clienteName = cliente ? (cliente.ragione || `${cliente.nome} ${cliente.cognome}`) : null
        
        // Find counterparties for this practice
        let controparti = null
        if (activity.practices.controparti_ids && activity.practices.controparti_ids.length > 0) {
          controparti = activity.practices.controparti_ids
            .map((id: string) => clients.find((c: Client) => c.id === id))
            .filter(Boolean)
            .map((c: Client) => c!.ragione || `${c!.nome} ${c!.cognome}`)
            .join(', ')
        }
        
        return {
          id: activity.id,
          user_id: activity.user_id,
          pratica: activity.practices.numero,
          attivita: activity.attivita,
          scadenza: activity.data,
          ora: activity.ora,
          categoria: activity.categoria,
          autorita_giudiziaria: activity.autorita_giudiziaria,
          rg: activity.rg,
          giudice: activity.giudice,
          note: activity.note,
          stato: activity.stato,
          urgent: activity.urgent,
          cliente: clienteName,
          controparte: controparti,
          created_at: activity.created_at,
          updated_at: activity.updated_at
        }
      })

      setUrgentTasks(convertedTasks)
    } catch (error) {
      console.error('Errore nel caricamento delle scadenze urgenti:', error)
      setUrgentTasks([])
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
      console.log('DashboardPage handleTaskUpdate called with:', updatedTask)
      
      // SOLUZIONE SEMPLIFICATA - Aggiorna solo i campi essenziali
      const { error } = await supabase
        .from('tasks')
        .update({
          pratica: updatedTask.pratica,
          attivita: updatedTask.attivita,
          scadenza: updatedTask.scadenza,
          ora: updatedTask.ora,
          stato: updatedTask.stato,
          urgent: updatedTask.urgent,
          note: updatedTask.note,
          cliente: updatedTask.cliente,
          controparte: updatedTask.controparte,
          categoria: updatedTask.categoria,
          evaso: updatedTask.evaso
        })
        .eq('id', updatedTask.id)
        .eq('user_id', user.id)

      if (error) throw error

      await loadTasks() // Reload tasks from database
      setIsTaskDialogOpen(false)
      setSelectedTask(null)
      showSuccess('Successo', 'Attività aggiornata con successo')
    } catch (error) {
      console.error('Errore nell\'aggiornamento dell\'attività:', error)
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
      console.error('Errore nell\'eliminazione dell\'attività:', error)
      setTasks([])
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
      showSuccess('Successo', 'Appuntamento aggiunto con successo')
    } catch (error) {
      console.error('Errore nell\'aggiunta dell\'appuntamento:', error)
      console.error('Errore nell\'aggiunta dell\'appuntamento:', error)
    }
  }

  const handleSaveClient = async (clientData: Client) => {
    console.log('🔍 DEBUG: handleSaveClient called!')
    try {
      setIsClientLoading(true)
      
      console.log('🔍 DEBUG: Saving client data:', clientData)
      console.log('🔍 DEBUG: Codice Fiscale:', clientData.codiceFiscale)
      console.log('🔍 DEBUG: Partita IVA:', clientData.partitaIva)
      console.log('🔍 DEBUG: Cliente:', clientData.cliente)
      console.log('🔍 DEBUG: Controparte:', clientData.controparte)
      console.log('🔍 DEBUG: Altri:', clientData.altri)
      
      // Pulisce i dati prima di inviarli al database
      // Gestisce le 4 tipologie di parti con campi specifici
      const cleanData = {
        tipologia: clientData.tipologia || 'Persona fisica',
        alternativa: clientData.alternativa || false,
        ragione: clientData.ragione || (clientData.nome && clientData.cognome ? `${clientData.nome} ${clientData.cognome}` : (clientData.denominazione || 'Cliente')),
        titolo: clientData.titolo || null,
        cognome: clientData.cognome || null,
        nome: clientData.nome || null,
        sesso: clientData.sesso || null,
        data_nascita: clientData.dataNascita || null,
        luogo_nascita: clientData.luogoNascita || null,
        partita_iva: clientData.partitaIva || null,
        codice_fiscale: clientData.codiceFiscale || null,
        denominazione: clientData.denominazione || null,
        indirizzi: JSON.stringify(clientData.indirizzi || []),
        contatti: JSON.stringify(clientData.contatti || []),
        cliente: clientData.cliente || false,
        controparte: clientData.controparte || false,
        altri: clientData.altri || false,
        codice_destinatario: clientData.codiceDestinatario || null,
        codice_destinatario_pa: clientData.codiceDestinatarioPA || null,
        note: clientData.note || null,
        sigla: clientData.sigla || null
      }
      
      console.log('🔍 DEBUG: Clean data to save:', cleanData)
      console.log('🔍 DEBUG: Clean data - codice_fiscale:', cleanData.codice_fiscale)
      console.log('🔍 DEBUG: Clean data - partita_iva:', cleanData.partita_iva)
      console.log('🔍 DEBUG: Clean data - cliente:', cleanData.cliente)
      console.log('🔍 DEBUG: Clean data - controparte:', cleanData.controparte)
      console.log('🔍 DEBUG: Clean data - altri:', cleanData.altri)
      console.log('🔍 DEBUG: Clean data - denominazione:', cleanData.denominazione)
      console.log('🔍 DEBUG: Clean data - ragione:', cleanData.ragione)
      console.log('🔍 DEBUG: Clean data - id:', clientData.id)
      console.log('🔍 DEBUG: Clean data - user_id:', user.id)
      
      // Verifica che tutti i campi siano presenti
      console.log('🔍 DEBUG: Verifica campi obbligatori:')
      console.log('  - codice_fiscale presente:', !!cleanData.codice_fiscale)
      console.log('  - cliente presente:', cleanData.cliente !== undefined)
      console.log('  - controparte presente:', cleanData.controparte !== undefined)
      console.log('  - altri presente:', cleanData.altri !== undefined)
      console.log('  - ragione non vuota:', !!cleanData.ragione)

      if (clientData.id) {
        // Update existing client
        console.log('🔍 DEBUG: Updating existing client with ID:', clientData.id)
        const { error } = await supabase
          .from('clients')
          .update({
            ...cleanData,
            updated_at: new Date().toISOString()
          })
          .eq('id', clientData.id)
          .eq('user_id', user.id)

        if (error) {
          console.error('🔍 DEBUG: Errore nell\'aggiornamento:', error)
          throw error
        }
        console.log('🔍 DEBUG: Cliente aggiornato con successo!')
        showSuccess('Successo', 'Cliente aggiornato con successo')
      } else {
        // Create new client
        const { error } = await supabase
          .from('clients')
          .insert({
            ...cleanData,
            user_id: user.id
          })

        if (error) throw error
        console.log('🔍 DEBUG: Cliente creato, mostrando notifica...')
        showSuccess('Successo', 'Cliente creato con successo')
      }

      setIsClientFormOpen(false)
      setSelectedClient(null)
      await loadClients()
      await loadTasks()
    } catch (error) {
      console.error('Error saving client:', error)
      showError('Errore', 'Errore nel salvataggio del cliente')
    } finally {
      setIsClientLoading(false)
    }
  }

  const openNewClientForm = () => {
    setSelectedClient(null)
    setIsClientFormOpen(true)
  }

  const handleLogout = async () => {
    try {
    await supabase.auth.signOut()
    } catch (error) {
      console.error('Errore durante il logout:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
                    {/* RIGA 1: Numero pratica - Attività - Cliente/Controparte centrali - categoria attivita' - semaforo rosso */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-gray-600">
                          Numero pratica: <span className="font-semibold text-gray-900">{task.pratica}</span>
                        </span>
                        <span className="text-gray-600">
                          Attività: <span className="font-bold text-gray-900">{task.attivita}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
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
        message={`Sei sicuro di voler eliminare l'attività "${taskToDelete?.attivita}" dalla pratica "${taskToDelete?.pratica}"?`}
      />

      <NewActivityWizard
        key={isNewActivityWizardOpen ? 'open' : 'closed'}
        open={isNewActivityWizardOpen}
        onOpenChange={(open) => {
          console.log('DashboardPage: onOpenChange called with:', open)
          setIsNewActivityWizardOpen(open)
        }}
        clients={clients}
        onActivityCreated={async (activity) => {
          console.log('New activity created:', activity)
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
                    {/* RIGA 1: Numero pratica - Attività - Cliente/Controparte centrali - categoria attivita' - semaforo rosso */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-gray-600">
                          Numero pratica: <span className="font-semibold text-gray-900">{task.pratica}</span>
                        </span>
                        <span className="text-gray-600">
                          Attività: <span className="font-bold text-gray-900">{task.attivita}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
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
        onActivityCreated={async (activity) => {
          console.log('Activity created from existing practice:', activity)
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

      <ClientForm
        open={isClientFormOpen}
        onOpenChange={setIsClientFormOpen}
        client={selectedClient}
        onSave={handleSaveClient}
        isLoading={isClientLoading}
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Footer */}
      <Footer />
    </div>
  )
}