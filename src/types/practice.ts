// Tipi di procedura
export type ProcedureType = 'STRAGIUDIZIALE' | 'GIUDIZIALE'

// Categorie attività per STRAGIUDIZIALE
export const STRAGIUDIZIALE_CATEGORIES = [
  { value: 'APPUNTAMENTO', label: 'Appuntamento', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  { value: 'SCADENZA', label: 'Scadenza', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'ATTIVITA_DA_SVOLGERE', label: 'Attività da Svolgere', color: 'bg-blue-100 text-blue-800 border-blue-200' }
] as const

// Categorie attività per GIUDIZIALE
export const GIUDIZIALE_CATEGORIES = [
  { value: 'UDIENZA', label: 'Udienza', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'SCADENZA_PROCESSUALE', label: 'Scadenza Processuale', color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'ATTIVITA_PROCESSUALE', label: 'Attività Processuale', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'APPUNTAMENTO', label: 'Appuntamento', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  { value: 'SCADENZA', label: 'Scadenza', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'ATTIVITA_DA_SVOLGERE', label: 'Attività da Svolgere', color: 'bg-blue-100 text-blue-800 border-blue-200' }
] as const

export type StragiudizialeCategory = typeof STRAGIUDIZIALE_CATEGORIES[number]['value']
export type GiudizialeCategory = typeof GIUDIZIALE_CATEGORIES[number]['value']
export type ActivityCategory = StragiudizialeCategory | GiudizialeCategory

// Interfaccia per una pratica
export interface Practice {
  id?: string
  user_id?: string
  numero: string
  cliente_id: string
  controparti_ids: string[]
  tipo_procedura: ProcedureType
  created_at?: string
  updated_at?: string
}

// Interfaccia per un'attività
export interface Activity {
  id?: string
  user_id?: string
  pratica_id: string
  categoria: ActivityCategory
  attivita: string
  data: string
  ora?: string
  autorita_giudiziaria?: string // Solo per GIUDIZIALE
  rg?: string // Solo per GIUDIZIALE
  giudice?: string // Solo per GIUDIZIALE
  note?: string
  stato: 'todo' | 'done'
  priorita: number
  created_at?: string
  updated_at?: string
}

// Interfaccia per il form di creazione pratica
export interface PracticeFormData {
  numero: string
  cliente_id: string
  controparti_ids: string[]
  tipo_procedura: ProcedureType
}

// Interfaccia per il form di creazione attività
export interface ActivityFormData {
  pratica_id: string
  categoria: ActivityCategory
  attivita: string
  data: string
  ora: string
  autorita_giudiziaria: string
  rg: string
  giudice: string
  note: string
  priorita: number
}

// Interfaccia per la risposta dell'API pratiche
export interface PracticeResponse {
  success: boolean
  data?: Practice
  error?: string
}

// Interfaccia per la lista delle pratiche
export interface PracticeListResponse {
  success: boolean
  data?: Practice[]
  error?: string
  total?: number
}

// Interfaccia per la risposta dell'API attività
export interface ActivityResponse {
  success: boolean
  data?: Activity
  error?: string
}

// Interfaccia per la lista delle attività
export interface ActivityListResponse {
  success: boolean
  data?: Activity[]
  error?: string
  total?: number
}
