import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import { Textarea } from '../ui/textarea'
import { Card } from '../ui/card'
import { Plus, Minus } from 'lucide-react'
import { DateInput } from '../ui/DateInput'
import { Client, Address, Contact, ClientFormData } from '../../types/client'
import { CLIENT_TYPES, TITLES, GENDER_OPTIONS, CONTACT_TYPES } from '../../data/clientTypes'
import { useMobile } from '../../hooks/useMobile'

interface ClientFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client | null
  onSave: (client: Client) => void
  isLoading?: boolean
}

export function ClientForm({ open, onOpenChange, client, onSave, isLoading = false }: ClientFormProps) {
  const isMobile = useMobile()
  
  const [formData, setFormData] = useState<ClientFormData>({
    tipologia: 'Non specificata',
    alternativa: false,
    ragione: '',
    titolo: '',
    cognome: '',
    nome: '',
    sesso: 'M',
    dataNascita: '',
    luogoNascita: '',
    partitaIva: '',
    indirizzi: [],
    contatti: [],
    codiceDestinatario: '',
    codiceDestinatarioPA: '',
    note: '',
    sigla: ''
  })

  useEffect(() => {
    if (client) {
      // Gestisce i campi JSON che potrebbero essere stringhe
      let indirizzi = []
      let contatti = []
      
      try {
        indirizzi = Array.isArray(client.indirizzi) ? client.indirizzi : 
                   (typeof client.indirizzi === 'string' ? JSON.parse(client.indirizzi) : [])
      } catch (e) {
        console.warn('Errore parsing indirizzi:', e)
        indirizzi = []
      }
      
      try {
        contatti = Array.isArray(client.contatti) ? client.contatti : 
                  (typeof client.contatti === 'string' ? JSON.parse(client.contatti) : [])
      } catch (e) {
        console.warn('Errore parsing contatti:', e)
        contatti = []
      }
      
      setFormData({
        tipologia: client.tipologia,
        alternativa: client.alternativa,
        ragione: client.ragione,
        titolo: client.titolo || '',
        cognome: client.cognome || '',
        nome: client.nome || '',
        sesso: client.sesso || 'M',
        dataNascita: client.dataNascita || '',
        luogoNascita: client.luogoNascita || '',
        partitaIva: client.partitaIva || '',
        indirizzi: indirizzi,
        contatti: contatti,
        codiceDestinatario: client.codiceDestinatario || '',
        codiceDestinatarioPA: client.codiceDestinatarioPA || '',
        note: client.note || '',
        sigla: client.sigla || ''
      })
    } else {
      // Reset form for new client
      setFormData({
        tipologia: 'Non specificata',
        alternativa: false,
        ragione: '',
        titolo: '',
        cognome: '',
        nome: '',
        sesso: 'M',
        dataNascita: '',
        luogoNascita: '',
        partitaIva: '',
        indirizzi: [],
        contatti: [],
        codiceDestinatario: '',
        codiceDestinatarioPA: '',
        note: '',
        sigla: ''
      })
    }
  }, [client, open])

  const handleInputChange = (field: keyof ClientFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addAddress = () => {
    setFormData(prev => ({
      ...prev,
      indirizzi: [...prev.indirizzi, {
        fieldName: '',
        street: '',
        postalCode: '',
        city: '',
        province: '',
        country: 'Italia'
      }]
    }))
  }

  const removeAddress = (index: number) => {
    setFormData(prev => ({
      ...prev,
      indirizzi: prev.indirizzi.filter((_, i) => i !== index)
    }))
  }

  const updateAddress = (index: number, field: keyof Address, value: string) => {
    setFormData(prev => ({
      ...prev,
      indirizzi: prev.indirizzi.map((addr, i) => 
        i === index ? { ...addr, [field]: value } : addr
      )
    }))
  }

  const addContact = () => {
    setFormData(prev => ({
      ...prev,
      contatti: [...prev.contatti, {
        type: 'Email',
        value: '',
        fieldName: ''
      }]
    }))
  }

  const removeContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contatti: prev.contatti.filter((_, i) => i !== index)
    }))
  }

  const updateContact = (index: number, field: keyof Contact, value: string) => {
    setFormData(prev => ({
      ...prev,
      contatti: prev.contatti.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const clientData: Client = {
      ...formData,
      id: client?.id,
      user_id: client?.user_id
    }
    
    onSave(clientData)
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${isMobile ? 'mx-2' : ''}`}>
        <DialogHeader>
          <DialogTitle>
            {client ? 'Modifica Cliente' : 'Nuovo Cliente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sezione Tipologia */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tipologia">Tipologia</Label>
                <Select 
                  value={formData.tipologia || 'Non specificata'} 
                  onValueChange={(value) => handleInputChange('tipologia', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipologia" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLIENT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="alternativa"
                  checked={formData.alternativa}
                  onCheckedChange={(checked) => handleInputChange('alternativa', checked)}
                />
                <Label htmlFor="alternativa">Alternativa</Label>
              </div>
              
              <div>
                <Label htmlFor="ragione">Ragione</Label>
                <Input
                  id="ragione"
                  value={formData.ragione}
                  onChange={(e) => handleInputChange('ragione', e.target.value)}
                  placeholder="Ragione sociale o denominazione"
                />
              </div>
            </div>
          </Card>

          {/* Sezione Informazioni Personali */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Informazioni Personali</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="titolo">Titolo</Label>
                <Select 
                  value={formData.titolo || undefined} 
                  onValueChange={(value) => handleInputChange('titolo', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona titolo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TITLES.map(title => (
                      <SelectItem key={title.value} value={title.value}>
                        {title.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="cognome">Cognome</Label>
                <Input
                  id="cognome"
                  value={formData.cognome}
                  onChange={(e) => handleInputChange('cognome', e.target.value)}
                  placeholder="Cognome"
                />
              </div>
              
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Nome"
                />
              </div>
              
              <div>
                <Label htmlFor="sesso">Sesso</Label>
                <Select 
                  value={formData.sesso} 
                  onValueChange={(value) => handleInputChange('sesso', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona sesso" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map(gender => (
                      <SelectItem key={gender.value} value={gender.value}>
                        {gender.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <DateInput
                  id="dataNascita"
                  label="Data di nascita"
                  value={formData.dataNascita}
                  onChange={(value) => handleInputChange('dataNascita', value)}
                  placeholder="gg/mm/aaaa"
                />
              </div>
              
              <div>
                <Label htmlFor="luogoNascita">Luogo di nascita</Label>
                <Input
                  id="luogoNascita"
                  value={formData.luogoNascita}
                  onChange={(e) => handleInputChange('luogoNascita', e.target.value)}
                  placeholder="Luogo di nascita"
                />
              </div>
              
              <div>
                <Label htmlFor="partitaIva">Partita IVA</Label>
                <Input
                  id="partitaIva"
                  value={formData.partitaIva}
                  onChange={(e) => handleInputChange('partitaIva', e.target.value)}
                  placeholder="Partita IVA"
                />
              </div>
            </div>
          </Card>

          {/* Sezione Indirizzi */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Indirizzi</h3>
              <Button type="button" onClick={addAddress} size="sm" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Aggiungi Indirizzo
              </Button>
            </div>
            
            {formData.indirizzi.map((address, index) => (
              <div key={index} className="border rounded-lg p-4 mb-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Indirizzo {index + 1}</h4>
                  <Button
                    type="button"
                    onClick={() => removeAddress(index)}
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Minus className="w-4 h-4" />
                    Rimuovi
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`address-field-${index}`}>Nome Campo</Label>
                    <Input
                      id={`address-field-${index}`}
                      value={address.fieldName}
                      onChange={(e) => updateAddress(index, 'fieldName', e.target.value)}
                      placeholder="es. Indirizzo, Sede legale"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`address-street-${index}`}>Via</Label>
                    <Input
                      id={`address-street-${index}`}
                      value={address.street}
                      onChange={(e) => updateAddress(index, 'street', e.target.value)}
                      placeholder="Via, numero civico"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`address-postal-${index}`}>CAP</Label>
                    <Input
                      id={`address-postal-${index}`}
                      value={address.postalCode}
                      onChange={(e) => updateAddress(index, 'postalCode', e.target.value)}
                      placeholder="CAP"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`address-city-${index}`}>Comune</Label>
                    <Input
                      id={`address-city-${index}`}
                      value={address.city}
                      onChange={(e) => updateAddress(index, 'city', e.target.value)}
                      placeholder="Comune"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`address-province-${index}`}>Provincia</Label>
                    <Input
                      id={`address-province-${index}`}
                      value={address.province}
                      onChange={(e) => updateAddress(index, 'province', e.target.value)}
                      placeholder="Provincia"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`address-country-${index}`}>Nazione</Label>
                    <Input
                      id={`address-country-${index}`}
                      value={address.country}
                      onChange={(e) => updateAddress(index, 'country', e.target.value)}
                      placeholder="Nazione"
                    />
                  </div>
                </div>
              </div>
            ))}
          </Card>

          {/* Sezione Contatti */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Contatti</h3>
              <Button type="button" onClick={addContact} size="sm" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Aggiungi Contatto
              </Button>
            </div>
            
            {formData.contatti.map((contact, index) => (
              <div key={index} className="border rounded-lg p-4 mb-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Contatto {index + 1}</h4>
                  <Button
                    type="button"
                    onClick={() => removeContact(index)}
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Minus className="w-4 h-4" />
                    Rimuovi
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`contact-type-${index}`}>Tipo</Label>
                    <Select 
                      value={contact.type} 
                      onValueChange={(value) => updateContact(index, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTACT_TYPES.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor={`contact-value-${index}`}>Valore</Label>
                    <Input
                      id={`contact-value-${index}`}
                      value={contact.value}
                      onChange={(e) => updateContact(index, 'value', e.target.value)}
                      placeholder="Email, telefono, etc."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`contact-field-${index}`}>Nome Campo</Label>
                    <Input
                      id={`contact-field-${index}`}
                      value={contact.fieldName || ''}
                      onChange={(e) => updateContact(index, 'fieldName', e.target.value)}
                      placeholder="es. Email PEC"
                    />
                  </div>
                </div>
              </div>
            ))}
          </Card>

          {/* Sezione Destinatario */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Destinatario</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codiceDestinatario">Codice</Label>
                <Input
                  id="codiceDestinatario"
                  value={formData.codiceDestinatario}
                  onChange={(e) => handleInputChange('codiceDestinatario', e.target.value)}
                  placeholder="Codice destinatario"
                />
              </div>
              
              <div>
                <Label htmlFor="codiceDestinatarioPA">Cerca codice destinatario fra le PA</Label>
                <Input
                  id="codiceDestinatarioPA"
                  value={formData.codiceDestinatarioPA}
                  onChange={(e) => handleInputChange('codiceDestinatarioPA', e.target.value)}
                  placeholder="Cerca codice destinatario fra le PA"
                />
              </div>
            </div>
          </Card>

          {/* Sezione Note */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Note</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => handleInputChange('note', e.target.value)}
                  placeholder="Note aggiuntive"
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="sigla">Sigla</Label>
                <Input
                  id="sigla"
                  value={formData.sigla}
                  onChange={(e) => handleInputChange('sigla', e.target.value)}
                  placeholder="Sigla"
                />
              </div>
            </div>
          </Card>

          {/* Note informative */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Note Importanti:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• L'indirizzo con Nome Campo "Indirizzo" verrà utilizzato come indirizzo di fatturazione.</li>
              <li>• Il contatto con Nome Campo "Email PEC" verrà utilizzato come indirizzo PEC di default.</li>
              <li>• Non è possibile selezionare più di una categoria alla volta.</li>
            </ul>
          </Card>

          {/* Pulsanti */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? 'Salvataggio...' : (client ? 'Aggiorna Cliente' : 'Crea Cliente')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
