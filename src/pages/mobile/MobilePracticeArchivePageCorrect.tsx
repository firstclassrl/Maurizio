import React, { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { MobileLayout } from '../../components/mobile/MobileLayout'
import { MobileHeader } from '../../components/mobile/MobileHeader'
import { MobileCard } from '../../components/mobile/MobileCard'
import { MobileButton } from '../../components/mobile/MobileButton'
import { NewActivityWizard } from '../../components/practice/NewActivityWizard'
import { AppView } from '../../App'
import { Search, Plus, FileText, Calendar, Building2 } from 'lucide-react'
import { User as UserIcon } from 'lucide-react'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Client } from '../../types/client'

interface Practice {
  id: string
  numero: string
  cliente_id: string
  controparti_ids: string[]
  tipo_procedura: 'STRAGIUDIZIALE' | 'GIUDIZIALE'
  autorita_giudiziaria?: string
  rg?: string
  giudice?: string
  note?: string
  created_at: string
  updated_at: string
}

interface MobilePracticeArchivePageCorrectProps {
  user: User
  onNavigate: (view: AppView) => void
}

export function MobilePracticeArchivePageCorrect({ user, onNavigate }: MobilePracticeArchivePageCorrectProps) {
  const [practices, setPractices] = useState<Practice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [filteredPractices, setFilteredPractices] = useState<Practice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProcedura, setSelectedProcedura] = useState('ALL')
  const [isWizardOpen, setIsWizardOpen] = useState(false)

  useEffect(() => {
    loadPractices()
    loadClients()
  }, [])

  useEffect(() => {
    filterPractices()
  }, [practices, searchTerm, selectedProcedura])

  const loadPractices = async () => {
    try {
      setIsLoading(true)
      
      const { data: practicesData, error } = await supabase
        .from('practices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Errore nel caricamento delle pratiche:', error)
        return
      }

      setPractices(practicesData || [])
    } catch (error) {
      console.error('Errore nel caricamento:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadClients = async () => {
    try {
      const { data: clientsData, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Errore nel caricamento dei clienti:', error)
        return
      }

      setClients(clientsData || [])
    } catch (error) {
      console.error('Errore nel caricamento dei clienti:', error)
    }
  }

  const filterPractices = () => {
    let filtered = practices

    // Filtro per ricerca
    if (searchTerm) {
      filtered = filtered.filter(practice => 
        practice.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        practice.autorita_giudiziaria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        practice.rg?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        practice.giudice?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (practice as any).note?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro per tipo procedura
    if (selectedProcedura && selectedProcedura !== 'ALL') {
      filtered = filtered.filter(practice => practice.tipo_procedura === selectedProcedura)
    }

    setFilteredPractices(filtered)
  }

  const getClientDisplayName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    return client ? (client.denominazione || `${client.nome} ${client.cognome}`) : 'Cliente Sconosciuto'
  }

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedProcedura('ALL')
  }

  const handleActivityCreated = () => {
    // Ricarica le pratiche dopo aver creato un'attività
    loadPractices()
  }

  const handlePracticeCreated = () => {
    // Ricarica le pratiche dopo aver creato una pratica
    loadPractices()
  }

  if (isLoading) {
    return (
      <MobileLayout
        header={<MobileHeader title="Pratiche" showBack onBack={() => onNavigate('dashboard')} />}
        currentView="practice-archive"
        onNavigate={onNavigate}
      >
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento pratiche...</p>
          </div>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout
      header={
        <MobileHeader 
          title="Pratiche" 
          showBack 
          onBack={() => onNavigate('dashboard')}
          rightAction={
            <MobileButton onClick={() => setIsWizardOpen(true)} className="px-2 py-1 text-xs h-8">
              <Plus className="h-3 w-3 mr-1" />
              Nuova
            </MobileButton>
          }
        />
      }
      currentView="practice-archive"
      onNavigate={onNavigate}
    >
      {/* Filtri Compatti */}
      <div className="mb-4">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cerca pratiche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
          <MobileButton onClick={resetFilters} variant="outline" size="sm" className="px-3">
            Reset
          </MobileButton>
        </div>

        {/* Filtro procedura */}
        <Select value={selectedProcedura} onValueChange={setSelectedProcedura}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Tipo procedura" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tutti</SelectItem>
            <SelectItem value="STRAGIUDIZIALE">Stragiudiziale</SelectItem>
            <SelectItem value="GIUDIZIALE">Giudiziale</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista Pratiche */}
      <div className="space-y-3">
        {filteredPractices.map((practice) => (
          <MobileCard
            key={practice.id}
            className="p-3"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 mb-1">
                  {practice.numero}
                </h3>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-3 w-3" />
                    <span className="truncate">{getClientDisplayName(practice.cliente_id)}</span>
                  </div>
                  
                  {practice.autorita_giudiziaria && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3" />
                      <span className="truncate">{practice.autorita_giudiziaria}</span>
                    </div>
                  )}
                  
                  {practice.rg && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span className="truncate">{practice.rg}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    practice.tipo_procedura === 'GIUDIZIALE' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {practice.tipo_procedura === 'GIUDIZIALE' ? 'Giudiziale' : 'Stragiudiziale'}
                  </span>
                </div>
              </div>
            </div>
          </MobileCard>
        ))}
      </div>

      {/* Nessuna pratica */}
      {filteredPractices.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || selectedProcedura ? 'Nessuna pratica trovata' : 'Nessuna pratica'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedProcedura 
              ? 'Prova a modificare i filtri di ricerca' 
              : 'Inizia aggiungendo la tua prima pratica'
            }
          </p>
          {!searchTerm && !selectedProcedura && (
            <MobileButton onClick={() => setIsWizardOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Pratica
            </MobileButton>
          )}
        </div>
      )}

      {/* Wizard per creare pratica/attività */}
      <NewActivityWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        clients={clients}
        onActivityCreated={handleActivityCreated}
        onPracticeCreated={handlePracticeCreated}
      />
    </MobileLayout>
  )
}
