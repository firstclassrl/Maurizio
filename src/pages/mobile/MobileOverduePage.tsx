import React, { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { Task } from '../../lib/calendar-utils'
import { MobileLayout } from '../../components/mobile/MobileLayout'
import { MobileHeader } from '../../components/mobile/MobileHeader'
import { MobileTaskCard } from '../../components/mobile/MobileTaskCard'
import { MobileTaskDialog } from '../../components/mobile/MobileTaskDialog'
import { AppView } from '../../App'
import { AlertTriangle, Clock, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface MobileOverduePageProps {
  user: User
  onNavigate: (view: AppView) => void
}

export function MobileOverduePage({ user, onNavigate }: MobileOverduePageProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([])
  const [urgentTasks, setUrgentTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | undefined>()
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setIsLoading(true)
      
      // Carica le attività dal database
      const { data: tasksData, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('scadenza', { ascending: true })

      if (error) {
        console.error('Errore nel caricamento delle attività:', error)
        return
      }

      const today = new Date().toISOString().split('T')[0]
      
      // Filtra le attività scadute e urgenti
      const overdue = tasksData?.filter(task => 
        task.scadenza < today && task.stato !== 'done'
      ) || []
      
      const urgent = tasksData?.filter(task => 
        task.urgent && task.stato !== 'done'
      ) || []

      setTasks(tasksData || [])
      setOverdueTasks(overdue)
      setUrgentTasks(urgent)
    } catch (error) {
      console.error('Errore nel caricamento:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsTaskDialogOpen(true)
  }

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (selectedTask?.id) {
        // Aggiorna attività esistente
        const { error } = await supabase
          .from('activities')
          .update(taskData)
          .eq('id', selectedTask.id)

        if (error) throw error
      } else {
        // Crea nuova attività
        const { error } = await supabase
          .from('activities')
          .insert([{
            ...taskData,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])

        if (error) throw error
      }

      // Ricarica le attività
      await loadTasks()
    } catch (error) {
      console.error('Errore nel salvataggio:', error)
      throw error
    }
  }

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = today.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (isLoading) {
    return (
      <MobileLayout
        header={<MobileHeader title="Attività Scadute" showBack onBack={() => onNavigate('dashboard')} />}
        currentView="overdue"
        onNavigate={onNavigate}
      >
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento attività...</p>
          </div>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout
      header={<MobileHeader title="Attività Scadute" showBack onBack={() => onNavigate('dashboard')} />}
      currentView="overdue"
      onNavigate={onNavigate}
    >
      {/* Statistiche */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">Scadute</span>
            </div>
            <div className="text-xl font-bold text-red-700">{overdueTasks.length}</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-600">Urgenti</span>
            </div>
            <div className="text-xl font-bold text-orange-700">{urgentTasks.length}</div>
          </div>
        </div>
      </div>

      {/* Attività Scadute */}
      {overdueTasks.length > 0 && (
        <div className="mb-6">
          <div className="h-1 bg-red-500 rounded mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Attività Scadute ({overdueTasks.length})
          </h2>
          <div className="space-y-3">
            {overdueTasks.map((task) => (
              <div key={task.id} className="relative">
                <MobileTaskCard 
                  task={task} 
                  onClick={() => handleTaskClick(task)}
                />
                <div className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  +{getDaysOverdue(task.scadenza)} giorni
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attività Urgenti */}
      {urgentTasks.length > 0 && (
        <div className="mb-6">
          <div className="h-1 bg-orange-500 rounded mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Attività Urgenti ({urgentTasks.length})
          </h2>
          <div className="space-y-3">
            {urgentTasks.map((task) => (
              <div key={task.id} className="relative">
                <MobileTaskCard 
                  task={task} 
                  onClick={() => handleTaskClick(task)}
                />
                <div className="absolute top-2 right-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                  Urgente
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nessuna attività */}
      {overdueTasks.length === 0 && urgentTasks.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessuna attività scaduta
          </h3>
          <p className="text-gray-600">
            Tutte le tue attività sono in regola!
          </p>
        </div>
      )}

      {/* Dialog per modifica attività */}
      <MobileTaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        task={selectedTask}
        onSave={handleSaveTask}
      />
    </MobileLayout>
  )
}
