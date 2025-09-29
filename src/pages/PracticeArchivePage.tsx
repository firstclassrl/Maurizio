import { useState, useEffect } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Calendar, User, Users, FileText, ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Practice } from '../types/practice'
import { useToast } from '../components/ui/Toast'
import { Archive } from 'lucide-react'
import { Input } from '../components/ui/input'
import { Footer } from '../components/ui/Footer'
import { NewActivityWizard } from '../components/practice/NewActivityWizard'
import { AddActivityToExistingPractice } from '../components/practice/AddActivityToExistingPractice'

interface PracticeArchivePageProps {
  onNavigateBack: () => void
}

export function PracticeArchivePage({ onNavigateBack }: PracticeArchivePageProps) {
  const { showSuccess, showError } = useToast()
  const [practices, setPractices] = useState<Practice[]>([])
  const [clients] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const [filteredPractices, setFilteredPractices] = useState<Practice[]>([])
  // Nuovi filtri
  const [searchText, setSearchText] = useState<string>('')
  const [filterTipo, setFilterTipo] = useState<string>('all')
  const [filterAutorita, setFilterAutorita] = useState<string>('')
  const [filterRG, setFilterRG] = useState<string>('')
  const [filterGiudice, setFilterGiudice] = useState<string>('')
  const [filterStato, setFilterStato] = useState<string>('all')
  const [isNewPracticeModalOpen, setIsNewPracticeModalOpen] = useState(false)
  const [selectedPracticeForDetails, setSelectedPracticeForDetails] = useState<Practice | null>(null)
  const [selectedPracticeForActivity, setSelectedPracticeForActivity] = useState<Practice | null>(null)
  const [practiceActivities, setPracticeActivities] = useState<any[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(false)
  const [isEditingJudicialFields, setIsEditingJudicialFields] = useState(false)
  const [judicialFields, setJudicialFields] = useState({
    autorita_giudiziaria: '',
    rg: '',
    giudice: ''
  })
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [archivingId, setArchivingId] = useState<string | null>(null)

  const loadUserData = async () => {
    try {
      await loadPractices()
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error)
    }
  }
  // Elimina pratica e tutte le attività collegate
  const handleDeletePractice = async (practice: Practice) => {
    if (!practice?.id) return
    const confirmed = window.confirm(`Eliminare definitivamente la pratica ${practice.numero}? Verranno eliminate anche tutte le attività associate.`)
    if (!confirmed) return

    setDeletingId(practice.id)
    try {
      const { error: actErr } = await supabase
        .from('activities')
        .delete()
        .eq('pratica_id', practice.id)
      if (actErr) throw actErr

      const { error: pracErr } = await supabase
        .from('practices')
        .delete()
        .eq('id', practice.id)
      if (pracErr) throw pracErr

      setPractices(prev => prev.filter(p => p.id !== practice.id))
      showSuccess('Pratica eliminata', `Pratica ${practice.numero} eliminata`)
    } catch (error) {
      showError('Errore', `Errore durante l'eliminazione: ${error instanceof Error ? error.message : 'Sconosciuto'}`)
    } finally {
      setDeletingId(null)
    }
  }

  // Archivia pratica (sposta in storage pratiche)
  const handleArchivePractice = async (practice: Practice) => {
    if (!practice?.id) return
    const confirmed = window.confirm(`Archiviare la pratica ${practice.numero}? Potrai vederla nello Storage Pratiche e ripristinarla in seguito.`)
    if (!confirmed) return

    setArchivingId(practice.id)
    try {
      const { error } = await supabase
        .from('practices')
        .update({ stato: 'archived' })
        .eq('id', practice.id)
      if (error) throw error

      setPractices(prev => prev.filter(p => p.id !== practice.id))
      showSuccess('Pratica archiviata', `Pratica ${practice.numero} archiviata`)
    } catch (error) {
      showError('Errore', `Errore durante l'archiviazione: ${error instanceof Error ? error.message : 'Sconosciuto'}`)
    } finally {
      setArchivingId(null)
    }
  }

  const loadPractices = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return
      }

      // Prima carica le pratiche con il cliente
      const { data: practicesData, error: practicesError } = await supabase
        .from('practices')
        .select(`
          *,
          clients!practices_cliente_id_fkey(*)
        `)
        .eq('user_id', user.id)
        .order('numero', { ascending: false })

      if (practicesError) throw practicesError

      // Poi per ogni pratica, carica le controparti se ci sono
      const practicesWithCounterparties = await Promise.all(
        (practicesData || []).map(async (practice) => {
          if (practice.controparti_ids && practice.controparti_ids.length > 0) {
            const { data: counterpartiesData } = await supabase
              .from('clients')
              .select('*')
              .in('id', practice.controparti_ids)
            
            return {
              ...practice,
              counterparties: counterpartiesData || []
            }
          }
          return {
            ...practice,
            counterparties: []
          }
        })
      )

      setPractices(practicesWithCounterparties)
    } catch (error) {
      console.error('Errore nel caricamento delle pratiche:', error)
    } finally {
      setLoading(false)
    }
  }


  // Gestisce la creazione di una nuova attività
  const handleActivityCreated = () => {
    // Ricarica i dati usando il sistema sicuro
    loadUserData()
  }

  // Carica le attività di una pratica specifica
  const loadPracticeActivities = async (practiceId: string) => {
    setIsLoadingActivities(true)
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('pratica_id', practiceId)
        .order('data', { ascending: true })

      if (error) throw error
      setPracticeActivities(data || [])
    } catch (error) {
      setPracticeActivities([])
    } finally {
      setIsLoadingActivities(false)
    }
  }

  // Gestisce il click su "Visualizza Dettagli"
  const handleViewDetails = async (practice: Practice) => {
    setSelectedPracticeForDetails(practice)
    setJudicialFields({
      autorita_giudiziaria: practice.autorita_giudiziaria || '',
      rg: practice.rg || '',
      giudice: practice.giudice || ''
    })
    setIsEditingJudicialFields(false)
    if (practice.id) {
      await loadPracticeActivities(practice.id)
    }
  }

  // Gestisce il click su "Aggiungi Attività"
  const handleAddActivity = (practice: Practice) => {
    setSelectedPracticeForActivity(practice)
  }

  // Salva i campi giudiziali
  const handleSaveJudicialFields = async () => {
    if (!selectedPracticeForDetails?.id) return

    try {
      const { error } = await supabase
        .from('practices')
        .update({
          autorita_giudiziaria: judicialFields.autorita_giudiziaria || null,
          rg: judicialFields.rg || null,
          giudice: judicialFields.giudice || null
        })
        .eq('id', selectedPracticeForDetails.id)

      if (error) throw error

      // Aggiorna la pratica locale
      setSelectedPracticeForDetails(prev => prev ? {
        ...prev,
        autorita_giudiziaria: judicialFields.autorita_giudiziaria,
        rg: judicialFields.rg,
        giudice: judicialFields.giudice
      } : null)

      // Ricarica le pratiche per aggiornare la lista
      await loadPractices()
      
      setIsEditingJudicialFields(false)
      alert('Campi giudiziali aggiornati con successo!')
    } catch (error) {
      console.error('Errore nel salvataggio:', error)
      alert('Errore nel salvataggio dei campi giudiziali')
    }
  }


  // Filtra le pratiche
  const getFilteredPractices = () => {
    let filtered = practices

    // Ricerca libera: numero pratica, cliente, controparti
    if (searchText.trim()) {
      const q = searchText.toLowerCase()
      filtered = filtered.filter((p: any) => {
        const num = (p.numero || '').toString().toLowerCase()
        const cliente = (p.clients?.ragione || `${p.clients?.nome || ''} ${p.clients?.cognome || ''}`).toLowerCase()
        const controparti = (p.counterparties || []).map((c: any) => (c.ragione || `${c.nome || ''} ${c.cognome || ''}`).toLowerCase()).join(' ')
        const note = (p.note || '').toLowerCase()
        return num.includes(q) || cliente.includes(q) || controparti.includes(q) || note.includes(q)
      })
    }

    // Tipo procedura
    if (filterTipo !== 'all') {
      filtered = filtered.filter((p: any) => p.tipo_procedura === filterTipo)
    }

    // Stato pratica
    if (filterStato !== 'all') {
      if (filterStato === 'active') filtered = filtered.filter((p: any) => p.stato !== 'archived')
      if (filterStato === 'archived') filtered = filtered.filter((p: any) => p.stato === 'archived')
    }

    // Autorità
    if (filterAutorita.trim()) {
      const q = filterAutorita.toLowerCase()
      filtered = filtered.filter((p: any) => (p.autorita_giudiziaria || '').toLowerCase().includes(q))
    }

    // RG
    if (filterRG.trim()) {
      const q = filterRG.toLowerCase()
      filtered = filtered.filter((p: any) => (p.rg || '').toLowerCase().includes(q))
    }

    // Giudice
    if (filterGiudice.trim()) {
      const q = filterGiudice.toLowerCase()
      filtered = filtered.filter((p: any) => (p.giudice || '').toLowerCase().includes(q))
    }

    return filtered
  }

  // Formatta la data
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('it-IT')
  }

  // Ottiene il colore del tipo procedura
  const getProcedureColor = (tipo: string) => {
    return tipo === 'STRAGIUDIZIALE' 
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-red-100 text-red-800 border-red-200'
  }

  useEffect(() => {
    loadUserData()
  }, [])

  useEffect(() => {
    setFilteredPractices(getFilteredPractices())
  }, [searchText, filterTipo, filterAutorita, filterRG, filterGiudice, filterStato, practices])

  // Aggiorna filteredPractices quando cambiano i dati sicuri
  useEffect(() => {
    if (practices.length > 0) {
      setFilteredPractices(practices)
    }
  }, [practices])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={onNavigateBack}
              variant="outline"
              size="sm"
              className="border-white text-white hover:bg-white hover:text-slate-900 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna alla Dashboard
            </Button>
            <h1 className="text-xl font-semibold">Pratiche</h1>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsNewPracticeModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuova Pratica
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-6">

        {/* Filtri */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Filtri</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Ricerca</label>
                <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Numero pratica, cliente, controparti, note…" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Tipo procedura</label>
                <select value={filterTipo} onChange={(e)=>setFilterTipo(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                  <option value="all">Tutte</option>
                  <option value="GIUDIZIALE">Giudiziale</option>
                  <option value="STRAGIUDIZIALE">Stragiudiziale</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Autorità</label>
                <Input value={filterAutorita} onChange={(e)=>setFilterAutorita(e.target.value)} placeholder="es. Tribunale di Pescara" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">R.G.</label>
                <Input value={filterRG} onChange={(e)=>setFilterRG(e.target.value)} placeholder="es. 12345/2025" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Giudice</label>
                <Input value={filterGiudice} onChange={(e)=>setFilterGiudice(e.target.value)} placeholder="es. Dott. Rossi" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Stato</label>
                <select value={filterStato} onChange={(e)=>setFilterStato(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                  <option value="all">Tutte</option>
                  <option value="active">Attive</option>
                  <option value="archived">Archiviate</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={()=>{setSearchText('');setFilterTipo('all');setFilterAutorita('');setFilterRG('');setFilterGiudice('');setFilterStato('all');}}>Reset</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista Pratiche */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Lista Pratiche</h2>
              <span className="text-sm text-gray-600">
                {filteredPractices.length} pratiche trovate
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-500">Caricamento pratiche...</div>
              </div>
            ) : filteredPractices.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nessuna pratica trovata</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredPractices.map((practice) => (
                  <Card key={practice.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Informazioni Principali */}
                        <div className="lg:col-span-2">
                          <div className="flex items-center gap-3 mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">
                              Pratica {practice.numero}
                            </h3>
                            <Badge 
                              variant="outline" 
                              className={`text-sm ${getProcedureColor(practice.tipo_procedura)}`}
                            >
                              {practice.tipo_procedura}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span><strong>Cliente:</strong> {
                                practice.clients 
                                  ? (practice.clients.ragione || `${practice.clients.nome || ''} ${practice.clients.cognome || ''}`.trim())
                                  : 'N/A'
                              }</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span><strong>Controparti:</strong> {
                                practice.counterparties && practice.counterparties.length > 0
                                  ? practice.counterparties.map(c => c.ragione || `${c.nome || ''} ${c.cognome || ''}`.trim()).join(', ')
                                  : 'N/A'
                              }</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span><strong>Creata:</strong> {formatDate(practice.created_at)}</span>
                            </div>
                            
                            {/* Campi giudiziali per pratiche GIUDIZIALE */}
                            {practice.tipo_procedura === 'GIUDIZIALE' && (
                              <>
                                {practice.autorita_giudiziaria && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500">🏛️</span>
                                    <span><strong>Autorità:</strong> {practice.autorita_giudiziaria}</span>
                                  </div>
                                )}
                                {practice.rg && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500">📋</span>
                                    <span><strong>R.G.:</strong> {practice.rg}</span>
                                  </div>
                                )}
                                {practice.giudice && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500">⚖️</span>
                                    <span><strong>Giudice:</strong> {practice.giudice}</span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Azioni */}
                        <div className="flex flex-col justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleViewDetails(practice)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Visualizza Dettagli
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleAddActivity(practice)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Aggiungi Attività
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-orange-600 border-orange-600 hover:bg-orange-50 bg-white"
                            onClick={() => handleArchivePractice(practice)}
                            disabled={archivingId === practice.id}
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            {archivingId === practice.id ? 'Archiviazione…' : 'Archivia Pratica'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            onClick={() => handleDeletePractice(practice)}
                            disabled={deletingId === practice.id}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deletingId === practice.id ? 'Eliminazione…' : 'Elimina Pratica'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* New Practice Modal */}
      <NewActivityWizard
        open={isNewPracticeModalOpen}
        onOpenChange={setIsNewPracticeModalOpen}
        clients={clients}
        onActivityCreated={handleActivityCreated}
      />

      {/* Practice Details Modal */}
      {selectedPracticeForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Dettagli Pratica {selectedPracticeForDetails.numero}
                </h2>
                <button
                  onClick={() => setSelectedPracticeForDetails(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Informazioni Pratica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Informazioni Pratica</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Numero:</span> {selectedPracticeForDetails.numero}
                    </div>
                    <div>
                      <span className="font-medium">Tipo Procedura:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
                        selectedPracticeForDetails.tipo_procedura === 'STRAGIUDIZIALE' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedPracticeForDetails.tipo_procedura}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Cliente:</span> {
                        selectedPracticeForDetails.clients 
                          ? (selectedPracticeForDetails.clients.ragione || `${selectedPracticeForDetails.clients.nome || ''} ${selectedPracticeForDetails.clients.cognome || ''}`.trim())
                          : 'N/A'
                      }
                    </div>
                    <div>
                      <span className="font-medium">Controparti:</span> {
                        selectedPracticeForDetails.counterparties && selectedPracticeForDetails.counterparties.length > 0
                          ? selectedPracticeForDetails.counterparties.map(c => c.ragione || `${c.nome || ''} ${c.cognome || ''}`.trim()).join(', ')
                          : 'Nessuna'
                      }
                    </div>
                    <div>
                      <span className="font-medium">Creata:</span> {formatDate(selectedPracticeForDetails.created_at)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sezione Campi Giudiziali per pratiche GIUDIZIALE */}
              {selectedPracticeForDetails.tipo_procedura === 'GIUDIZIALE' && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Informazioni Giudiziali</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingJudicialFields(!isEditingJudicialFields)}
                    >
                      {isEditingJudicialFields ? 'Annulla' : 'Modifica'}
                    </Button>
                  </div>
                  
                  {isEditingJudicialFields ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Autorità Giudiziaria</label>
                        <input
                          type="text"
                          value={judicialFields.autorita_giudiziaria}
                          onChange={(e) => setJudicialFields(prev => ({ ...prev, autorita_giudiziaria: e.target.value }))}
                          placeholder="es. Tribunale di Roma"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">R.G.</label>
                        <input
                          type="text"
                          value={judicialFields.rg}
                          onChange={(e) => setJudicialFields(prev => ({ ...prev, rg: e.target.value }))}
                          placeholder="es. 12345/2024"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giudice</label>
                        <input
                          type="text"
                          value={judicialFields.giudice}
                          onChange={(e) => setJudicialFields(prev => ({ ...prev, giudice: e.target.value }))}
                          placeholder="es. Dott. Mario Rossi"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="font-medium">Autorità Giudiziaria:</span> 
                        <span className="ml-2">{selectedPracticeForDetails.autorita_giudiziaria || 'Non specificata'}</span>
                      </div>
                      <div>
                        <span className="font-medium">R.G.:</span> 
                        <span className="ml-2">{selectedPracticeForDetails.rg || 'Non specificato'}</span>
                      </div>
                      <div>
                        <span className="font-medium">Giudice:</span> 
                        <span className="ml-2">{selectedPracticeForDetails.giudice || 'Non specificato'}</span>
                      </div>
                    </div>
                  )}
                  
                  {isEditingJudicialFields && (
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingJudicialFields(false)}
                      >
                        Annulla
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveJudicialFields}
                      >
                        Salva
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Attività Correlate */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Attività Correlate</h3>
                {isLoadingActivities ? (
                  <div className="text-center py-4">
                    <div className="text-gray-500">Caricamento attività...</div>
                  </div>
                ) : practiceActivities.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nessuna attività trovata per questa pratica</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {practiceActivities.map((activity) => (
                      <div key={activity.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow bg-white">
                        {/* Header con icona e stato */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className={`w-2 h-2 rounded-full ${
                              activity.stato === 'done' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}></span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            activity.stato === 'done' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {activity.stato === 'done' ? 'Fatto' : 'Todo'}
                          </span>
                        </div>
                        
                        {/* Titolo attività */}
                        <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                          {activity.attivita}
                        </h4>
                        
                        {/* Informazioni compatte */}
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">📅</span>
                            <span>{new Date(activity.data).toLocaleDateString('it-IT')}</span>
                            {activity.ora && (
                              <>
                                <span className="mx-1">•</span>
                                <span>{activity.ora}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">🏷️</span>
                            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                              {activity.categoria}
                            </span>
                          </div>
                          {activity.note && (
                            <div className="flex items-start gap-1">
                              <span className="font-medium">📝</span>
                              <span className="line-clamp-2 italic">{activity.note}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {selectedPracticeForActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Aggiungi Attività - Pratica {selectedPracticeForActivity.numero}
                </h2>
                <button
                  onClick={() => setSelectedPracticeForActivity(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  Funzionalità in sviluppo. Per ora usa il pulsante "+ Nuova Pratica" per creare una nuova attività.
                </p>
                <Button
                  onClick={() => setSelectedPracticeForActivity(null)}
                  variant="outline"
                >
                  Chiudi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Activity to Existing Practice Modal */}
      <AddActivityToExistingPractice
        open={selectedPracticeForActivity !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedPracticeForActivity(null)
        }}
        clients={clients}
        preselectedPractice={selectedPracticeForActivity}
        onActivityCreated={() => {
          setSelectedPracticeForActivity(null)
          // Ricarica le pratiche per aggiornare i contatori
          loadPractices()
        }}
      />

      {/* Footer */}
      <Footer />
    </div>
  )
}
