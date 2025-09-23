import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameDay, 
  isToday, 
  isPast,
  addDays,
  subDays,
  startOfDay
} from 'date-fns'
import { it } from 'date-fns/locale'

export interface CalendarDay {
  date: Date
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  isPast: boolean
  tasks: Task[]
}

export interface Task {
  id: string
  user_id: string
  pratica: string
  attivita: string
  categoria?: string // Optional field for form compatibility
  scadenza: string
  stato: 'todo' | 'done'
  priorita: number
  note?: string | null
  cliente?: string | null
  controparte?: string | null
  created_at: string
  updated_at: string
}

/**
 * Builds a month grid starting from Monday
 * Returns 6 weeks (42 days) to ensure consistent calendar layout
 */
export function buildMonthGrid(date: Date, tasks: Task[] = []): CalendarDay[][] {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  
  // Start from Monday of the week containing the first day of the month
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  // End on Sunday of the week containing the last day of the month
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  
  // Get all days in the calendar view
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  
  // Ensure we have exactly 6 weeks (42 days)
  while (days.length < 42) {
    days.push(addDays(days[days.length - 1], 1))
  }
  
  // Group tasks by date for efficient lookup
  const tasksByDate = new Map<string, Task[]>()
  tasks.forEach(task => {
    const dateKey = format(new Date(task.scadenza), 'yyyy-MM-dd')
    if (!tasksByDate.has(dateKey)) {
      tasksByDate.set(dateKey, [])
    }
    tasksByDate.get(dateKey)!.push(task)
  })
  
  // Create calendar days
  const calendarDays: CalendarDay[] = days.map(day => {
    const dateKey = format(day, 'yyyy-MM-dd')
    const dayTasks = tasksByDate.get(dateKey) || []
    
    return {
      date: day,
      dayNumber: parseInt(format(day, 'd')),
      isCurrentMonth: day >= monthStart && day <= monthEnd,
      isToday: isToday(day),
      isPast: isPast(startOfDay(day)) && !isToday(day),
      tasks: dayTasks
    }
  })
  
  // Group into weeks (7 days each)
  const weeks: CalendarDay[][] = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }
  
  return weeks
}

/**
 * Builds a week view (7 days) starting from Monday
 */
export function buildWeekGrid(date: Date, tasks: Task[] = []): CalendarDay[] {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 })
  
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })
  
  // Group tasks by date
  const tasksByDate = new Map<string, Task[]>()
  tasks.forEach(task => {
    const dateKey = format(new Date(task.scadenza), 'yyyy-MM-dd')
    if (!tasksByDate.has(dateKey)) {
      tasksByDate.set(dateKey, [])
    }
    tasksByDate.get(dateKey)!.push(task)
  })
  
  return days.map(day => {
    const dateKey = format(day, 'yyyy-MM-dd')
    const dayTasks = tasksByDate.get(dateKey) || []
    
    return {
      date: day,
      dayNumber: parseInt(format(day, 'd')),
      isCurrentMonth: true, // In week view, all days are considered "current"
      isToday: isToday(day),
      isPast: isPast(startOfDay(day)) && !isToday(day),
      tasks: dayTasks
    }
  })
}

/**
 * Check if two dates are the same day
 */
export function isSameDayUtil(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2)
}

/**
 * Format date for display
 */
export function formatDate(date: Date, formatStr: string = 'dd/MM/yyyy'): string {
  return format(date, formatStr, { locale: it })
}

/**
 * Format date for API (ISO string)
 */
export function formatDateForAPI(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Parse date from API
 */
export function parseDateFromAPI(dateString: string): Date {
  return new Date(dateString)
}

/**
 * Get month name in Italian
 */
export function getMonthName(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: it })
}

/**
 * Get week day names in Italian (starting from Monday)
 */
export function getWeekDayNames(): string[] {
  return ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
}

/**
 * Navigate to previous/next month
 */
export function navigateMonth(date: Date, direction: 'prev' | 'next'): Date {
  if (direction === 'prev') {
    return subDays(startOfMonth(date), 1)
  } else {
    return addDays(endOfMonth(date), 1)
  }
}

/**
 * Navigate to previous/next week
 */
export function navigateWeek(date: Date, direction: 'prev' | 'next'): Date {
  if (direction === 'prev') {
    return subDays(date, 7)
  } else {
    return addDays(date, 7)
  }
}