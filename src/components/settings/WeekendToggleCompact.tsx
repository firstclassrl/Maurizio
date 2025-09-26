import React from 'react'
import { Switch } from '../ui/switch'
import { useWeekendSettings } from '../../hooks/useWeekendSettings'

interface WeekendToggleCompactProps {
  className?: string
}

export const WeekendToggleCompact: React.FC<WeekendToggleCompactProps> = ({ className = '' }) => {
  const { showWeekend, toggleWeekend } = useWeekendSettings()

  const handleToggle = (checked: boolean) => {
    console.log('🔧 WeekendToggleCompact: Toggle clicked, new value:', checked)
    toggleWeekend()
  }

  console.log('🔧 WeekendToggleCompact: Current showWeekend value:', showWeekend)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700">
        Weekend
      </span>
      <Switch
        checked={showWeekend}
        onCheckedChange={(checked) => {
          console.log('🔧 Switch onCheckedChange called with:', checked)
          handleToggle(checked)
        }}
      />
    </div>
  )
}
