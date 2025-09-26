import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { DateInput } from '../ui/DateInput'
import { TimeInput } from '../ui/TimeInput'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { useToast } from '../ui/Toast'
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
  const { showError } = useToast()
  const isMobile = useMobile()
  const [formData, setFormData] = useState({
    pratica: '',
    attivita: '',
    categoria: '',
    scadenza: '',
    ora: '',
    urgent: false,
    note: '',
    cliente: '',
    controparte: '',
    stato: 'todo' as 'todo' | 'done',
    evaso: false
  })


  useEffect(() => {
    if (task) {
      setFormData({
        pratica: task.pratica || '', // Numero pratica (non modificabile)
        attivita: task.attivita || '', // Attività da svolgere
        categoria: task.categoria || '', // Categoria dell'attività
        scadenza: task.scadenza,
        ora: task.ora || '',
        urgent: task.urgent || false,
        note: task.note || '',
        cliente: task.cliente || '',
        controparte: task.controparte || '',
        stato: task.stato || 'todo',
        evaso: task.evaso || false
      })
    } else {
      setFormData({
        pratica: '',
        attivita: '',
        categoria: '',
        scadenza: '',
        ora: '',
        urgent: isUrgentMode,
        note: '',
        cliente: '',
        controparte: '',
        stato: 'todo',
        evaso: false
      })
    }
  }, [task, open, isUrgentMode])




  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('TaskDialog handleSubmit called', { task, formData })
    
    // Validate required fields
    if (!formData.attivita.trim() || !formData.categoria.trim() || !formData.scadenza) {
      showError('Campi obbligatori', 'Compila tutti i campi obbligatori')
      return
    }
    
    // Validate date is not in the past (only for new tasks, not updates)
    if (!task && formData.scadenza) {
      try {
        // Parse ISO date format yyyy-mm-dd (from DateInput component)
        const selectedDate = new Date(formData.scadenza)
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Reset time to start of day
        
        if (selectedDate < today) {
          showError('Data non valida', 'Non è possibile creare attività con date precedenti a oggi')
          return
        }
      } catch (error) {
        showError('Data non valida', 'Formato data non corretto. Usa gg/mm/yyyy')
        return
      }
    }
    
    // Prepare data for save
    const taskData = {
      ...(task && { id: task.id }), // Include ID only when updating existing task
      attivita: formData.attivita, // Attività da svolgere
      categoria: formData.categoria, // Categoria dell'attività
      scadenza: formData.scadenza,
      ora: formData.ora || null,
      stato: formData.stato,
      urgent: formData.urgent,
      note: formData.note || null,
      cliente: formData.cliente || null,
      controparte: formData.controparte || null,
      evaso: formData.evaso
    }
    
    console.log('TaskDialog calling onSave with:', taskData)
    onSave(taskData)
  }

  const handleChange = (field: string, value: string | number | 'todo' | 'done' | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isMobile ? "mx-4 max-w-[95vw] max-h-[95vh] overflow-y-auto" : "sm:max-w-[600px] max-h-[95vh] overflow-y-auto"}>
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${isUrgentMode ? 'text-red-600' : ''}`}>
            {isUrgentMode && <AlertTriangle className="h-5 w-5" />}
            {task ? 'Modifica Attività' : isUrgentMode ? 'Nuova Attività Urgente' : 'Nuova Attività'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Numero Pratica (solo visualizzazione) */}
          {task && (
            <div className="space-y-1">
              <Label htmlFor="pratica">Numero Pratica</Label>
              <Input
                id="pratica"
                value={formData.pratica}
                disabled
                className="bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="attivita">Attività *</Label>
            <Input
              id="attivita"
              placeholder="es. Cliente vs Controparte"
              value={formData.attivita}
              onChange={(e) => handleChange('attivita', e.target.value)}
              required
              className={isMobile ? "text-base" : ""}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="categoria">Categoria Attività *</Label>
            <Select 
              value={formData.categoria} 
              onValueChange={(value) => handleChange('categoria', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Appuntamento">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                    Appuntamento
                  </span>
                </SelectItem>
                <SelectItem value="Scadenza">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                    Scadenza
                  </span>
                </SelectItem>
                <SelectItem value="Attività da Svolgere">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    Attività da Svolgere
                  </span>
                </SelectItem>
                <SelectItem value="Udienza">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    Udienza
                  </span>
                </SelectItem>
                <SelectItem value="Scadenza Processuale">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    Scadenza Processuale
                  </span>
                </SelectItem>
                <SelectItem value="Attività Processuale">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    Attività Processuale
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cliente e Controparte (solo visualizzazione) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="cliente">Cliente</Label>
              <Input
                id="cliente"
                value={formData.cliente || ''}
                disabled
                className="bg-gray-100 text-gray-600 cursor-not-allowed"
                placeholder="Nessun cliente assegnato"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="controparte">Controparte</Label>
              <Input
                id="controparte"
                value={formData.controparte || ''}
                disabled
                className="bg-gray-100 text-gray-600 cursor-not-allowed"
                placeholder="Nessuna controparte assegnata"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="note">Note</Label>
            <textarea
              id="note"
              placeholder="Note aggiuntive sulla pratica..."
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${isMobile ? "text-base" : ""}`}
              rows={3}
            />
          </div>

          {/* Semaforo Evaso/Non Evaso */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${formData.evaso ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <Label htmlFor="evaso" className="text-sm font-medium">
                {formData.evaso ? 'Evaso' : 'Non Evaso'}
              </Label>
            </div>
            <Switch
              id="evaso"
              checked={formData.evaso}
              onCheckedChange={(checked) => handleChange('evaso', checked)}
            />
          </div>


          <div className="space-y-1">
            <div className="flex gap-2">
              <DateInput
                id="scadenza"
                label="Scadenza * (gg/mm/yyyy)"
                value={formData.scadenza}
                onChange={(value) => handleChange('scadenza', value)}
                placeholder="gg/mm/yyyy"
                className="flex-1 text-gray-900"
                required
              />
              <div className="w-32">
                <TimeInput
                  id="ora"
                  label="Ora"
                  value={formData.ora || ''}
                  onChange={(value) => handleChange('ora', value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="urgente"
                checked={formData.urgent}
                onChange={(e) => handleChange('urgent', e.target.checked)}
                className="w-4 h-4 text-red-600 border-red-300 rounded focus:ring-red-500 cursor-pointer"
              />
              <label htmlFor="urgente" className="text-red-600 font-medium cursor-pointer">
                URGENTE
              </label>
            </div>
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