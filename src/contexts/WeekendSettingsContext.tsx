import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react'

interface WeekendSettingsContextType {
  showWeekend: boolean
  toggleWeekend: () => void
}

const WeekendSettingsContext = createContext<WeekendSettingsContextType | undefined>(undefined)

interface WeekendSettingsProviderProps {
  children: ReactNode
}

export const WeekendSettingsProvider: React.FC<WeekendSettingsProviderProps> = ({ children }) => {
  const [showWeekend, setShowWeekend] = useState<boolean>(() => {
    const storedValue = localStorage.getItem('lexagenda-show-weekend')
    return storedValue ? JSON.parse(storedValue) : false // Default to false
  })

  useEffect(() => {
    localStorage.setItem('lexagenda-show-weekend', JSON.stringify(showWeekend))
  }, [showWeekend])

  const toggleWeekend = () => {
    setShowWeekend(prev => !prev)
  }

  return (
    <WeekendSettingsContext.Provider value={{ showWeekend, toggleWeekend }}>
      {children}
    </WeekendSettingsContext.Provider>
  )
}

export const useWeekendSettings = () => {
  const context = useContext(WeekendSettingsContext)
  if (context === undefined) {
    throw new Error('useWeekendSettings must be used within a WeekendSettingsProvider')
  }
  return context
}
