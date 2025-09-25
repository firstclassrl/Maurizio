import { useState, useEffect } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Calendar, User, Users, FileText, ArrowLeft, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Practice } from '../types/practice'
import { PracticeFilter } from '../components/ui/PracticeFilter'
import { CategoryFilter } from '../components/ui/CategoryFilter'
import { PartyFilter } from '../components/ui/PartyFilter'
import { Footer } from '../components/ui/Footer'
import { NewActivityWizard } from '../components/practice/NewActivityWizard'
import { Client } from '../types/client'
import { Activity } from '../types/practice'

interface PracticeArchivePageProps {
  onNavigateBack: () => void
}

export function PracticeArchivePage({ onNavigateBack }: PracticeArchivePageProps) {
  const [practices, setPractices] = useState<Practice[]>([])
  const [filteredPractices, setFilteredPractices] = useState<Practice[]>([])
  const [selectedPractice, setSelectedPractice] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedParty, setSelectedParty] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [isNewPracticeModalOpen, setIsNewPracticeModalOpen] = useState(false)

  // Carica tutti i clienti
  const loadClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Errore nel caricamento dei clienti:', error)
    }
  }

  // Carica tutte le pratiche
  const loadPractices = async () => {
    setLoading(true)
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('User not authenticated')
        setLoading(false)
        return
      }

      console.log('Loading practices for user:', user.id)

      // Debug: Controlla se ci sono pratiche per questo utente
      const { data: debugPractices, error: debugError } = await supabase
        .from('practices')
        .select('*')
        .eq('user_id', user.id)
      
      console.log('Debug - All practices for user:', { debugPractices, debugError })

      // Prima carica le pratiche con il cliente
      const { data: practicesData, error: practicesError } = await supabase
        .from('practices')
        .select(`
          *,
          clients!practices_cliente_id_fkey(*)
        `)
        .eq('user_id', user.id)
        .order('numero', { ascending: false })

      console.log('Practices query result:', { practicesData, practicesError })

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

      console.log('Final practices with counterparties:', practicesWithCounterparties)
      setPractices(practicesWithCounterparties)
      setFilteredPractices(practicesWithCounterparties)
    } catch (error) {
      console.error('Errore nel caricamento delle pratiche:', error)
    } finally {
      setLoading(false)
    }
  }

  // Gestisce la creazione di una nuova attività
  const handleActivityCreated = (activity: Activity) => {
    console.log('New activity created from archive:', activity)
    // Ricarica le pratiche per mostrare eventuali aggiornamenti
    loadPractices()
  }

  // Filtra le pratiche
  const getFilteredPractices = () => {
    let filtered = practices

    // Filtro per pratica
    if (selectedPractice !== 'all') {
      filtered = filtered.filter(practice => practice.numero === selectedPractice)
    }

    // Filtro per categoria (basato sulle attività della pratica)
    if (selectedCategory !== 'all') {
      // Per ora filtriamo solo per tipo procedura
      if (selectedCategory === 'STRAGIUDIZIALE' || selectedCategory === 'GIUDIZIALE') {
        filtered = filtered.filter(practice => practice.tipo_procedura === selectedCategory)
      }
    }

    // Filtro per cliente/controparte
    if (selectedParty !== 'all') {
      filtered = filtered.filter(practice => {
        const clientName = practice.clients?.nome?.toLowerCase() || ''
        const counterpartyNames = practice.counterparties?.map(c => c.nome.toLowerCase()).join(' ') || ''
        const searchTerm = selectedParty.toLowerCase()
        return clientName.includes(searchTerm) || counterpartyNames.includes(searchTerm)
      })
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
    loadClients()
    loadPractices()
  }, [])

  useEffect(() => {
    setFilteredPractices(getFilteredPractices())
  }, [selectedPractice, selectedCategory, selectedParty, practices])

  return (
    <div className="min-h-screen bg-gray-50">
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
            <h1 className="text-xl font-semibold">Archivio Pratiche</h1>
          </div>
          <Button
            onClick={() => setIsNewPracticeModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuova Pratica
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6 pb-20">
        {/* Filtri */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Filtri</h2>
            <div className="flex items-center gap-4 flex-wrap">
              <PracticeFilter 
                selectedPractice={selectedPractice}
                onPracticeChange={setSelectedPractice}
                tasks={[]} // Non necessario per l'archivio
                className="w-64"
              />
              <CategoryFilter 
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                className="w-64"
              />
              <PartyFilter 
                selectedParty={selectedParty}
                onPartyChange={setSelectedParty}
                tasks={[]} // Non necessario per l'archivio
                className="w-64"
              />
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
                              <span><strong>Cliente:</strong> {practice.clients?.nome || 'N/A'}</span>
                            </div>
                            
                            {practice.counterparties && practice.counterparties.length > 0 && (
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-500" />
                                <span><strong>Controparti:</strong> {practice.counterparties.map(c => c.nome).join(', ')}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span><strong>Creata:</strong> {formatDate(practice.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Azioni */}
                        <div className="flex flex-col justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Visualizza Dettagli
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Aggiungi Attività
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

      {/* Footer */}
      <Footer absolute />
    </div>
  )
}
