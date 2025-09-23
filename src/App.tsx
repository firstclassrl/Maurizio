import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { User } from '@supabase/supabase-js'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { MonthPage } from './pages/MonthPage'
import { WeekPage } from './pages/WeekPage'
import { CalcolatoreTerminiPage } from './pages/CalcolatoreTerminiPage'
import { Loader2 } from 'lucide-react'

type AppView = 'dashboard' | 'month' | 'week' | 'calcolatore-termini'

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
            onNavigateToCalcolatore={() => setCurrentView('calcolatore-termini')}
          />
        )
      case 'month':
        return (
          <MonthPage 
            user={user} 
            onBackToDashboard={() => setCurrentView('dashboard')}
            onNavigateToWeek={() => setCurrentView('week')}
            onNavigateToDay={() => setCurrentView('dashboard')} // Per ora torna alla dashboard
          />
        )
      case 'week':
        return (
          <WeekPage 
            user={user} 
            onBackToDashboard={() => setCurrentView('dashboard')}
            onNavigateToMonth={() => setCurrentView('month')}
            onNavigateToDay={() => setCurrentView('dashboard')} // Per ora torna alla dashboard
          />
        )
      case 'calcolatore-termini':
        return (
          <CalcolatoreTerminiPage 
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
            onNavigateToCalcolatore={() => setCurrentView('calcolatore-termini')}
          />
        )
    }
  }

  return renderCurrentView()
}

export default App