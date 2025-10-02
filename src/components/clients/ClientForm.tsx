import React, { useState, useEffect } from 'react'
import { Client, ClientFormData, Address, Contact } from '../../types/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import { Card } from '../ui/card'
import { Plus, Minus, ArrowLeft } from 'lucide-react'
import { CLIENT_TYPES } from '../../data/clientTypes'
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
  const [step, setStep] = useState<'type' | 'form'>('type')
  const [selectedType, setSelectedType] = useState<string>('')
  
  const [formData, setFormData] = useState<ClientFormData>({
    tipologia: 'Persona fisica',
    alternativa: false,
    ragione: '',
    titolo: '',
    cognome: '',
    nome: '',
    sesso: 'M',
    dataNascita: '',
    luogoNascita: '',
    partitaIva: '',
    codiceFiscale: '',
    denominazione: '',
    indirizzi: [],
    contatti: [],
    cliente: false,
    controparte: false,
    altri: false,
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
        indirizzi = []
      }
      
      try {
        contatti = Array.isArray(client.contatti) ? client.contatti : 
                  (typeof client.contatti === 'string' ? JSON.parse(client.contatti) : [])
      } catch (e) {
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
        codiceFiscale: client.codiceFiscale || '',
        denominazione: client.denominazione || '',
        indirizzi: indirizzi,
        contatti: contatti,
        cliente: client.cliente || false,
        controparte: client.controparte || false,
        altri: client.altri || false,
        codiceDestinatario: client.codiceDestinatario || '',
        codiceDestinatarioPA: client.codiceDestinatarioPA || '',
        note: client.note || '',
        sigla: client.sigla || ''
      })
      setSelectedType(client.tipologia)
      setStep('form')
    } else {
      // Reset form for new client
      setFormData({
        tipologia: 'Persona fisica',
        alternativa: false,
        ragione: '',
        titolo: '',
        cognome: '',
        nome: '',
        sesso: 'M',
        dataNascita: '',
        luogoNascita: '',
        partitaIva: '',
        codiceFiscale: '',
        denominazione: '',
        indirizzi: [],
        contatti: [],
        cliente: false,
        controparte: false,
        altri: false,
        codiceDestinatario: '',
        codiceDestinatarioPA: '',
        note: '',
        sigla: ''
      })
      setSelectedType('')
      setStep('type')
    }
  }, [client, open])

  const handleInputChange = (field: keyof ClientFormData, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      }
      return newData
    })
  }

  const handleTypeSelection = (type: string) => {
    setSelectedType(type)
    setFormData(prev => ({
      ...prev,
      tipologia: type as any
    }))
    setStep('form')
  }

  const goBackToTypeSelection = () => {
    setStep('type')
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

  const renderTypeSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Seleziona Tipo di Anagrafica</h2>
        <p className="text-gray-600">Scegli il tipo di cliente che vuoi inserire</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CLIENT_TYPES.map((type) => (
          <Card 
            key={type} 
            className="p-6 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-300"
            onClick={() => handleTypeSelection(type)}
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">{type}</h3>
              <p className="text-sm text-gray-600">
                {type === 'Persona fisica' && 'Nome, cognome, codice fiscale, indirizzo, contatti'}
                {type === 'Persona Giuridica' && 'Ragione sociale, codice fiscale, partita IVA, indirizzo, contatti'}
                {type === 'Ditta Individuale' && 'Nome, cognome, denominazione, codice fiscale, partita IVA, indirizzo, contatti'}
                {type === 'Altro ente' && 'Ragione sociale, codice fiscale, partita IVA, indirizzo, contatti'}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderPersonaFisicaForm = () => (
    <div className="space-y-6">
      {/* Informazioni Personali */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Informazioni Personali</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              placeholder="Nome"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="cognome">Cognome *</Label>
            <Input
              id="cognome"
              value={formData.cognome}
              onChange={(e) => handleInputChange('cognome', e.target.value)}
              placeholder="Cognome"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="codiceFiscale">Codice Fiscale *</Label>
            <Input
              id="codiceFiscale"
              value={formData.codiceFiscale}
              onChange={(e) => handleInputChange('codiceFiscale', e.target.value)}
              placeholder="Codice Fiscale"
              required
            />
          </div>
        </div>
      </Card>

      {/* Indirizzo */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Indirizzo Completo</h3>
        {formData.indirizzi.length === 0 && (
          <Button type="button" onClick={addAddress} size="sm" className="mb-4">
            <Plus className="w-4 h-4 mr-2" />
            Aggiungi Indirizzo
          </Button>
        )}
        
        {formData.indirizzi.map((address, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Indirizzo {index + 1}</h4>
              <Button
                type="button"
                onClick={() => removeAddress(index)}
                variant="destructive"
                size="sm"
              >
                <Minus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`address-street-${index}`}>Via *</Label>
                <Input
                  id={`address-street-${index}`}
                  value={address.street}
                  onChange={(e) => updateAddress(index, 'street', e.target.value)}
                  placeholder="Via, numero civico"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor={`address-postal-${index}`}>CAP *</Label>
                <Input
                  id={`address-postal-${index}`}
                  value={address.postalCode}
                  onChange={(e) => updateAddress(index, 'postalCode', e.target.value)}
                  placeholder="CAP"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor={`address-city-${index}`}>Comune *</Label>
                <Input
                  id={`address-city-${index}`}
                  value={address.city}
                  onChange={(e) => updateAddress(index, 'city', e.target.value)}
                  placeholder="Comune"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor={`address-province-${index}`}>Provincia *</Label>
                <Input
                  id={`address-province-${index}`}
                  value={address.province}
                  onChange={(e) => updateAddress(index, 'province', e.target.value)}
                  placeholder="Provincia"
                  required
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

      {/* Contatti */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Contatti</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefono">Telefono</Label>
              <Input
                id="telefono"
                value={formData.contatti.find(c => c.type === 'Telefono')?.value || ''}
                onChange={(e) => {
                  const telefonoIndex = formData.contatti.findIndex(c => c.type === 'Telefono')
                  if (telefonoIndex >= 0) {
                    updateContact(telefonoIndex, 'value', e.target.value)
                  } else {
                    addContact()
                    setTimeout(() => {
                      const newIndex = formData.contatti.length
                      updateContact(newIndex, 'type', 'Telefono')
                      updateContact(newIndex, 'value', e.target.value)
                    }, 0)
                  }
                }}
                placeholder="Telefono"
              />
            </div>
            
            <div>
              <Label htmlFor="pec">PEC</Label>
              <Input
                id="pec"
                value={formData.contatti.find(c => c.type === 'Email PEC')?.value || ''}
                onChange={(e) => {
                  const pecIndex = formData.contatti.findIndex(c => c.type === 'Email PEC')
                  if (pecIndex >= 0) {
                    updateContact(pecIndex, 'value', e.target.value)
                  } else {
                    addContact()
                    setTimeout(() => {
                      const newIndex = formData.contatti.length
                      updateContact(newIndex, 'type', 'Email PEC')
                      updateContact(newIndex, 'value', e.target.value)
                    }, 0)
                  }
                }}
                placeholder="PEC"
              />
            </div>
            
            <div>
              <Label htmlFor="mail">Mail</Label>
              <Input
                id="mail"
                value={formData.contatti.find(c => c.type === 'Email')?.value || ''}
                onChange={(e) => {
                  const mailIndex = formData.contatti.findIndex(c => c.type === 'Email')
                  if (mailIndex >= 0) {
                    updateContact(mailIndex, 'value', e.target.value)
                  } else {
                    addContact()
                    setTimeout(() => {
                      const newIndex = formData.contatti.length
                      updateContact(newIndex, 'type', 'Email')
                      updateContact(newIndex, 'value', e.target.value)
                    }, 0)
                  }
                }}
                placeholder="Email"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Ruoli */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Ruoli</h3>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="cliente"
              checked={formData.cliente}
              onCheckedChange={(checked) => handleInputChange('cliente', checked)}
            />
            <Label htmlFor="cliente">Cliente</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="controparte"
              checked={formData.controparte}
              onCheckedChange={(checked) => handleInputChange('controparte', checked)}
            />
            <Label htmlFor="controparte">Controparte</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="altri"
              checked={formData.altri}
              onCheckedChange={(checked) => handleInputChange('altri', checked)}
            />
            <Label htmlFor="altri">Altri</Label>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderPersonaGiuridicaForm = () => (
    <div className="space-y-6">
      {/* Informazioni Aziendali */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Informazioni Aziendali</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="ragione">Ragione Sociale *</Label>
            <Input
              id="ragione"
              value={formData.ragione}
              onChange={(e) => handleInputChange('ragione', e.target.value)}
              placeholder="Ragione Sociale"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="codiceFiscale">Codice Fiscale *</Label>
            <Input
              id="codiceFiscale"
              value={formData.codiceFiscale}
              onChange={(e) => handleInputChange('codiceFiscale', e.target.value)}
              placeholder="Codice Fiscale"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="partitaIva">Partita IVA *</Label>
            <Input
              id="partitaIva"
              value={formData.partitaIva}
              onChange={(e) => handleInputChange('partitaIva', e.target.value)}
              placeholder="Partita IVA"
              required
            />
          </div>
        </div>
      </Card>

      {/* Indirizzo */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Indirizzo Completo</h3>
        {formData.indirizzi.length === 0 && (
          <Button type="button" onClick={addAddress} size="sm" className="mb-4">
            <Plus className="w-4 h-4 mr-2" />
            Aggiungi Indirizzo
          </Button>
        )}
        
        {formData.indirizzi.map((address, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Indirizzo {index + 1}</h4>
              <Button
                type="button"
                onClick={() => removeAddress(index)}
                variant="destructive"
                size="sm"
              >
                <Minus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`address-street-${index}`}>Via *</Label>
                <Input
                  id={`address-street-${index}`}
                  value={address.street}
                  onChange={(e) => updateAddress(index, 'street', e.target.value)}
                  placeholder="Via, numero civico"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor={`address-postal-${index}`}>CAP *</Label>
                <Input
                  id={`address-postal-${index}`}
                  value={address.postalCode}
                  onChange={(e) => updateAddress(index, 'postalCode', e.target.value)}
                  placeholder="CAP"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor={`address-city-${index}`}>Comune *</Label>
                <Input
                  id={`address-city-${index}`}
                  value={address.city}
                  onChange={(e) => updateAddress(index, 'city', e.target.value)}
                  placeholder="Comune"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor={`address-province-${index}`}>Provincia *</Label>
                <Input
                  id={`address-province-${index}`}
                  value={address.province}
                  onChange={(e) => updateAddress(index, 'province', e.target.value)}
                  placeholder="Provincia"
                  required
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

      {/* Contatti */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Contatti</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefono">Telefono</Label>
              <Input
                id="telefono"
                value={formData.contatti.find(c => c.type === 'Telefono')?.value || ''}
                onChange={(e) => {
                  const telefonoIndex = formData.contatti.findIndex(c => c.type === 'Telefono')
                  if (telefonoIndex >= 0) {
                    updateContact(telefonoIndex, 'value', e.target.value)
                  } else {
                    addContact()
                    setTimeout(() => {
                      const newIndex = formData.contatti.length
                      updateContact(newIndex, 'type', 'Telefono')
                      updateContact(newIndex, 'value', e.target.value)
                    }, 0)
                  }
                }}
                placeholder="Telefono"
              />
            </div>
            
            <div>
              <Label htmlFor="pec">PEC</Label>
              <Input
                id="pec"
                value={formData.contatti.find(c => c.type === 'Email PEC')?.value || ''}
                onChange={(e) => {
                  const pecIndex = formData.contatti.findIndex(c => c.type === 'Email PEC')
                  if (pecIndex >= 0) {
                    updateContact(pecIndex, 'value', e.target.value)
                  } else {
                    addContact()
                    setTimeout(() => {
                      const newIndex = formData.contatti.length
                      updateContact(newIndex, 'type', 'Email PEC')
                      updateContact(newIndex, 'value', e.target.value)
                    }, 0)
                  }
                }}
                placeholder="PEC"
              />
            </div>
            
            <div>
              <Label htmlFor="mail">Mail</Label>
              <Input
                id="mail"
                value={formData.contatti.find(c => c.type === 'Email')?.value || ''}
                onChange={(e) => {
                  const mailIndex = formData.contatti.findIndex(c => c.type === 'Email')
                  if (mailIndex >= 0) {
                    updateContact(mailIndex, 'value', e.target.value)
                  } else {
                    addContact()
                    setTimeout(() => {
                      const newIndex = formData.contatti.length
                      updateContact(newIndex, 'type', 'Email')
                      updateContact(newIndex, 'value', e.target.value)
                    }, 0)
                  }
                }}
                placeholder="Email"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Ruoli */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Ruoli</h3>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="cliente"
              checked={formData.cliente}
              onCheckedChange={(checked) => handleInputChange('cliente', checked)}
            />
            <Label htmlFor="cliente">Cliente</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="controparte"
              checked={formData.controparte}
              onCheckedChange={(checked) => handleInputChange('controparte', checked)}
            />
            <Label htmlFor="controparte">Controparte</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="altri"
              checked={formData.altri}
              onCheckedChange={(checked) => handleInputChange('altri', checked)}
            />
            <Label htmlFor="altri">Altri</Label>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderDittaIndividualeForm = () => (
    <div className="space-y-6">
      {/* Informazioni Personali */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Informazioni Personali</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              placeholder="Nome"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="cognome">Cognome *</Label>
            <Input
              id="cognome"
              value={formData.cognome}
              onChange={(e) => handleInputChange('cognome', e.target.value)}
              placeholder="Cognome"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="denominazione">Denominazione *</Label>
            <Input
              id="denominazione"
              value={formData.denominazione}
              onChange={(e) => handleInputChange('denominazione', e.target.value)}
              placeholder="Denominazione"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="codiceFiscale">Codice Fiscale *</Label>
            <Input
              id="codiceFiscale"
              value={formData.codiceFiscale}
              onChange={(e) => handleInputChange('codiceFiscale', e.target.value)}
              placeholder="Codice Fiscale"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="partitaIva">Partita IVA *</Label>
            <Input
              id="partitaIva"
              value={formData.partitaIva}
              onChange={(e) => handleInputChange('partitaIva', e.target.value)}
              placeholder="Partita IVA"
              required
            />
          </div>
        </div>
      </Card>

      {/* Indirizzo */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Indirizzo Completo</h3>
        {formData.indirizzi.length === 0 && (
          <Button type="button" onClick={addAddress} size="sm" className="mb-4">
            <Plus className="w-4 h-4 mr-2" />
            Aggiungi Indirizzo
          </Button>
        )}
        
        {formData.indirizzi.map((address, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Indirizzo {index + 1}</h4>
              <Button
                type="button"
                onClick={() => removeAddress(index)}
                variant="destructive"
                size="sm"
              >
                <Minus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`address-street-${index}`}>Via *</Label>
                <Input
                  id={`address-street-${index}`}
                  value={address.street}
                  onChange={(e) => updateAddress(index, 'street', e.target.value)}
                  placeholder="Via, numero civico"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor={`address-postal-${index}`}>CAP *</Label>
                <Input
                  id={`address-postal-${index}`}
                  value={address.postalCode}
                  onChange={(e) => updateAddress(index, 'postalCode', e.target.value)}
                  placeholder="CAP"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor={`address-city-${index}`}>Comune *</Label>
                <Input
                  id={`address-city-${index}`}
                  value={address.city}
                  onChange={(e) => updateAddress(index, 'city', e.target.value)}
                  placeholder="Comune"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor={`address-province-${index}`}>Provincia *</Label>
                <Input
                  id={`address-province-${index}`}
                  value={address.province}
                  onChange={(e) => updateAddress(index, 'province', e.target.value)}
                  placeholder="Provincia"
                  required
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

      {/* Contatti */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Contatti</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefono">Telefono</Label>
              <Input
                id="telefono"
                value={formData.contatti.find(c => c.type === 'Telefono')?.value || ''}
                onChange={(e) => {
                  const telefonoIndex = formData.contatti.findIndex(c => c.type === 'Telefono')
                  if (telefonoIndex >= 0) {
                    updateContact(telefonoIndex, 'value', e.target.value)
                  } else {
                    addContact()
                    setTimeout(() => {
                      const newIndex = formData.contatti.length
                      updateContact(newIndex, 'type', 'Telefono')
                      updateContact(newIndex, 'value', e.target.value)
                    }, 0)
                  }
                }}
                placeholder="Telefono"
              />
            </div>
            
            <div>
              <Label htmlFor="pec">PEC</Label>
              <Input
                id="pec"
                value={formData.contatti.find(c => c.type === 'Email PEC')?.value || ''}
                onChange={(e) => {
                  const pecIndex = formData.contatti.findIndex(c => c.type === 'Email PEC')
                  if (pecIndex >= 0) {
                    updateContact(pecIndex, 'value', e.target.value)
                  } else {
                    addContact()
                    setTimeout(() => {
                      const newIndex = formData.contatti.length
                      updateContact(newIndex, 'type', 'Email PEC')
                      updateContact(newIndex, 'value', e.target.value)
                    }, 0)
                  }
                }}
                placeholder="PEC"
              />
            </div>
            
            <div>
              <Label htmlFor="mail">Mail</Label>
              <Input
                id="mail"
                value={formData.contatti.find(c => c.type === 'Email')?.value || ''}
                onChange={(e) => {
                  const mailIndex = formData.contatti.findIndex(c => c.type === 'Email')
                  if (mailIndex >= 0) {
                    updateContact(mailIndex, 'value', e.target.value)
                  } else {
                    addContact()
                    setTimeout(() => {
                      const newIndex = formData.contatti.length
                      updateContact(newIndex, 'type', 'Email')
                      updateContact(newIndex, 'value', e.target.value)
                    }, 0)
                  }
                }}
                placeholder="Email"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Ruoli */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Ruoli</h3>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="cliente"
              checked={formData.cliente}
              onCheckedChange={(checked) => handleInputChange('cliente', checked)}
            />
            <Label htmlFor="cliente">Cliente</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="controparte"
              checked={formData.controparte}
              onCheckedChange={(checked) => handleInputChange('controparte', checked)}
            />
            <Label htmlFor="controparte">Controparte</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="altri"
              checked={formData.altri}
              onCheckedChange={(checked) => handleInputChange('altri', checked)}
            />
            <Label htmlFor="altri">Altri</Label>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderAltroEnteForm = () => (
    <div className="space-y-6">
      {/* Informazioni Ente */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Informazioni Ente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="ragione">Ragione Sociale *</Label>
            <Input
              id="ragione"
              value={formData.ragione}
              onChange={(e) => handleInputChange('ragione', e.target.value)}
              placeholder="Ragione Sociale"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="codiceFiscale">Codice Fiscale *</Label>
            <Input
              id="codiceFiscale"
              value={formData.codiceFiscale}
              onChange={(e) => handleInputChange('codiceFiscale', e.target.value)}
              placeholder="Codice Fiscale"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="partitaIva">Partita IVA *</Label>
            <Input
              id="partitaIva"
              value={formData.partitaIva}
              onChange={(e) => handleInputChange('partitaIva', e.target.value)}
              placeholder="Partita IVA"
              required
            />
          </div>
        </div>
      </Card>

      {/* Indirizzo */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Indirizzo Completo</h3>
        {formData.indirizzi.length === 0 && (
          <Button type="button" onClick={addAddress} size="sm" className="mb-4">
            <Plus className="w-4 h-4 mr-2" />
            Aggiungi Indirizzo
          </Button>
        )}
        
        {formData.indirizzi.map((address, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Indirizzo {index + 1}</h4>
              <Button
                type="button"
                onClick={() => removeAddress(index)}
                variant="destructive"
                size="sm"
              >
                <Minus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`address-street-${index}`}>Via *</Label>
                <Input
                  id={`address-street-${index}`}
                  value={address.street}
                  onChange={(e) => updateAddress(index, 'street', e.target.value)}
                  placeholder="Via, numero civico"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor={`address-postal-${index}`}>CAP *</Label>
                <Input
                  id={`address-postal-${index}`}
                  value={address.postalCode}
                  onChange={(e) => updateAddress(index, 'postalCode', e.target.value)}
                  placeholder="CAP"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor={`address-city-${index}`}>Comune *</Label>
                <Input
                  id={`address-city-${index}`}
                  value={address.city}
                  onChange={(e) => updateAddress(index, 'city', e.target.value)}
                  placeholder="Comune"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor={`address-province-${index}`}>Provincia *</Label>
                <Input
                  id={`address-province-${index}`}
                  value={address.province}
                  onChange={(e) => updateAddress(index, 'province', e.target.value)}
                  placeholder="Provincia"
                  required
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

      {/* Contatti */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Contatti</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefono">Telefono</Label>
              <Input
                id="telefono"
                value={formData.contatti.find(c => c.type === 'Telefono')?.value || ''}
                onChange={(e) => {
                  const telefonoIndex = formData.contatti.findIndex(c => c.type === 'Telefono')
                  if (telefonoIndex >= 0) {
                    updateContact(telefonoIndex, 'value', e.target.value)
                  } else {
                    addContact()
                    setTimeout(() => {
                      const newIndex = formData.contatti.length
                      updateContact(newIndex, 'type', 'Telefono')
                      updateContact(newIndex, 'value', e.target.value)
                    }, 0)
                  }
                }}
                placeholder="Telefono"
              />
            </div>
            
            <div>
              <Label htmlFor="pec">PEC</Label>
              <Input
                id="pec"
                value={formData.contatti.find(c => c.type === 'Email PEC')?.value || ''}
                onChange={(e) => {
                  const pecIndex = formData.contatti.findIndex(c => c.type === 'Email PEC')
                  if (pecIndex >= 0) {
                    updateContact(pecIndex, 'value', e.target.value)
                  } else {
                    addContact()
                    setTimeout(() => {
                      const newIndex = formData.contatti.length
                      updateContact(newIndex, 'type', 'Email PEC')
                      updateContact(newIndex, 'value', e.target.value)
                    }, 0)
                  }
                }}
                placeholder="PEC"
              />
            </div>
            
            <div>
              <Label htmlFor="mail">Mail</Label>
              <Input
                id="mail"
                value={formData.contatti.find(c => c.type === 'Email')?.value || ''}
                onChange={(e) => {
                  const mailIndex = formData.contatti.findIndex(c => c.type === 'Email')
                  if (mailIndex >= 0) {
                    updateContact(mailIndex, 'value', e.target.value)
                  } else {
                    addContact()
                    setTimeout(() => {
                      const newIndex = formData.contatti.length
                      updateContact(newIndex, 'type', 'Email')
                      updateContact(newIndex, 'value', e.target.value)
                    }, 0)
                  }
                }}
                placeholder="Email"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Ruoli */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Ruoli</h3>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="cliente"
              checked={formData.cliente}
              onCheckedChange={(checked) => handleInputChange('cliente', checked)}
            />
            <Label htmlFor="cliente">Cliente</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="controparte"
              checked={formData.controparte}
              onCheckedChange={(checked) => handleInputChange('controparte', checked)}
            />
            <Label htmlFor="controparte">Controparte</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="altri"
              checked={formData.altri}
              onCheckedChange={(checked) => handleInputChange('altri', checked)}
            />
            <Label htmlFor="altri">Altri</Label>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderForm = () => {
    switch (selectedType) {
      case 'Persona fisica':
        return renderPersonaFisicaForm()
      case 'Persona Giuridica':
        return renderPersonaGiuridicaForm()
      case 'Ditta Individuale':
        return renderDittaIndividualeForm()
      case 'Altro ente':
        return renderAltroEnteForm()
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${isMobile ? 'mx-2' : ''}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'form' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={goBackToTypeSelection}
                className="p-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            {step === 'type' ? 'Seleziona Tipo di Parte' : 
             client ? 'Modifica Parte' : 'Nuova Parte'}
          </DialogTitle>
        </DialogHeader>

        {step === 'type' ? (
          renderTypeSelection()
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderForm()}

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
                {isLoading ? 'Salvataggio...' : (client ? 'Aggiorna Parte' : 'Crea Parte')}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}