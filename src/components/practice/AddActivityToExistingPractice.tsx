import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Plus, ArrowLeft, Calendar } from 'lucide-react'
import { Activity } from '../../types/practice'
import { Client } from '../../types/client'
import { useMobile } from '../../hooks/useMobile'
import { supabase } from '../../lib/supabase'

interface Practice {
  id: string
  numero: string
  cliente_id: string
  controparti_ids: string[]
  tipo_procedura: 'STRAGIUDIZIALE' | 'GIUDIZIALE'
  created_at: string
  updated_at: string
}

interface AddActivityToExistingPracticeProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clients: Client[]
  onActivityCreated: (activity: Activity) => void
}

export function AddActivityToExistingPractice({ open, onOpenChange, clients, onActivityCreated }: AddActivityToExistingPracticeProps) {
  const isMobile = useMobile()
  const [step, setStep] = useState<'select-practice' | 'add-activity'>('select-practice')
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null)
  const [practices, setPractices] = useState<Practice[]>([])
  const [isCreatingActivity, setIsCreatingActivity] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form data for activity
  const [activityData, setActivityData] = useState({
    categoria: 'Appuntamento' as any,
    attivita: '',
    data: '',
    ora: '',
    autorita_giudiziaria: '',
    rg: '',
    giudice: '',
    note: '',
    urgent: false
  })

  // Reset when modal opens/closes
  useEffect(() => {
    if (open) {
      setStep('select-practice')
      setSelectedPractice(null)
      setActivityData({
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
      loadPractices()
    }
  }, [open])

  const loadPractices = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Load practices from the practices table
      const { data: practices, error } = await supabase
        .from('practices')
        .select('*')
        .eq('user_id', user.id)
        .order('numero', { ascending: true })

      if (error) {
        console.error('Error loading practices:', error)
        throw error
      }

      console.log('Loaded practices:', practices)
      setPractices(practices || [])
    } catch (error) {
      console.error('Error loading practices:', error)
      // Fallback: try to load from tasks table if practices table doesn't exist
      try {
        const { data: { user: fallbackUser } } = await supabase.auth.getUser()
        if (!fallbackUser) {
          throw new Error('User not authenticated')
        }
        
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('pratica, cliente, controparte, categoria')
          .eq('user_id', fallbackUser.id)
          .not('pratica', 'is', null)

        if (tasksError) throw tasksError

        // Group by pratica to get unique practices
        const practiceMap = new Map()
        tasks?.forEach(task => {
          if (!practiceMap.has(task.pratica)) {
            practiceMap.set(task.pratica, {
              id: `practice_${task.pratica.replace(/\//g, '_')}`,
              numero: task.pratica,
              cliente_id: '', // We'll need to find this from clients
              controparti_ids: [],
              tipo_procedura: 'STRAGIUDIZIALE' as const, // Default, we'll need to determine this
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          }
        })

        const fallbackPractices = Array.from(practiceMap.values())
        setPractices(fallbackPractices)
      } catch (fallbackError) {
        console.error('Fallback loading failed:', fallbackError)
        setPractices([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('select-practice')
    setSelectedPractice(null)
    onOpenChange(false)
  }

  const handlePracticeSelect = (practice: Practice) => {
    setSelectedPractice(practice)
    setStep('add-activity')
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
      const cliente = clients.find(c => c.id === selectedPractice!.cliente_id)
      const controparti = selectedPractice!.controparti_ids
        .map(id => clients.find(c => c.id === id))
        .filter(Boolean)
        .map(c => c!.ragione || `${c!.nome} ${c!.cognome}`)
        .join(', ')

      console.log('Debug client data:', {
        selectedPractice: selectedPractice,
        clients: clients,
        cliente: cliente,
        controparti: controparti
      })

      // Check if this is a real practice (from practices table) or a fallback practice
      const isRealPractice = selectedPractice!.id && !selectedPractice!.id.startsWith('practice_')
      
      let data, error
      
      if (isRealPractice) {
        // Save to activities table
        const activityRecord = {
          user_id: user.id,
          pratica_id: selectedPractice!.id,
          categoria: activityData.categoria,
          attivita: activityData.attivita,
          data: activityData.data,
          ora: activityData.ora || null,
          autorita_giudiziaria: activityData.autorita_giudiziaria || null,
          rg: activityData.rg || null,
          giudice: activityData.giudice || null,
          note: activityData.note || null,
          stato: 'todo' as const,
          urgent: activityData.urgent
        }

        console.log('Saving activity to database:', activityRecord)
        
        const result = await supabase
          .from('activities')
          .insert(activityRecord)
          .select()
          .single()
        
        data = result.data
        error = result.error
      } else {
        // Save to tasks table (fallback)
        const taskData = {
          user_id: user.id,
          pratica: selectedPractice!.numero,
          attivita: activityData.attivita,
          scadenza: activityData.data,
          ora: activityData.ora || null,
          categoria: activityData.categoria,
          autorita_giudiziaria: activityData.autorita_giudiziaria || null,
          rg: activityData.rg || null,
          giudice: activityData.giudice || null,
          note: activityData.note || null,
          stato: 'todo' as const,
          urgent: activityData.urgent,
          cliente: cliente ? (cliente.ragione || `${cliente.nome} ${cliente.cognome}`) : null,
          controparte: controparti || null
        }

        console.log('Saving task to database:', taskData)

        const result = await supabase
          .from('tasks')
          .insert(taskData)
          .select()
          .single()
        
        data = result.data
        error = result.error
      }

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      console.log('Record saved successfully:', data)

      // Create Activity object for callback
      const newActivity: Activity = {
        id: data.id,
        user_id: data.user_id,
        pratica_id: isRealPractice ? selectedPractice!.id : `practice_${selectedPractice!.numero.replace(/\//g, '_')}`,
        categoria: activityData.categoria,
        attivita: activityData.attivita,
        data: activityData.data,
        ora: activityData.ora,
        autorita_giudiziaria: activityData.autorita_giudiziaria,
        rg: activityData.rg,
        giudice: activityData.giudice,
        note: activityData.note,
        stato: 'todo',
        urgent: activityData.urgent,
        created_at: data.created_at,
        updated_at: data.updated_at
      }

      console.log('Activity created successfully:', newActivity)
      onActivityCreated(newActivity)
      handleClose()
    } catch (error) {
      console.error('Error creating activity:', error)
      alert('Errore nella creazione dell\'attività: ' + (error as Error).message)
    } finally {
      setIsCreatingActivity(false)
    }
  }

  const goBackToPracticeSelection = () => {
    setStep('select-practice')
  }

  const getCategories = () => {
    return selectedPractice?.tipo_procedura === 'STRAGIUDIZIALE' 
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
      <div className={`relative bg-white rounded-lg shadow-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full mx-4 ${isMobile ? 'mx-2' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Aggiungi Attività a Pratica Esistente
          </h2>
          <button
            onClick={handleClose}
            className="rounded-sm opacity-70 hover:opacity-100 p-1"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${step === 'select-practice' ? 'text-blue-600' : 'text-green-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 'select-practice' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">1. Seleziona Pratica</span>
              </div>

              <ArrowLeft className="w-4 h-4 text-gray-400" />

              <div className={`flex items-center space-x-2 ${step === 'add-activity' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 'add-activity' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">2. Aggiungi Attività</span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          {step === 'select-practice' ? (
            <div className="space-y-6">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Seleziona Pratica</h3>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Caricamento pratiche...</p>
                  </div>
                ) : practices.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nessuna pratica trovata.</p>
                    <p className="text-sm text-gray-400 mt-2">Crea prima una nuova pratica.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {practices.map((practice) => (
                      <div
                        key={practice.id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handlePracticeSelect(practice)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-gray-900">{practice.numero}</h4>
                            <p className="text-sm text-gray-600">
                              Tipo: {practice.tipo_procedura}
                            </p>
                          </div>
                          <div className="text-blue-600">
                            <Plus className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Aggiungi Attività a {selectedPractice?.numero}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                {selectedPractice?.tipo_procedura === 'GIUDIZIALE' && (
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
                      type="time"
                      value={activityData.ora} 
                      onChange={(e) => setActivityData(prev => ({ ...prev, ora: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Urgent Checkbox */}
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="urgent"
                    checked={activityData.urgent}
                    onChange={(e) => setActivityData(prev => ({ 
                      ...prev, 
                      urgent: e.target.checked
                    }))}
                    className="w-4 h-4 text-red-600 border-red-300 rounded focus:ring-red-500 cursor-pointer"
                  />
                  <label htmlFor="urgent" className="text-red-600 font-medium cursor-pointer">
                    URGENTE
                  </label>
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
        <div className="flex justify-between p-6 border-t bg-gray-50">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isCreatingActivity}
          >
            Annulla
          </Button>

          <div className="flex gap-2">
            {step === 'add-activity' && (
              <Button
                type="button"
                variant="outline"
                onClick={goBackToPracticeSelection}
                disabled={isCreatingActivity}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Indietro
              </Button>
            )}

            {step === 'add-activity' && (
              <Button
                type="button"
                onClick={handleActivitySubmit}
                disabled={isCreatingActivity || !activityData.attivita || !activityData.data}
                className="flex items-center gap-2"
              >
                {isCreatingActivity ? 'Creazione...' : 'Aggiungi Attività'}
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
