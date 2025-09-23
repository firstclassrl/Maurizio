// Tipologie di clienti disponibili nel sistema
export const CLIENT_TYPES = [
  'Non specificata',
  'Associazione',
  'Comitato',
  'Condominio',
  'Consorzio',
  'Cooperativa',
  'Ditta individuale',
  'Ente pubblico',
  'Ente religioso',
  'Enti di gestione',
  'Istituto di Credito',
  'Organizzazione o stato estero',
  'Partito o sindacato',
  'Persona fisica',
  'Persona giuridica',
  'Pubblica amministrazione',
  'Pubblico Ministero',
  'Società',
  'Società di persone'
] as const

export type ClientType = typeof CLIENT_TYPES[number]

// Titoli disponibili per le persone fisiche
export const TITLES = [
  { value: '', label: '-' },
  { value: 'Dott.', label: 'Dott.' },
  { value: 'Dott.ssa', label: 'Dott.ssa' },
  { value: 'Avv.', label: 'Avv.' },
  { value: 'Avv.ssa', label: 'Avv.ssa' },
  { value: 'Prof.', label: 'Prof.' },
  { value: 'Prof.ssa', label: 'Prof.ssa' },
  { value: 'Ing.', label: 'Ing.' },
  { value: 'Arch.', label: 'Arch.' },
  { value: 'Rag.', label: 'Rag.' },
  { value: 'Sig.', label: 'Sig.' },
  { value: 'Sig.ra', label: 'Sig.ra' },
  { value: 'Sig.na', label: 'Sig.na' }
] as const

// Opzioni per il sesso
export const GENDER_OPTIONS = [
  { value: 'M', label: 'M' },
  { value: 'F', label: 'F' },
  { value: 'Altro', label: 'Altro' }
] as const

// Tipi di contatto
export const CONTACT_TYPES = [
  'Email',
  'Telefono',
  'Fax',
  'Email PEC',
  'Cellulare',
  'Sito Web',
  'Altro'
] as const

export type ContactType = typeof CONTACT_TYPES[number]
