import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { DateInput } from '../ui/DateInput';
import { TimeInput } from '../ui/TimeInput';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Users, X } from 'lucide-react';

interface AppuntamentoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appuntamento: {
    cliente: string;
    data: string;
    ora: string;
    note?: string;
  }) => Promise<void>;
}

export function AppuntamentoDialog({ isOpen, onClose, onSave }: AppuntamentoDialogProps) {
  const [cliente, setCliente] = useState('');
  const [data, setData] = useState('');
  const [ora, setOra] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!cliente.trim() || !data) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        cliente: cliente.trim(),
        data,
        ora,
        note: note.trim() || undefined
      });
      
      // Reset form
      setCliente('');
      setData('');
      setOra('');
      setNote('');
      onClose();
    } catch (error) {
      console.error('Error saving appuntamento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setCliente('');
      setData('');
      setOra('');
      setNote('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-cyan-600" />
            Nuovo Appuntamento in Studio
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="cliente">Cliente *</Label>
            <Input
              id="cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Nome del cliente"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DateInput
              id="data-appuntamento"
              label="Data *"
              value={data}
              onChange={setData}
              required
            />
            <TimeInput
              id="ora-appuntamento"
              label="Ora"
              value={ora}
              onChange={setOra}
            />
          </div>

          <div>
            <Label htmlFor="note-appuntamento">Note</Label>
            <Input
              id="note-appuntamento"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note aggiuntive sull'appuntamento..."
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={handleClose}
              variant="outline"
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Annulla
            </Button>
            <Button
              onClick={handleSave}
              disabled={!cliente.trim() || !data || isLoading}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvataggio...' : 'Salva Appuntamento'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
