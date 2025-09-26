import React from 'react'
import { Switch } from '../ui/switch'
import { useWeekendSettings } from '../../contexts/WeekendSettingsContext'

interface WeekendToggleProps {
  className?: string
}

export const WeekendToggle: React.FC<WeekendToggleProps> = ({ className = '' }) => {
  const { showWeekend, toggleWeekend } = useWeekendSettings()

  return (
    <div className={`flex items-center justify-between p-4 bg-white rounded-lg border ${className}`}>
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-900">
          Visualizza Weekend
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Mostra sabato e domenica nei calendari settimana e mese
        </p>
      </div>
      <Switch
        checked={showWeekend}
        onCheckedChange={toggleWeekend}
        className="ml-4"
      />
    </div>
  )
}
