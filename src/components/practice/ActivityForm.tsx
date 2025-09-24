import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Textarea } from '../ui/textarea'
import { ArrowLeft } from 'lucide-react'
import { Activity, ActivityFormData, STRAGIUDIZIALE_CATEGORIES, GIUDIZIALE_CATEGORIES } from '../../types/practice'
import { Practice } from '../../types/practice'
import { DateInput } from '../ui/DateInput'
import { TimeInput } from '../ui/TimeInput'
import { useMobile } from '../../hooks/useMobile'

interface ActivityFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activity?: Activity | null
  practice: Practice
  onSave: (activity: Activity) => void
  isLoading?: boolean
}

export function ActivityForm({ open, onOpenChange, activity, practice, onSave, isLoading = false }: ActivityFormProps) {
  const isMobile = useMobile()
  
  const [formData, setFormData] = useState<ActivityFormData>({
    pratica_id: practice.id || '',
    categoria: 'Appuntamento',
    attivita: '',
    data: '',
    ora: '',
    autorita_giudiziaria: '',
    rg: '',
    giudice: '',
    note: '',
    urgent: false
  })

  useEffect(() => {
    if (activity) {
      setFormData({
        pratica_id: activity.pratica_id,
        categoria: activity.categoria,
        attivita: activity.attivita,
        data: activity.data,
        ora: activity.ora || '',
        autorita_giudiziaria: activity.autorita_giudiziaria || '',
        rg: activity.rg || '',
        giudice: activity.giudice || '',
        note: activity.note || '',
        urgent: activity.urgent
      })
    } else {
      // Reset form for new activity
      setFormData({
        pratica_id: practice.id || '',
        categoria: 'Appuntamento',
        attivita: '',
        data: '',
        ora: '',
        autorita_giudiziaria: '',
        rg: '',
        giudice: '',
        note: '',
        urgent: false
      })
    }
  }, [activity, practice, open])

  const handleInputChange = (field: keyof ActivityFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const activityData: Activity = {
      ...formData,
      id: activity?.id,
      user_id: activity?.user_id,
      stato: activity?.stato || 'todo'
    }
    
    onSave(activityData)
  }

  const getAvailableCategories = () => {
    if (practice.tipo_procedura === 'STRAGIUDIZIALE') {
      return STRAGIUDIZIALE_CATEGORIES
    } else {
      return GIUDIZIALE_CATEGORIES
    }
  }

  const getCategoryColor = (category: string) => {
    const categories = getAvailableCategories()
    const found = categories.find(cat => cat.value === category)
    return found?.color || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const isGiudiziale = practice.tipo_procedura === 'GIUDIZIALE'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${isMobile ? 'mx-2' : ''}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="p-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            {activity ? 'Modifica Attività' : 'Nuova Attività'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informazioni Pratica */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold mb-2 text-blue-800">Pratica</h3>
            <div className="text-sm text-blue-700">
              <div><strong>Numero:</strong> {practice.numero}</div>
              <div><strong>Tipo:</strong> {practice.tipo_procedura}</div>
            </div>
          </Card>

          {/* Categoria Attività */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Categoria Attività</h3>
            <div>
              <Label htmlFor="categoria">Categoria *</Label>
              <Select 
                value={formData.categoria} 
                onValueChange={(value) => handleInputChange('categoria', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona categoria" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableCategories().map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${category.color.split(' ')[0]}`}></div>
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Dettagli Attività */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Dettagli Attività</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="attivita">Attività da Svolgere *</Label>
                <Input
                  id="attivita"
                  value={formData.attivita}
                  onChange={(e) => handleInputChange('attivita', e.target.value)}
                  placeholder="Descrizione dell'attività"
                  required
                />
              </div>
              
              <div>
                <DateInput
                  id="data"
                  label="Data *"
                  value={formData.data}
                  onChange={(value) => handleInputChange('data', value)}
                  placeholder="gg/mm/aaaa"
                  required
                />
              </div>
              
              <div>
                <TimeInput
                  id="ora"
                  label="Ora"
                  value={formData.ora}
                  onChange={(value) => handleInputChange('ora', value)}
                  placeholder="hh:mm"
                />
              </div>
            </div>
          </Card>

          {/* Campi specifici per GIUDIZIALE */}
          {isGiudiziale && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Informazioni Giudiziali</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="autorita_giudiziaria">Autorità Giudiziaria</Label>
                  <Input
                    id="autorita_giudiziaria"
                    value={formData.autorita_giudiziaria}
                    onChange={(e) => handleInputChange('autorita_giudiziaria', e.target.value)}
                    placeholder="es. Tribunale di Roma"
                  />
                </div>
                
                <div>
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    value={formData.rg}
                    onChange={(e) => handleInputChange('rg', e.target.value)}
                    placeholder="es. RG 12345/2024"
                  />
                </div>
                
                <div>
                  <Label htmlFor="giudice">Giudice</Label>
                  <Input
                    id="giudice"
                    value={formData.giudice}
                    onChange={(e) => handleInputChange('giudice', e.target.value)}
                    placeholder="Nome del giudice"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Note e Priorità */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Note e Priorità</h3>
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
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={formData.urgent}
                  onChange={(e) => handleInputChange('urgent', e.target.checked)}
                  className="w-4 h-4 text-red-600 border-red-300 rounded focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="urgent" className="text-red-600 font-medium cursor-pointer">
                  URGENTE
                </label>
              </div>
            </div>
          </Card>

          {/* Anteprima Categoria */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Anteprima</h3>
            <div className={`p-4 rounded-lg border ${getCategoryColor(formData.categoria)}`}>
              <div className="font-medium">
                {getAvailableCategories().find(cat => cat.value === formData.categoria)?.label}
              </div>
              {formData.attivita && (
                <div className="text-sm mt-1">{formData.attivita}</div>
              )}
            </div>
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
              {isLoading ? 'Salvataggio...' : (activity ? 'Aggiorna Attività' : 'Crea Attività')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
