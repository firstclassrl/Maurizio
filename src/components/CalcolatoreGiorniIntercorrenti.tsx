import { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { DateInput } from './ui/DateInput';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  CalendarDays
} from 'lucide-react';
import { 
  calcolaGiorniIntercorrenti,
  formattaPeriodo,
  RisultatoGiorniIntercorrenti 
} from '../utils/terminiProcessuali';

interface CalcolatoreGiorniIntercorrentiProps {
  onAggiungiACalendario?: (data: Date, titolo: string, note?: string) => void;
}

export function CalcolatoreGiorniIntercorrenti({ onAggiungiACalendario }: CalcolatoreGiorniIntercorrentiProps) {
  // Form state
  const [dataInizio, setDataInizio] = useState('');
  const [dataFine, setDataFine] = useState('');
  const [includiSospensione, setIncludiSospensione] = useState(true);
  
  // Risultati
  const [risultato, setRisultato] = useState<RisultatoGiorniIntercorrenti | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [isCalcolando, setIsCalcolando] = useState(false);

  // Inizializza con date di esempio
  useState(() => {
    const oggi = new Date();
    const traUnMese = new Date();
    traUnMese.setMonth(oggi.getMonth() + 1);
    
    setDataInizio(oggi.toISOString().split('T')[0]);
    setDataFine(traUnMese.toISOString().split('T')[0]);
  });

  // Gestisce il calcolo
  const handleCalculate = async () => {
    setIsCalcolando(true);
    setErrore(null);
    
    try {
      // Validazione input
      if (!dataInizio || !dataFine) {
        setErrore('Entrambe le date sono obbligatorie');
        return;
      }
      
      const data1 = new Date(dataInizio);
      const data2 = new Date(dataFine);
      
      if (isNaN(data1.getTime()) || isNaN(data2.getTime())) {
        setErrore('Date non valide');
        return;
      }
      
      if (data1.getTime() === data2.getTime()) {
        setErrore('Le date non possono essere uguali');
        return;
      }
      
      const res = calcolaGiorniIntercorrenti(data1, data2, includiSospensione);
      setRisultato(res);
      
    } catch (error) {
      setErrore(error instanceof Error ? error.message : 'Errore durante il calcolo');
    } finally {
      setIsCalcolando(false);
    }
  };

  // Gestisce l'aggiunta al calendario
  const handleAggiungiACalendario = () => {
    if (risultato && onAggiungiACalendario) {
      const titolo = `Periodo: ${formattaPeriodo(risultato.dataInizio, risultato.dataFine)}`;
      const note = `Giorni intercorrenti: ${risultato.giorniIntercorrenti}\nGiorni lavorativi: ${risultato.giorniLavorativi}\nGiorni festivi: ${risultato.giorniFestivi}`;
      
      onAggiungiACalendario(risultato.dataFine, titolo, note);
    }
  };

  // Reset form
  const handleReset = () => {
    const oggi = new Date();
    const traUnMese = new Date();
    traUnMese.setMonth(oggi.getMonth() + 1);
    
    setDataInizio(oggi.toISOString().split('T')[0]);
    setDataFine(traUnMese.toISOString().split('T')[0]);
    setIncludiSospensione(true);
    setRisultato(null);
    setErrore(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Calcolo Giorni Intercorrenti
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Calcola i giorni tra due date, inclusi giorni lavorativi, festivi e sospensione feriale
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form di calcolo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Calcolo Periodo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Data di inizio */}
            <DateInput
              id="data-inizio-intercorrenti"
              label="Data di inizio"
              value={dataInizio}
              onChange={setDataInizio}
              required
            />

            {/* Data di fine */}
            <DateInput
              id="data-fine-intercorrenti"
              label="Data di fine"
              value={dataFine}
              onChange={setDataFine}
              required
            />

            {/* Opzioni */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="sospensione-intercorrenti">Includi sospensione feriale</Label>
                <Switch
                  id="sospensione-intercorrenti"
                  checked={includiSospensione}
                  onCheckedChange={setIncludiSospensione}
                />
              </div>
            </div>

            {/* Pulsanti */}
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleCalculate} 
                disabled={isCalcolando}
                className="flex-1"
              >
                {isCalcolando ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Calcolando...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Calcola Giorni
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>

            {/* Errore */}
            {errore && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">{errore}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risultato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Risultato
            </CardTitle>
          </CardHeader>
          <CardContent>
            {risultato ? (
              <div className="space-y-4">
                {/* Periodo */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      Periodo calcolato
                    </span>
                  </div>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {formattaPeriodo(risultato.dataInizio, risultato.dataFine)}
                  </p>
                </div>

                {/* Statistiche principali */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {risultato.giorniIntercorrenti}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Giorni Totali
                    </div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {risultato.giorniLavorativi}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      Giorni Lavorativi
                    </div>
                  </div>
                </div>

                {/* Dettagli aggiuntivi */}
                <div className="space-y-2">
                  {risultato.giorniFestivi > 0 && (
                    <div className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                      <span className="text-sm text-yellow-800 dark:text-yellow-200">Giorni festivi:</span>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {risultato.giorniFestivi}
                      </Badge>
                    </div>
                  )}
                  
                  {risultato.giorniSospensione > 0 && (
                    <div className="flex justify-between items-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                      <span className="text-sm text-orange-800 dark:text-orange-200">Sospensione feriale:</span>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        {risultato.giorniSospensione}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Note */}
                {risultato.note.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Dettagli
                    </h4>
                    <div className="space-y-1">
                      {risultato.note.map((nota, index) => (
                        <div
                          key={index}
                          className="text-xs p-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
                        >
                          {nota}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pulsante aggiungi al calendario */}
                {onAggiungiACalendario && (
                  <Button 
                    onClick={handleAggiungiACalendario}
                    className="w-full"
                    variant="outline"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Aggiungi Periodo al Calendario
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Inserisci le due date e clicca "Calcola Giorni" per vedere il risultato</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informazioni utili */}
      <Card className="bg-gray-50 dark:bg-gray-800">
        <CardContent className="pt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              <strong>Informazioni:</strong> Il calcolo include tutti i giorni tra le due date (esclusi i giorni estremi).
              I giorni lavorativi escludono sabati e festività nazionali. La sospensione feriale si riferisce ai giorni di agosto.
            </p>
            <p>
              <strong>Utilizzo:</strong> Utile per calcolare durate di procedimenti, termini di prescrizione, 
              periodi di decadenza e qualsiasi calcolo temporale in ambito legale.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
