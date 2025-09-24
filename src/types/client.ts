import { ClientType, ContactType } from '../data/clientTypes'

// Interfaccia per gli indirizzi
export interface Address {
  id?: string
  fieldName: string // Nome del campo (es. "Indirizzo", "Sede legale", etc.)
  street: string
  postalCode: string
  city: string
  province: string
  country: string
}

// Interfaccia per i contatti
export interface Contact {
  id?: string
  type: ContactType
  value: string
  fieldName?: string // Per contatti speciali come "Email PEC"
}

// Interfaccia principale per il cliente
export interface Client {
  id?: string
  user_id?: string
  tipologia: ClientType
  alternativa: boolean
  ragione: string
  
  // Informazioni personali
  titolo?: string
  cognome?: string
  nome?: string
  sesso?: 'M' | 'F' | 'Altro'
  dataNascita?: string
  luogoNascita?: string
  partitaIva?: string
  codiceFiscale?: string
  denominazione?: string
  
  // Indirizzi
  indirizzi: Address[]
  
  // Contatti
  contatti: Contact[]
  
  // Ruoli
  cliente: boolean
  controparte: boolean
  altri: boolean
  
  // Destinatario (per PA)
  codiceDestinatario?: string
  codiceDestinatarioPA?: string
  
  // Note
  note?: string
  sigla?: string
  
  // Metadati
  created_at?: string
  updated_at?: string
}

// Interfaccia per il form del cliente
export interface ClientFormData {
  tipologia: ClientType
  alternativa: boolean
  ragione: string
  
  titolo: string
  cognome: string
  nome: string
  sesso: 'M' | 'F' | 'Altro'
  dataNascita: string
  luogoNascita: string
  partitaIva: string
  codiceFiscale: string
  denominazione: string
  
  indirizzi: Address[]
  contatti: Contact[]
  
  // Ruoli
  cliente: boolean
  controparte: boolean
  altri: boolean
  
  codiceDestinatario: string
  codiceDestinatarioPA: string
  
  note: string
  sigla: string
}

// Interfaccia per la risposta dell'API
export interface ClientResponse {
  success: boolean
  data?: Client
  error?: string
}

// Interfaccia per la lista dei clienti
export interface ClientListResponse {
  success: boolean
  data?: Client[]
  error?: string
  total?: number
}
