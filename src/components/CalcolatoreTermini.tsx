import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { DateInput } from './ui/DateInput';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { 
  Calculator, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Plus,
  CalendarDays
} from 'lucide-react';
import { 
  calcolaTermineGiorni, 
  calcolaTermineMesi, 
  calcolaTermineAnni,
  formattaData, 
  formattaDataBreve,
  validaInput,
  RisultatoCalcolo 
} from '../utils/terminiProcessuali';
import { 
  TERMINI_PROCESSUALI, 
  getCategorie
} from '../data/terminiStandard';
import { CalcolatoreGiorniIntercorrenti } from './CalcolatoreGiorniIntercorrenti';

interface CalcolatoreTerminiProps {
  onAggiungiACalendario?: (data: Date, titolo: string, note?: string) => void;
}

export function CalcolatoreTermini({ onAggiungiACalendario }: CalcolatoreTerminiProps) {
  // Form state
  const [dataInizio, setDataInizio] = useState('');
  const [tipoCalcolo, setTipoCalcolo] = useState<'giorni' | 'mesi' | 'anni'>('giorni');
  const [valore, setValore] = useState('');
  const [conSospensione, setConSospensione] = useState(true);
  const [aRitroso, setARitroso] = useState(false);
  const [termineLibero, setTermineLibero] = useState(false);
  
  // Termini predefiniti
  const [termineSelezionato, setTermineSelezionato] = useState<string>('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('all');
  const [ricercaTermini, setRicercaTermini] = useState('');
  
  // Risultati
  const [risultato, setRisultato] = useState<RisultatoCalcolo | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [isCalcolando, setIsCalcolando] = useState(false);
  
  // UI state
  const [mostraTerminiPredefiniti, setMostraTerminiPredefiniti] = useState(false);
  const [tabAttivo, setTabAttivo] = useState<'termini' | 'giorni'>('termini');

  // Inizializza con data odierna
  useEffect(() => {
    const oggi = new Date();
    const dataFormattata = oggi.toISOString().split('T')[0];
    setDataInizio(dataFormattata);
  }, []);

  // Filtra termini in base a categoria e ricerca
  const terminiFiltrati = React.useMemo(() => {
    let termini = TERMINI_PROCESSUALI;
    
    if (categoriaFiltro !== 'all') {
      termini = termini.filter(t => t.categoria === categoriaFiltro);
    }
    
    if (ricercaTermini) {
      termini = termini.filter(t => 
        t.nome.toLowerCase().includes(ricercaTermini.toLowerCase()) ||
        t.descrizione.toLowerCase().includes(ricercaTermini.toLowerCase()) ||
        t.articolo.toLowerCase().includes(ricercaTermini.toLowerCase())
      );
    }
    
    return termini;
  }, [categoriaFiltro, ricercaTermini]);

  // Gestisce la selezione di un termine predefinito
  const handleSelezioneTermine = (termineId: string) => {
    const termine = TERMINI_PROCESSUALI.find(t => t.id === termineId);
    if (termine) {
      setTermineSelezionato(termineId);
      setTipoCalcolo(termine.tipo);
      setValore(termine.giorni?.toString() || termine.mesi?.toString() || termine.anni?.toString() || '');
      setConSospensione(termine.sospensione ?? true);
      setTermineLibero(termine.termineLibero ?? false);
      setARitroso(false);
      setErrore(null);
    }
  };

  // Gestisce il calcolo
  const handleCalculate = async () => {
    setIsCalcolando(true);
    setErrore(null);
    
    try {
      // Validazione input
      const erroreValidazione = validaInput(dataInizio, valore, tipoCalcolo);
      if (erroreValidazione) {
        setErrore(erroreValidazione);
        return;
      }
      
      const data = new Date(dataInizio);
      const numValore = Number(valore);
      
      let res: RisultatoCalcolo;
      
      switch (tipoCalcolo) {
        case 'giorni':
          res = calcolaTermineGiorni(data, numValore, conSospensione, termineLibero, aRitroso);
          break;
        case 'mesi':
          res = calcolaTermineMesi(data, numValore, conSospensione, aRitroso);
          break;
        case 'anni':
          res = calcolaTermineAnni(data, numValore, conSospensione, aRitroso);
          break;
        default:
          throw new Error('Tipo di calcolo non supportato');
      }
      
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
      const termine = termineSelezionato ? 
        TERMINI_PROCESSUALI.find(t => t.id === termineSelezionato) : null;
      
      const titolo = termine ? termine.nome : `Scadenza ${tipoCalcolo}`;
      const note = risultato.note.join('\n');
      
      onAggiungiACalendario(risultato.dataFinale, titolo, note);
    }
  };

  // Reset form
  const handleReset = () => {
    setDataInizio(new Date().toISOString().split('T')[0]);
    setTipoCalcolo('giorni');
    setValore('');
    setConSospensione(true);
    setARitroso(false);
    setTermineLibero(false);
    setTermineSelezionato('');
    setRisultato(null);
    setErrore(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Calcolatore Legale
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Calcola termini processuali e giorni intercorrenti secondo il Codice di Procedura Civile italiano
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setTabAttivo('termini')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              tabAttivo === 'termini'
                ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Calculator className="h-4 w-4 inline mr-2" />
            Termini Processuali
          </button>
          <button
            onClick={() => setTabAttivo('giorni')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              tabAttivo === 'giorni'
                ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <CalendarDays className="h-4 w-4 inline mr-2" />
            Giorni Intercorrenti
          </button>
        </div>
      </div>

      {/* Contenuto Tab */}
      {tabAttivo === 'termini' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form di calcolo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calcolo Termine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Toggle per termini predefiniti */}
            <div className="flex items-center justify-between">
              <Label htmlFor="termini-predefiniti">Usa termine predefinito</Label>
              <Switch
                id="termini-predefiniti"
                checked={mostraTerminiPredefiniti}
                onCheckedChange={setMostraTerminiPredefiniti}
              />
            </div>

            {/* Selezione termine predefinito */}
            {mostraTerminiPredefiniti && (
              <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Cerca termine..."
                      value={ricercaTermini}
                      onChange={(e) => setRicercaTermini(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                    <SelectTrigger className="w-40 h-9">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutte</SelectItem>
                      {getCategorie().map(categoria => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {terminiFiltrati.map(termine => (
                    <div
                      key={termine.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        termineSelezionato === termine.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => handleSelezioneTermine(termine.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{termine.nome}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {termine.descrizione}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {termine.articolo}
                            </Badge>
                            {termine.urgente && (
                              <Badge variant="destructive" className="text-xs">
                                Urgente
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">
                            {termine.giorni || termine.mesi || termine.anni}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            {termine.tipo}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data di inizio */}
            <DateInput
              id="data-inizio"
              label="Data di inizio"
              value={dataInizio}
              onChange={setDataInizio}
              required
            />

            {/* Tipo di calcolo e valore */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipo-calcolo">Tipo di calcolo</Label>
                <Select value={tipoCalcolo} onValueChange={(value: any) => setTipoCalcolo(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="giorni">Giorni</SelectItem>
                    <SelectItem value="mesi">Mesi</SelectItem>
                    <SelectItem value="anni">Anni</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="valore">Valore *</Label>
                <Input
                  id="valore"
                  type="number"
                  min="1"
                  value={valore}
                  onChange={(e) => setValore(e.target.value)}
                  placeholder="Es. 30"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Opzioni */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="sospensione">Applica sospensione feriale</Label>
                <Switch
                  id="sospensione"
                  checked={conSospensione}
                  onCheckedChange={setConSospensione}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="termine-libero">Termine libero</Label>
                <Switch
                  id="termine-libero"
                  checked={termineLibero}
                  onCheckedChange={setTermineLibero}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="ritroso">Calcolo a ritroso</Label>
                <Switch
                  id="ritroso"
                  checked={aRitroso}
                  onCheckedChange={setARitroso}
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
                    <Calculator className="h-4 w-4 mr-2" />
                    Calcola
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
                {/* Data calcolata */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      Scadenza calcolata
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {formattaData(risultato.dataFinale)}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {formattaDataBreve(risultato.dataFinale)}
                  </p>
                </div>

                {/* Dettagli calcolo */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Data di inizio:</span>
                    <span>{formattaDataBreve(risultato.dataInizio)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Termine:</span>
                    <span>{risultato.valoreOriginale} {risultato.tipoCalcolo}</span>
                  </div>
                  {risultato.giorniSospensione > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Giorni sospensione:</span>
                      <span className="text-orange-600 dark:text-orange-400">
                        +{risultato.giorniSospensione}
                      </span>
                    </div>
                  )}
                </div>

                {/* Note */}
                {risultato.note.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Note
                    </h4>
                    <div className="space-y-1">
                      {risultato.note.map((nota, index) => (
                        <div
                          key={index}
                          className={`text-xs p-2 rounded ${
                            nota.includes('⚠️') 
                              ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                              : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
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
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi al Calendario
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Inserisci i dati e clicca "Calcola" per vedere il risultato</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      ) : (
        /* Tab Giorni Intercorrenti */
        <CalcolatoreGiorniIntercorrenti onAggiungiACalendario={onAggiungiACalendario} />
      )}

      {/* Informazioni legali */}
      <Card className="bg-gray-50 dark:bg-gray-800">
        <CardContent className="pt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              <strong>Nota legale:</strong> Questo calcolatore implementa le regole del Codice di Procedura Civile italiano 
              per il calcolo dei termini processuali e giorni intercorrenti. I risultati sono forniti a titolo informativo e non sostituiscono 
              la consulenza legale professionale.
            </p>
            <p>
              <strong>Riferimenti normativi:</strong> Art. 155 c.p.c. (calcolo termini), Art. 183 c.p.c. (comparsa conclusionale), 
              Art. 325 c.p.c. (appello), Art. 366 c.p.c. (cassazione).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
