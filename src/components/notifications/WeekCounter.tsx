import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent } from '../ui/card'
import { CheckCircle } from 'lucide-react'

interface WeekCounterProps {
  userId: string
}

export function WeekCounter({ userId }: WeekCounterProps) {
  const [thisWeekCount, setThisWeekCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const loadThisWeekCount = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', userId)
        .gte('scadenza', today)
        .lte('scadenza', weekFromNow)
        .eq('stato', 'todo')

      if (error) throw error

      setThisWeekCount(data?.length || 0)
    } catch (error) {
      console.error('Error loading this week count:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      loadThisWeekCount()
      
      // Set up real-time subscription
      const subscription = supabase
        .channel('week_counter_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${userId}`
          },
          () => {
            loadThisWeekCount()
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
      <Card className="border-blue-200 bg-blue-50 animate-pulse">
        <CardContent className="p-3">
          <div className="h-4 bg-blue-200 rounded mb-2"></div>
          <div className="h-6 bg-blue-200 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  // Always show the counter, even when count is 0

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-blue-800">Scadenze questa settimana</p>
            <p className="text-lg font-bold text-blue-900">{thisWeekCount}</p>
          </div>
          <div className="p-1 bg-blue-100 rounded-full">
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
