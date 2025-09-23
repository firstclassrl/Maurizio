import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent } from '../ui/card'
import { AlertTriangle } from 'lucide-react'

interface OverdueCounterProps {
  userId: string
  onClick?: () => void
}

export function OverdueCounter({ userId, onClick }: OverdueCounterProps) {
  const [overdueCount, setOverdueCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const loadOverdueCount = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', userId)
        .lt('scadenza', today)
        .eq('stato', 'todo')

      if (error) throw error

      setOverdueCount(data?.length || 0)
    } catch (error) {
      console.error('Error loading overdue count:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      loadOverdueCount()
      
      // Set up real-time subscription
      const subscription = supabase
        .channel('overdue_counter_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${userId}`
          },
          () => {
            loadOverdueCount()
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

  // Don't show the counter if there are no overdue tasks
  if (overdueCount === 0) {
    return null
  }

  return (
    <Card 
      className="border-red-200 bg-red-50 cursor-pointer hover:bg-red-100 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-red-800">Attività scadute</p>
            <p className="text-lg font-bold text-red-900">{overdueCount}</p>
          </div>
          <div className="p-1 bg-red-100 rounded-full">
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
