import React, { useState } from 'react'
import { MobileDialog } from './MobileDialog'
import { MobileButton } from './MobileButton'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Users, Calendar, Clock } from 'lucide-react'

interface Appuntamento {
  cliente: string
  data: string
  ora: string
  note: string
}

interface MobileAppuntamentoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (appuntamento: Appuntamento) => Promise<void>
}

export function MobileAppuntamentoDialog({ 
  open, 
  onOpenChange, 
  onSave 
}: MobileAppuntamentoDialogProps) {
  const [formData, setFormData] = useState<Appuntamento>({
    cliente: '',
    data: '',
    ora: '',
    note: ''
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSave(formData)
      onOpenChange(false)
      // Reset form
      setFormData({
        cliente: '',
        data: '',
        ora: '',
        note: ''
      })
    } catch (error) {
      console.error('Errore nel salvataggio:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof Appuntamento, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false)
      // Reset form
      setFormData({
        cliente: '',
        data: '',
        ora: '',
        note: ''
      })
    }
  }

  return (
    <MobileDialog
      open={open}
      onOpenChange={handleClose}
      title="Nuovo Appuntamento in Studio"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cliente */}
        <div className="space-y-2">
          <Label htmlFor="cliente" className="text-sm font-medium text-gray-700">
            Cliente *
          </Label>
          <Input
            id="cliente"
            placeholder="Nome del cliente"
            value={formData.cliente}
            onChange={(e) => handleInputChange('cliente', e.target.value)}
            required
            className="mobile-input"
          />
        </div>

        {/* Data e Ora */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="data" className="text-sm font-medium text-gray-700">
              Data *
            </Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => handleInputChange('data', e.target.value)}
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

        {/* Note */}
        <div className="space-y-2">
          <Label htmlFor="note" className="text-sm font-medium text-gray-700">
            Note
          </Label>
          <Textarea
            id="note"
            placeholder="Note aggiuntive sull'appuntamento..."
            value={formData.note}
            onChange={(e) => handleInputChange('note', e.target.value)}
            rows={3}
            className="mobile-input resize-none"
          />
        </div>

        {/* Pulsanti */}
        <div className="flex gap-3 pt-4">
          <MobileButton
            type="button"
            variant="outline"
            onClick={handleClose}
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
            {isLoading ? 'Salvataggio...' : 'Crea Appuntamento'}
          </MobileButton>
        </div>
      </form>
    </MobileDialog>
  )
}
