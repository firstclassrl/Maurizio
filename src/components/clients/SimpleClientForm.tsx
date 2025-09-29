import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import { AddressAutocomplete } from './AddressAutocomplete';

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

interface SimpleClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  client?: Client | null;
}

export const SimpleClientForm: React.FC<SimpleClientFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  client
}) => {
  const [formData, setFormData] = useState({
    tipologia: 'Persona fisica',
    ragione: '',
    nome: '',
    cognome: '',
    denominazione: '',
    codice_fiscale: '',
    partita_iva: '',
    sesso: '',
    indirizzo_strada: '',
    indirizzo_civico: '',
    indirizzo_cap: '',
    indirizzo_citta: '',
    indirizzo_provincia: '',
    telefono: '',
    mail: '',
    pec: '',
    cliente: false,
    controparte: false,
    altri: false,
    note: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (client) {
      // Carica i dati del cliente esistente
      setFormData({
        tipologia: client.tipologia || 'Persona fisica',
        ragione: client.ragione || '',
        nome: client.nome || '',
        cognome: client.cognome || '',
        denominazione: client.denominazione || '',
        codice_fiscale: client.codice_fiscale || '',
        partita_iva: client.partita_iva || '',
        sesso: client.sesso || '',
        indirizzo_strada: '',
        indirizzo_civico: '',
        indirizzo_cap: '',
        indirizzo_citta: '',
        indirizzo_provincia: '',
        telefono: '',
        mail: '',
        pec: '',
        cliente: client.cliente || false,
        controparte: client.controparte || false,
        altri: client.altri || false,
        note: client.note || ''
      });
    } else {
      // Reset form per nuovo cliente
      setFormData({
        tipologia: 'Persona fisica',
        ragione: '',
        nome: '',
        cognome: '',
        denominazione: '',
        codice_fiscale: '',
        partita_iva: '',
        sesso: '',
        indirizzo_strada: '',
        indirizzo_civico: '',
        indirizzo_cap: '',
        indirizzo_citta: '',
        indirizzo_provincia: '',
        telefono: '',
        mail: '',
        pec: '',
        cliente: false,
        controparte: false,
        altri: false,
        note: ''
      });
    }
  }, [client]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressSelect = (suggestion: any) => {
    setFormData(prev => ({
      ...prev,
      indirizzo_strada: suggestion.via || '',
      indirizzo_civico: suggestion.civico || '',
      indirizzo_cap: suggestion.cap || '',
      indirizzo_citta: suggestion.citta || '',
      indirizzo_provincia: suggestion.provincia || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utente non autenticato');
      }

      // Prepara indirizzo e contatti
      const indirizzi = [{
        strada: formData.indirizzo_strada,
        civico: formData.indirizzo_civico,
        cap: formData.indirizzo_cap,
        citta: formData.indirizzo_citta,
        provincia: formData.indirizzo_provincia
      }].filter(addr => addr.strada || addr.citta); // Solo se almeno un campo è compilato

      const contatti = [
        { type: 'Telefono', value: formData.telefono },
        { type: 'Email', value: formData.mail },
        { type: 'PEC', value: formData.pec }
      ].filter(contact => contact.value); // Solo se il valore è presente

      // Prepara i dati per il database
      const dbData = {
        user_id: user.id,
        tipologia: formData.tipologia,
        alternativa: false,
        ragione: formData.ragione || (formData.nome && formData.cognome ? `${formData.nome} ${formData.cognome}` : formData.denominazione || 'Cliente'),
        titolo: null,
        cognome: formData.cognome || null,
        nome: formData.nome || null,
        sesso: formData.sesso || null,
        data_nascita: null,
        luogo_nascita: null,
        partita_iva: formData.partita_iva || null,
        codice_fiscale: formData.codice_fiscale || null,
        denominazione: formData.denominazione || null,
        indirizzi: JSON.stringify(indirizzi),
        contatti: JSON.stringify(contatti),
        cliente: formData.cliente,
        controparte: formData.controparte,
        altri: formData.altri,
        codice_destinatario: null,
        codice_destinatario_pa: null,
        note: formData.note || null,
        sigla: null
      };


      if (client?.id) {
        // Update existing client
        const { error } = await supabase
          .from('clients')
          .update({
            ...dbData,
            updated_at: new Date().toISOString()
          })
          .eq('id', client.id)
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }
        showSuccess('Successo', 'Parte aggiornata con successo');
      } else {
        // Create new client
        const { error } = await supabase
          .from('clients')
          .insert([dbData]);

        if (error) {
          throw error;
        }
        showSuccess('Successo', 'Parte creata con successo');
      }

      onSuccess();
      onClose();
    } catch (error) {
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
          <div>
            <Label htmlFor="tipologia">Tipologia *</Label>
            <Select value={formData.tipologia} onValueChange={(value) => handleInputChange('tipologia', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona tipologia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Persona fisica">Persona fisica</SelectItem>
                <SelectItem value="Ditta Individuale">Ditta Individuale</SelectItem>
                <SelectItem value="Persona Giuridica">Persona Giuridica</SelectItem>
                <SelectItem value="Altro ente">Altro ente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* PERSONA FISICA */}
          {formData.tipologia === 'Persona fisica' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informazioni Persona Fisica</h3>
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
          )}

          {/* DITTA INDIVIDUALE */}
          {formData.tipologia === 'Ditta Individuale' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informazioni Ditta Individuale</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="denominazione">Denominazione *</Label>
                  <Input
                    id="denominazione"
                    value={formData.denominazione}
                    onChange={(e) => handleInputChange('denominazione', e.target.value)}
                    placeholder="Denominazione ditta"
                  />
                </div>
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Nome"
                  />
                </div>
                <div>
                  <Label htmlFor="cognome">Cognome</Label>
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
                  <Label htmlFor="partita_iva">Partita IVA</Label>
                  <Input
                    id="partita_iva"
                    value={formData.partita_iva}
                    onChange={(e) => handleInputChange('partita_iva', e.target.value)}
                    placeholder="Partita IVA"
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
          )}

          {/* PERSONA GIURIDICA */}
          {formData.tipologia === 'Persona Giuridica' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informazioni Persona Giuridica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ragione">Ragione Sociale *</Label>
                  <Input
                    id="ragione"
                    value={formData.ragione}
                    onChange={(e) => handleInputChange('ragione', e.target.value)}
                    placeholder="Ragione sociale"
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
                  <Label htmlFor="partita_iva">Partita IVA</Label>
                  <Input
                    id="partita_iva"
                    value={formData.partita_iva}
                    onChange={(e) => handleInputChange('partita_iva', e.target.value)}
                    placeholder="Partita IVA"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ALTRO ENTE */}
          {formData.tipologia === 'Altro ente' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informazioni Altro Ente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ragione">Ragione Sociale *</Label>
                  <Input
                    id="ragione"
                    value={formData.ragione}
                    onChange={(e) => handleInputChange('ragione', e.target.value)}
                    placeholder="Ragione sociale"
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
                  <Label htmlFor="partita_iva">Partita IVA</Label>
                  <Input
                    id="partita_iva"
                    value={formData.partita_iva}
                    onChange={(e) => handleInputChange('partita_iva', e.target.value)}
                    placeholder="Partita IVA"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Indirizzo Completo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Indirizzo Completo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="indirizzo_strada">Via/Strada</Label>
                <AddressAutocomplete
                  value={formData.indirizzo_strada}
                  onChange={(v) => handleInputChange('indirizzo_strada', v)}
                  onSelect={handleAddressSelect}
                  placeholder="Via, Strada, Piazza... (autocomplete)"
                />
              </div>
              <div>
                <Label htmlFor="indirizzo_civico">Numero Civico</Label>
                <Input
                  id="indirizzo_civico"
                  value={formData.indirizzo_civico}
                  onChange={(e) => handleInputChange('indirizzo_civico', e.target.value)}
                  placeholder="123"
                />
              </div>
              <div>
                <Label htmlFor="indirizzo_cap">CAP</Label>
                <Input
                  id="indirizzo_cap"
                  value={formData.indirizzo_cap}
                  onChange={(e) => handleInputChange('indirizzo_cap', e.target.value)}
                  placeholder="00100"
                />
              </div>
              <div>
                <Label htmlFor="indirizzo_citta">Città</Label>
                <Input
                  id="indirizzo_citta"
                  value={formData.indirizzo_citta}
                  onChange={(e) => handleInputChange('indirizzo_citta', e.target.value)}
                  placeholder="Roma"
                />
              </div>
              <div>
                <Label htmlFor="indirizzo_provincia">Provincia</Label>
                <Input
                  id="indirizzo_provincia"
                  value={formData.indirizzo_provincia}
                  onChange={(e) => handleInputChange('indirizzo_provincia', e.target.value)}
                  placeholder="RM"
                />
              </div>
            </div>
          </div>

          {/* Contatti */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contatti</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="telefono">Telefono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  placeholder="+39 123 456 7890"
                />
              </div>
              <div>
                <Label htmlFor="mail">Email</Label>
                <Input
                  id="mail"
                  type="email"
                  value={formData.mail}
                  onChange={(e) => handleInputChange('mail', e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="pec">PEC</Label>
                <Input
                  id="pec"
                  type="email"
                  value={formData.pec}
                  onChange={(e) => handleInputChange('pec', e.target.value)}
                  placeholder="pec@example.com"
                />
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
