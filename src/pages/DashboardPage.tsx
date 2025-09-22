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
import { useMobile } from '../hooks/useMobile'
import { NotificationCenter } from '../components/notifications/NotificationCenter'
import { AudioNotificationSettings } from '../components/notifications/AudioNotificationSettings'
import { WeekCounter } from '../components/notifications/WeekCounter'
import { TodayCounter } from '../components/notifications/TodayCounter'
import { UrgentCounter } from '../components/notifications/UrgentCounter'
import { CategoryFilter } from '../components/ui/CategoryFilter'
import { Plus, LogOut, Calendar, CalendarDays, RefreshCw, Trash2 } from 'lucide-react'

interface DashboardPageProps {
  user: User
  onNavigateToMonth: () => void
  onNavigateToWeek: () => void
}

export function DashboardPage({ user, onNavigateToMonth, onNavigateToWeek }: DashboardPageProps) {
  const { message, showError, showSuccess, hideMessage } = useMessage()
  const isMobile = useMobile()
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<{full_name: string} | null>(null)
  const [isUrgentMode, setIsUrgentMode] = useState(false)
  const [refreshCounters, setRefreshCounters] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Form fields for new task
  const [newPratica, setNewPratica] = useState('')
  const [newCategoria, setNewCategoria] = useState('')
  const [newScadenza, setNewScadenza] = useState('')
  const [newOra, setNewOra] = useState('')
  const [newNote, setNewNote] = useState('')
  const [newParte, setNewParte] = useState('')
  const [newControparte, setNewControparte] = useState('')

  useEffect(() => {
    loadTasks()
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      console.log('Loading profile for user ID:', user.id)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Profile query error:', error)
        console.log('Trying to get all profiles to debug...')
        
        // Debug: check if profiles table exists and has data
        const { data: allProfiles, error: allError } = await supabase
          .from('profiles')
          .select('*')
          .limit(5)
        
        console.log('All profiles debug:', allProfiles)
        console.log('All profiles error:', allError)
        
        setUserProfile(null)
        return
      }
      
      console.log('Profile data loaded:', data)
      console.log('Full name value:', data?.full_name)
      setUserProfile(data)
    } catch (error) {
      console.error('Error loading user profile:', error)
      setUserProfile(null)
    }
  }

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
        return 'bg-green-100 text-green-800 border-green-200'
      case 'ATTIVITA\' PROCESSUALE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Check if task is urgent (priority 10)
  const isUrgentTask = (priorita: number) => {
    return priorita === 10
  }

  // Get row background color based on activity type
  const getRowBackgroundColor = (attivita: string) => {
    switch (attivita) {
      case 'UDIENZA':
        return 'bg-green-50 border-green-200'
      case 'ATTIVITA\' PROCESSUALE':
        return 'bg-yellow-50 border-yellow-200'
      case 'SCADENZA ATTO PROCESSUALE':
        return 'bg-red-50 border-red-400 border-2'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const handleTaskSave = async (taskData: Partial<Task>) => {
    try {
      // Map categoria to attivita for database compatibility
      const mappedData = {
        pratica: taskData.pratica,
        attivita: taskData.categoria || taskData.attivita,
        scadenza: taskData.scadenza,
        stato: taskData.stato,
        priorita: taskData.priorita || 5, // Use priority from form or default to 5
        note: taskData.note || null,
        parte: taskData.parte || null,
        controparte: taskData.controparte || null,
        user_id: user.id
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
      setIsUrgentMode(false)
      setRefreshCounters(prev => prev + 1) // Force counter refresh
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
            priorita: isUrgentMode ? 10 : 5, // Priorità alta per urgenti, media per normali
            note: newNote.trim() || null,
            parte: newParte.trim() || null,
            controparte: newControparte.trim() || null
          })

      if (error) throw error

      // Clear form
      setNewPratica('')
      setNewCategoria('')
      setNewScadenza('')
      setNewOra('')
      setNewNote('')
      setNewParte('')
      setNewControparte('')
      setIsUrgentMode(false)
      await loadTasks()
      setRefreshCounters(prev => prev + 1) // Force counter refresh
      showSuccess('Pratica aggiunta', `La pratica ${isUrgentMode ? 'urgente' : ''} è stata aggiunta con successo`)
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
      setRefreshCounters(prev => prev + 1) // Force counter refresh
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

  // Filter tasks by category
  const getFilteredTasks = () => {
    if (selectedCategory === 'all') {
      return tasks
    }
    return tasks.filter(task => task.attivita === selectedCategory)
  }

  // Get user's display name
  const getUserDisplayName = () => {
    console.log('UserProfile:', userProfile)
    console.log('Full name check:', userProfile?.full_name)
    console.log('Full name type:', typeof userProfile?.full_name)
    console.log('Full name is null:', userProfile?.full_name === null)
    console.log('Full name is undefined:', userProfile?.full_name === undefined)
    
    // Only use full_name if it exists, is not null, and is not empty
    if (userProfile?.full_name && 
        userProfile.full_name !== null && 
        userProfile.full_name !== undefined && 
        userProfile.full_name.trim() !== '') {
      console.log('Using full_name:', userProfile.full_name)
      return userProfile.full_name
    }
    
    console.log('Full name not available, not showing any name')
    return '' // Don't show anything if full_name is not available
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-slate-900 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          {isMobile ? (
            // Mobile Header Layout
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Logo size={28} className="text-blue-300" />
                  <h1 className="text-xl font-bold text-white">LexAgenda</h1>
                </div>
                <div className="flex items-center gap-2">
                  <NotificationCenter userId={user.id} />
                  <AudioNotificationSettings userId={user.id} />
                  <Button onClick={handleLogout} variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={onNavigateToWeek} className="bg-green-600 hover:bg-green-700 text-white border-0 flex-1" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  SETTIMANA
                </Button>
                <Button onClick={onNavigateToMonth} className="bg-blue-600 hover:bg-blue-700 text-white border-0 flex-1" size="sm">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  MESE
                </Button>
              </div>
            </div>
          ) : (
            // Desktop Header Layout
            <div className="flex justify-between items-center">
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
                <NotificationCenter userId={user.id} />
                <AudioNotificationSettings userId={user.id} />
                <Button onClick={handleLogout} variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Greeting Section with All Counters */}
        {isMobile ? (
          // Mobile Layout
          <div className="mb-6 space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Buongiorno Avvocato{getUserDisplayName() ? ` ${getUserDisplayName()}` : ''}
              </h1>
              <p className="text-gray-600 mt-2">
                Ecco il riepilogo delle sue attività per oggi
              </p>
            </div>
            
            {/* Counters in vertical layout for mobile */}
            <div className="grid grid-cols-1 gap-2">
              <TodayCounter userId={user.id} key={`today-${refreshCounters}`} />
              <UrgentCounter userId={user.id} key={`urgent-${refreshCounters}`} />
              <WeekCounter userId={user.id} key={`week-${refreshCounters}`} />
            </div>
          </div>
        ) : (
          // Desktop Layout
          <div className="mb-6 flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800">
                Buongiorno Avvocato{getUserDisplayName() ? ` ${getUserDisplayName()}` : ''}
              </h1>
              <p className="text-gray-600 mt-2">
                Ecco il riepilogo delle sue attività per oggi
              </p>
            </div>
            
            {/* All Counters - positioned on the right */}
            <div className="ml-4 flex flex-col gap-2">
              {/* Today, Urgent and Week counters in horizontal layout */}
              <div className="flex gap-2">
                <TodayCounter userId={user.id} key={`today-${refreshCounters}`} />
                <UrgentCounter userId={user.id} key={`urgent-${refreshCounters}`} />
                <WeekCounter userId={user.id} key={`week-${refreshCounters}`} />
              </div>
            </div>
          </div>
        )}

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
                      {task.stato === 'done' && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Completato
                        </span>
                      )}
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
          <CardContent className={isMobile ? "p-4" : "p-6"}>
            <h3 className="text-lg font-semibold mb-4">Aggiungi Nuova Pratica</h3>
            {isMobile ? (
              // Mobile Layout - Vertical
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pratica">Pratica</Label>
                  <Input
                    id="pratica"
                    value={newPratica}
                    onChange={(e) => setNewPratica(e.target.value)}
                    placeholder="Nome della pratica"
                    className="text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoria Attività</Label>
                  <Select value={newCategoria} onValueChange={setNewCategoria}>
                    <SelectTrigger className="text-base">
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
                          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                          UDIENZA
                        </span>
                      </SelectItem>
                      <SelectItem value="ATTIVITA' PROCESSUALE">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                          ATTIVITA' PROCESSUALE
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="parte">Parte</Label>
                    <Input
                      id="parte"
                      value={newParte}
                      onChange={(e) => setNewParte(e.target.value)}
                      placeholder="es. Mario Rossi"
                      className="text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="controparte">Controparte</Label>
                    <Input
                      id="controparte"
                      value={newControparte}
                      onChange={(e) => setNewControparte(e.target.value)}
                      placeholder="es. Azienda XYZ"
                      className="text-base"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="note">Note</Label>
                  <textarea
                    id="note"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Note aggiuntive sulla pratica..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scadenza">Scadenza</Label>
                    <Input
                      id="scadenza"
                      type="date"
                      value={newScadenza}
                      onChange={(e) => setNewScadenza(e.target.value)}
                      className="text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ora">Ora (opzionale)</Label>
                    <Input
                      id="ora"
                      type="time"
                      value={newOra}
                      onChange={(e) => setNewOra(e.target.value)}
                      className="text-base"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="urgente-mobile"
                      checked={isUrgentMode}
                      onChange={(e) => setIsUrgentMode(e.target.checked)}
                      className="w-4 h-4 text-red-600 border-red-300 rounded focus:ring-red-500 cursor-pointer"
                    />
                    <label htmlFor="urgente-mobile" className="text-red-600 font-medium cursor-pointer">
                      URGENTE
                    </label>
                  </div>
                  <Button onClick={handleQuickAdd} className="bg-blue-600 hover:bg-blue-700 flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Pratica
                  </Button>
                </div>
              </div>
            ) : (
              // Desktop Layout - Two Rows
              <div className="space-y-4">
                {/* First Row */}
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Label htmlFor="pratica">Pratica</Label>
                    <Input
                      id="pratica"
                      value={newPratica}
                      onChange={(e) => setNewPratica(e.target.value)}
                      placeholder="Nome della pratica"
                    />
                  </div>
                  <div className="w-48">
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
                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            UDIENZA
                          </span>
                        </SelectItem>
                        <SelectItem value="ATTIVITA' PROCESSUALE">
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                            ATTIVITA' PROCESSUALE
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-32">
                    <Label htmlFor="scadenza">Scadenza</Label>
                    <Input
                      id="scadenza"
                      type="date"
                      value={newScadenza}
                      onChange={(e) => setNewScadenza(e.target.value)}
                    />
                  </div>
                  <div className="w-32">
                    <Label htmlFor="ora">Ora (opzionale)</Label>
                    <Input
                      id="ora"
                      type="time"
                      value={newOra}
                      onChange={(e) => setNewOra(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Second Row */}
                <div className="flex items-end gap-4">
                  <div className="w-48">
                    <Label htmlFor="parte">Parte</Label>
                    <Input
                      id="parte"
                      value={newParte}
                      onChange={(e) => setNewParte(e.target.value)}
                      placeholder="es. Mario Rossi"
                    />
                  </div>
                  <div className="w-48">
                    <Label htmlFor="controparte">Controparte</Label>
                    <Input
                      id="controparte"
                      value={newControparte}
                      onChange={(e) => setNewControparte(e.target.value)}
                      placeholder="es. Azienda XYZ"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="note">Note</Label>
                    <Input
                      id="note"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Note aggiuntive sulla pratica..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="urgente-desktop"
                        checked={isUrgentMode}
                        onChange={(e) => setIsUrgentMode(e.target.checked)}
                        className="w-4 h-4 text-red-600 border-red-300 rounded focus:ring-red-500 cursor-pointer"
                      />
                      <label htmlFor="urgente-desktop" className="text-red-600 font-medium cursor-pointer">
                        URGENTE
                      </label>
                    </div>
                  </div>
                  <Button onClick={handleQuickAdd} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Pratica
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Tasks Section */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className={isMobile ? "p-4" : "p-6"}>
            <div className="bg-purple-800 h-1 w-full mb-4 rounded"></div>
            <div className={`flex justify-between items-center mb-4 ${isMobile ? 'flex-col gap-2' : ''}`}>
              <h3 className="text-lg font-semibold text-purple-900">Tutte le Attività</h3>
              <div className={`flex items-center gap-2 ${isMobile ? 'w-full' : ''}`}>
                <CategoryFilter 
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  className={isMobile ? "flex-1" : ""}
                />
                <Button onClick={loadTasks} variant="outline" size="sm" className={isMobile ? "w-auto" : ""}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Ricarica
                </Button>
              </div>
            </div>
            {getFilteredTasks().length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {selectedCategory === 'all' 
                  ? 'Nessuna attività trovata. Aggiungi la tua prima pratica!'
                  : `Nessuna attività trovata per la categoria selezionata.`
                }
              </p>
            ) : (
              <div className="space-y-3">
                {getFilteredTasks().map((task) => (
                  <div key={task.id} className={`${isMobile ? 'p-3' : 'p-4'} rounded-lg border ${getRowBackgroundColor(task.attivita)}`}>
                    {isMobile ? (
                      // Mobile Layout - Vertical
                      <div className="space-y-3">
                        <div>
                          <div className="font-medium text-gray-900 text-base mb-1">{task.pratica}</div>
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">
                              Parte: <span className="text-gray-900 font-bold">{task.parte || 'Non specificata'}</span>
                            </span>
                            <span className="text-gray-400 mx-2">•</span>
                            <span className="font-medium">
                              Controparte: <span className="text-gray-900 font-bold">{task.controparte || 'Non specificata'}</span>
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(task.attivita)}`}>
                              {task.attivita}
                            </span>
                            {isUrgentTask(task.priorita) && (
                              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 border-red-200">
                                URGENTE
                              </span>
                            )}
                            {task.stato === 'done' && (
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                Completato
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Scadenza: {new Date(task.scadenza).toLocaleDateString('it-IT')}
                          </div>
                          {task.note && (
                            <div className="text-sm text-gray-600 mt-1 italic">
                              Note: {task.note}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setSelectedTask(task)
                              setIsTaskDialogOpen(true)
                            }}
                            variant="outline"
                            size="sm"
                            className="flex-1"
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
                    ) : (
                      // Desktop Layout - Horizontal
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-1">{task.pratica}</div>
                          <div className="text-xs text-gray-600 mb-1">
                            <span className="font-medium">
                              Parte: <span className="text-gray-900 font-bold">{task.parte || 'Non specificata'}</span>
                            </span>
                            <span className="text-gray-400 mx-1">•</span>
                            <span className="font-medium">
                              Controparte: <span className="text-gray-900 font-bold">{task.controparte || 'Non specificata'}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(task.attivita)}`}>
                              {task.attivita}
                            </span>
                            {isUrgentTask(task.priorita) && (
                              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 border-red-200">
                                URGENTE
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Scadenza: {new Date(task.scadenza).toLocaleDateString('it-IT')}
                          </div>
                          {task.note && (
                            <div className="text-xs text-gray-600 mt-1 italic">
                              Note: {task.note}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {task.stato === 'done' && (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Completato
                            </span>
                          )}
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
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={(open) => {
          setIsTaskDialogOpen(open)
          if (!open) {
            setIsUrgentMode(false)
            setSelectedTask(null)
          }
        }}
        task={selectedTask}
        onSave={handleTaskSave}
        isUrgentMode={isUrgentMode}
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
      
      {/* Footer */}
      <footer className="mt-12 py-4 bg-slate-900">
        <div className="container mx-auto px-4">
          {isMobile ? (
            // Mobile Layout - Vertical
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="text-white text-xs opacity-75">
                LexAgenda Ver 1.7.0
              </div>
              <div className="flex items-center gap-2 text-white text-sm">
                <span>Created by Abruzzo.AI</span>
                <img 
                  src="/Marchio AbruzzoAI.png" 
                  alt="Abruzzo.AI" 
                  className="h-4 w-auto"
                />
              </div>
              <div className="text-white text-xs opacity-75">
                Copyright 2025
              </div>
            </div>
          ) : (
            // Desktop Layout - Horizontal
            <div className="flex justify-between items-center">
              {/* Versione app - sinistra */}
              <div className="text-white text-xs opacity-75">
                LexAgenda Ver 1.7.0
              </div>
              
              {/* Abruzzo.AI branding - centro */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-white text-sm">
                  <span>Created by Abruzzo.AI</span>
                  <img 
                    src="/Marchio AbruzzoAI.png" 
                    alt="Abruzzo.AI" 
                    className="h-4 w-auto"
                  />
                </div>
                <div className="text-white text-xs opacity-75">
                  Copyright 2025
                </div>
              </div>
              
              {/* Spazio vuoto per bilanciare */}
              <div className="w-24"></div>
            </div>
          )}
        </div>
      </footer>
    </div>
  )
}