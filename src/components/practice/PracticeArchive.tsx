import { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Badge } from '../ui/badge'
import { Calendar, User, Users, FileText, ChevronRight, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Practice, Activity } from '../../types/practice'
import { useToast } from '../ui/Toast'
import { formatTimeWithoutSeconds } from '../../lib/time-utils'

interface PracticeArchiveProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PracticeArchive({ open, onOpenChange }: PracticeArchiveProps) {
  const { showSuccess, showError } = useToast()
  const [practices, setPractices] = useState<Practice[]>([])
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null)
  const [practiceActivities, setPracticeActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [activitiesLoading, setActivitiesLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Carica tutte le pratiche
  const loadPractices = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('practices')
        .select(`
          *,
          clients!practices_cliente_id_fkey(*),
          counterparties(*)
        `)
        .order('numero', { ascending: false })

      if (error) throw error
      setPractices(data || [])
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  // Elimina pratica e tutte le attività collegate
  const handleDeletePractice = async (practice: Practice) => {
    if (!practice?.id) return
    const confirmed = window.confirm(`Eliminare definitivamente la pratica ${practice.numero}? Verranno eliminate anche tutte le attività associate.`)
    if (!confirmed) return

    setDeletingId(practice.id)
    try {
      // 1) Elimina attività collegate
      const { error: actErr } = await supabase
        .from('activities')
        .delete()
        .eq('pratica_id', practice.id)

      if (actErr) throw actErr

      // 2) Elimina pratica
      const { error: pracErr } = await supabase
        .from('practices')
        .delete()
        .eq('id', practice.id)

      if (pracErr) throw pracErr

      // 3) Aggiorna UI
      setPractices(prev => prev.filter(p => p.id !== practice.id))
      if (selectedPractice?.id === practice.id) {
        handleCloseActivities()
      }
      showSuccess('Pratica eliminata', `Pratica ${practice.numero} eliminata`)
    } catch (error) {
      showError('Errore', `Errore durante l'eliminazione: ${error instanceof Error ? error.message : 'Sconosciuto'}`)
    } finally {
      setDeletingId(null)
    }
  }

  // Carica le attività di una pratica specifica
  const loadPracticeActivities = async (practiceId: string) => {
    setActivitiesLoading(true)
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('pratica_id', practiceId)
        .order('data', { ascending: true })

      if (error) throw error
      setPracticeActivities(data || [])
    } catch (error) {
    } finally {
      setActivitiesLoading(false)
    }
  }

  // Gestisce la selezione di una pratica
  const handlePracticeSelect = (practice: Practice) => {
    setSelectedPractice(practice)
    if (practice.id) {
      loadPracticeActivities(practice.id)
    }
  }

  // Chiude il modal delle attività
  const handleCloseActivities = () => {
    setSelectedPractice(null)
    setPracticeActivities([])
  }

  // Formatta la data
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('it-IT')
  }

  // Ottiene il colore della categoria
  const getCategoryColor = (categoria: string) => {
    const colors: { [key: string]: string } = {
      'Appuntamento': 'bg-gray-100 text-gray-800 border-gray-200',
      'Scadenza': 'bg-orange-100 text-orange-800 border-orange-200',
      'Attività da Svolgere': 'bg-blue-100 text-blue-800 border-blue-200',
      'Udienza': 'bg-green-100 text-green-800 border-green-200',
      'Scadenza Processuale': 'bg-red-100 text-red-800 border-red-200',
      'Attività Processuale': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
    return colors[categoria] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  useEffect(() => {
    if (open) {
      loadPractices()
    }
  }, [open])

  return (
    <>
      {/* Modal principale - Lista pratiche */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pratiche
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">Caricamento pratiche...</div>
            </div>
          ) : practices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nessuna pratica trovata</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {practices.map((practice) => (
                <Card key={practice.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Pratica {practice.numero}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {practice.tipo_procedura}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span><strong>Cliente:</strong> {practice.clients?.nome || 'N/A'}</span>
                          </div>
                          
                          {practice.counterparties && practice.counterparties.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span><strong>Controparti:</strong> {practice.counterparties.map(c => c.nome).join(', ')}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span><strong>Creata:</strong> {formatDate(practice.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          onClick={() => handlePracticeSelect(practice)}
                          variant="outline"
                          size="sm"
                        >
                          <ChevronRight className="h-4 w-4 mr-1" />
                          Visualizza Attività
                        </Button>
                        <Button
                          onClick={() => handleDeletePractice(practice)}
                          variant="destructive"
                          size="sm"
                          disabled={deletingId === practice.id}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {deletingId === practice.id ? 'Eliminazione…' : 'Elimina'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal secondario - Attività della pratica */}
      <Dialog open={!!selectedPractice} onOpenChange={handleCloseActivities}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Attività - Pratica {selectedPractice?.numero}
            </DialogTitle>
          </DialogHeader>

          {activitiesLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">Caricamento attività...</div>
            </div>
          ) : practiceActivities.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nessuna attività trovata per questa pratica</p>
            </div>
          ) : (
            <div className="space-y-3">
              {practiceActivities.map((activity) => (
                <Card key={activity.id} className={`border-2 ${getCategoryColor(activity.categoria)}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 w-full">
                      {/* Semaforo */}
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        activity.stato === 'done' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      
                      {/* Data */}
                      <span className="font-medium text-gray-600 text-[10px] leading-tight flex-shrink-0">
                        {formatDate(activity.data)}
                      </span>
                      
                      {/* Ora */}
                      {activity.ora && (
                        <span className="font-medium text-gray-600 text-[10px] leading-tight flex-shrink-0">
                          {formatTimeWithoutSeconds(activity.ora)}
                        </span>
                      )}
                      
                      {/* Categoria */}
                      <span className="font-semibold text-gray-900 text-[10px] leading-tight flex-shrink-0">
                        {activity.categoria}
                      </span>
                      
                      {/* Attività */}
                      <span className="text-gray-600 text-[10px] leading-tight flex-1 min-w-0">
                        - {activity.attivita}
                      </span>
                      
                      {/* Flag URGENTE */}
                      {activity.urgent && (
                        <span className="text-red-600 font-semibold text-[10px] leading-tight flex-shrink-0">
                          URGENTE
                        </span>
                      )}
                    </div>
                    
                    {/* Note se presenti */}
                    {activity.note && (
                      <div className="mt-2 text-xs text-gray-500 italic">
                        Note: {activity.note}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
