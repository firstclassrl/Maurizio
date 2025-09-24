import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Task } from '../../lib/calendar-utils'

interface PracticeFilterProps {
  selectedPractice: string
  onPracticeChange: (practice: string) => void
  tasks: Task[]
  className?: string
}

export function PracticeFilter({ selectedPractice, onPracticeChange, tasks, className = '' }: PracticeFilterProps) {
  // Get unique practices from tasks
  const practices = Array.from(new Set(tasks.map(task => task.pratica).filter(Boolean))).sort()

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Pratica:</label>
      <Select value={selectedPractice} onValueChange={onPracticeChange}>
        <SelectTrigger className="min-w-[140px] max-w-[160px]">
          <SelectValue placeholder="Tutte le pratiche" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tutte le pratiche</SelectItem>
          {practices.map((practice) => (
            <SelectItem key={practice} value={practice}>
              {practice}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
