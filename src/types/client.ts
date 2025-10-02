export interface Address {
  id?: string
  tipo: 'RESIDENZA' | 'DOMICILIO' | 'SEDE'
  via: string
  citta: string
  cap: string
  provincia: string
  // Campi dinamici per supportare i form
  fieldName?: string
  street?: string
  postalCode?: string
  city?: string
  province?: string
  country?: string
}

export interface Contact {
  id?: string
  tipo: 'TELEFONO' | 'EMAIL' | 'FAX'
  valore: string
  note?: string
  // Campi dinamici per supportare i form
  type?: string
  value?: string
  fieldName?: string
}

export interface ClientFormData {
  tipologia: 'Persona fisica' | 'Ditta Individuale' | 'Persona Giuridica' | 'Altro ente'
  denominazione?: string
  nome?: string
  cognome?: string
  codice_fiscale?: string
  partita_iva?: string
  indirizzi: (Address | any)[]
  contatti: (Contact | any)[]
  note?: string
  cliente?: boolean
  controparte?: boolean
  altri?: boolean
  alternativa?: boolean
  ragione?: string
  titolo?: string
  // Campi aggiuntivi per compatibilità con ClientForm
  sesso?: string
  dataNascita?: string
  luogoNascita?: string
  partitaIva?: string
  codiceFiscale?: string
  codiceDestinatario?: string
  codiceDestinatarioPA?: string
  sigla?: string
}

export interface Client {
  id: string
  user_id?: string
  tipologia?: string
  denominazione?: string
  nome?: string
  cognome?: string
  codice_fiscale?: string
  partita_iva?: string
  indirizzi?: any[]
  contatti?: any[]
  note?: string
  created_at?: string
  updated_at?: string
  cliente?: boolean
  controparte?: boolean
  altri?: boolean
  alternativa?: boolean
  ragione?: string
  titolo?: string
  // Campi aggiuntivi per compatibilità
  sesso?: string
  dataNascita?: string
  luogoNascita?: string
  partitaIva?: string
  codiceFiscale?: string
  codiceDestinatario?: string
  codiceDestinatarioPA?: string
  sigla?: string
  indirizzo?: string
  citta?: string
  cap?: string
  provincia?: string
  telefono?: string
  email?: string
  [key: string]: any // Permette qualsiasi campo aggiuntivo
}
