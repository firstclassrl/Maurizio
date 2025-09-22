import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { MessageModal } from '../ui/MessageModal'
import { useMessage } from '../../hooks/useMessage'
import { useMobile } from '../../hooks/useMobile'
import { Task } from '../../lib/calendar-utils'
import { AlertTriangle } from 'lucide-react'

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  isUrgentMode?: boolean
  onSave: (task: Partial<Task>) => void
}

export function TaskDialog({ open, onOpenChange, task, isUrgentMode = false, onSave }: TaskDialogProps) {
  const { message, showError, hideMessage } = useMessage()
  const isMobile = useMobile()
  const [formData, setFormData] = useState({
    pratica: '',
    categoria: '',
    scadenza: '',
    stato: 'todo' as 'todo' | 'done',
    priorita: 5
  })

  useEffect(() => {
    if (task) {
      setFormData({
        pratica: task.pratica,
        categoria: task.attivita,
        scadenza: task.scadenza,
        stato: task.stato,
        priorita: task.priorita
      })
    } else {
      setFormData({
        pratica: '',
        categoria: '',
        scadenza: format(new Date(), 'yyyy-MM-dd'),
        stato: 'todo',
        priorita: isUrgentMode ? 10 : 5
      })
    }
  }, [task, open, isUrgentMode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate date is not in the past
    const selectedDate = new Date(formData.scadenza)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day
    
    if (selectedDate < today) {
      showError('Data non valida', 'Non è possibile creare pratiche con date precedenti a oggi')
      return
    }
    
    onSave(formData)
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isMobile ? "mx-4 max-w-[95vw]" : "sm:max-w-[500px]"}>
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${isUrgentMode ? 'text-red-600' : ''}`}>
            {isUrgentMode && <AlertTriangle className="h-5 w-5" />}
            {task ? 'Modifica Attività' : isUrgentMode ? 'Nuova Pratica Urgente' : 'Nuova Attività'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pratica">Pratica *</Label>
            <Input
              id="pratica"
              placeholder="es. Cliente vs Controparte"
              value={formData.pratica}
              onChange={(e) => handleChange('pratica', e.target.value)}
              required
              className={isMobile ? "text-base" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria Attività *</Label>
            <Select 
              value={formData.categoria} 
              onValueChange={(value) => handleChange('categoria', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCADENZA ATTO PROCESSUALE">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    SCADENZA ATTO PROCESSUALE
                  </span>
                </SelectItem>
                <SelectItem value="UDIENZA">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                    UDIENZA
                  </span>
                </SelectItem>
                <SelectItem value="ATTIVITA' PROCESSUALE">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                    ATTIVITA' PROCESSUALE
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scadenza">Scadenza *</Label>
              <Input
                id="scadenza"
                type="date"
                value={formData.scadenza}
                onChange={(e) => handleChange('scadenza', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stato">Stato</Label>
              <Select 
                value={formData.stato} 
                onValueChange={(value: 'todo' | 'done') => handleChange('stato', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Da fare</SelectItem>
                  <SelectItem value="done">Completato</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.priorita === 10}
                onChange={(e) => handleChange('priorita', e.target.checked ? 10 : 5)}
                className="w-4 h-4 text-red-600 border-red-300 rounded focus:ring-red-500"
              />
              <span className="text-red-600 font-medium">URGENTE</span>
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit">
              {task ? 'Aggiorna' : 'Crea'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      
      <MessageModal
        open={!!message}
        onClose={hideMessage}
        type={message?.type || 'info'}
        title={message?.title || ''}
        message={message?.message || ''}
      />
    </Dialog>
  )
}