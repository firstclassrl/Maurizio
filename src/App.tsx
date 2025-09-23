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
import { Loader2 } from 'lucide-react'

type AppView = 'dashboard' | 'month' | 'week' | 'overdue' | 'calcolatore-termini' | 'clients'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<AppView>('dashboard')

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
      default:
        return (
          <DashboardPage 
            user={user} 
            onNavigateToMonth={() => setCurrentView('month')}
            onNavigateToWeek={() => setCurrentView('week')}
            onNavigateToOverdue={() => setCurrentView('overdue')}
            onNavigateToCalcolatore={() => setCurrentView('calcolatore-termini')}
            onNavigateToClients={() => setCurrentView('clients')}
          />
        )
    }
  }

  return renderCurrentView()
}

export default App