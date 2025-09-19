import { useState } from 'react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Task } from '../../lib/calendar-utils'
import { 
  Edit, 
  Trash2, 
  Calendar,
  AlertCircle,
  CheckCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

interface TaskListProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

type SortField = 'pratica' | 'attivita' | 'scadenza' | 'stato' | 'priorita'
type SortDirection = 'asc' | 'desc'

export function TaskList({ tasks, onEdit, onDelete }: TaskListProps) {
  const [sortField, setSortField] = useState<SortField>('scadenza')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    if (sortField === 'scadenza') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'bg-red-100 text-red-800'
    if (priority >= 5) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getPriorityLabel = (priority: number) => {
    if (priority >= 8) return 'Alta'
    if (priority >= 5) return 'Media'
    return 'Bassa'
  }

  const isOverdue = (scadenza: string) => {
    const today = new Date()
    const dueDate = new Date(scadenza)
    return dueDate < today
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Lista Attività ({tasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nessuna attività trovata</p>
            <p className="text-sm">Aggiungi una nuova attività per iniziare</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 pb-2 border-b text-sm font-medium text-gray-600">
              <button
                onClick={() => handleSort('pratica')}
                className="col-span-3 flex items-center gap-1 hover:text-gray-900 text-left"
              >
                Pratica {getSortIcon('pratica')}
              </button>
              <button
                onClick={() => handleSort('attivita')}
                className="col-span-3 flex items-center gap-1 hover:text-gray-900 text-left"
              >
                Attività {getSortIcon('attivita')}
              </button>
              <button
                onClick={() => handleSort('scadenza')}
                className="col-span-2 flex items-center gap-1 hover:text-gray-900 text-left"
              >
                Scadenza {getSortIcon('scadenza')}
              </button>
              <button
                onClick={() => handleSort('stato')}
                className="col-span-1 flex items-center gap-1 hover:text-gray-900 text-left"
              >
                Stato {getSortIcon('stato')}
              </button>
              <button
                onClick={() => handleSort('priorita')}
                className="col-span-1 flex items-center gap-1 hover:text-gray-900 text-left"
              >
                Priorità {getSortIcon('priorita')}
              </button>
              <div className="col-span-2 text-right">Azioni</div>
            </div>

            {/* Task Rows */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sortedTasks.map((task) => (
                <div
                  key={task.id}
                  className={`grid grid-cols-12 gap-2 p-3 rounded-lg border transition-colors hover:bg-gray-50 ${
                    isOverdue(task.scadenza) && task.stato === 'todo' 
                      ? 'border-red-200 bg-red-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="col-span-3">
                    <p className="font-medium text-sm truncate" title={task.pratica}>
                      {task.pratica}
                    </p>
                  </div>
                  
                  <div className="col-span-3">
                    <p className="text-sm text-gray-600 truncate" title={task.attivita}>
                      {task.attivita}
                    </p>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center gap-1">
                      {isOverdue(task.scadenza) && task.stato === 'todo' && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm ${
                        isOverdue(task.scadenza) && task.stato === 'todo' 
                          ? 'text-red-600 font-medium' 
                          : 'text-gray-600'
                      }`}>
                        {format(new Date(task.scadenza), 'dd/MM/yy', { locale: it })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      task.stato === 'done' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.stato === 'done' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {task.stato === 'done' ? 'Fatto' : 'Da fare'}
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priorita)}`}>
                      {getPriorityLabel(task.priorita)}
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(task)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(task.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}