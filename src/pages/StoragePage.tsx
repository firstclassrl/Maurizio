import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Task } from '../lib/calendar-utils'
// import { Client } from '../types/client'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { TaskDialog } from '../components/dashboard/TaskDialog'
import { Logo } from '../components/ui/Logo'
import { MessageModal } from '../components/ui/MessageModal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useMessage } from '../hooks/useMessage'
import { useToast, ToastContainer } from '../components/ui/Toast'
import { STRAGIUDIZIALE_CATEGORIES, GIUDIZIALE_CATEGORIES } from '../types/practice'
// import { useMobile } from '../hooks/useMobile'
import { CategoryFilter } from '../components/ui/CategoryFilter'
import { PartyFilter } from '../components/ui/PartyFilter'
import { ArrowLeft, Trash2, RotateCcw, Search } from 'lucide-react'

interface StoragePageProps {
  user: User
  onNavigateBack: () => void
}

export function StoragePage({ user, onNavigateBack }: StoragePageProps) {
  // const isMobile = useMobile()
  const { message, showMessage, hideMessage } = useMessage()
  const { toasts, addToast, removeToast } = useToast()

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
  // const [clients, setClients] = useState<Client[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedParty, setSelectedParty] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
    // loadClients()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      // First try with evaso filter, fallback without it if column doesn't exist
      let { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('evaso', true) // Only load evased tasks
        .order('scadenza', { ascending: false })

      // If error due to missing evaso column, return empty array (no evased tasks yet)
      if (error && error.message.includes('evaso')) {
        console.log('evaso column not found, no evased tasks available')
        data = []
        error = null
      }

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
      showMessage('error', 'Errore', 'Errore nel caricamento delle attività')
    } finally {
      setLoading(false)
    }
  }

  // const loadClients = async () => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('clients')
  //       .select('*')
  //       .eq('user_id', user.id)

  //     if (error) throw error
  //     setClients(data || [])
  //   } catch (error) {
  //     console.error('Error loading clients:', error)
  //   }
  // }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsTaskDialogOpen(true)
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

      setTasks(tasks.filter(task => task.id !== taskToDelete.id))
      addToast({ type: 'success', title: 'Eliminazione', message: 'Attività eliminata con successo' })
    } catch (error) {
      console.error('Error deleting task:', error)
      addToast({ type: 'error', title: 'Errore', message: 'Errore nell\'eliminazione dell\'attività' })
    } finally {
      setIsConfirmDialogOpen(false)
      setTaskToDelete(null)
    }
  }

  const handleRestoreTask = async (task: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ evaso: false })
        .eq('id', task.id)

      if (error) throw error

      setTasks(tasks.filter(t => t.id !== task.id))
      addToast({ type: 'success', title: 'Ripristino', message: 'Attività ripristinata nella lista principale' })
    } catch (error) {
      console.error('Error restoring task:', error)
      addToast({ type: 'error', title: 'Errore', message: 'Errore nel ripristino dell\'attività' })
    }
  }

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter(task => {
    const matchesCategory = selectedCategory === 'all' || task.categoria === selectedCategory
    const matchesParty = selectedParty === 'all' || 
      (selectedParty === 'cliente' && task.cliente) ||
      (selectedParty === 'controparte' && task.controparte)
    const matchesSearch = searchTerm === '' || 
      task.attivita.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.pratica.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.cliente && task.cliente.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.controparte && task.controparte.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesCategory && matchesParty && matchesSearch
  })

  // Get unique categories from evased tasks
  // const availableCategories = Array.from(new Set(tasks.map(task => task.categoria).filter(Boolean)))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={onNavigateBack}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Indietro
              </Button>
              <Logo />
            </div>
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Storage Attività Evase</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          <Card className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Cerca per attività, pratica, cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />

              {/* Party Filter */}
              <PartyFilter
                selectedParty={selectedParty}
                onPartyChange={setSelectedParty}
                tasks={tasks}
              />
            </div>
          </Card>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Attività Evase: {filteredTasks.length}
                </h3>
                <p className="text-sm text-gray-600">
                  Totale nel storage: {tasks.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {loading ? (
            <Card className="p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Caricamento attività...</p>
              </div>
            </Card>
          ) : filteredTasks.length === 0 ? (
            <Card className="p-8">
              <div className="text-center">
                <p className="text-gray-500 text-lg">Nessuna attività evasa trovata</p>
                <p className="text-gray-400 mt-2">
                  {searchTerm || selectedCategory !== 'all' || selectedParty !== 'all'
                    ? 'Prova a modificare i filtri di ricerca'
                    : 'Le attività evase appariranno qui quando verranno completate'
                  }
                </p>
              </div>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card 
                key={task.id} 
                className={`p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 ${getCategoryColor(task.categoria)}`}
                onClick={() => handleTaskClick(task)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">
                        {task.categoria}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Evaso
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{task.attivita}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Pratica:</span> {task.pratica}
                    </p>
                    {task.cliente && (
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Cliente:</span> {task.cliente}
                      </p>
                    )}
                    {task.controparte && (
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Controparte:</span> {task.controparte}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Scadenza:</span> {new Date(task.scadenza).toLocaleDateString('it-IT')}
                    </p>
                    {task.note && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        {task.note}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRestoreTask(task)
                      }}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Ripristina
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTaskDelete(task)
                      }}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Elimina
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Task Dialog */}
      <TaskDialog
        task={selectedTask}
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        onSave={loadTasks}
        user={user}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        title="Conferma Eliminazione"
        message={`Sei sicuro di voler eliminare definitivamente l'attività "${taskToDelete?.attivita}"?`}
        onConfirm={confirmDelete}
        confirmText="Elimina"
        cancelText="Annulla"
      />

      {/* Message Modal */}
      <MessageModal
        open={!!message}
        onClose={hideMessage}
        title="Informazione"
        message={message?.message || ''}
        type="info"
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
