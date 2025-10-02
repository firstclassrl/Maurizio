import React from 'react'
import { cn } from '../../lib/utils'

interface MobileCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  active?: boolean
}

export function MobileCard({ children, className, onClick, active }: MobileCardProps) {
  return (
    <div 
      className={cn(
        "mobile-card p-4 mb-3 transition-colors",
        onClick && "cursor-pointer hover:bg-gray-50 active:bg-gray-100",
        active && "ring-2 ring-blue-500 bg-blue-50",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
