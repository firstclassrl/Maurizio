import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Settings, Sparkles, Calendar, CalendarDays, Calculator, LogOut } from 'lucide-react'
import { Logo } from '../ui/Logo'
import { supabase } from '../../lib/supabase'

interface DashboardHeaderProps {
  onAssistantOpen: (query?: string) => void
  onOptionsOpen: () => void
  onNavigateToWeek: () => void
  onNavigateToMonth: () => void
  onNavigateToCalcolatore: () => void
}

export function DashboardHeader({
  onAssistantOpen,
  onOptionsOpen,
  onNavigateToWeek,
  onNavigateToMonth,
  onNavigateToCalcolatore,
}: DashboardHeaderProps) {
  const [assistantQuery, setAssistantQuery] = useState('')

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Errore durante il logout:', error)
    }
  }

  return (
    <div className="bg-slate-900 border-b border-slate-700 shadow-lg relative">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e Titolo LexAgenda */}
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <div>
              <h1 className="text-xl font-bold text-white">LexAgenda</h1>
              <p className="text-sm text-slate-300">Gestione pratiche e scadenze</p>
            </div>
          </div>
          
          {/* Controlli Header - Tutti sulla stessa riga */}
          <div className="flex items-center gap-3">
            {/* Assistente AI */}
            <div className="relative">
              <Sparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
              <Input
                placeholder="Chiedi al tuo assistente AI..."
                value={assistantQuery}
                onChange={(e) => setAssistantQuery(e.target.value)}
                className="pl-10 bg-blue-50 border-blue-200 text-blue-700 placeholder-blue-400 focus:bg-blue-100 focus:border-blue-300 w-64"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && assistantQuery.trim()) {
                    onAssistantOpen(assistantQuery.trim())
                    setAssistantQuery('')
                  }
                }}
              />
            </div>
            
            {/* Tasto Settimana */}
            <Button
              onClick={onNavigateToWeek}
              className="bg-cyan-500 hover:bg-cyan-600 text-white border-0"
              size="sm"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Settimana
            </Button>
            
            {/* Tasto Mese */}
            <Button
              onClick={onNavigateToMonth}
              className="bg-green-600 hover:bg-green-700 text-white border-0"
              size="sm"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Mese
            </Button>
            
            {/* Tasto Calcolatore */}
            <Button
              onClick={onNavigateToCalcolatore}
              className="bg-amber-200 hover:bg-amber-300 text-amber-900 border-0"
              size="sm"
            >
              <Calculator className="h-4 w-4 mr-2" />
              CALCOLATORE
            </Button>
            
            {/* Pulsante Opzioni - solo rotella */}
            <Button variant="outline" size="sm" onClick={onOptionsOpen} className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
              <Settings className="h-4 w-4" />
            </Button>
            
            {/* Pulsante Logout */}
            <Button variant="outline" size="sm" onClick={handleLogout} className="bg-red-600 border-red-500 text-white hover:bg-red-700">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {/* Riga dorata alla base */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
    </div>
  )
}