import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Settings, Sparkles } from 'lucide-react'
import { Logo } from '../ui/Logo'

interface DashboardHeaderProps {
  onAssistantOpen: (query?: string) => void
  onOptionsOpen: () => void
}

export function DashboardHeader({
  onAssistantOpen,
  onOptionsOpen,
}: DashboardHeaderProps) {
  const [assistantQuery, setAssistantQuery] = useState('')

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e Titolo LexAgenda */}
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <div>
              <h1 className="text-xl font-bold text-gray-900">LexAgenda</h1>
              <p className="text-sm text-gray-500">Gestione pratiche e scadenze</p>
            </div>
          </div>
          
          {/* Controlli Header */}
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
            
            {/* Pulsante Opzioni - solo rotella */}
            <Button variant="outline" size="sm" onClick={onOptionsOpen}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}