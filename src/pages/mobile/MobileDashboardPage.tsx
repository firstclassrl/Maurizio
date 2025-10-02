import React, { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { Task } from '../../lib/calendar-utils'
import { supabase } from '../../lib/supabase'
import { MobileLayout } from '../../components/mobile/MobileLayout'
import { MobileHeader } from '../../components/mobile/MobileHeader'
import { MobileStatCard } from '../../components/mobile/MobileStatCard'
import { MobileActionButton } from '../../components/mobile/MobileActionButton'
import { MobileTaskCard } from '../../components/mobile/MobileTaskCard'
import { MobileClientDialog } from '../../components/mobile/MobileClientDialog'
import { AddActivityToExistingPractice } from '../../components/practice/AddActivityToExistingPractice'
import { MobileAppuntamentoDialog } from '../../components/mobile/MobileAppuntamentoDialog'
import { NewActivityWizard } from '../../components/practice/NewActivityWizard'
import { AppView } from '../../App'
import { 
  AlertTriangle, 
  Clock, 
  Plus, 
  Users, 
  Calculator,
  MoreVertical,
  Sparkles,
  FolderOpen,
  FileText,
  LogOut
} from 'lucide-react'

interface MobileDashboardPageProps {
  user: User
  onNavigate: (view: AppView) => void
  onNavigateToCalcolatore: () => void
  onNavigateToClients: () => void
  onNavigateToStorage: () => void
  onNavigateToPracticeArchive: () => void
  
}

export function MobileDashboardPage({ 
  user, 
  onNavigate,
  onNavigateToCalcolatore,
  onNavigateToClients,
  onNavigateToStorage,
  onNavigateToPracticeArchive,
  
}: MobileDashboardPageProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [urgentTasks, setUrgentTasks] = useState<Task[]>([])
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([])
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false)
  const [isAddActivityDialogOpen, setIsAddActivityDialogOpen] = useState(false)
  const [isAppuntamentoDialogOpen, setIsAppuntamentoDialogOpen] = useState(false)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [clients, setClients] = useState<any[]>([])

  useEffect(() => {
    // Carica subito sia clienti che attività
    loadClients()
    loadTasks()
  }, [])

  const loadClients = async () => {
    try {
      const { data: clientsData, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Errore nel caricamento dei clienti:', error)
        return
      }

      setClients(clientsData || [])
    } catch (error) {
      console.error('Errore nel caricamento dei clienti:', error)
    }
  }

  const loadTasks = async () => {
    try {
      // Rich query with joins (best-effort)
      let activitiesData: any[] | null = null
      let errorJoin: any = null
      {
        const { data, error } = await supabase
          .from('activities')
          .select(`
            *,
            practices(
              numero,
              cliente_id,
              controparti_ids
            )
          `)
          .eq('user_id', user.id)
          .order('data', { ascending: true })
        activitiesData = data
        errorJoin = error
      }

      if (errorJoin) {
        console.warn('Join failed, falling back to simple activities query:', errorJoin)
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', user.id)
          .order('data', { ascending: true })
        if (error) throw error
        activitiesData = data
      }

      const transformedTasks: Task[] = (activitiesData || []).map(activity => ({
        id: activity.id,
        user_id: activity.user_id,
        attivita: activity.attivita,
        pratica: activity.practices?.numero || 'Pratica',
        scadenza: activity.data,
        ora: activity.ora || '00:00',
        stato: activity.stato === 'done' ? 'done' : 'todo',
        urgent: (activity.priorita ?? 5) >= 8,
        categoria: activity.categoria,
        cliente: 'Cliente',
        controparte: null,
        created_at: activity.created_at,
        updated_at: activity.updated_at
      }))

      // If empty, provide mock tasks
      const list = transformedTasks && transformedTasks.length > 0 ? transformedTasks : [
        {
          id: 'm1', user_id: user.id, pratica: '2025/001', attivita: 'Deposito ricorso', scadenza: new Date().toISOString().split('T')[0], ora: '10:00', stato: 'todo', urgent: true, categoria: 'Scadenza Processuale', cliente: 'Rossi Mario', controparte: 'Alfa S.p.A.', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        },
        {
          id: 'm2', user_id: user.id, pratica: '2025/002', attivita: 'Udienza di comparizione', scadenza: new Date(Date.now()+86400000).toISOString().split('T')[0], ora: '09:30', stato: 'todo', urgent: false, categoria: 'Udienza', cliente: 'Beta S.r.l.', controparte: 'Bianchi Lucia', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        }
      ]

      setTasks(list)
      setUrgentTasks(list.filter(t => t.urgent))
      setOverdueTasks(list.filter(t => t.stato === 'todo' && new Date(t.scadenza) < new Date()))
      setTodayTasks(list.filter(t => t.scadenza === new Date().toISOString().split('T')[0]))
    } catch (error) {
      console.error('Error loading tasks:', error)
      setTasks([])
      setUrgentTasks([])
      setOverdueTasks([])
      setTodayTasks([])
    }
  }

  const handleTaskClick = (task: Task) => {
    // Implementare apertura dettagli task
    console.log('Task clicked:', task)
  }

  const handleNewActivity = () => {
    // Implementare nuova attività
    console.log('New activity')
  }

  const handleNewClient = () => {
    setIsClientDialogOpen(true)
  }

  const handleAssistant = () => {
    onNavigate('assistant')
  }

  const handleLogout = async () => {
    try {
      const confirmed = window.confirm('Sei sicuro di voler uscire?')
      if (!confirmed) return
      await supabase.auth.signOut()
      // Torna alla pagina di login
      onNavigate('dashboard')
      window.location.reload()
    } catch (error) {
      console.error('Errore nel logout:', error)
    }
  }

  const menuItems = [
    { label: 'Calcolatore Termini', onClick: onNavigateToCalcolatore, icon: Calculator },
    { label: 'Archivio Pratiche', onClick: onNavigateToPracticeArchive, icon: MoreVertical },
    { label: 'Storage', onClick: onNavigateToStorage, icon: MoreVertical },
    { label: 'Logout', onClick: handleLogout, icon: LogOut },
  ]

  return (
    <MobileLayout 
      header={
        <MobileHeader 
          title="LexAgenda" 
          showMenu={true}
          onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
          rightAction={
            <div className="flex items-center gap-1">
              <button 
                onClick={onNavigateToCalcolatore}
                className="mobile-button p-2 text-purple-600 hover:text-purple-700"
                title="Calcolatore Termini"
              >
                <Calculator className="h-5 w-5" />
              </button>
              <button 
                onClick={handleAssistant}
                className="mobile-button p-2 -mr-2 text-blue-600 hover:text-blue-700"
              >
                <Sparkles className="h-5 w-5" />
              </button>
            </div>
          }
        />
      }
      currentView="dashboard"
      onNavigate={onNavigate}
    >
      {/* Demo banner removed */}

      {/* Quick Stats */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-3">
          <MobileStatCard 
            title="Urgenti" 
            value={urgentTasks.length} 
            color="red" 
            icon={AlertTriangle}
            onClick={() => onNavigate('overdue')}
          />
          <MobileStatCard 
            title="Scaduti" 
            value={overdueTasks.length} 
            color="orange" 
            icon={Clock}
            onClick={() => onNavigate('overdue')}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <div className="h-1 bg-black rounded mb-4"></div>
        <h2 className="mobile-heading mb-3">Azioni Rapide</h2>
        <div className="grid grid-cols-3 gap-2 mb-3">
        <MobileActionButton
          icon={Plus}
          label="Nuova Parte"
          onClick={() => setIsClientDialogOpen(true)}
          color="orange"
          variant="solid"
        />
          <MobileActionButton 
            icon={FolderOpen}
            label="Nuova Pratica"
            onClick={() => setIsWizardOpen(true)}
            color="blue"
            variant="solid"
          />
          <MobileActionButton 
            icon={FileText}
            label="Aggiungi Attività"
            onClick={() => setIsAddActivityDialogOpen(true)}
            color="purple"
            variant="solid"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MobileActionButton 
            icon={FileText}
            label="Pratiche"
            onClick={onNavigateToPracticeArchive}
            color="blue"
            variant="outline"
          />
          <MobileActionButton 
            icon={Users}
            label="Parti"
            onClick={onNavigateToClients}
            color="orange"
            variant="outline"
          />
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="mb-6">
        <div className="h-1 bg-yellow-500 rounded mb-4"></div>
        <h2 className="mobile-heading mb-3">Oggi</h2>
        {todayTasks.length > 0 ? (
          <div className="space-y-3">
            {todayTasks.map(task => (
              <MobileTaskCard 
                key={task.id}
                task={task}
                onClick={() => handleTaskClick(task)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Nessuna attività per oggi</p>
          </div>
        )}
      </div>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsMenuOpen(false)}>
          <div className="absolute top-16 right-4 bg-white rounded-lg shadow-lg p-2 min-w-[200px]">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick()
                  setIsMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 rounded-md ${item.label === 'Logout' ? 'text-red-600' : ''}`}
              >
                <item.icon className={`h-4 w-4 ${item.label === 'Logout' ? 'text-red-600' : ''}`} />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <MobileClientDialog
        open={isClientDialogOpen}
        onOpenChange={setIsClientDialogOpen}
        onSave={async (clientData: any) => {
          try {
            console.log('Salvataggio cliente:', clientData)
            // Qui andrebbe la logica di salvataggio in Supabase
          } catch (error) {
            console.error('Errore nel salvataggio del cliente:', error)
            throw error
          }
        }}
      />

      <AddActivityToExistingPractice
        open={isAddActivityDialogOpen}
        onOpenChange={setIsAddActivityDialogOpen}
        clients={clients}
        onActivityCreated={(activity) => {
          console.log('Attività creata:', activity)
          loadTasks() // Ricarica le attività
        }}
      />

      <MobileAppuntamentoDialog
        open={isAppuntamentoDialogOpen}
        onOpenChange={setIsAppuntamentoDialogOpen}
        onSave={async (appuntamentoData: any) => {
          try {
            console.log('Salvataggio appuntamento:', appuntamentoData)
            // Qui andrebbe la logica di salvataggio in Supabase
          } catch (error) {
            console.error('Errore nel salvataggio dell\'appuntamento:', error)
            throw error
          }
        }}
      />

      <NewActivityWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        clients={clients}
        onActivityCreated={() => {
          console.log('Attività creata')
          loadTasks() // Ricarica le attività
        }}
        onPracticeCreated={() => {
          console.log('Pratica creata')
          loadClients() // Ricarica i clienti
        }}
      />

    </MobileLayout>
  )
}
