import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Plus, ArrowRight, FileText, Calendar, ArrowLeft } from 'lucide-react'
import { Practice, Activity } from '../../types/practice'
import { Client } from '../../types/client'
import { useMobile } from '../../hooks/useMobile'
import { supabase } from '../../lib/supabase'

interface NewActivityWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clients: Client[]
  onActivityCreated: (activity: Activity) => void
}

export function NewActivityWizard({ open, onOpenChange, clients, onActivityCreated }: NewActivityWizardProps) {
  const isMobile = useMobile()
  const [step, setStep] = useState<'practice' | 'activity'>('practice')
  const [currentPractice, setCurrentPractice] = useState<Practice | null>(null)
  const [isCreatingPractice, setIsCreatingPractice] = useState(false)
  const [isCreatingActivity, setIsCreatingActivity] = useState(false)

  // Form data for practice
  const [practiceData, setPracticeData] = useState({
    numero: '',
    cliente_id: '',
    controparti_ids: [] as string[],
    tipo_procedura: 'STRAGIUDIZIALE' as 'STRAGIUDIZIALE' | 'GIUDIZIALE'
  })

  // Form data for activity
  const [activityData, setActivityData] = useState({
    categoria: 'Appuntamento' as any,
    attivita: '',
    data: '',
    ora: '',
    autorita_giudiziaria: '',
    rg: '',
    giudice: '',
    note: ''
  })

  // Reset when modal opens/closes
  useEffect(() => {
    if (open) {
      setStep('practice')
      setCurrentPractice(null)
      setPracticeData({
        numero: '',
        cliente_id: '',
        controparti_ids: [],
        tipo_procedura: 'STRAGIUDIZIALE'
      })
      setActivityData({
        categoria: 'Appuntamento',
        attivita: '',
        data: '',
        ora: '',
        autorita_giudiziaria: '',
        rg: '',
        giudice: '',
        note: ''
      })
    }
  }, [open])

  // Function to generate practice number
  const generatePracticeNumber = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      const { data, error } = await supabase
        .rpc('get_next_practice_number', { user_id_param: user.id })
      
      if (error) {
        console.warn('Practice number function not available, using fallback:', error)
        throw error
      }
      
      if (data) {
        return data
      }
      
      // Fallback
      const currentYear = new Date().getFullYear()
      const randomNum = Math.floor(Math.random() * 999) + 1
      return `${currentYear}/${randomNum.toString().padStart(3, '0')}`
    } catch (error) {
      console.error('Error generating practice number:', error)
      const currentYear = new Date().getFullYear()
      const randomNum = Math.floor(Math.random() * 999) + 1
      return `${currentYear}/${randomNum.toString().padStart(3, '0')}`
    }
  }

  const handleClose = () => {
    console.log('handleClose called')
    setStep('practice')
    setCurrentPractice(null)
    onOpenChange(false)
    console.log('onOpenChange(false) called')
  }

  const handlePracticeSubmit = async () => {
    if (!practiceData.cliente_id) {
      alert('Seleziona un cliente')
      return
    }

    setIsCreatingPractice(true)
    try {
      // Generate practice number only when creating activity
      const practiceNumber = await generatePracticeNumber()
      
      const newPractice: Practice = {
        id: `practice_${Date.now()}`,
        user_id: 'current_user_id',
        numero: practiceNumber,
        cliente_id: practiceData.cliente_id,
        controparti_ids: practiceData.controparti_ids,
        tipo_procedura: practiceData.tipo_procedura,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setCurrentPractice(newPractice)
      setStep('activity')
    } catch (error) {
      console.error('Error creating practice:', error)
      alert('Errore nella creazione della pratica')
    } finally {
      setIsCreatingPractice(false)
    }
  }

  const handleActivitySubmit = async () => {
    if (!activityData.attivita || !activityData.data) {
      alert('Compila tutti i campi obbligatori')
      return
    }

    setIsCreatingActivity(true)
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Get client names for pratica and controparti
      const cliente = clients.find(c => c.id === currentPractice!.cliente_id)
      const controparti = currentPractice!.controparti_ids
        .map(id => clients.find(c => c.id === id))
        .filter(Boolean)
        .map(c => c!.ragione || `${c!.nome} ${c!.cognome}`)
        .join(', ')

      // Map Activity data to Task format for database
      const taskData = {
        user_id: user.id,
        pratica: currentPractice!.numero,
        attivita: activityData.attivita,
        scadenza: activityData.data,
        ora: activityData.ora || null,
        categoria: activityData.categoria,
        autorita_giudiziaria: activityData.autorita_giudiziaria || null,
        rg: activityData.rg || null,
        giudice: activityData.giudice || null,
        note: activityData.note || null,
        stato: 'todo' as const,
        urgent: false,
        cliente: cliente?.ragione || `${cliente?.nome} ${cliente?.cognome}` || null,
        controparte: controparti || null
      }

      console.log('Saving task to database:', taskData)
      console.log('Task data details:', {
        pratica: taskData.pratica,
        attivita: taskData.attivita,
        categoria: taskData.categoria,
        scadenza: taskData.scadenza
      })

      // Save to database
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      console.log('Task saved successfully:', data)

      // Create Activity object for callback
      const newActivity: Activity = {
        id: data.id,
        user_id: data.user_id,
        pratica_id: currentPractice!.id!,
        categoria: activityData.categoria,
        attivita: activityData.attivita,
        data: activityData.data,
        ora: activityData.ora,
        autorita_giudiziaria: activityData.autorita_giudiziaria,
        rg: activityData.rg,
        giudice: activityData.giudice,
        note: activityData.note,
        stato: 'todo',
        urgent: false,
        created_at: data.created_at,
        updated_at: data.updated_at
      }

      console.log('Activity created successfully:', newActivity)
      onActivityCreated(newActivity)
      console.log('Calling handleClose...')
      handleClose()
    } catch (error) {
      console.error('Error creating activity:', error)
      alert('Errore nella creazione dell\'attività: ' + (error as Error).message)
    } finally {
      setIsCreatingActivity(false)
    }
  }

  const goBackToPractice = () => {
    setStep('practice')
  }

  const addControparte = () => {
    setPracticeData(prev => ({
      ...prev,
      controparti_ids: [...prev.controparti_ids, '']
    }))
  }

  const removeControparte = (index: number) => {
    setPracticeData(prev => ({
      ...prev,
      controparti_ids: prev.controparti_ids.filter((_, i) => i !== index)
    }))
  }

  const updateControparte = (index: number, value: string) => {
    setPracticeData(prev => ({
      ...prev,
      controparti_ids: prev.controparti_ids.map((id, i) => 
        i === index ? value : id
      )
    }))
  }

  const getCategories = () => {
    return practiceData.tipo_procedura === 'STRAGIUDIZIALE' 
      ? ['Appuntamento', 'Scadenza', 'Attività da Svolgere']
      : ['Udienza', 'Scadenza Processuale', 'Attività Processuale', 'Appuntamento', 'Scadenza', 'Attività da Svolgere']
  }

  const getCategoryDotColor = (categoria: string) => {
    const colorMap: { [key: string]: string } = {
      'Appuntamento': 'bg-gray-500',
      'Scadenza': 'bg-orange-500',
      'Attività da Svolgere': 'bg-blue-500',
      'Udienza': 'bg-green-500',
      'Scadenza Processuale': 'bg-red-500',
      'Attività Processuale': 'bg-yellow-500'
    }
    return colorMap[categoria] || 'bg-gray-500'
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className={`relative bg-white rounded-lg shadow-lg max-w-2xl max-h-[80vh] overflow-y-auto w-full mx-4 ${isMobile ? 'mx-2' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuova Attività
          </h2>
          <button
            onClick={handleClose}
            className="rounded-sm opacity-70 hover:opacity-100 p-1"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${step === 'practice' ? 'text-blue-600' : 'text-green-600'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step === 'practice' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  <FileText className="w-3 h-3" />
                </div>
                <span className="text-xs font-medium">1. Pratica</span>
              </div>

              <ArrowRight className="w-3 h-3 text-gray-400" />

              <div className={`flex items-center space-x-2 ${step === 'activity' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step === 'activity' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Calendar className="w-3 h-3" />
                </div>
                <span className="text-xs font-medium">2. Attività</span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          {step === 'practice' ? (
            <div className="space-y-4">
              <Card className="p-3">
                <h3 className="text-base font-semibold mb-3">Informazioni Pratica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Procedura *</label>
                    <select 
                      value={practiceData.tipo_procedura} 
                      onChange={(e) => setPracticeData(prev => ({ ...prev, tipo_procedura: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="STRAGIUDIZIALE">Stragiudiziale</option>
                      <option value="GIUDIZIALE">Giudiziale</option>
                    </select>
                  </div>
                </div>
              </Card>

              <Card className="p-3">
                <h3 className="text-base font-semibold mb-3">Cliente</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                  <select 
                    value={practiceData.cliente_id} 
                    onChange={(e) => setPracticeData(prev => ({ ...prev, cliente_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleziona cliente</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id!}>
                        {client.ragione || `${client.nome} ${client.cognome}`}
                      </option>
                    ))}
                  </select>
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold">Controparti</h3>
                  <Button type="button" onClick={addControparte} size="sm" className="flex items-center gap-1 text-xs">
                    <Plus className="w-3 h-3" />
                    Aggiungi Controparte
                  </Button>
                </div>
                
                {practiceData.controparti_ids.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    Nessuna controparte selezionata
                  </div>
                )}
                
                {practiceData.controparti_ids.map((controparteId, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <div className="flex-1">
                      <select 
                        value={controparteId} 
                        onChange={(e) => updateControparte(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleziona controparte</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id!}>
                            {client.ragione || `${client.nome} ${client.cognome}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeControparte(index)}
                      variant="destructive"
                      size="sm"
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="p-3">
                <h3 className="text-base font-semibold mb-3">Dettagli Attività</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria Attività *</label>
                    <div className="relative">
                      <select 
                        value={activityData.categoria} 
                        onChange={(e) => setActivityData(prev => ({ ...prev, categoria: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      >
                        {getCategories().map(cat => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <div className={`w-3 h-3 rounded-full ${getCategoryDotColor(activityData.categoria)}`}></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attività da Svolgere *</label>
                    <input 
                      type="text"
                      value={activityData.attivita} 
                      onChange={(e) => setActivityData(prev => ({ ...prev, attivita: e.target.value }))}
                      placeholder="Descrizione dell'attività"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {practiceData.tipo_procedura === 'GIUDIZIALE' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Autorità Giudiziaria</label>
                      <input 
                        type="text"
                        value={activityData.autorita_giudiziaria} 
                        onChange={(e) => setActivityData(prev => ({ ...prev, autorita_giudiziaria: e.target.value }))}
                        placeholder="es. Tribunale di Roma"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">RG</label>
                      <input 
                        type="text"
                        value={activityData.rg} 
                        onChange={(e) => setActivityData(prev => ({ ...prev, rg: e.target.value }))}
                        placeholder="es. 12345/2024"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giudice</label>
                      <input 
                        type="text"
                        value={activityData.giudice} 
                        onChange={(e) => setActivityData(prev => ({ ...prev, giudice: e.target.value }))}
                        placeholder="es. Dott. Rossi"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                    <input 
                      type="date"
                      value={activityData.data} 
                      onChange={(e) => setActivityData(prev => ({ ...prev, data: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ora</label>
                    <input 
                      type="text"
                      placeholder="--:--"
                      value={activityData.ora} 
                      onChange={(e) => setActivityData(prev => ({ ...prev, ora: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <textarea 
                    value={activityData.note} 
                    onChange={(e) => setActivityData(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="Note aggiuntive"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between p-4 border-t bg-gray-50">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isCreatingPractice || isCreatingActivity}
          >
            Annulla
          </Button>

          <div className="flex gap-2">
            {step === 'activity' && (
              <Button
                type="button"
                variant="outline"
                onClick={goBackToPractice}
                disabled={isCreatingPractice || isCreatingActivity}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Indietro
              </Button>
            )}

            {step === 'practice' ? (
              <Button
                type="button"
                onClick={handlePracticeSubmit}
                disabled={isCreatingPractice || !practiceData.cliente_id}
                className="flex items-center gap-2"
              >
                {isCreatingPractice ? 'Creazione...' : 'Avanti'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleActivitySubmit}
                disabled={isCreatingActivity || !activityData.attivita || !activityData.data}
                className="flex items-center gap-2"
              >
                {isCreatingActivity ? 'Creazione...' : 'Crea Attività'}
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
