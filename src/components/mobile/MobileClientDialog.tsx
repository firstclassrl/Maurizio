import React, { useState, useEffect } from 'react'
import { MobileDialog } from './MobileDialog'
import { MobileButton } from './MobileButton'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { User, Building2, MapPin, Phone, Mail, FileText } from 'lucide-react'

interface Client {
  id?: string
  tipologia: string
  denominazione: string
  nome?: string
  cognome?: string
  codice_fiscale: string
  partita_iva?: string
  indirizzo: string
  citta: string
  cap: string
  provincia: string
  telefono: string
  email: string
  note?: string
  cliente?: boolean
  controparte?: boolean
  altri?: boolean
  created_at?: string
  updated_at?: string
}

interface MobileClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client
  onSave: (clientData: Client) => Promise<void>
}

export function MobileClientDialog({ 
  open, 
  onOpenChange, 
  client, 
  onSave 
}: MobileClientDialogProps) {
  const [formData, setFormData] = useState<Client>({
    tipologia: '',
    denominazione: '',
    nome: '',
    cognome: '',
    codice_fiscale: '',
    partita_iva: '',
    indirizzo: '',
    citta: '',
    cap: '',
    provincia: '',
    telefono: '',
    email: '',
    note: '',
    cliente: false,
    controparte: false,
    altri: false
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (client) {
      setFormData(client)
    } else {
      setFormData({
        tipologia: '',
        denominazione: '',
        nome: '',
        cognome: '',
        codice_fiscale: '',
        partita_iva: '',
        indirizzo: '',
        citta: '',
        cap: '',
        provincia: '',
        telefono: '',
        email: '',
        note: '',
        cliente: false,
        controparte: false,
        altri: false
      })
    }
  }, [client])

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const tipologie = [
    'Persona fisica',
    'Ditta Individuale', 
    'Persona Giuridica',
    'Altro ente'
  ]

  const isPersonaFisica = formData.tipologia === 'Persona fisica' || formData.tipologia === 'Ditta Individuale'

  return (
    <MobileDialog
      open={open}
      onOpenChange={onOpenChange}
      title={client ? 'Modifica Parte' : 'Nuova Parte'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipologia */}
        <div className="space-y-2">
          <Label htmlFor="tipologia" className="text-sm font-medium text-gray-700">
            Tipologia *
          </Label>
          <Select value={formData.tipologia} onValueChange={(value) => handleInputChange('tipologia', value)}>
            <SelectTrigger className="mobile-input">
              <SelectValue placeholder="Seleziona tipologia" />
            </SelectTrigger>
            <SelectContent>
              {tipologie.map((tipologia) => (
                <SelectItem key={tipologia} value={tipologia}>
                  {tipologia}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Denominazione/Nome e Cognome */}
        {isPersonaFisica ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
                Nome
              </Label>
              <Input
                id="nome"
                placeholder="Nome"
                value={formData.nome || ''}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                className="mobile-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cognome" className="text-sm font-medium text-gray-700">
                Cognome
              </Label>
              <Input
                id="cognome"
                placeholder="Cognome"
                value={formData.cognome || ''}
                onChange={(e) => handleInputChange('cognome', e.target.value)}
                className="mobile-input"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="denominazione" className="text-sm font-medium text-gray-700">
              Denominazione *
            </Label>
            <Input
              id="denominazione"
              placeholder="Ragione sociale"
              value={formData.denominazione}
              onChange={(e) => handleInputChange('denominazione', e.target.value)}
              className="mobile-input"
            />
          </div>
        )}

        {/* Codice Fiscale e Partita IVA */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="codice_fiscale" className="text-sm font-medium text-gray-700">
              Codice Fiscale *
            </Label>
            <Input
              id="codice_fiscale"
              placeholder="CF1234567890123"
              value={formData.codice_fiscale}
              onChange={(e) => handleInputChange('codice_fiscale', e.target.value.toUpperCase())}
              className="mobile-input"
              maxLength={16}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partita_iva" className="text-sm font-medium text-gray-700">
              Partita IVA
            </Label>
            <Input
              id="partita_iva"
              placeholder="12345678901"
              value={formData.partita_iva || ''}
              onChange={(e) => handleInputChange('partita_iva', e.target.value)}
              className="mobile-input"
            />
          </div>
        </div>

        {/* Indirizzo */}
        <div className="space-y-2">
          <Label htmlFor="indirizzo" className="text-sm font-medium text-gray-700">
            Indirizzo *
          </Label>
          <Input
            id="indirizzo"
            placeholder="Via, Piazza, ecc."
            value={formData.indirizzo}
            onChange={(e) => handleInputChange('indirizzo', e.target.value)}
            className="mobile-input"
          />
        </div>

        {/* Città, CAP, Provincia */}
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2">
            <Label htmlFor="citta" className="text-sm font-medium text-gray-700">
              Città *
            </Label>
            <Input
              id="citta"
              placeholder="Città"
              value={formData.citta}
              onChange={(e) => handleInputChange('citta', e.target.value)}
              className="mobile-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cap" className="text-sm font-medium text-gray-700">
              CAP *
            </Label>
            <Input
              id="cap"
              placeholder="CAP"
              value={formData.cap}
              onChange={(e) => handleInputChange('cap', e.target.value)}
              className="mobile-input"
              maxLength={5}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="provincia" className="text-sm font-medium text-gray-700">
              Provincia
            </Label>
            <Input
              id="provincia"
              placeholder="RM"
              value={formData.provincia}
              onChange={(e) => handleInputChange('provincia', e.target.value.toUpperCase())}
              className="mobile-input"
              maxLength={2}
            />
          </div>
        </div>

        {/* Telefono e Email */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="telefono" className="text-sm font-medium text-gray-700">
              Telefono *
            </Label>
            <Input
              id="telefono"
              placeholder="+39 123 456 7890"
              value={formData.telefono}
              onChange={(e) => handleInputChange('telefono', e.target.value)}
              className="mobile-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="email@esempio.it"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
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
            value={formData.note || ''}
            onChange={(e) => handleInputChange('note', e.target.value)}
            rows={3}
            className="mobile-input resize-none"
          />
        </div>

        {/* Toggle Ruoli */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">Ruoli</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="cliente" className="text-sm font-medium text-gray-700">Cliente</Label>
              <input
                id="cliente"
                type="checkbox"
                checked={formData.cliente || false}
                onChange={(e) => handleInputChange('cliente', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="controparte" className="text-sm font-medium text-gray-700">Controparte</Label>
              <input
                id="controparte"
                type="checkbox"
                checked={formData.controparte || false}
                onChange={(e) => handleInputChange('controparte', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="altri" className="text-sm font-medium text-gray-700">Altri</Label>
              <input
                id="altri"
                type="checkbox"
                checked={formData.altri || false}
                onChange={(e) => handleInputChange('altri', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
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
            {isLoading ? 'Salvataggio...' : (client ? 'Aggiorna' : 'Crea')}
          </MobileButton>
        </div>
      </form>
    </MobileDialog>
  )
}
