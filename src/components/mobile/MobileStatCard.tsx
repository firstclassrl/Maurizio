import React from 'react'
import { LucideIcon } from 'lucide-react'
import { MobileCard } from './MobileCard'

interface MobileStatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  color: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray'
  onClick?: () => void
}

export function MobileStatCard({ title, value, icon: Icon, color, onClick }: MobileStatCardProps) {
  const colorClasses = {
    red: 'text-red-600 bg-red-50',
    orange: 'text-orange-600 bg-orange-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    green: 'text-green-600 bg-green-50',
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
    gray: 'text-gray-600 bg-gray-50'
  }

  return (
    <MobileCard onClick={onClick} className="text-center py-1">
      <div className="flex items-center justify-center gap-2">
        <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-3 w-3" />
        </div>
        <div className="text-sm font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-600">{title}</div>
      </div>
    </MobileCard>
  )
}
