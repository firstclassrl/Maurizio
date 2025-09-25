import { useState, useRef, useCallback } from 'react'
import { Task } from '../lib/calendar-utils'

interface UseActivityTooltipReturn {
  tooltip: {
    isVisible: boolean
    task: Task | null
    position: { x: number; y: number }
  }
  handleMouseEnter: (task: Task, event: React.MouseEvent) => void
  handleMouseLeave: () => void
}

export const useActivityTooltip = (delay: number = 2000): UseActivityTooltipReturn => {
  const [tooltip, setTooltip] = useState<{
    isVisible: boolean
    task: Task | null
    position: { x: number; y: number }
  }>({
    isVisible: false,
    task: null,
    position: { x: 0, y: 0 }
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = useCallback((task: Task, event: React.MouseEvent) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setTooltip({
        isVisible: true,
        task,
        position: {
          x: event.clientX,
          y: event.clientY
        }
      })
    }, delay)
  }, [delay])

  const handleMouseLeave = useCallback(() => {
    // Clear timeout if mouse leaves before delay
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Hide tooltip
    setTooltip(prev => ({
      ...prev,
      isVisible: false
    }))
  }, [])

  return {
    tooltip,
    handleMouseEnter,
    handleMouseLeave
  }
}
