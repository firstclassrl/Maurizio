export interface Address {
  id?: string
  tipo: 'RESIDENZA' | 'DOMICILIO' | 'SEDE'
  via: string
  citta: string
  cap: string
  provincia: string
}

export interface Contact {
  id?: string
  tipo: 'TELEFONO' | 'EMAIL' | 'FAX'
  valore: string
  note?: string
}

export interface ClientFormData {
  tipologia: 'Persona Fisica' | 'Società' | 'Ente' | 'Professionista'
  denominazione?: string
  nome?: string
  cognome?: string
  codice_fiscale: string
  partita_iva?: string
  indirizzi: Address[]
  contatti: Contact[]
  note?: string
}

export interface Client {
  id: string
  user_id: string
  tipologia: 'Persona Fisica' | 'Società' | 'Ente' | 'Professionista'
  denominazione?: string
  nome?: string
  cognome?: string
  codice_fiscale: string
  partita_iva?: string
  indirizzi: Address[]
  contatti: Contact[]
  note?: string
  created_at: string
  updated_at: string
}
