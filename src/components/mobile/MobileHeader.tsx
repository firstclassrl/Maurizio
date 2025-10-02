import React from 'react'
import { ArrowLeft, MoreVertical } from 'lucide-react'

interface MobileHeaderProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  rightAction?: React.ReactNode
  showMenu?: boolean
  onMenuClick?: () => void
}

export function MobileHeader({ 
  title, 
  showBack, 
  onBack, 
  rightAction, 
  showMenu = false,
  onMenuClick 
}: MobileHeaderProps) {
  return (
    <div className="flex items-center justify-between h-14 px-4 bg-slate-900 border-b-2 border-yellow-500">
      <div className="flex items-center gap-3">
        {showBack && (
          <button 
            onClick={onBack}
            className="mobile-button p-2 -ml-2 text-white hover:text-gray-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="mobile-heading text-white truncate">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {rightAction}
        {showMenu && (
          <button 
            onClick={onMenuClick}
            className="mobile-button p-2 -mr-2 text-white hover:text-gray-300"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}
