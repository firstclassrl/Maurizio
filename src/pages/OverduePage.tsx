import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Task } from '../lib/calendar-utils'
import { User } from '@supabase/supabase-js'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { TaskDialog } from '../components/dashboard/TaskDialog'
import { Footer } from '../components/ui/Footer'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

interface OverduePageProps {
  user: User
  onBackToDashboard: () => void
}

export function OverduePage({ user, onBackToDashboard }: OverduePageProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadOverdueTasks = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          practices (
            numero,
            cliente,
            controparte,
            controparti_ids
          )
        `)
        .eq('user_id', user.id)
        .lt('data', today)
        .eq('stato', 'todo')
        .order('data', { ascending: true })

      if (error) throw error

      // Convert activities to tasks format for compatibility
      const convertedTasks = (data || []).map(activity => ({
        id: activity.id,
        user_id: activity.user_id,
        pratica: activity.practices?.numero || 'N/A',
        attivita: activity.attivita,
        scadenza: activity.data,
        ora: activity.ora,
        stato: activity.stato,
        urgent: activity.priorita === 'alta',
        note: activity.note,
        cliente: null, // Will be populated by client lookup if needed
        controparte: null, // Will be populated by client lookup if needed
        categoria: activity.categoria,
        evaso: activity.stato === 'done',
        created_at: activity.created_at,
        updated_at: activity.updated_at
      }))

      setTasks(convertedTasks)
    } catch (error) {
      console.error('Error loading overdue activities:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadOverdueTasks()
    }
  }, [user])

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsTaskDialogOpen(true)
  }

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (!selectedTask) return

    try {
      // Map to activities table format
      const mappedData = {
        attivita: taskData.attivita,
        data: taskData.scadenza,
        ora: taskData.ora,
        stato: taskData.stato,
        priorita: taskData.urgent ? 'alta' : 'normale',
        note: taskData.note,
        categoria: taskData.categoria,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('activities')
        .update(mappedData)
        .eq('id', selectedTask.id)

      if (error) throw error

      await loadOverdueTasks()
      setIsTaskDialogOpen(false)
      setSelectedTask(null)
    } catch (error) {
      console.error('Error updating activity:', error)
    }
  }

  const handleNewTask = () => {
    setSelectedTask(null)
    setIsTaskDialogOpen(true)
  }

  const handleSaveNewTask = async (taskData: Partial<Task>) => {
    try {
      // Map to activities table format
      const mappedData = {
        attivita: taskData.attivita,
        data: taskData.scadenza,
        ora: taskData.ora,
        stato: taskData.stato,
        priorita: taskData.urgent ? 'alta' : 'normale',
        note: taskData.note,
        categoria: taskData.categoria,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('activities')
        .insert(mappedData)

      if (error) throw error

      await loadOverdueTasks()
      setIsTaskDialogOpen(false)
      setSelectedTask(null)
    } catch (error) {
      console.error('Error creating activity:', error)
    }
  }

  const getDaysOverdue = (scadenza: string) => {
    const today = new Date()
    const dueDate = new Date(scadenza)
    const diffTime = today.getTime() - dueDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getTaskColor = (task: Task) => {
    if (task.attivita === 'SCADENZA ATTO PROCESSUALE') {
      return 'bg-red-50 border-red-200'
    } else if (task.attivita === 'UDIENZA') {
      return 'bg-green-50 border-green-200'
    } else if (task.attivita === 'ATTIVITA\' PROCESSUALE') {
      return 'bg-yellow-50 border-yellow-200'
    } else if (task.attivita === 'APPUNTAMENTO IN STUDIO') {
      return 'bg-cyan-50 border-cyan-200'
    }
    return 'bg-gray-50 border-gray-200'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento attività scadute...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button onClick={onBackToDashboard} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna a Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Attività Scadute</h1>
            </div>
          </div>
          <Button onClick={handleNewTask} variant="outline" size="sm" className="bg-red-600 text-white hover:bg-red-700">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Nuova Attività Urgente
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-6">
        {tasks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <AlertTriangle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Nessuna Attività Scaduta!</h2>
              <p className="text-gray-600">Ottimo lavoro! Non hai attività scadute non evase.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-800">
                {tasks.length} attività scadute non evase
              </h2>
            </div>

            {tasks.map((task) => {
              const daysOverdue = getDaysOverdue(task.scadenza)
              
              return (
                <Card key={task.id} className={`border-l-4 border-l-red-500 ${getTaskColor(task)}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                          <h3 className="text-lg font-semibold text-gray-900">{task.pratica}</h3>
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">
                            {daysOverdue} giorni di ritardo
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Attività:</span> {task.attivita}
                          </div>
                          <div>
                            <span className="font-medium">Scadenza:</span> {new Date(task.scadenza).toLocaleDateString('it-IT')}
                          </div>
                          <div>
                            <span className="font-medium">Urgente:</span> {task.urgent ? 'Sì' : 'No'}
                          </div>
                        </div>

                        {(task.cliente || task.controparte) && (
                          <div className="text-sm text-gray-600 mb-3">
                            <span className="font-medium">Parti:</span> {task.cliente || 'N/A'} - {task.controparte || 'N/A'}
                          </div>
                        )}

                        {task.note && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Note:</span> {task.note}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          onClick={() => handleTaskClick(task)}
                          variant="outline"
                          size="sm"
                          className="whitespace-nowrap"
                        >
                          Modifica
                        </Button>
                        <Button
                          onClick={() => handleTaskClick({ ...task, stato: 'done' })}
                          variant="outline"
                          size="sm"
                          className="whitespace-nowrap bg-green-100 text-green-800 hover:bg-green-200"
                        >
                          Segna Evaso
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Task Dialog */}
      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        task={selectedTask}
        isUrgentMode={true}
        onSave={selectedTask ? handleSaveTask : handleSaveNewTask}
      />
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
