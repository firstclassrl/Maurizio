import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { Calendar, ExternalLink, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useMessage } from '../../hooks/useMessage'

interface SyncStatus {
  google_connected: boolean
  active_watch_channels: number
  pending_events: number
  last_sync: string | null
}

interface GoogleCalendarSyncProps {
  user: any
  onSyncStatusChange?: (status: SyncStatus) => void
}

export function GoogleCalendarSync({ user, onSyncStatusChange }: GoogleCalendarSyncProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const { showError, showSuccess } = useMessage()

  useEffect(() => {
    loadSyncStatus()
  }, [user])

  const loadSyncStatus = async () => {
    try {
      // Prima controlliamo se la funzione esiste
      const { data, error } = await supabase
        .rpc('get_user_sync_status', { user_uuid: user.id })
        .single()

      if (error) {
        console.warn('Google Calendar sync not available:', error.message)
        // Se la funzione non esiste, imposta stato di default
        const defaultStatus: SyncStatus = {
          google_connected: false,
          active_watch_channels: 0,
          pending_events: 0,
          last_sync: null
        }
        setSyncStatus(defaultStatus)
        onSyncStatusChange?.(defaultStatus)
        return
      }

      setSyncStatus(data as SyncStatus)
      onSyncStatusChange?.(data as SyncStatus)
    } catch (error) {
      console.warn('Google Calendar sync not configured:', error)
      // In caso di errore, mostra stato disconnesso
      const defaultStatus: SyncStatus = {
        google_connected: false,
        active_watch_channels: 0,
        pending_events: 0,
        last_sync: null
      }
      setSyncStatus(defaultStatus)
      onSyncStatusChange?.(defaultStatus)
    }
  }

  const handleConnectGoogle = async () => {
    try {
      setIsConnecting(true)

      // Get OAuth URL from backend
      const { data, error } = await supabase.functions.invoke('google-oauth-url', {
        body: { user_id: user.id }
      })

      if (error) {
        console.warn('Google OAuth not configured:', error.message)
        showError('Funzionalità non disponibile', 'La sincronizzazione con Google Calendar non è ancora configurata. Contatta l\'amministratore per abilitarla.')
        return
      }

      // Redirect to Google OAuth
      window.location.href = data.auth_url
    } catch (error) {
      console.error('Error connecting to Google:', error)
      showError('Errore', 'Impossibile connettersi a Google Calendar. La funzionalità potrebbe non essere configurata.')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnectGoogle = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          google_access_token: null,
          google_refresh_token: null,
          google_token_expiry: null,
          google_calendar_connected: false
        })
        .eq('id', user.id)

      if (error) throw error

      // Stop all watch channels
      const { error: channelsError } = await supabase
        .from('watch_channels')
        .delete()
        .eq('user_id', user.id)

      if (channelsError) throw channelsError

      showSuccess('Successo', 'Google Calendar disconnesso')
      loadSyncStatus()
    } catch (error) {
      console.error('Error disconnecting Google:', error)
      showError('Errore', 'Impossibile disconnettere Google Calendar')
    }
  }

  const handleManualSync = async () => {
    try {
      setIsSyncing(true)

      const { error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { 
          user_id: user.id,
          sync_type: 'manual'
        }
      })

      if (error) {
        console.warn('Manual sync not available:', error.message)
        showError('Funzionalità non disponibile', 'La sincronizzazione manuale non è ancora configurata.')
        return
      }

      showSuccess('Successo', 'Sincronizzazione completata')
      loadSyncStatus()
    } catch (error) {
      console.error('Error syncing:', error)
      showError('Errore', 'Errore durante la sincronizzazione. La funzionalità potrebbe non essere configurata.')
    } finally {
      setIsSyncing(false)
    }
  }

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'Mai'
    
    const date = new Date(lastSync)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Appena ora'
    if (diffMins < 60) return `${diffMins} minuti fa`
    if (diffHours < 24) return `${diffHours} ore fa`
    return `${diffDays} giorni fa`
  }

  // Se l'utente ha scelto di nascondere il componente
  if (isHidden) {
    return (
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-gray-500 mb-3">
            Integrazione Google Calendar nascosta
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsHidden(false)}
          >
            Mostra integrazione
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!syncStatus) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2">Caricamento stato sincronizzazione...</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsHidden(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              Nascondi
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Sincronizzazione Google Calendar
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsHidden(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            Nascondi
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {syncStatus.google_connected ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Connesso a Google Calendar</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Attivo
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDisconnectGoogle}
              >
                Disconnetti
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Canali attivi:</span>
                <span className="ml-2 font-medium">{syncStatus.active_watch_channels}</span>
              </div>
              <div>
                <span className="text-gray-600">Eventi in sospeso:</span>
                <span className="ml-2 font-medium">{syncStatus.pending_events}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Ultima sincronizzazione: {formatLastSync(syncStatus.last_sync)}</span>
            </div>

            {syncStatus.pending_events > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Ci sono {syncStatus.pending_events} eventi in attesa di sincronizzazione.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleManualSync}
                disabled={isSyncing}
                size="sm"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sincronizzazione...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sincronizza ora
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                size="sm"
                onClick={() => window.open('https://calendar.google.com', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Apri Google Calendar
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <AlertCircle className="h-5 w-5" />
                <span>Google Calendar non connesso</span>
              </div>
              
              <p className="text-sm text-gray-500">
                Connetti il tuo account Google per sincronizzare automaticamente 
                gli eventi tra LexAgenda e Google Calendar.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Nota:</strong> La sincronizzazione con Google Calendar è una funzionalità opzionale. 
                  Puoi continuare a usare LexAgenda normalmente senza questa integrazione.
                </p>
              </div>

              <Button 
                onClick={handleConnectGoogle}
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Connessione...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Connetti Google Calendar
                  </>
                )}
              </Button>

              <div className="text-xs text-gray-400">
                La sincronizzazione è bidirezionale e sicura
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
