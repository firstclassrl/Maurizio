import React, { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { Task } from '../../lib/calendar-utils'
import { supabase } from '../../lib/supabase'
import { MobileLayout } from '../../components/mobile/MobileLayout'
import { MobileHeader } from '../../components/mobile/MobileHeader'
import { MobileWeekView } from '../../components/mobile/MobileWeekView'
import { WeekendToggleCompact } from '../../components/settings/WeekendToggleCompact'
import { AppView } from '../../App'

interface MobileWeekPageProps {
  user: User
  onNavigate: (view: AppView) => void
}

export function MobileWeekPage({ user, onNavigate }: MobileWeekPageProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          practices!inner(
            numero,
            cliente_id,
            controparti_ids,
            clients!practices_cliente_id_fkey(
              ragione,
              nome,
              cognome
            )
          )
        `)
        .eq('user_id', user.id)
        .order('data', { ascending: true })
        .limit(1000)

      if (error) throw error

      // Transform data to match Task interface
      const transformedTasks: Task[] = (data || []).map((activity: any) => ({
        id: activity.id,
        user_id: activity.user_id,
        pratica: activity.practices?.numero || 'N/A',
        attivita: activity.attivita || 'Attività',
        categoria: activity.categoria,
        scadenza: activity.data,
        ora: activity.ora,
        stato: activity.stato || 'todo',
        urgent: activity.urgent || false,
        note: activity.note,
        cliente: activity.practices?.clients?.ragione || 
                activity.practices?.clients?.nome + ' ' + activity.practices?.clients?.cognome || 
                'N/A',
        controparte: activity.controparte,
        created_at: activity.created_at,
        updated_at: activity.updated_at
      }))

      setTasks(transformedTasks)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    // Qui potresti aprire un dialog mobile per i dettagli della task
    console.log('Task clicked:', task)
  }

  const handleTaskUpdate = () => {
    loadTasks() // Ricarica le task dopo un aggiornamento
  }

  if (isLoading) {
    return (
      <MobileLayout 
        header={
        <MobileHeader 
          title="Questa Settimana" 
          showBack={true}
          onBack={() => onNavigate('dashboard')}
        />
        }
        currentView="week"
        onNavigate={onNavigate}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento calendario...</p>
          </div>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout 
      header={
        <MobileHeader 
          title="Questa Settimana" 
          showBack={true}
          onBack={() => onNavigate('dashboard')}
          rightAction={<WeekendToggleCompact />}
        />
      }
      currentView="week"
      onNavigate={onNavigate}
    >
      <MobileWeekView 
        tasks={tasks}
        onTaskClick={handleTaskClick}
        onDateChange={handleTaskUpdate}
      />
    </MobileLayout>
  )
}
