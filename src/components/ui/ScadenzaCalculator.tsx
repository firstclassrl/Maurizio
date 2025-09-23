import React, { useState, useEffect } from 'react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Input } from './input'
import { Label } from './label'
import { Select } from './select'
import { Calendar, Calculator, AlertTriangle } from 'lucide-react'

interface ScadenzaCalculatorProps {
  onScadenzaCalculated?: (dataScadenza: Date, giorniTermine: number) => void
  initialDataInizio?: Date
  initialTipoScadenza?: string
}

interface TipoScadenza {
  id: string
  nome: string
  giorniTermine: number
  descrizione: string
  categoria: string
}

const TIPI_SCADENZA: TipoScadenza[] = [
  // Termini Processuali Civili
  {
    id: 'termini_processuali_civili',
    nome: 'Termini Processuali Civili',
    giorniTermine: 90,
    descrizione: 'Termini generali per atti processuali civili',
    categoria: 'Processuale'
  },
  {
    id: 'memorie_repliche',
    nome: 'Memorie e Repliche (artt. 171-ter, 189 cpc)',
    giorniTermine: 30,
    descrizione: 'Termini per deposito memorie integrative e repliche',
    categoria: 'Processuale'
  },
  {
    id: 'separazione_divorzio',
    nome: 'Separazione e Divorzio',
    giorniTermine: 60,
    descrizione: 'Termini specifici per procedimenti di famiglia',
    categoria: 'Famiglia'
  },
  {
    id: 'procedimento_semplificato',
    nome: 'Procedimento Semplificato (art. 281-duodecies)',
    giorniTermine: 45,
    descrizione: 'Termini per procedimento semplificato',
    categoria: 'Processuale'
  },
  {
    id: 'termini_183_190',
    nome: 'Termini 183 + 190 cpc',
    giorniTermine: 20,
    descrizione: 'Termini per memorie e comparse',
    categoria: 'Processuale'
  },
  
  // Esecuzioni
  {
    id: 'esecuzioni_mobiliari',
    nome: 'Esecuzioni Mobiliari',
    giorniTermine: 30,
    descrizione: 'Termini per esecuzioni su beni mobili',
    categoria: 'Esecuzione'
  },
  {
    id: 'esecuzioni_immobiliari',
    nome: 'Esecuzioni Immobiliari',
    giorniTermine: 60,
    descrizione: 'Termini per esecuzioni su beni immobili',
    categoria: 'Esecuzione'
  },
  {
    id: 'esecuzioni_terzi',
    nome: 'Esecuzioni Presso Terzi',
    giorniTermine: 15,
    descrizione: 'Termini per esecuzioni presso terzi',
    categoria: 'Esecuzione'
  },
  
  // Impugnazioni
  {
    id: 'impugnazioni_civili',
    nome: 'Impugnazioni Civili',
    giorniTermine: 30,
    descrizione: 'Termini per impugnazioni in sede civile',
    categoria: 'Impugnazione'
  },
  {
    id: 'impugnazioni_amministrative',
    nome: 'Impugnazioni Amministrative',
    giorniTermine: 60,
    descrizione: 'Termini per impugnazioni in sede amministrativa',
    categoria: 'Impugnazione'
  },
  {
    id: 'impugnazioni_tributarie',
    nome: 'Impugnazioni Tributarie',
    giorniTermine: 60,
    descrizione: 'Termini per impugnazioni in sede tributaria',
    categoria: 'Impugnazione'
  },
  
  // Depositi e CTU
  {
    id: 'deposito_atti_appello',
    nome: 'Deposito Atti Appello (art. 352 cpc)',
    giorniTermine: 30,
    descrizione: 'Termini per deposito atti nel processo di appello',
    categoria: 'Deposito'
  },
  {
    id: 'deposito_ctu',
    nome: 'Deposito CTU',
    giorniTermine: 45,
    descrizione: 'Termini per deposito consulenza tecnica d\'ufficio',
    categoria: 'Deposito'
  },
  
  // Scadenze Varie
  {
    id: 'scadenze_multe',
    nome: 'Scadenze Multe',
    giorniTermine: 30,
    descrizione: 'Termini per presentare ricorso contro multe',
    categoria: 'Varie'
  },
  {
    id: 'termini_generici',
    nome: 'Termini Generici',
    giorniTermine: 30,
    descrizione: 'Termini generici personalizzabili',
    categoria: 'Generico'
  }
]

export const ScadenzaCalculator: React.FC<ScadenzaCalculatorProps> = ({
  onScadenzaCalculated,
  initialDataInizio,
  initialTipoScadenza
}) => {
  const [dataInizio, setDataInizio] = useState<string>(
    initialDataInizio ? initialDataInizio.toISOString().split('T')[0] : ''
  )
  const [tipoScadenza, setTipoScadenza] = useState<string>(
    initialTipoScadenza || 'termini_processuali_civili'
  )
  const [giorniTermine, setGiorniTermine] = useState<number>(90)
  const [giorniTermineCustom, setGiorniTermineCustom] = useState<number>(30)
  const [dataScadenza, setDataScadenza] = useState<Date | null>(null)
  const [giorniRimanenti, setGiorniRimanenti] = useState<number>(0)
  const [isUrgente, setIsUrgente] = useState<boolean>(false)

  // Funzione per aggiungere giorni lavorativi (esclude weekend) - per uso futuro
  // const addWorkingDays = (date: Date, days: number): Date => {
  //   const result = new Date(date)
  //   let addedDays = 0
  //   
  //   while (addedDays < days) {
  //     result.setDate(result.getDate() + 1)
  //     // Controlla se è un giorno lavorativo (lunedì-venerdì)
  //     if (result.getDay() >= 1 && result.getDay() <= 5) {
  //       addedDays++
  //     }
  //   }
  //   
  //   return result
  // }

  // Funzione per calcolare la scadenza
  const calculateScadenza = () => {
    if (!dataInizio) return

    const dataInizioDate = new Date(dataInizio)
    const giorni = tipoScadenza === 'termini_generici' ? giorniTermineCustom : giorniTermine
    
    // Calcola la scadenza (per ora usiamo giorni calendario, in futuro aggiungeremo giorni lavorativi)
    const scadenza = new Date(dataInizioDate)
    scadenza.setDate(scadenza.getDate() + giorni)
    
    setDataScadenza(scadenza)
    
    // Calcola giorni rimanenti
    const oggi = new Date()
    const diffTime = scadenza.getTime() - oggi.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    setGiorniRimanenti(diffDays)
    
    // Controlla se è urgente (meno di 7 giorni)
    setIsUrgente(diffDays <= 7 && diffDays >= 0)
    
    // Callback per il componente padre
    if (onScadenzaCalculated) {
      onScadenzaCalculated(scadenza, giorni)
    }
  }

  // Aggiorna i giorni termine quando cambia il tipo di scadenza
  useEffect(() => {
    const tipo = TIPI_SCADENZA.find(t => t.id === tipoScadenza)
    if (tipo) {
      setGiorniTermine(tipo.giorniTermine)
    }
  }, [tipoScadenza])

  // Calcola automaticamente quando cambiano i parametri
  useEffect(() => {
    if (dataInizio) {
      calculateScadenza()
    }
  }, [dataInizio, tipoScadenza, giorniTermineCustom])

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'Processuale': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Famiglia': return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'Esecuzione': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Impugnazione': return 'bg-red-100 text-red-800 border-red-200'
      case 'Deposito': return 'bg-green-100 text-green-800 border-green-200'
      case 'Varie': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'Generico': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calcolatore Scadenze Legali
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Data di Inizio */}
        <div className="space-y-2">
          <Label htmlFor="data-inizio">Data di Inizio</Label>
          <Input
            id="data-inizio"
            type="date"
            value={dataInizio}
            onChange={(e) => setDataInizio(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Tipo di Scadenza */}
        <div className="space-y-2">
          <Label htmlFor="tipo-scadenza">Tipo di Scadenza</Label>
          <Select value={tipoScadenza} onValueChange={setTipoScadenza}>
            {TIPI_SCADENZA.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nome} ({tipo.giorniTermine} giorni)
              </option>
            ))}
          </Select>
        </div>

        {/* Giorni Termine Personalizzati (solo per termini generici) */}
        {tipoScadenza === 'termini_generici' && (
          <div className="space-y-2">
            <Label htmlFor="giorni-termine">Giorni Termine</Label>
            <Input
              id="giorni-termine"
              type="number"
              min="1"
              max="365"
              value={giorniTermineCustom}
              onChange={(e) => setGiorniTermineCustom(parseInt(e.target.value) || 30)}
              className="w-full"
            />
          </div>
        )}

        {/* Risultato del Calcolo */}
        {dataScadenza && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Risultato del Calcolo:</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Data di Scadenza:</Label>
                <div className="text-lg font-bold text-gray-900">
                  {dataScadenza.toLocaleDateString('it-IT')}
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-gray-600">Giorni Rimanenti:</Label>
                <div className={`text-lg font-bold ${isUrgente ? 'text-red-600' : 'text-gray-900'}`}>
                  {giorniRimanenti} giorni
                </div>
              </div>
            </div>

            {/* Avviso Urgente */}
            {isUrgente && (
              <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800 font-medium">
                  ATTENZIONE: Scadenza urgente! Meno di 7 giorni rimanenti.
                </span>
              </div>
            )}

            {/* Informazioni Tipo Scadenza */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Informazioni:</Label>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full border ${getCategoriaColor(
                  TIPI_SCADENZA.find(t => t.id === tipoScadenza)?.categoria || 'Generico'
                )}`}>
                  {TIPI_SCADENZA.find(t => t.id === tipoScadenza)?.categoria}
                </span>
                <span className="text-sm text-gray-700">
                  {TIPI_SCADENZA.find(t => t.id === tipoScadenza)?.descrizione}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Pulsante Calcola (per calcoli manuali) */}
        <Button 
          onClick={calculateScadenza}
          disabled={!dataInizio}
          className="w-full"
        >
          <Calculator className="h-4 w-4 mr-2" />
          Calcola Scadenza
        </Button>
      </CardContent>
    </Card>
  )
}

export default ScadenzaCalculator
