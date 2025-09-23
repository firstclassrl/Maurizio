import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from './ui/button'
import { useMessage } from '../hooks/useMessage'

interface TestDataInserterProps {
  userId: string
}

export function TestDataInserter({ userId }: TestDataInserterProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { showSuccess, showError } = useMessage()

  const testActivities = [
    // Settembre 2025
    { pratica: "Ricorso TAR contro Comune di Roma", categoria: "SCADENZA ATTO PROCESSUALE", data: "2025-09-03", parte: "Rossi Mario", controparte: "Comune di Roma" },
    { pratica: "Udienza primo grado Tribunale Milano", categoria: "UDIENZA", data: "2025-09-05", parte: "Bianchi S.r.l.", controparte: "Verdi & Associati" },
    { pratica: "Memoria difensiva causa civile", categoria: "ATTIVITA' PROCESSUALE", data: "2025-09-08", parte: "Neri Giovanni", controparte: "Azienda XYZ" },
    { pratica: "Appuntamento cliente per consulenza", categoria: "APPUNTAMENTO IN STUDIO", data: "2025-09-10", parte: "Ferrari Anna", controparte: null },
    { pratica: "Termine per ricorso amministrativo", categoria: "SCADENZA ATTO PROCESSUALE", data: "2025-09-12", parte: "Lombardi Paolo", controparte: "Regione Lombardia" },
    { pratica: "Udienza Tribunale civile Napoli", categoria: "UDIENZA", data: "2025-09-15", parte: "Russo Maria", controparte: "Immobiliare ABC" },
    { pratica: "Preparazione documentazione perito", categoria: "ATTIVITA' PROCESSUALE", data: "2025-09-18", parte: "Conti Giuseppe", controparte: "Assicurazione DEF" },
    { pratica: "Consulenza legale via videochiamata", categoria: "APPUNTAMENTO IN STUDIO", data: "2025-09-20", parte: "Ricci Elena", controparte: null },
    { pratica: "Scadenza deposito memorie", categoria: "SCADENZA ATTO PROCESSUALE", data: "2025-09-22", parte: "Moretti Luca", controparte: "Banca GHI" },
    { pratica: "Udienza Corte d'Appello Torino", categoria: "UDIENZA", data: "2025-09-25", parte: "Santoro Francesca", controparte: "Sindacato JKL" },
    { pratica: "Analisi documenti contrattuali", categoria: "ATTIVITA' PROCESSUALE", data: "2025-09-28", parte: "De Luca Marco", controparte: "Costruzioni MNO" },
    { pratica: "Incontro con cliente per strategia", categoria: "APPUNTAMENTO IN STUDIO", data: "2025-09-30", parte: "Orlando Silvia", controparte: null },

    // Ottobre 2025
    { pratica: "Ricorso urgente TAR Lazio", categoria: "SCADENZA ATTO PROCESSUALE", data: "2025-10-02", parte: "Palmieri Roberto", controparte: "Regione Lazio" },
    { pratica: "Udienza Tribunale penale Roma", categoria: "UDIENZA", data: "2025-10-05", parte: "Greco Alessandra", controparte: "Procura della Repubblica" },
    { pratica: "Preparazione istanza di mediazione", categoria: "ATTIVITA' PROCESSUALE", data: "2025-10-08", parte: "Villa Antonio", controparte: "Impresa PQR" },
    { pratica: "Colloquio con cliente per nuovo caso", categoria: "APPUNTAMENTO IN STUDIO", data: "2025-10-10", parte: "Marchetti Giulia", controparte: null },
    { pratica: "Scadenza per opposizione decreto", categoria: "SCADENZA ATTO PROCESSUALE", data: "2025-10-12", parte: "Barbieri Francesco", controparte: "Agenzia Entrate" },
    { pratica: "Udienza civile Tribunale Firenze", categoria: "UDIENZA", data: "2025-10-15", parte: "Fabbri Chiara", controparte: "Immobiliare STU" },
    { pratica: "Redazione contratto di locazione", categoria: "ATTIVITA' PROCESSUALE", data: "2025-10-18", parte: "Galli Matteo", controparte: "Proprietà VWX" },
    { pratica: "Consulenza per ristrutturazione aziendale", categoria: "APPUNTAMENTO IN STUDIO", data: "2025-10-20", parte: "Martini Sara", controparte: null },
    { pratica: "Termine per ricorso tributario", categoria: "SCADENZA ATTO PROCESSUALE", data: "2025-10-22", parte: "Leone Davide", controparte: "Guardia di Finanza" },
    { pratica: "Udienza Corte di Cassazione", categoria: "UDIENZA", data: "2025-10-25", parte: "Serra Valentina", controparte: "Ministero YZA" },
    { pratica: "Analisi clausole contrattuali", categoria: "ATTIVITA' PROCESSUALE", data: "2025-10-28", parte: "Bruno Stefano", controparte: "Società BCD" },
    { pratica: "Meeting strategico con team legale", categoria: "APPUNTAMENTO IN STUDIO", data: "2025-10-30", parte: "Rizzo Monica", controparte: null },

    // Attività aggiuntive per riempire fino a 40
    { pratica: "Ricorso TAR per licenza edilizia", categoria: "SCADENZA ATTO PROCESSUALE", data: "2025-09-06", parte: "Costa Pietro", controparte: "Comune di Milano" },
    { pratica: "Udienza Tribunale famiglia", categoria: "UDIENZA", data: "2025-09-11", parte: "Mancini Laura", controparte: "Ex coniuge" },
    { pratica: "Redazione atto di compravendita", categoria: "ATTIVITA' PROCESSUALE", data: "2025-09-16", parte: "Romano Andrea", controparte: "Venditore immobile" },
    { pratica: "Consulenza per successione", categoria: "APPUNTAMENTO IN STUDIO", data: "2025-09-21", parte: "Colombo Beatrice", controparte: null },
    { pratica: "Scadenza per ricorso previdenziale", categoria: "SCADENZA ATTO PROCESSUALE", data: "2025-09-26", parte: "Ferretti Gianni", controparte: "INPS" },
    { pratica: "Udienza per risarcimento danni", categoria: "UDIENZA", data: "2025-10-03", parte: "Pellegrini Carmen", controparte: "Assicurazione auto" },
    { pratica: "Preparazione perizia tecnica", categoria: "ATTIVITA' PROCESSUALE", data: "2025-10-07", parte: "Vitali Giorgio", controparte: "Perito nominato" },
    { pratica: "Colloquio per accordo transattivo", categoria: "APPUNTAMENTO IN STUDIO", data: "2025-10-13", parte: "Esposito Federica", controparte: null },
    { pratica: "Termine per opposizione cartelle", categoria: "SCADENZA ATTO PROCESSUALE", data: "2025-10-17", parte: "Mariani Claudio", controparte: "Agenzia Entrate" },
    { pratica: "Udienza per separazione consensuale", categoria: "UDIENZA", data: "2025-10-23", parte: "Gentile Roberta", controparte: "Coniuge" },
    { pratica: "Redazione testamento olografo", categoria: "ATTIVITA' PROCESSUALE", data: "2025-10-27", parte: "Rossi Ernesto", controparte: "Beneficiari" },
    { pratica: "Consulenza per startup innovativa", categoria: "APPUNTAMENTO IN STUDIO", data: "2025-10-31", parte: "Lombardi Giulia", controparte: null },
    { pratica: "Ricorso per licenza commerciale", categoria: "SCADENZA ATTO PROCESSUALE", data: "2025-09-07", parte: "Benedetti Simone", controparte: "Comune di Bologna" },
    { pratica: "Udienza per diritto di visita", categoria: "UDIENZA", data: "2025-09-14", parte: "Verdi Paola", controparte: "Ex coniuge" },
    { pratica: "Analisi rischio contrattuale", categoria: "ATTIVITA' PROCESSUALE", data: "2025-09-19", parte: "Neri Alessandro", controparte: "Cliente aziendale" },
    { pratica: "Incontro per revisione contratti", categoria: "APPUNTAMENTO IN STUDIO", data: "2025-09-24", parte: "Bianchi Elena", controparte: null },
    { pratica: "Scadenza per ricorso amministrativo", categoria: "SCADENZA ATTO PROCESSUALE", data: "2025-09-29", parte: "Russo Massimo", controparte: "Provincia di Roma" },
    { pratica: "Udienza per risoluzione contratto", categoria: "UDIENZA", data: "2025-10-04", parte: "Conti Isabella", controparte: "Fornitore" },
    { pratica: "Preparazione memoria difensiva", categoria: "ATTIVITA' PROCESSUALE", data: "2025-10-09", parte: "Ricci Tommaso", controparte: "Attore in causa" },
    { pratica: "Consulenza per privacy GDPR", categoria: "APPUNTAMENTO IN STUDIO", data: "2025-10-14", parte: "Moretti Chiara", controparte: null }
  ]

  const insertTestData = async () => {
    setIsLoading(true)
    try {
      // Prima cancella tutte le attività esistenti dell'utente
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('user_id', userId)

      if (deleteError) throw deleteError

      // Inserisci le nuove attività di test
      const activitiesToInsert = testActivities.map(activity => ({
        user_id: userId,
        pratica: activity.pratica,
        attivita: activity.categoria,
        scadenza: activity.data,
        stato: 'todo',
        priorita: Math.random() > 0.8 ? 10 : 5, // 20% urgenti
        parte: activity.parte,
        controparte: activity.controparte,
        note: null
      }))

      const { error: insertError } = await supabase
        .from('tasks')
        .insert(activitiesToInsert)

      if (insertError) throw insertError

      showSuccess('Dati di test inseriti', `Inserite ${testActivities.length} attività di test per settembre e ottobre 2025`)
    } catch (error) {
      console.error('Error inserting test data:', error)
      showError('Errore', 'Errore durante l\'inserimento dei dati di test')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-sm font-semibold text-yellow-800 mb-2">Dati di Test</h3>
      <p className="text-xs text-yellow-700 mb-3">
        Inserisce 40 attività di test per settembre e ottobre 2025 (sostituisce tutte le attività esistenti)
      </p>
      <Button 
        onClick={insertTestData}
        disabled={isLoading}
        className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm"
        size="sm"
      >
        {isLoading ? 'Inserimento...' : 'Inserisci Dati di Test'}
      </Button>
    </div>
  )
}
