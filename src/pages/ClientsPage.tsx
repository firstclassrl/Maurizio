import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { ClientForm } from '../components/clients/ClientForm'
import { Client } from '../types/client'
import { supabase } from '../lib/supabase'
import { useMessage } from '../hooks/useMessage'
import { useMobile } from '../hooks/useMobile'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Calendar
} from 'lucide-react'

interface ClientsPageProps {
  user: any
  onBackToDashboard: () => void
}

export function ClientsPage({ user, onBackToDashboard }: ClientsPageProps) {
  const { message, showError, showSuccess } = useMessage()
  const isMobile = useMobile()
  
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    filterClients()
  }, [clients, searchTerm])

  const loadClients = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error loading clients:', error)
      showError('Errore', 'Errore nel caricamento dei clienti')
    } finally {
      setIsLoading(false)
    }
  }

  const filterClients = () => {
    if (!searchTerm.trim()) {
      setFilteredClients(clients)
      return
    }

    const filtered = clients.filter(client =>
      client.ragione?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cognome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.tipologia.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredClients(filtered)
  }

  const handleSaveClient = async (clientData: Client) => {
    try {
      setIsLoading(true)
      
      if (clientData.id) {
        // Update existing client
        const { error } = await supabase
          .from('clients')
          .update({
            ...clientData,
            updated_at: new Date().toISOString()
          })
          .eq('id', clientData.id)
          .eq('user_id', user.id)

        if (error) throw error
        showSuccess('Successo', 'Cliente aggiornato con successo')
      } else {
        // Create new client
        const { error } = await supabase
          .from('clients')
          .insert({
            ...clientData,
            user_id: user.id
          })

        if (error) throw error
        showSuccess('Successo', 'Cliente creato con successo')
      }

      setIsFormOpen(false)
      setSelectedClient(null)
      loadClients()
    } catch (error) {
      console.error('Error saving client:', error)
      showError('Errore', 'Errore nel salvataggio del cliente')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClient = async () => {
    if (!clientToDelete) return

    try {
      setIsLoading(true)
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientToDelete.id)
        .eq('user_id', user.id)

      if (error) throw error
      showSuccess('Successo', 'Cliente eliminato con successo')
      loadClients()
    } catch (error) {
      console.error('Error deleting client:', error)
      showError('Errore', 'Errore nell\'eliminazione del cliente')
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
      setClientToDelete(null)
    }
  }

  const openEditForm = (client: Client) => {
    setSelectedClient(client)
    setIsFormOpen(true)
  }

  const openDeleteDialog = (client: Client) => {
    setClientToDelete(client)
    setIsDeleteDialogOpen(true)
  }

  const openNewForm = () => {
    setSelectedClient(null)
    setIsFormOpen(true)
  }

  const getClientIcon = (tipologia: string) => {
    if (tipologia === 'Persona fisica') {
      return <User className="w-5 h-5" />
    }
    return <Building2 className="w-5 h-5" />
  }

  const getClientDisplayName = (client: Client) => {
    if (client.tipologia === 'Persona fisica') {
      return `${client.titolo || ''} ${client.nome || ''} ${client.cognome || ''}`.trim() || client.ragione
    }
    return client.ragione
  }

  const getPrimaryContact = (client: Client) => {
    const emailContact = client.contatti?.find(c => c.type === 'Email')
    const phoneContact = client.contatti?.find(c => c.type === 'Telefono' || c.type === 'Cellulare')
    
    return { email: emailContact?.value, phone: phoneContact?.value }
  }

  const getPrimaryAddress = (client: Client) => {
    const mainAddress = client.indirizzi?.find(addr => 
      addr.fieldName?.toLowerCase().includes('indirizzo') || 
      addr.fieldName?.toLowerCase().includes('sede')
    )
    
    return mainAddress
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToDashboard}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Gestione Clienti</h1>
            </div>
            
            <Button
              onClick={openNewForm}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <Plus className="w-4 h-4" />
              Nuovo Cliente
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Stats */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cerca clienti per nome, ragione sociale o tipologia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm">
                {filteredClients.length} clienti
              </Badge>
            </div>
          </div>
        </div>

        {/* Clients Grid */}
        {isLoading && clients.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">Caricamento clienti...</div>
          </div>
        ) : filteredClients.length === 0 ? (
          <Card className="p-8 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nessun cliente trovato' : 'Nessun cliente presente'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Prova a modificare i termini di ricerca'
                : 'Inizia creando il tuo primo cliente'
              }
            </p>
            {!searchTerm && (
              <Button onClick={openNewForm} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Crea Primo Cliente
              </Button>
            )}
          </Card>
        ) : (
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {filteredClients.map((client) => {
              const displayName = getClientDisplayName(client)
              const primaryContact = getPrimaryContact(client)
              const primaryAddress = getPrimaryAddress(client)
              
              return (
                <Card key={client.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getClientIcon(client.tipologia)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                          {displayName}
                        </h3>
                        <Badge variant="outline" className="mt-1">
                          {client.tipologia}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditForm(client)}
                        className="p-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(client)}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {primaryContact.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{primaryContact.email}</span>
                      </div>
                    )}
                    
                    {primaryContact.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{primaryContact.phone}</span>
                      </div>
                    )}
                    
                    {primaryAddress && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">
                          {primaryAddress.street}, {primaryAddress.city}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Creato il {new Date(client.created_at || '').toLocaleDateString('it-IT')}
                      </span>
                    </div>
                    
                    {client.alternativa && (
                      <Badge variant="secondary" className="text-xs">
                        Alternativa
                      </Badge>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Forms and Dialogs */}
      <ClientForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        client={selectedClient}
        onSave={handleSaveClient}
        isLoading={isLoading}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Conferma Eliminazione"
        message={`Sei sicuro di voler eliminare il cliente "${clientToDelete ? getClientDisplayName(clientToDelete) : ''}"? Questa azione non può essere annullata.`}
        confirmText="Elimina"
        cancelText="Annulla"
        onConfirm={handleDeleteClient}
        type="danger"
      />

      {/* Message Display */}
      {message && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`p-4 rounded-lg shadow-lg ${
            message.type === 'error' 
              ? 'bg-red-100 text-red-800 border border-red-200' 
              : 'bg-green-100 text-green-800 border border-green-200'
          }`}>
            <div className="font-semibold">{message.title}</div>
            <div>{message.message}</div>
          </div>
        </div>
      )}
    </div>
  )
}
