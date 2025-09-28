import { User } from '@supabase/supabase-js';
import { Button } from '../components/ui/button';
import { CalcolatoreTermini } from '../components/CalcolatoreTermini';
import { useCalcolatoreTermini } from '../hooks/useCalcolatoreTermini';
import { Footer } from '../components/ui/Footer';
import { ArrowLeft, Calculator } from 'lucide-react';

interface CalcolatoreTerminiPageProps {
  user: User;
  onBackToDashboard: () => void;
}

export function CalcolatoreTerminiPage({ onBackToDashboard }: CalcolatoreTerminiPageProps) {
  const { aggiungiACalendario } = useCalcolatoreTermini();

  const handleAggiungiACalendario = async (data: Date, titolo: string, note?: string) => {
    try {
      await aggiungiACalendario(data, titolo, note, 'Scadenza Processuale');
    } catch (error) {
      // L'errore è già gestito nel hook
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-slate-900 shadow-sm border-b border-slate-700 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToDashboard}
                className="flex items-center gap-2 text-white hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Torna alla Dashboard
              </Button>
              <div className="h-6 w-px bg-slate-600" />
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-400" />
                <h1 className="text-lg font-semibold text-white">
                  Calcolatore Legale
                </h1>
              </div>
            </div>
          </div>
        </div>
        {/* Riga dorata alla base */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
      </div>

      {/* Contenuto principale */}
      <div className="py-8">
        <CalcolatoreTermini onAggiungiACalendario={handleAggiungiACalendario} />
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
