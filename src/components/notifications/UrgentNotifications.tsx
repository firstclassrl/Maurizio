import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { AlertTriangle, Clock, Check, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'

interface Notification {
  id: string
  user_id: string
  task_id?: string
  type: string
  title: string
  message: string
  is_read: boolean
  priority: 'low' | 'normal' | 'high' | 'urgent'
  scheduled_for?: string
  created_at: string
  read_at?: string
}

interface UrgentNotificationsProps {
  userId: string
}

export function UrgentNotifications({ userId }: UrgentNotificationsProps) {
  const [urgentNotifications, setUrgentNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  const loadUrgentNotifications = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('priority', 'urgent')
        .eq('is_read', false)
        .lte('scheduled_for', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      setUrgentNotifications(data || [])
    } catch (error) {
      console.error('Error loading urgent notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId)

      if (error) throw error

      // Update local state
      setUrgentNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const dismissNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId)

      if (error) throw error

      // Remove from local state
      setUrgentNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Error dismissing notification:', error)
    }
  }

  useEffect(() => {
    if (userId) {
      loadUrgentNotifications()
      
      // Set up real-time subscription
      const subscription = supabase
        .channel('urgent_notifications_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          () => {
            loadUrgentNotifications()
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
      <Card className="mb-6 bg-red-50 border-red-200">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Caricamento notifiche urgenti...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (urgentNotifications.length === 0) {
    return null
  }

  return (
    <Card className="mb-6 bg-red-50 border-red-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          Notifiche Urgenti
          <Badge className="bg-red-600 text-white">
            {urgentNotifications.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {urgentNotifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200"
            >
              <div className="flex-shrink-0 mt-1">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-red-900 mb-1">
                  {notification.title}
                </h4>
                <p className="text-sm text-red-700 mb-2">
                  {notification.message}
                </p>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-600">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                      locale: it
                    })}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAsRead(notification.id)}
                  className="p-1 h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissNotification(notification.id)}
                  className="p-1 h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
