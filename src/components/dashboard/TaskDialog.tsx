import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { DateInput } from '../ui/DateInput'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { MessageModal } from '../ui/MessageModal'
import { ScadenzaCalculator } from '../ui/ScadenzaCalculator'
import { useMessage } from '../../hooks/useMessage'
import { useMobile } from '../../hooks/useMobile'
import { Task } from '../../lib/calendar-utils'
import { analyzeActivity, getActivityDescription, getActivityIcon } from '../../lib/activity-intelligence'
import { AlertTriangle, Calculator, Brain } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Client } from '../../types/client'

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  isUrgentMode?: boolean
  onSave: (task: Partial<Task>) => void
  user: any
}

export function TaskDialog({ open, onOpenChange, task, isUrgentMode = false, onSave, user }: TaskDialogProps) {
  const { message, showError, hideMessage } = useMessage()
  const isMobile = useMobile()
  const [formData, setFormData] = useState({
    attivita: '',
    categoria: '',
    scadenza: '',
    priorita: 5,
    note: '',
    cliente: '',
    controparte: '',
    stato: 'todo' as 'todo' | 'done'
  })
  const [showCalculator, setShowCalculator] = useState(false)
  const [activityAnalysis, setActivityAnalysis] = useState<any>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(false)

  // Carica i clienti quando il dialog si apre
  useEffect(() => {
    if (open) {
      loadClients()
    }
  }, [open])

  useEffect(() => {
    if (task) {
      setFormData({
        attivita: task.pratica || '', // Mappa da pratica a attivita
        categoria: task.attivita,
        scadenza: task.scadenza,
        priorita: task.priorita,
        note: task.note || '',
        cliente: task.cliente || '',
        controparte: task.controparte || '',
        stato: task.stato || 'todo'
      })
    } else {
      setFormData({
        attivita: '',
        categoria: '',
        scadenza: '',
        priorita: isUrgentMode ? 10 : 5,
        note: '',
        cliente: '',
        controparte: '',
        stato: 'todo'
      })
    }
  }, [task, open, isUrgentMode])

  const loadClients = async () => {
    try {
      setLoadingClients(true)
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('ragione', { ascending: true })

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error loading clients:', error)
      showError('Errore', 'Errore nel caricamento dei clienti')
    } finally {
      setLoadingClients(false)
    }
  }

  // Analizza l'attività quando cambiano attivita o categoria
  useEffect(() => {
    if (formData.attivita && formData.categoria) {
      const analysis = analyzeActivity(formData.categoria, formData.attivita)
      setActivityAnalysis(analysis)
    } else {
      setActivityAnalysis(null)
    }
  }, [formData.attivita, formData.categoria])

  const handleScadenzaCalculated = (dataScadenza: Date) => {
    const formattedDate = format(dataScadenza, 'yyyy-MM-dd')
    setFormData(prev => ({
      ...prev,
      scadenza: formattedDate
    }))
    // Chiudi il calcolatore dopo aver applicato la scadenza
    setShowCalculator(false)
  }

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
      pratica: formData.attivita, // Map attivita to pratica for database compatibility
      attivita: formData.categoria, // Map categoria to attivita for database compatibility
      scadenza: formData.scadenza,
      stato: formData.stato,
      priorita: formData.priorita,
      note: formData.note || null,
      cliente: formData.cliente || null,
      controparte: formData.controparte || null
    }
    
    console.log('TaskDialog calling onSave with:', taskData)
    onSave(taskData)
  }

  const handleChange = (field: string, value: string | number | 'todo' | 'done') => {
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
                <SelectItem value="APPUNTAMENTO IN STUDIO">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-cyan-500 rounded-full"></span>
                    APPUNTAMENTO IN STUDIO
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="cliente">Cliente</Label>
              <Select 
                value={formData.cliente} 
                onValueChange={(value) => handleChange('cliente', value)}
                disabled={loadingClients}
              >
                <SelectTrigger className={isMobile ? "text-base" : ""}>
                  <SelectValue placeholder={loadingClients ? "Caricamento..." : "Seleziona cliente"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nessun cliente</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.ragione}>
                      {client.ragione}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
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
              <div className={`w-4 h-4 rounded-full ${formData.stato === 'done' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <Label htmlFor="stato" className="text-sm font-medium">
                {formData.stato === 'done' ? 'Evaso' : 'Non Evaso'}
              </Label>
            </div>
            <Switch
              id="stato"
              checked={formData.stato === 'done'}
              onCheckedChange={(checked) => handleChange('stato', checked ? 'done' : 'todo')}
            />
          </div>

          {/* Analisi AI dell'attività */}
          {activityAnalysis && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
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
              {activityAnalysis?.needsCalculator && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowCalculator(true)
                  }}
                  className="px-3"
                  title="Calcola scadenza automaticamente"
                >
                  <Calculator className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-1">
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
            <div className="space-y-2 p-2 bg-gray-50 rounded-lg border">
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