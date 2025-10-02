import React, { useState, useEffect } from 'react'
import { MobileDialog } from './MobileDialog'
import { MobileButton } from './MobileButton'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { FileText, Plus, Minus } from 'lucide-react'

interface Practice {
  id?: string
  numero: string
  cliente_id: string
  controparti_ids: string[]
  tipo_procedura: 'STRAGIUDIZIALE' | 'GIUDIZIALE'
  autorita_giudiziaria: string
  rg: string
  giudice: string
  note?: string
}

interface Client {
  id: string
  denominazione?: string
  nome?: string
  cognome?: string
}

interface MobilePracticeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  practice?: Practice
  clients: Client[]
  onSave: (practiceData: Practice) => Promise<void>
}

export function MobilePracticeDialog({ 
  open, 
  onOpenChange, 
  practice, 
  clients,
  onSave 
}: MobilePracticeDialogProps) {
  const [formData, setFormData] = useState<Practice>({
    numero: '',
    cliente_id: '',
    controparti_ids: [],
    tipo_procedura: 'STRAGIUDIZIALE',
    autorita_giudiziaria: '',
    rg: '',
    giudice: '',
    note: ''
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (practice) {
      setFormData(practice)
    } else {
      setFormData({
        numero: '',
        cliente_id: '',
        controparti_ids: [],
        tipo_procedura: 'STRAGIUDIZIALE',
        autorita_giudiziaria: '',
        rg: '',
        giudice: '',
        note: ''
      })
    }
  }, [practice])

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

  const handleInputChange = (field: keyof Practice, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addControparte = () => {
    setFormData(prev => ({
      ...prev,
      controparti_ids: [...prev.controparti_ids, '']
    }))
  }

  const removeControparte = (index: number) => {
    setFormData(prev => ({
      ...prev,
      controparti_ids: prev.controparti_ids.filter((_, i) => i !== index)
    }))
  }

  const updateControparte = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      controparti_ids: prev.controparti_ids.map((id, i) => 
        i === index ? value : id
      )
    }))
  }

  const getClientDisplayName = (client: Client) => {
    if (client.nome && client.cognome) {
      return `${client.nome} ${client.cognome}`
    }
    return client.denominazione || 'Cliente senza nome'
  }

  return (
    <MobileDialog
      open={open}
      onOpenChange={onOpenChange}
      title={practice ? 'Modifica Pratica' : 'Nuova Pratica'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Numero Pratica */}
        <div className="space-y-2">
          <Label htmlFor="numero" className="text-sm font-medium text-gray-700">
            Numero Pratica *
          </Label>
          <Input
            id="numero"
            placeholder="es. 2025/001"
            value={formData.numero}
            onChange={(e) => handleInputChange('numero', e.target.value)}
            required
            className="mobile-input"
          />
        </div>

        {/* Cliente */}
        <div className="space-y-2">
          <Label htmlFor="cliente_id" className="text-sm font-medium text-gray-700">
            Cliente *
          </Label>
          <Select value={formData.cliente_id} onValueChange={(value) => handleInputChange('cliente_id', value)}>
            <SelectTrigger className="mobile-input">
              <SelectValue placeholder="Seleziona cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {getClientDisplayName(client)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tipo Procedura */}
        <div className="space-y-2">
          <Label htmlFor="tipo_procedura" className="text-sm font-medium text-gray-700">
            Tipo Procedura *
          </Label>
          <Select value={formData.tipo_procedura} onValueChange={(value) => handleInputChange('tipo_procedura', value as 'STRAGIUDIZIALE' | 'GIUDIZIALE')}>
            <SelectTrigger className="mobile-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STRAGIUDIZIALE">Stragiudiziale</SelectItem>
              <SelectItem value="GIUDIZIALE">Giudiziale</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Autorità Giudiziaria e RG */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="autorita_giudiziaria" className="text-sm font-medium text-gray-700">
              Autorità Giudiziaria
            </Label>
            <Input
              id="autorita_giudiziaria"
              placeholder="Tribunale di..."
              value={formData.autorita_giudiziaria}
              onChange={(e) => handleInputChange('autorita_giudiziaria', e.target.value)}
              className="mobile-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rg" className="text-sm font-medium text-gray-700">
              R.G.
            </Label>
            <Input
              id="rg"
              placeholder="R.G. 123/2025"
              value={formData.rg}
              onChange={(e) => handleInputChange('rg', e.target.value)}
              className="mobile-input"
            />
          </div>
        </div>

        {/* Giudice */}
        <div className="space-y-2">
          <Label htmlFor="giudice" className="text-sm font-medium text-gray-700">
            Giudice
          </Label>
          <Input
            id="giudice"
            placeholder="Nome del giudice"
            value={formData.giudice}
            onChange={(e) => handleInputChange('giudice', e.target.value)}
            className="mobile-input"
          />
        </div>

        {/* Controparti */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">
              Controparti
            </Label>
            <MobileButton
              type="button"
              onClick={addControparte}
              size="sm"
              className="px-2 py-1 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Aggiungi
            </MobileButton>
          </div>
          
          <div className="space-y-2">
            {formData.controparti_ids.map((controparteId, index) => (
              <div key={index} className="flex gap-2">
                <Select 
                  value={controparteId} 
                  onValueChange={(value) => updateControparte(index, value)}
                >
                  <SelectTrigger className="mobile-input flex-1">
                    <SelectValue placeholder="Seleziona controparte" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {getClientDisplayName(client)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <MobileButton
                  type="button"
                  onClick={() => removeControparte(index)}
                  variant="outline"
                  size="sm"
                  className="px-2 py-1"
                >
                  <Minus className="h-3 w-3" />
                </MobileButton>
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="space-y-2">
          <Label htmlFor="note" className="text-sm font-medium text-gray-700">
            Note
          </Label>
          <Textarea
            id="note"
            placeholder="Note aggiuntive sulla pratica..."
            value={formData.note || ''}
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
            {isLoading ? 'Salvataggio...' : (practice ? 'Aggiorna' : 'Crea Pratica')}
          </MobileButton>
        </div>
      </form>
    </MobileDialog>
  )
}
