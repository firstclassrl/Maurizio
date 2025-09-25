import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { supabase } from '../../lib/supabase';
import { useMessage } from '../../hooks/useMessage';

interface Client {
  id?: string;
  user_id?: string;
  tipologia: string;
  alternativa: boolean;
  ragione: string;
  titolo?: string;
  cognome?: string;
  nome?: string;
  sesso?: string;
  data_nascita?: string;
  luogo_nascita?: string;
  partita_iva?: string;
  codice_fiscale?: string;
  denominazione?: string;
  indirizzi: any[];
  contatti: any[];
  cliente: boolean;
  controparte: boolean;
  altri: boolean;
  codice_destinatario?: string;
  codice_destinatario_pa?: string;
  note?: string;
  sigla?: string;
}

interface NewClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  client?: Client | null;
}

export const NewClientForm: React.FC<NewClientFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  client
}) => {
  const [formData, setFormData] = useState<Client>({
    tipologia: 'Persona fisica',
    alternativa: false,
    ragione: '',
    titolo: '',
    cognome: '',
    nome: '',
    sesso: '',
    data_nascita: '',
    luogo_nascita: '',
    partita_iva: '',
    codice_fiscale: '',
    denominazione: '',
    indirizzi: [],
    contatti: [],
    cliente: false,
    controparte: false,
    altri: false,
    codice_destinatario: '',
    codice_destinatario_pa: '',
    note: '',
    sigla: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useMessage();

  useEffect(() => {
    if (client) {
      setFormData({
        ...client,
        data_nascita: client.data_nascita || '',
        indirizzi: client.indirizzi || [],
        contatti: client.contatti || []
      });
    } else {
      setFormData({
        tipologia: 'Persona fisica',
        alternativa: false,
        ragione: '',
        titolo: '',
        cognome: '',
        nome: '',
        sesso: '',
        data_nascita: '',
        luogo_nascita: '',
        partita_iva: '',
        codice_fiscale: '',
        denominazione: '',
        indirizzi: [],
        contatti: [],
        cliente: false,
        controparte: false,
        altri: false,
        codice_destinatario: '',
        codice_destinatario_pa: '',
        note: '',
        sigla: ''
      });
    }
  }, [client]);

  const handleInputChange = (field: keyof Client, value: any) => {
    console.log('🆕 NEW FORM: handleInputChange', { field, value });
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🆕 NEW FORM: handleSubmit called');
      console.log('🆕 NEW FORM: formData:', formData);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utente non autenticato');
      }

      // Prepara i dati per il database - STRUTTURA ESATTA
      const dbData = {
        user_id: user.id,
        tipologia: formData.tipologia,
        alternativa: formData.alternativa,
        ragione: formData.ragione || (formData.nome && formData.cognome ? `${formData.nome} ${formData.cognome}` : 'Cliente'),
        titolo: formData.titolo || null,
        cognome: formData.cognome || null,
        nome: formData.nome || null,
        sesso: formData.sesso || null,
        data_nascita: formData.data_nascita || null,
        luogo_nascita: formData.luogo_nascita || null,
        partita_iva: formData.partita_iva || null,
        codice_fiscale: formData.codice_fiscale || null,
        denominazione: formData.denominazione || null,
        indirizzi: JSON.stringify(formData.indirizzi),
        contatti: JSON.stringify(formData.contatti),
        cliente: formData.cliente,
        controparte: formData.controparte,
        altri: formData.altri,
        codice_destinatario: formData.codice_destinatario || null,
        codice_destinatario_pa: formData.codice_destinatario_pa || null,
        note: formData.note || null,
        sigla: formData.sigla || null
      };

      console.log('🆕 NEW FORM: dbData to save:', dbData);

      if (client?.id) {
        // Update existing client
        console.log('🆕 NEW FORM: Updating client with ID:', client.id);
        const { error } = await supabase
          .from('clients')
          .update({
            ...dbData,
            updated_at: new Date().toISOString()
          })
          .eq('id', client.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('🆕 NEW FORM: Update error:', error);
          throw error;
        }
        console.log('🆕 NEW FORM: Client updated successfully!');
        showSuccess('Successo', 'Parte aggiornata con successo');
      } else {
        // Create new client
        console.log('🆕 NEW FORM: Creating new client');
        const { error } = await supabase
          .from('clients')
          .insert([dbData]);

        if (error) {
          console.error('🆕 NEW FORM: Insert error:', error);
          throw error;
        }
        console.log('🆕 NEW FORM: Client created successfully!');
        showSuccess('Successo', 'Parte creata con successo');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('🆕 NEW FORM: Error:', error);
      showError('Errore', 'Errore nel salvataggio della parte');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {client ? 'Modifica Parte' : 'Nuova Parte'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipologia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipologia">Tipologia *</Label>
              <Select value={formData.tipologia} onValueChange={(value) => handleInputChange('tipologia', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipologia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Persona fisica">Persona fisica</SelectItem>
                  <SelectItem value="Persona Giuridica">Persona Giuridica</SelectItem>
                  <SelectItem value="Ditta Individuale">Ditta Individuale</SelectItem>
                  <SelectItem value="Altro ente">Altro ente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Informazioni Personali */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informazioni Personali</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Nome"
                />
              </div>
              <div>
                <Label htmlFor="cognome">Cognome *</Label>
                <Input
                  id="cognome"
                  value={formData.cognome}
                  onChange={(e) => handleInputChange('cognome', e.target.value)}
                  placeholder="Cognome"
                />
              </div>
              <div>
                <Label htmlFor="codice_fiscale">Codice Fiscale</Label>
                <Input
                  id="codice_fiscale"
                  value={formData.codice_fiscale}
                  onChange={(e) => handleInputChange('codice_fiscale', e.target.value)}
                  placeholder="Codice Fiscale"
                />
              </div>
              <div>
                <Label htmlFor="sesso">Sesso</Label>
                <Select value={formData.sesso} onValueChange={(value) => handleInputChange('sesso', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona sesso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Maschio</SelectItem>
                    <SelectItem value="F">Femmina</SelectItem>
                    <SelectItem value="Altro">Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Ruoli */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ruoli</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="cliente"
                  checked={formData.cliente}
                  onCheckedChange={(checked) => handleInputChange('cliente', checked)}
                />
                <Label htmlFor="cliente">Cliente</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="controparte"
                  checked={formData.controparte}
                  onCheckedChange={(checked) => handleInputChange('controparte', checked)}
                />
                <Label htmlFor="controparte">Controparte</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="altri"
                  checked={formData.altri}
                  onCheckedChange={(checked) => handleInputChange('altri', checked)}
                />
                <Label htmlFor="altri">Altri</Label>
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <Label htmlFor="note">Note</Label>
            <Input
              id="note"
              value={formData.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              placeholder="Note aggiuntive"
            />
          </div>

          {/* Bottoni */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvataggio...' : (client ? 'Aggiorna Parte' : 'Crea Parte')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
