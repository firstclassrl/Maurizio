import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useMessage } from './useMessage';
import { RisultatoCalcolo } from '../utils/terminiProcessuali';

export function useCalcolatoreTermini() {
  const { showSuccess, showError } = useMessage();
  const [isLoading, setIsLoading] = useState(false);

  // Aggiunge una scadenza al calendario dell'app
  const aggiungiACalendario = useCallback(async (
    dataScadenza: Date,
    titolo: string,
    note?: string,
    categoria: string = 'Scadenza Processuale'
  ) => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utente non autenticato');
      }

      // Formatta la data per il database
      const dataFormattata = dataScadenza.toISOString().split('T')[0];
      const oraFormattata = '09:00'; // Ora predefinita per le scadenze

      // Crea il task nel database
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          pratica: titolo,
          attivita: categoria,
          scadenza: dataFormattata,
          ora: oraFormattata,
          note: note || '',
          stato: 'todo',
          priorita: 5,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      showSuccess('Scadenza aggiunta', `Scadenza "${titolo}" aggiunta al calendario per il ${dataFormattata}`);
      return data;

    } catch (error) {
      console.error('Errore nell\'aggiunta al calendario:', error);
      showError('Errore', error instanceof Error ? error.message : 'Errore nell\'aggiunta al calendario');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, showError]);

  // Esporta il risultato in formato PDF
  const esportaPDF = useCallback(async () => {
    try {
      // Qui potresti implementare la generazione PDF
      // Per ora mostriamo un messaggio di successo
      showSuccess('Info', 'Funzionalità di esportazione PDF in arrivo');
    } catch (error) {
      showError('Errore', 'Errore nell\'esportazione PDF');
    }
  }, [showSuccess, showError]);

  // Condivide il risultato
  const condividiRisultato = useCallback(async () => {
    try {
      const testo = `Scadenza calcolata con LexAgenda`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Scadenza Processuale',
          text: testo
        });
      } else {
        // Fallback: copia negli appunti
        await navigator.clipboard.writeText(testo);
        showSuccess('Successo', 'Risultato copiato negli appunti');
      }
    } catch (error) {
      showError('Errore', 'Errore nella condivisione');
    }
  }, [showSuccess, showError]);

  // Salva il calcolo nella cronologia
  const salvaCronologia = useCallback(async (risultato: RisultatoCalcolo, titolo: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      const { error } = await supabase
        .from('calcoli_termini')
        .insert({
          user_id: user.id,
          titolo: titolo,
          data_inizio: risultato.dataInizio.toISOString(),
          data_finale: risultato.dataFinale.toISOString(),
          tipo_calcolo: risultato.tipoCalcolo,
          valore_originale: risultato.valoreOriginale,
          giorni_sospensione: risultato.giorniSospensione,
          note: JSON.stringify(risultato.note),
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Errore nel salvataggio cronologia:', error);
      }
    } catch (error) {
      console.error('Errore nel salvataggio cronologia:', error);
    }
  }, []);

  // Ottiene la cronologia dei calcoli
  const getCronologia = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('calcoli_termini')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Errore nel recupero cronologia:', error);
      return [];
    }
  }, []);

  return {
    aggiungiACalendario,
    esportaPDF,
    condividiRisultato,
    salvaCronologia,
    getCronologia,
    isLoading
  };
}
