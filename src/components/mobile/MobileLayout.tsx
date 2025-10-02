import React from 'react'
import { MobileBottomNav } from './MobileBottomNav'
import { AppView } from '../../App'

interface MobileLayoutProps {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  showBottomNav?: boolean
  currentView?: AppView
  onNavigate?: (view: AppView) => void
}

export function MobileLayout({ 
  children, 
  header, 
  footer, 
  showBottomNav = true,
  currentView,
  onNavigate
}: MobileLayoutProps) {
  return (
    <div className="mobile-layout">
      {/* Header Mobile */}
      {header && (
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          {header}
        </header>
      )}
      
      {/* Main Content */}
      <main className="flex-1 pb-20 mobile-safe-area">
        <div className="mobile-container">
          {children}
        </div>
      </main>
      
      {/* Bottom Navigation */}
      {showBottomNav && currentView && onNavigate && (
        <MobileBottomNav currentView={currentView} onNavigate={onNavigate} />
      )}
      
      {/* Footer Mobile */}
      {footer && (
        <footer className="bg-white border-t border-gray-200 mobile-safe-area">
          {footer}
        </footer>
      )}
    </div>
  )
}
