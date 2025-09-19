import { format, addMonths, subMonths } from 'date-fns'
import { it } from 'date-fns/locale'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent } from '../ui/card'
import { Task } from '../../lib/calendar-utils'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  List, 
  Plus, 
  LogOut,
  Scale,
  Search
} from 'lucide-react'

interface DashboardHeaderProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  viewMode: 'month' | 'week'
  onViewModeChange: (mode: 'month' | 'week') => void
  statusFilter: 'all' | 'todo' | 'done'
  onStatusFilterChange: (status: 'all' | 'todo' | 'done') => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  onNewTask: () => void
  onLogout: () => void
  tasks: Task[]
}

export function DashboardHeader({
  currentDate,
  onDateChange,
  viewMode,
  onViewModeChange,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  onNewTask,
  onLogout,
}: DashboardHeaderProps) {
  const handlePrevious = () => {
    if (viewMode === 'month') {
      onDateChange(subMonths(currentDate, 1))
    } else {
      onDateChange(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))
    }
  }

  const handleNext = () => {
    if (viewMode === 'month') {
      onDateChange(addMonths(currentDate, 1))
    } else {
      onDateChange(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Legal Planner</h1>
              <p className="text-sm text-gray-500">Gestione pratiche e scadenze</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Date Navigation */}
            <Card>
              <CardContent className="p-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="min-w-[140px] text-center">
                    <span className="text-sm font-medium">
                      {format(currentDate, 'MMMM yyyy', { locale: it })}
                    </span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* View Mode Toggle */}
            <div className="flex rounded-lg border">
              <Button
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('month')}
                className="rounded-r-none"
              >
                <CalendarIcon className="h-4 w-4 mr-1" />
                Mese
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('week')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4 mr-1" />
                Settimana
              </Button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={onNewTask} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Nuova
              </Button>
              
              <Button variant="outline" onClick={onLogout} size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cerca per pratica o attività..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(value: 'all' | 'todo' | 'done') => onStatusFilterChange(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtra per stato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli stati</SelectItem>
              <SelectItem value="todo">Da fare</SelectItem>
              <SelectItem value="done">Completati</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}