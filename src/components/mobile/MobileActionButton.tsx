import React from 'react'
import { LucideIcon } from 'lucide-react'
import { MobileCard } from './MobileCard'

interface MobileActionButtonProps {
  icon: LucideIcon
  label: string
  onClick: () => void
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'gray'
  variant?: 'solid' | 'outline'
}

export function MobileActionButton({ icon: Icon, label, onClick, color = 'blue', variant = 'solid' }: MobileActionButtonProps) {
  const getColorClasses = () => {
    if (variant === 'outline') {
      return {
        blue: 'bg-white text-blue-600 border-2 border-blue-600',
        orange: 'bg-white text-orange-600 border-2 border-orange-600',
        purple: 'bg-white text-purple-600 border-2 border-purple-600',
        green: 'bg-white text-green-600 border-2 border-green-600',
        gray: 'bg-white text-gray-600 border-2 border-gray-600'
      }
    }
    
    return {
      blue: 'bg-blue-600 text-white border-0',
      orange: 'bg-orange-600 text-white border-0',
      purple: 'bg-purple-600 text-white border-0',
      green: 'bg-green-600 text-white border-0',
      gray: 'bg-gray-600 text-white border-0'
    }
  }

  const colorClasses = getColorClasses()[color]

  return (
    <div 
      onClick={onClick}
      className={`text-center rounded-lg shadow-sm p-4 mb-3 cursor-pointer ${colorClasses}`}
    >
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs font-medium">{label}</span>
      </div>
    </div>
  )
}
