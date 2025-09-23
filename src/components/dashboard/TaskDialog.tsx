import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { MessageModal } from '../ui/MessageModal'
import { ScadenzaCalculator } from '../ui/ScadenzaCalculator'
import { useMessage } from '../../hooks/useMessage'
import { useMobile } from '../../hooks/useMobile'
import { Task } from '../../lib/calendar-utils'
import { analyzeActivity, getActivityDescription, getActivityIcon } from '../../lib/activity-intelligence'
import { AlertTriangle, Calculator, Brain } from 'lucide-react'

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
    priorita: 5,
    note: '',
    parte: '',
    controparte: ''
  })
  const [showCalculator, setShowCalculator] = useState(false)
  const [activityAnalysis, setActivityAnalysis] = useState<any>(null)

  useEffect(() => {
    if (task) {
      setFormData({
        pratica: task.pratica,
        categoria: task.attivita,
        scadenza: task.scadenza,
        stato: task.stato,
        priorita: task.priorita,
        note: task.note || '',
        parte: task.parte || '',
        controparte: task.controparte || ''
      })
    } else {
      setFormData({
        pratica: '',
        categoria: '',
        scadenza: format(new Date(), 'yyyy-MM-dd'),
        stato: 'todo',
        priorita: isUrgentMode ? 10 : 5,
        note: '',
        parte: '',
        controparte: ''
      })
    }
  }, [task, open, isUrgentMode])

  // Analizza l'attività quando cambiano pratica o categoria
  useEffect(() => {
    if (formData.pratica && formData.categoria) {
      const analysis = analyzeActivity(formData.categoria, formData.pratica)
      setActivityAnalysis(analysis)
    } else {
      setActivityAnalysis(null)
    }
  }, [formData.pratica, formData.categoria])

  const handleScadenzaCalculated = (dataScadenza: Date) => {
    const formattedDate = format(dataScadenza, 'yyyy-MM-dd')
    setFormData(prev => ({
      ...prev,
      scadenza: formattedDate
    }))
    // Non chiudere automaticamente il calcolatore, lascia che l'utente decida
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('TaskDialog handleSubmit called', { task, formData })
    
    // Validate required fields
    if (!formData.pratica.trim() || !formData.categoria.trim() || !formData.scadenza) {
      showError('Campi obbligatori', 'Compila tutti i campi obbligatori')
      return
    }
    
    // Validate date is not in the past (only for new tasks, not updates)
    if (!task) {
      const selectedDate = new Date(formData.scadenza)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day
      
      if (selectedDate < today) {
        showError('Data non valida', 'Non è possibile creare pratiche con date precedenti a oggi')
        return
      }
    }
    
    // Prepare data for save
    const taskData = {
      pratica: formData.pratica,
      attivita: formData.categoria, // Map categoria to attivita for database compatibility
      scadenza: formData.scadenza,
      stato: formData.stato,
      priorita: formData.priorita,
      note: formData.note || null,
      parte: formData.parte || null,
      controparte: formData.controparte || null
    }
    
    console.log('TaskDialog calling onSave with:', taskData)
    onSave(taskData)
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isMobile ? "mx-4 max-w-[95vw] max-h-[90vh] overflow-y-auto" : "sm:max-w-[800px] max-h-[90vh] overflow-y-auto"}>
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
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    UDIENZA
                  </span>
                </SelectItem>
                <SelectItem value="ATTIVITA' PROCESSUALE">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    ATTIVITA' PROCESSUALE
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parte">Parte</Label>
              <Input
                id="parte"
                placeholder="es. Mario Rossi"
                value={formData.parte}
                onChange={(e) => handleChange('parte', e.target.value)}
                className={isMobile ? "text-base" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="controparte">Controparte</Label>
              <Input
                id="controparte"
                placeholder="es. Azienda XYZ"
                value={formData.controparte}
                onChange={(e) => handleChange('controparte', e.target.value)}
                className={isMobile ? "text-base" : ""}
              />
            </div>
          </div>

          <div className="space-y-2">
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

          {/* Analisi AI dell'attività */}
          {activityAnalysis && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Analisi AI</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{getActivityIcon(activityAnalysis)}</span>
                <span className="text-sm text-blue-700">{getActivityDescription(activityAnalysis)}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scadenza">Scadenza *</Label>
              <div className="flex gap-2">
                <Input
                  id="scadenza"
                  type="date"
                  value={formData.scadenza}
                  onChange={(e) => handleChange('scadenza', e.target.value)}
                  className={`flex-1 text-gray-900`}
                  style={{ colorScheme: 'light' }}
                  required
                />
                {activityAnalysis?.needsCalculator && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowCalculator(!showCalculator)
                    }}
                    className="px-3"
                    title="Calcola scadenza automaticamente"
                  >
                    <Calculator className="h-4 w-4" />
                  </Button>
                )}
              </div>
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
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="urgente"
                checked={formData.priorita === 10}
                onChange={(e) => handleChange('priorita', e.target.checked ? 10 : 5)}
                className="w-4 h-4 text-red-600 border-red-300 rounded focus:ring-red-500 cursor-pointer"
              />
              <label htmlFor="urgente" className="text-red-600 font-medium cursor-pointer">
                URGENTE
              </label>
            </div>
          </div>

          {/* Calcolatore Scadenze */}
          {showCalculator && (
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Calcolatore Scadenze Legali</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCalculator(false)}
                  className="px-2 py-1 text-xs"
                >
                  ✕
                </Button>
              </div>
              <ScadenzaCalculator
                onScadenzaCalculated={handleScadenzaCalculated}
                initialDataInizio={formData.scadenza ? new Date(formData.scadenza) : undefined}
                categoriaAttivita={formData.categoria}
                activityAnalysis={activityAnalysis}
              />
            </div>
          )}

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