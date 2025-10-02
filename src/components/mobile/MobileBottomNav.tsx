import React from 'react'
import { 
  Home, 
  Calendar, 
  CalendarDays, 
  AlertTriangle, 
  Users,
  Calculator,
  Archive
} from 'lucide-react'
import { AppView } from '../../App'

interface MobileBottomNavProps {
  currentView: AppView
  onNavigate: (view: AppView) => void
}

export function MobileBottomNav({ currentView, onNavigate }: MobileBottomNavProps) {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'week', icon: CalendarDays, label: 'Settimana' },
    { id: 'month', icon: Calendar, label: 'Mese' },
    { id: 'overdue', icon: AlertTriangle, label: 'Scaduti' },
    { id: 'clients', icon: Users, label: 'Clienti' },
  ] as const

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 mobile-safe-area z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onNavigate(id as AppView)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              currentView === id 
                ? 'text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
