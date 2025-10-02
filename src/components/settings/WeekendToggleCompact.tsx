import React from 'react'
import { Switch } from '../ui/switch'
import { useWeekendSettings } from '../../contexts/WeekendSettingsContext'

interface WeekendToggleCompactProps {
  className?: string
}

export const WeekendToggleCompact: React.FC<WeekendToggleCompactProps> = ({ className = '' }) => {
  const { showWeekend, toggleWeekend } = useWeekendSettings()

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-cyan-600">
        Weekend
      </span>
      <Switch
        checked={showWeekend}
        onCheckedChange={toggleWeekend}
      />
    </div>
  )
}
