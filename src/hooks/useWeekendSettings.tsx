import { useState, useEffect } from 'react'

const WEEKEND_STORAGE_KEY = 'lexagenda-show-weekend'

export const useWeekendSettings = () => {
  const [showWeekend, setShowWeekend] = useState<boolean>(() => {
    // Default: non mostrare weekend
    const stored = localStorage.getItem(WEEKEND_STORAGE_KEY)
    return stored ? JSON.parse(stored) : false
  })

  useEffect(() => {
    localStorage.setItem(WEEKEND_STORAGE_KEY, JSON.stringify(showWeekend))
  }, [showWeekend])

  const toggleWeekend = () => {
    setShowWeekend(prev => !prev)
  }

  return {
    showWeekend,
    setShowWeekend,
    toggleWeekend
  }
}
