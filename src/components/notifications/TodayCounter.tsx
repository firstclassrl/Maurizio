import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent } from '../ui/card'
import { Clock } from 'lucide-react'

interface TodayCounterProps {
  userId: string
}

export function TodayCounter({ userId }: TodayCounterProps) {
  const [todayCount, setTodayCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const loadTodayCount = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', userId)
        .eq('scadenza', today)
        .eq('stato', 'todo')

      if (error) throw error

      setTodayCount(data?.length || 0)
    } catch (error) {
      console.error('Error loading today count:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      loadTodayCount()
      
      // Set up real-time subscription
      const subscription = supabase
        .channel('today_counter_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${userId}`
          },
          () => {
            loadTodayCount()
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
      <Card className="border-orange-200 bg-orange-50 animate-pulse">
        <CardContent className="p-3">
          <div className="h-4 bg-orange-200 rounded mb-2"></div>
          <div className="h-6 bg-orange-200 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  // Always show the counter, even when count is 0

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-orange-800">Scadenze oggi</p>
            <p className="text-lg font-bold text-orange-900">{todayCount}</p>
          </div>
          <div className="p-1 bg-orange-100 rounded-full">
            <Clock className="h-4 w-4 text-orange-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
