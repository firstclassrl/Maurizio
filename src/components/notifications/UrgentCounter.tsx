import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent } from '../ui/card'
import { AlertTriangle } from 'lucide-react'

interface UrgentCounterProps {
  userId: string
  onClick?: () => void
}

export function UrgentCounter({ userId, onClick }: UrgentCounterProps) {
  const [urgentCount, setUrgentCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const loadUrgentCount = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]

      // Get urgent tasks (priority 10) OR overdue tasks
      const { data: urgentTasks, error: urgentError } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', userId)
        .eq('stato', 'todo')
        .or(`priorita.eq.10,scadenza.lt.${today}`)

      if (urgentError) throw urgentError

      setUrgentCount(urgentTasks?.length || 0)
    } catch (error) {
      console.error('Error loading urgent count:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      loadUrgentCount()
      
      // Set up real-time subscription
      const subscription = supabase
        .channel('urgent_counter_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${userId}`
          },
          () => {
            loadUrgentCount()
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [userId])

  if (loading) {
    return (
      <Card className="border-red-200 bg-red-50 animate-pulse">
        <CardContent className="p-3">
          <div className="h-4 bg-red-200 rounded mb-2"></div>
          <div className="h-6 bg-red-200 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  // Always show the counter, even when count is 0

  return (
    <Card 
      className={`border-red-200 bg-red-50 ${onClick ? 'cursor-pointer hover:bg-red-100 transition-colors' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-red-800">Scadenze urgenti</p>
            <p className="text-lg font-bold text-red-900">{urgentCount}</p>
          </div>
          <div className="p-1 bg-red-100 rounded-full">
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
