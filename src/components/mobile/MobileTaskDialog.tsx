import React, { useState, useEffect } from 'react'
import { Task } from '../../lib/calendar-utils'
import { MobileDialog } from './MobileDialog'
import { MobileButton } from './MobileButton'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { AlertTriangle, Clock, Calendar, User, FileText } from 'lucide-react'
import { format } from 'date-fns'

interface MobileTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
  onSave: (taskData: Partial<Task>) => Promise<void>
  isUrgentMode?: boolean
}

export function MobileTaskDialog({ 
  open, 
  onOpenChange, 
  task, 
  onSave, 
  isUrgentMode = false 
}: MobileTaskDialogProps) {
  const [formData, setFormData] = useState({
    attivita: '',
    pratica: '',
    scadenza: '',
    ora: '',
    categoria: '',
    cliente: '',
    controparte: '',
    note: '',
    urgent: false,
    stato: 'todo' as 'todo' | 'done'
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (task) {
      setFormData({
        attivita: task.attivita || '',
        pratica: task.pratica || '',
        scadenza: task.scadenza || '',
        ora: task.ora || '',
        categoria: task.categoria || '',
        cliente: task.cliente || '',
        controparte: task.controparte || '',
        note: task.note || '',
        urgent: task.urgent || false,
        stato: task.stato || 'todo'
      })
    } else {
      setFormData({
        attivita: '',
        pratica: '',
        scadenza: '',
        ora: '',
        categoria: '',
        cliente: '',
        controparte: '',
        note: '',
        urgent: isUrgentMode,
        stato: 'todo'
      })
    }
  }, [task, isUrgentMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSave(formData)
      onOpenChange(false)
    } catch (error) {
      console.error('Errore nel salvataggio:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const categories = [
    'SCADENZA ATTO PROCESSUALE',
    'UDIENZA',
    'CONSIGLIO DEL CLIENTE',
    'RICORSO',
    'COMPARSA',
    'MEMORIA',
    'ALLEGATI',
    'ALTRO'
  ]

  return (
    <MobileDialog
      open={open}
      onOpenChange={onOpenChange}
      title={task ? 'Modifica Attività' : isUrgentMode ? 'Nuova Attività Urgente' : 'Nuova Attività'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Numero Pratica (solo visualizzazione se editing) */}
        {task && (
          <div className="space-y-2">
            <Label htmlFor="pratica" className="text-sm font-medium text-gray-700">
              Numero Pratica
            </Label>
            <Input
              id="pratica"
              value={formData.pratica}
              disabled
              className="bg-gray-100 text-gray-600 cursor-not-allowed mobile-input"
            />
          </div>
        )}

        {/* Attività */}
        <div className="space-y-2">
          <Label htmlFor="attivita" className="text-sm font-medium text-gray-700">
            Attività *
          </Label>
          <Input
            id="attivita"
            placeholder="es. Cliente vs Controparte"
            value={formData.attivita}
            onChange={(e) => handleInputChange('attivita', e.target.value)}
            required
            className="mobile-input"
          />
        </div>

        {/* Data e Ora */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="scadenza" className="text-sm font-medium text-gray-700">
              Data *
            </Label>
            <Input
              id="scadenza"
              type="date"
              value={formData.scadenza}
              onChange={(e) => handleInputChange('scadenza', e.target.value)}
              required
              className="mobile-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ora" className="text-sm font-medium text-gray-700">
              Ora
            </Label>
            <Input
              id="ora"
              type="time"
              value={formData.ora}
              onChange={(e) => handleInputChange('ora', e.target.value)}
              className="mobile-input"
            />
          </div>
        </div>

        {/* Categoria */}
        <div className="space-y-2">
          <Label htmlFor="categoria" className="text-sm font-medium text-gray-700">
            Categoria
          </Label>
          <Select value={formData.categoria} onValueChange={(value) => handleInputChange('categoria', value)}>
            <SelectTrigger className="mobile-input">
              <SelectValue placeholder="Seleziona categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cliente e Controparte */}
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-2">
            <Label htmlFor="cliente" className="text-sm font-medium text-gray-700">
              Cliente
            </Label>
            <Input
              id="cliente"
              placeholder="Nome cliente"
              value={formData.cliente}
              onChange={(e) => handleInputChange('cliente', e.target.value)}
              className="mobile-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="controparte" className="text-sm font-medium text-gray-700">
              Controparte
            </Label>
            <Input
              id="controparte"
              placeholder="Nome controparte"
              value={formData.controparte}
              onChange={(e) => handleInputChange('controparte', e.target.value)}
              className="mobile-input"
            />
          </div>
        </div>

        {/* Note */}
        <div className="space-y-2">
          <Label htmlFor="note" className="text-sm font-medium text-gray-700">
            Note
          </Label>
          <Textarea
            id="note"
            placeholder="Note aggiuntive..."
            value={formData.note}
            onChange={(e) => handleInputChange('note', e.target.value)}
            rows={3}
            className="mobile-input resize-none"
          />
        </div>

        {/* Stato e Urgenza */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="stato" className="text-sm font-medium text-gray-700">
              Stato
            </Label>
            <Select value={formData.stato} onValueChange={(value) => handleInputChange('stato', value)}>
              <SelectTrigger className="mobile-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">Da fare</SelectItem>
                <SelectItem value="done">Completato</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="urgent" className="text-sm font-medium text-gray-700">
              Urgente
            </Label>
            <Select value={formData.urgent ? 'true' : 'false'} onValueChange={(value) => handleInputChange('urgent', value === 'true')}>
              <SelectTrigger className="mobile-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">No</SelectItem>
                <SelectItem value="true">Sì</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pulsanti */}
        <div className="flex gap-3 pt-4">
          <MobileButton
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1 mobile-button"
          >
            Annulla
          </MobileButton>
          <MobileButton
            type="submit"
            disabled={isLoading}
            className="flex-1 mobile-button"
          >
            {isLoading ? 'Salvataggio...' : (task ? 'Aggiorna' : 'Crea')}
          </MobileButton>
        </div>
      </form>
    </MobileDialog>
  )
}
