import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Task } from '../../lib/calendar-utils'

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  onSave: (task: Partial<Task>) => void
}

export function TaskDialog({ open, onOpenChange, task, onSave }: TaskDialogProps) {
  const [formData, setFormData] = useState({
    pratica: '',
    attivita: '',
    scadenza: '',
    stato: 'todo' as 'todo' | 'done',
    priorita: 0
  })

  useEffect(() => {
    if (task) {
      setFormData({
        pratica: task.pratica,
        attivita: task.attivita,
        scadenza: task.scadenza,
        stato: task.stato,
        priorita: task.priorita
      })
    } else {
      setFormData({
        pratica: '',
        attivita: '',
        scadenza: format(new Date(), 'yyyy-MM-dd'),
        stato: 'todo',
        priorita: 0
      })
    }
  }, [task, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {task ? 'Modifica Attività' : 'Nuova Attività'}
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attivita">Attività *</Label>
            <textarea
              id="attivita"
              placeholder="es. Deposito ricorso presso il tribunale"
              value={formData.attivita}
              onChange={(e) => handleChange('attivita', e.target.value)}
              required
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
            />
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
            <Label htmlFor="priorita">Priorità</Label>
            <Select 
              value={formData.priorita.toString()} 
              onValueChange={(value) => handleChange('priorita', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Molto bassa</SelectItem>
                <SelectItem value="1">Bassa</SelectItem>
                <SelectItem value="2">Bassa</SelectItem>
                <SelectItem value="3">Bassa</SelectItem>
                <SelectItem value="4">Bassa</SelectItem>
                <SelectItem value="5">Media</SelectItem>
                <SelectItem value="6">Media</SelectItem>
                <SelectItem value="7">Media</SelectItem>
                <SelectItem value="8">Alta</SelectItem>
                <SelectItem value="9">Alta</SelectItem>
                <SelectItem value="10">Molto alta</SelectItem>
              </SelectContent>
            </Select>
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
    </Dialog>
  )
}