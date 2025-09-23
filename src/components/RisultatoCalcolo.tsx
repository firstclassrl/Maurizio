import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Plus,
  Download,
  Share
} from 'lucide-react';
import { RisultatoCalcolo, formattaData, formattaDataBreve, differenzaGiorni } from '../utils/terminiProcessuali';

interface RisultatoCalcoloProps {
  risultato: RisultatoCalcolo;
  onAggiungiACalendario?: () => void;
  onEsportaPDF?: () => void;
  onCondividi?: () => void;
}

export function RisultatoCalcoloComponent({ 
  risultato, 
  onAggiungiACalendario, 
  onEsportaPDF, 
  onCondividi 
}: RisultatoCalcoloProps) {
  const giorniTotali = differenzaGiorni(risultato.dataInizio, risultato.dataFinale);
  const isUrgente = giorniTotali <= 7;
  const isFestivo = risultato.note.some(nota => nota.includes('festivo'));
  const isSabato = risultato.note.some(nota => nota.includes('sabato'));

  return (
    <div className="space-y-4">
      {/* Header risultato */}
      <div className={`p-4 rounded-lg ${
        isUrgente 
          ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {isUrgente ? (
            <AlertTriangle className="h-5 w-5 text-red-600" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-600" />
          )}
          <span className={`font-medium ${
            isUrgente 
              ? 'text-red-900 dark:text-red-100'
              : 'text-green-900 dark:text-green-100'
          }`}>
            {isUrgente ? 'Scadenza Imminente' : 'Scadenza Calcolata'}
          </span>
        </div>
        <p className={`text-2xl font-bold ${
          isUrgente 
            ? 'text-red-900 dark:text-red-100'
            : 'text-green-900 dark:text-green-100'
        }`}>
          {formattaData(risultato.dataFinale)}
        </p>
        <p className={`text-sm ${
          isUrgente 
            ? 'text-red-700 dark:text-red-300'
            : 'text-green-700 dark:text-green-300'
        } mt-1`}>
          {formattaDataBreve(risultato.dataFinale)}
        </p>
      </div>

      {/* Badges informativi */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="text-xs">
          {risultato.tipoCalcolo}: {risultato.valoreOriginale}
        </Badge>
        {risultato.giorniSospensione > 0 && (
          <Badge variant="secondary" className="text-xs">
            Sospensione: +{risultato.giorniSospensione} giorni
          </Badge>
        )}
        {isUrgente && (
          <Badge variant="destructive" className="text-xs">
            Urgente
          </Badge>
        )}
        {isFestivo && (
          <Badge variant="destructive" className="text-xs">
            Giorno Festivo
          </Badge>
        )}
        {isSabato && (
          <Badge variant="destructive" className="text-xs">
            Sabato
          </Badge>
        )}
      </div>

      {/* Dettagli calcolo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dettagli Calcolo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Data di inizio:</span>
              <p className="font-medium">{formattaDataBreve(risultato.dataInizio)}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Termine originale:</span>
              <p className="font-medium">{risultato.valoreOriginale} {risultato.tipoCalcolo}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Giorni totali:</span>
              <p className="font-medium">{giorniTotali} giorni</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Giorni rimanenti:</span>
              <p className={`font-medium ${
                giorniTotali <= 7 ? 'text-red-600' : 
                giorniTotali <= 30 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {Math.max(0, giorniTotali)} giorni
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note e avvisi */}
      {risultato.note.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5" />
              Note e Avvisi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {risultato.note.map((nota, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg text-sm ${
                    nota.includes('⚠️') 
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
                      : nota.includes('ATTENZIONE')
                      ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                      : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
                  }`}
                >
                  {nota}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Azioni */}
      <div className="flex gap-2">
        {onAggiungiACalendario && (
          <Button onClick={onAggiungiACalendario} className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi al Calendario
          </Button>
        )}
        {onEsportaPDF && (
          <Button variant="outline" onClick={onEsportaPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        )}
        {onCondividi && (
          <Button variant="outline" onClick={onCondividi}>
            <Share className="h-4 w-4 mr-2" />
            Condividi
          </Button>
        )}
      </div>

      {/* Cronologia calcolo */}
      <Card className="bg-gray-50 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Cronologia Calcolo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Data iniziale:</span>
              <span>{formattaDataBreve(risultato.dataInizio)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Calcolo base:</span>
              <span>{formattaDataBreve(risultato.dataCalcolata)}</span>
            </div>
            {risultato.giorniSospensione > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Dopo sospensione:</span>
                <span className="text-orange-600 dark:text-orange-400">
                  +{risultato.giorniSospensione} giorni
                </span>
              </div>
            )}
            <div className="flex justify-between font-medium">
              <span>Data finale:</span>
              <span>{formattaDataBreve(risultato.dataFinale)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
