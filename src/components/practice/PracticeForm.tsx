import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Plus, Minus, ArrowLeft } from 'lucide-react'
import { Practice, PracticeFormData, ProcedureType } from '../../types/practice'
import { Client } from '../../types/client'
import { useMobile } from '../../hooks/useMobile'
import { supabase } from '../../lib/supabase'

interface PracticeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  practice?: Practice | null
  onSave: (practice: Practice) => void
  clients: Client[]
  isLoading?: boolean
}

export function PracticeForm({ open, onOpenChange, practice, onSave, clients, isLoading = false }: PracticeFormProps) {
  const isMobile = useMobile()
  const [step, setStep] = useState<'form' | 'activity'>('form')
  const [loadingNumber, setLoadingNumber] = useState(false)
  
  const [formData, setFormData] = useState<PracticeFormData>({
    numero: '',
    cliente_id: '',
    controparti_ids: [],
    tipo_procedura: 'STRAGIUDIZIALE'
  })

  // Function to generate next practice number
  const generatePracticeNumber = async () => {
    try {
      setLoadingNumber(true)
      const { data, error } = await supabase
        .rpc('get_next_practice_number', { user_id_param: supabase.auth.getUser().then(u => u.data.user?.id) })
      
      if (error) throw error
      
      // Fallback to manual generation if function doesn't exist
      if (!data) {
        const currentYear = new Date().getFullYear()
        const randomNum = Math.floor(Math.random() * 999) + 1
        return `${currentYear}/${randomNum.toString().padStart(3, '0')}`
      }
      
      return data
    } catch (error) {
      console.error('Error generating practice number:', error)
      // Fallback to manual generation
      const currentYear = new Date().getFullYear()
      const randomNum = Math.floor(Math.random() * 999) + 1
      return `${currentYear}/${randomNum.toString().padStart(3, '0')}`
    } finally {
      setLoadingNumber(false)
    }
  }

  useEffect(() => {
    if (practice) {
      setFormData({
        numero: practice.numero,
        cliente_id: practice.cliente_id,
        controparti_ids: practice.controparti_ids,
        tipo_procedura: practice.tipo_procedura
      })
      setStep('form')
    } else {
      // Reset form for new practice and generate number
      const initializeNewPractice = async () => {
        const newNumber = await generatePracticeNumber()
        setFormData({
          numero: newNumber,
          cliente_id: '',
          controparti_ids: [],
          tipo_procedura: 'STRAGIUDIZIALE'
        })
        setStep('form')
      }
      
      if (open) {
        initializeNewPractice()
      }
    }
  }, [practice, open])

  const handleInputChange = (field: keyof PracticeFormData, value: any) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const practiceData: Practice = {
      ...formData,
      id: practice?.id,
      user_id: practice?.user_id
    }
    
    onSave(practiceData)
  }

  const goBackToForm = () => {
    setStep('form')
  }

  const renderForm = () => (
    <div className="space-y-6">
      {/* Informazioni Pratica */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Informazioni Pratica</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="numero">Numero Pratica *</Label>
            <Input
              id="numero"
              value={formData.numero}
              readOnly
              placeholder={loadingNumber ? "Generazione numero..." : "es. 2024/001"}
              className="bg-gray-50"
              required
            />
            {loadingNumber && (
              <p className="text-sm text-gray-500 mt-1">Generazione automatica in corso...</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="tipo_procedura">Tipo Procedura *</Label>
            <Select 
              value={formData.tipo_procedura} 
              onValueChange={(value: ProcedureType) => handleInputChange('tipo_procedura', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona tipo procedura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STRAGIUDIZIALE">Stragiudiziale</SelectItem>
                <SelectItem value="GIUDIZIALE">Giudiziale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Cliente */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Cliente</h3>
        <div>
          <Label htmlFor="cliente">Cliente *</Label>
          <Select 
            value={formData.cliente_id} 
            onValueChange={(value) => handleInputChange('cliente_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.filter(client => client.cliente).map(client => (
                <SelectItem key={client.id} value={client.id!}>
                  {client.ragione || `${client.nome} ${client.cognome}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Controparti */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Controparti</h3>
          <Button type="button" onClick={addControparte} size="sm" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Aggiungi Controparte
          </Button>
        </div>
        
        {formData.controparti_ids.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            Nessuna controparte selezionata
          </div>
        )}
        
        {formData.controparti_ids.map((controparteId, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <div className="flex-1">
              <Select 
                value={controparteId} 
                onValueChange={(value) => updateControparte(index, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona controparte" />
                </SelectTrigger>
                <SelectContent>
                  {clients.filter(client => client.controparte).map(client => (
                    <SelectItem key={client.id} value={client.id!}>
                      {client.ragione || `${client.nome} ${client.cognome}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              onClick={() => removeControparte(index)}
              variant="destructive"
              size="sm"
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>
        ))}
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
          {isLoading ? 'Salvataggio...' : (practice ? 'Aggiorna Pratica' : 'Crea Pratica e Aggiungi Attività')}
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${isMobile ? 'mx-2' : ''}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'activity' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={goBackToForm}
                className="p-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            {step === 'form' ? 
             (practice ? 'Modifica Pratica' : 'Nuova Pratica') : 
             'Aggiungi Attività'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderForm()}
        </form>
      </DialogContent>
    </Dialog>
  )
}
