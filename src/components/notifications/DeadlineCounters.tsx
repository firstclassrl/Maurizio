import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

interface DeadlineCountersProps {
  userId: string
}

interface DeadlineStats {
  today: number
  tomorrow: number
  thisWeek: number
  overdue: number
}

export function DeadlineCounters({ userId }: DeadlineCountersProps) {
  const [stats, setStats] = useState<DeadlineStats>({
    today: 0,
    tomorrow: 0,
    thisWeek: 0,
    overdue: 0
  })
  const [loading, setLoading] = useState(false)

  const loadDeadlineStats = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      // Get tasks due today
      const { data: todayTasks, error: todayError } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', userId)
        .eq('scadenza', today)
        .eq('stato', 'todo')

      if (todayError) throw todayError

      // Get tasks due tomorrow
      const { data: tomorrowTasks, error: tomorrowError } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', userId)
        .eq('scadenza', tomorrow)
        .eq('stato', 'todo')

      if (tomorrowError) throw tomorrowError

      // Get tasks due this week
      const { data: weekTasks, error: weekError } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', userId)
        .gte('scadenza', today)
        .lte('scadenza', weekFromNow)
        .eq('stato', 'todo')

      if (weekError) throw weekError

      // Get overdue tasks
      const { data: overdueTasks, error: overdueError } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', userId)
        .lt('scadenza', today)
        .eq('stato', 'todo')

      if (overdueError) throw overdueError

      setStats({
        today: todayTasks?.length || 0,
        tomorrow: tomorrowTasks?.length || 0,
        thisWeek: weekTasks?.length || 0,
        overdue: overdueTasks?.length || 0
      })
    } catch (error) {
      console.error('Error loading deadline stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      loadDeadlineStats()
      
      // Set up real-time subscription
      const subscription = supabase
        .channel('deadline_stats_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${userId}`
          },
          () => {
            loadDeadlineStats()
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const totalActive = stats.today + stats.tomorrow + stats.thisWeek + stats.overdue

  if (totalActive === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Overdue Tasks */}
      {stats.overdue > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Scadenze Scadute</p>
                <p className="text-2xl font-bold text-red-900">{stats.overdue}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <Badge className="mt-2 bg-red-600 text-white">
              Urgente
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Today's Tasks */}
      {stats.today > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">Scadenze Oggi</p>
                <p className="text-2xl font-bold text-orange-900">{stats.today}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <Badge className="mt-2 bg-orange-600 text-white">
              Oggi
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Tomorrow's Tasks */}
      {stats.tomorrow > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Scadenze Domani</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.tomorrow}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <Badge className="mt-2 bg-yellow-600 text-white">
              Domani
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* This Week's Tasks */}
      {stats.thisWeek > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Questa Settimana</p>
                <p className="text-2xl font-bold text-blue-900">{stats.thisWeek}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <Badge className="mt-2 bg-blue-600 text-white">
              Questa settimana
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
