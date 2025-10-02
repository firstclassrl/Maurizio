import React, { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { MobileLayout } from '../../components/mobile/MobileLayout'
import { MobileHeader } from '../../components/mobile/MobileHeader'
import { MobileCard } from '../../components/mobile/MobileCard'
import { MobileButton } from '../../components/mobile/MobileButton'
import { MobileClientDialog } from '../../components/mobile/MobileClientDialog'
import { AppView } from '../../App'
import { Plus, User as UserIcon, Building2, Phone, Mail, FileText } from 'lucide-react'
import { Input } from '../../components/ui/input'
import { Client } from '../../types/client'
import { MOCK_CLIENTS } from '../../lib/mock-demo'

interface MobileClientsPageProps {
  user: User
  onNavigate: (view: AppView) => void
}

export function MobileClientsPage({ user, onNavigate }: MobileClientsPageProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | undefined>()
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTipologia, setSelectedTipologia] = useState('')

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    filterClients()
  }, [clients, searchTerm, selectedTipologia])

  const loadClients = async () => {
    try {
      setIsLoading(true)
      
      const { data: clientsData, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Errore nel caricamento dei clienti:', error)
        return
      }

      const list = clientsData || []
      if (list.length === 0) {
        setClients(MOCK_CLIENTS as any)
      } else {
        // Allinea ai campi del desktop: parsifica JSON potenzialmente serializzati
        const parsed = list.map((client: any) => {
          let indirizzi = []
          let contatti = []
          try {
            indirizzi = Array.isArray(client.indirizzi) ? client.indirizzi : (typeof client.indirizzi === 'string' ? JSON.parse(client.indirizzi) : [])
          } catch (e) {
            indirizzi = []
          }
          try {
            contatti = Array.isArray(client.contatti) ? client.contatti : (typeof client.contatti === 'string' ? JSON.parse(client.contatti) : [])
          } catch (e) {
            contatti = []
          }
          return { ...client, indirizzi, contatti }
        })
        setClients(parsed as any)
      }
    } catch (error) {
      console.error('Errore nel caricamento:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterClients = () => {
    let filtered = clients

    // Filtro per ricerca
    if (searchTerm) {
      filtered = filtered.filter(client => 
        (client as any).ragione?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.cognome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client as any).codice_fiscale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro per tipologia
    if (selectedTipologia) {
      filtered = filtered.filter(client => client.tipologia === selectedTipologia)
    }

    setFilteredClients(filtered)
  }

  const handleClientClick = (client: Client) => {
    setSelectedClient(client)
    setIsClientDialogOpen(true)
  }

  const handleNewClient = () => {
    setSelectedClient(undefined)
    setIsClientDialogOpen(true)
  }

  const handleSaveClient = async (clientData: any) => {
    try {
      if (selectedClient?.id) {
        // Aggiorna cliente esistente
        const { error } = await supabase
          .from('clients')
          .update({
            ...clientData,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedClient.id)

        if (error) throw error
      } else {
        // Crea nuovo cliente
        const { error } = await supabase
          .from('clients')
          .insert([{
            ...clientData,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])

        if (error) throw error
      }

      // Ricarica i clienti
      await loadClients()
    } catch (error) {
      console.error('Errore nel salvataggio:', error)
      throw error
    }
  }

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedTipologia('')
  }

  const getClientDisplayName = (client: Client) => {
    const companyName = (client as any).ragione
    if (companyName) return companyName
    if (client.nome && client.cognome) {
      return `${client.nome} ${client.cognome}`
    }
    return 'Cliente senza nome'
  }

  const tipologie = ['Persona fisica', 'Ditta Individuale', 'Persona Giuridica', 'Altro ente']

  if (isLoading) {
    return (
      <MobileLayout
        header={
          <MobileHeader 
            title="Gestione Parti" 
            showBack 
            onBack={() => onNavigate('dashboard')}
            rightAction={
              <MobileButton onClick={handleNewClient} className="px-2 py-1 text-xs h-8">
                <Plus className="h-3 w-3 mr-1" />
                Nuova
              </MobileButton>
            }
          />
        }
        currentView="clients"
        onNavigate={onNavigate}
      >
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento parti...</p>
          </div>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout
      header={
        <MobileHeader 
          title="Gestione Parti" 
          showBack 
          onBack={() => onNavigate('dashboard')}
          rightAction={
            <MobileButton onClick={handleNewClient} className="px-2 py-1 text-xs h-8">
              <Plus className="h-3 w-3 mr-1" />
              Nuova
            </MobileButton>
          }
        />
      }
      currentView="clients"
      onNavigate={onNavigate}
    >
      {/* Filtri e Ricerca */}
      <div className="mb-6">
        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <Input
              placeholder="Cerca parti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mobile-input"
            />
          </div>
          <MobileButton onClick={resetFilters} variant="outline" className="px-3">
            Reset
          </MobileButton>
        </div>

        {/* Filtro tipologia */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <MobileButton
            variant={selectedTipologia === '' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedTipologia('')}
            className="whitespace-nowrap"
          >
            Tutti
          </MobileButton>
          {tipologie.map((tipologia) => (
            <MobileButton
              key={tipologia}
              variant={selectedTipologia === tipologia ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedTipologia(tipologia)}
              className="whitespace-nowrap"
            >
              {tipologia}
            </MobileButton>
          ))}
        </div>
      </div>

      {/* Lista Parti */}
      <div className="space-y-3">
        {filteredClients.map((client) => (
          <MobileCard
            key={client.id}
            onClick={() => handleClientClick(client)}
            className="p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {client.tipologia === 'Persona fisica' || client.tipologia === 'Ditta Individuale' ? (
                  <UserIcon className="h-8 w-8 text-blue-600" />
                ) : (
                  <Building2 className="h-8 w-8 text-blue-600" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 mb-1">
                  {getClientDisplayName(client)}
                </h3>
                
                <p className="text-sm text-blue-600 mb-2">
                  {client.tipologia}
                </p>
                
                <div className="space-y-1">
                  {client.codice_fiscale && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-3 w-3" />
                      <span>{client.codice_fiscale}</span>
                    </div>
                  )}
                  
                  {client.telefono && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-3 w-3" />
                      <span>{client.telefono}</span>
                    </div>
                  )}
                  
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  
                  {client.citta && (
                    <div className="text-sm text-gray-500">
                      {client.citta}, {client.provincia}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </MobileCard>
        ))}
      </div>

      {/* Nessuna parte */}
      {filteredClients.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <UserIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || selectedTipologia ? 'Nessuna parte trovata' : 'Nessuna parte presente'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedTipologia 
              ? 'Prova a modificare i filtri di ricerca' 
              : 'Inizia aggiungendo la tua prima parte'
            }
          </p>
          {!searchTerm && !selectedTipologia && (
            <MobileButton onClick={handleNewClient}>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Parte
            </MobileButton>
          )}
        </div>
      )}

      {/* Dialog per modifica cliente */}
      <MobileClientDialog
        open={isClientDialogOpen}
        onOpenChange={setIsClientDialogOpen}
        client={selectedClient}
        onSave={handleSaveClient}
      />
    </MobileLayout>
  )
}
