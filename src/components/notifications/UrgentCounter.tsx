import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent } from '../ui/card'
import { AlertTriangle } from 'lucide-react'

interface UrgentCounterProps {
  userId: string
}

export function UrgentCounter({ userId }: UrgentCounterProps) {
  const [urgentCount, setUrgentCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const loadUrgentCount = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]

      // Get overdue tasks
      const { data: overdueTasks, error: overdueError } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', userId)
        .lt('scadenza', today)
        .eq('stato', 'todo')

      if (overdueError) throw overdueError

      setUrgentCount(overdueTasks?.length || 0)
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

  if (urgentCount === 0) {
    return null
  }

  return (
    <Card className="border-red-200 bg-red-50">
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
