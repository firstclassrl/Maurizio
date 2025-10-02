import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { User } from '@supabase/supabase-js'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { MonthPage } from './pages/MonthPage'
import { WeekPage } from './pages/WeekPage'
import { OverduePage } from './pages/OverduePage'
import { CalcolatoreTerminiPage } from './pages/CalcolatoreTerminiPage'
import { ClientsPage } from './pages/ClientsPage'
import { StoragePage } from './pages/StoragePage'
import { PracticeArchivePage } from './pages/PracticeArchivePage'
import { MobileDashboardPage } from './pages/mobile/MobileDashboardPage'
import { MobileOverduePage } from './pages/mobile/MobileOverduePage'
import { MobileClientsPage } from './pages/mobile/MobileClientsPage'
import { MobilePracticeArchivePageCorrect } from './pages/mobile/MobilePracticeArchivePageCorrect'
import { MobileMonthPage } from './pages/mobile/MobileMonthPage'
import { MobileWeekPage } from './pages/mobile/MobileWeekPage'
import { MobileAssistantPage } from './pages/mobile/MobileAssistantPage'
import { Loader2 } from 'lucide-react'
import { WeekendSettingsProvider } from './contexts/WeekendSettingsContext'
import { useAppUpdate } from './hooks/useAppUpdate'
import { UpdateNotification } from './components/ui/UpdateNotification'
import { useMobile } from './hooks/useMobile'
// Demo data hook removed

export type AppView = 'dashboard' | 'month' | 'week' | 'overdue' | 'calcolatore-termini' | 'clients' | 'storage' | 'practice-archive' | 'assistant'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<AppView>('dashboard')
  const [showUpdateNotification, setShowUpdateNotification] = useState(false)
  const { isUpdateAvailable, isUpdating, updateApp } = useAppUpdate()
  const isMobile = useMobile()
  // Demo data removed

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Mostra la notifica di aggiornamento quando disponibile
  useEffect(() => {
    if (isUpdateAvailable) {
      setShowUpdateNotification(true)
    }
  }, [isUpdateAvailable])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Caricamento...</span>
        </div>
      </div>
    )
  }

  const renderCurrentView = () => {
    if (!user) return <LoginPage />
    
    // Mobile routing
    if (isMobile) {
      switch (currentView) {
        case 'dashboard':
          return (
            <MobileDashboardPage 
              user={user} 
              onNavigate={setCurrentView}
              onNavigateToCalcolatore={() => setCurrentView('calcolatore-termini')}
              onNavigateToClients={() => setCurrentView('clients')}
              onNavigateToStorage={() => setCurrentView('storage')}
              onNavigateToPracticeArchive={() => setCurrentView('practice-archive')}
              
            />
          )
        case 'month':
          return (
            <MobileMonthPage 
              user={user} 
              onNavigate={setCurrentView}
            />
          )
        case 'week':
          return (
            <MobileWeekPage 
              user={user} 
              onNavigate={setCurrentView}
            />
          )
        case 'overdue':
          return (
            <MobileOverduePage 
              user={user} 
              onNavigate={setCurrentView}
            />
          )
        case 'clients':
          return (
            <MobileClientsPage 
              user={user} 
              onNavigate={setCurrentView}
            />
          )
        case 'practice-archive':
          return (
            <MobilePracticeArchivePageCorrect 
              user={user}
              onNavigate={setCurrentView}
            />
          )
        case 'calcolatore-termini':
          return (
            <CalcolatoreTerminiPage 
              user={user} 
              onBackToDashboard={() => setCurrentView('dashboard')}
            />
          )
        case 'assistant':
          return (
            <MobileAssistantPage 
              user={user}
              onNavigate={setCurrentView}
            />
          )
        // Per le altre pagine mobile usiamo ancora le versioni desktop
        // Implementeremo le versioni mobile specifiche nei prossimi step
        default:
          return (
            <MobileDashboardPage 
              user={user} 
              onNavigate={setCurrentView}
              onNavigateToCalcolatore={() => setCurrentView('calcolatore-termini')}
              onNavigateToClients={() => setCurrentView('clients')}
              onNavigateToStorage={() => setCurrentView('storage')}
              onNavigateToPracticeArchive={() => setCurrentView('practice-archive')}
              
            />
          )
      }
    }
    
    // Desktop routing
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardPage 
            user={user} 
            onNavigateToMonth={() => setCurrentView('month')}
            onNavigateToWeek={() => setCurrentView('week')}
            onNavigateToOverdue={() => setCurrentView('overdue')}
            onNavigateToCalcolatore={() => setCurrentView('calcolatore-termini')}
            onNavigateToClients={() => setCurrentView('clients')}
            onNavigateToStorage={() => setCurrentView('storage')}
            onNavigateToPracticeArchive={() => setCurrentView('practice-archive')}
            
          />
        )
        case 'month':
          return (
            <MonthPage 
              user={user} 
              onBackToDashboard={() => setCurrentView('dashboard')}
              onNavigateToWeek={() => setCurrentView('week')}
            />
          )
        case 'week':
          return (
            <WeekPage 
              user={user} 
              onBackToDashboard={() => setCurrentView('dashboard')}
              onNavigateToMonth={() => setCurrentView('month')}
            />
          )
        case 'overdue':
          return (
            <OverduePage 
              user={user} 
              onBackToDashboard={() => setCurrentView('dashboard')}
            />
          )
      case 'calcolatore-termini':
        return (
          <CalcolatoreTerminiPage 
            user={user} 
            onBackToDashboard={() => setCurrentView('dashboard')}
          />
        )
      case 'clients':
        return (
          <ClientsPage 
            user={user} 
            onBackToDashboard={() => setCurrentView('dashboard')}
          />
        )
      case 'storage':
        return (
          <StoragePage 
            onNavigateBack={() => setCurrentView('dashboard')}
          />
        )
      case 'practice-archive':
        return (
          <PracticeArchivePage 
            onNavigateBack={() => setCurrentView('dashboard')}
          />
        )
      default:
        return (
          <DashboardPage 
            user={user} 
            onNavigateToMonth={() => setCurrentView('month')}
            onNavigateToWeek={() => setCurrentView('week')}
            onNavigateToOverdue={() => setCurrentView('overdue')}
            onNavigateToCalcolatore={() => setCurrentView('calcolatore-termini')}
            onNavigateToClients={() => setCurrentView('clients')}
            onNavigateToStorage={() => setCurrentView('storage')}
            onNavigateToPracticeArchive={() => setCurrentView('practice-archive')}
          />
        )
    }
  }

  return (
    <WeekendSettingsProvider>
      {renderCurrentView()}
      <UpdateNotification
        isVisible={showUpdateNotification}
        isUpdating={isUpdating}
        onUpdate={() => {
          updateApp()
          setShowUpdateNotification(false)
        }}
        onDismiss={() => setShowUpdateNotification(false)}
      />
    </WeekendSettingsProvider>
  )
}

export default App