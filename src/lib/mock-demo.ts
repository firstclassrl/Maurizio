// Shared inline mock data used as fallback across desktop and mobile

export type MockClient = {
  id: string
  tipologia: 'Persona fisica' | 'Ditta Individuale' | 'Persona Giuridica' | 'Altro ente'
  nome?: string
  cognome?: string
  ragione?: string
  codice_fiscale?: string
  partita_iva?: string
  telefono?: string
  email?: string
  citta?: string
  provincia?: string
  cliente: boolean
  controparte: boolean
  indirizzi?: any[]
  contatti?: any[]
}

export const MOCK_CLIENTS: MockClient[] = [
  { id: 'c1', tipologia: 'Persona fisica', nome: 'Mario', cognome: 'Rossi', codice_fiscale: 'RSSMRA80A01H501Z', telefono: '+39 333 1234567', email: 'mario.rossi@example.com', citta: 'Roma', provincia: 'RM', cliente: true, controparte: false,
    indirizzi: [{ tipo: 'RESIDENZA', via: 'Via Roma 10', citta: 'Roma', cap: '00100', provincia: 'RM' }],
    contatti: [{ tipo: 'TELEFONO', valore: '+39 333 1234567' }, { tipo: 'EMAIL', valore: 'mario.rossi@example.com' }] },
  { id: 'c2', tipologia: 'Persona Giuridica', ragione: 'Alfa S.p.A.', partita_iva: '01234567890', email: 'legale@alfaspa.it', citta: 'Milano', provincia: 'MI', cliente: false, controparte: true,
    indirizzi: [{ tipo: 'SEDE', via: 'Corso Italia 25', citta: 'Milano', cap: '20100', provincia: 'MI' }],
    contatti: [{ tipo: 'EMAIL', valore: 'legale@alfaspa.it' }] },
  { id: 'c3', tipologia: 'Persona Giuridica', ragione: 'Beta S.r.l.', partita_iva: '09876543210', email: 'amministrazione@betasrl.it', citta: 'Pescara', provincia: 'PE', cliente: true, controparte: false,
    indirizzi: [{ tipo: 'SEDE', via: 'Via Garibaldi 5', citta: 'Pescara', cap: '65100', provincia: 'PE' }],
    contatti: [{ tipo: 'EMAIL', valore: 'amministrazione@betasrl.it' }] },
  { id: 'c4', tipologia: 'Persona fisica', nome: 'Lucia', cognome: 'Bianchi', codice_fiscale: 'BNCLCU75B41H501X', telefono: '+39 366 9876543', email: 'lucia.bianchi@example.com', citta: 'Torino', provincia: 'TO', cliente: false, controparte: true,
    indirizzi: [{ tipo: 'RESIDENZA', via: 'Via Torino 15', citta: 'Torino', cap: '10100', provincia: 'TO' }],
    contatti: [{ tipo: 'TELEFONO', valore: '+39 366 9876543' }, { tipo: 'EMAIL', valore: 'lucia.bianchi@example.com' }] },
  { id: 'c5', tipologia: 'Altro ente', ragione: 'Comune di Pescara', email: 'protocollo@comune.pescara.it', citta: 'Pescara', provincia: 'PE', cliente: true, controparte: false,
    indirizzi: [{ tipo: 'SEDE', via: 'Piazza Italia 1', citta: 'Pescara', cap: '65121', provincia: 'PE' }],
    contatti: [{ tipo: 'EMAIL', valore: 'protocollo@comune.pescara.it' }] },
  { id: 'c6', tipologia: 'Persona Giuridica', ragione: 'Gamma S.c.a.r.l.', partita_iva: '11223344550', email: 'info@gammascarll.it', citta: 'Firenze', provincia: 'FI', cliente: false, controparte: true,
    indirizzi: [{ tipo: 'SEDE', via: 'Via Firenze 8', citta: 'Firenze', cap: '50100', provincia: 'FI' }],
    contatti: [{ tipo: 'EMAIL', valore: 'info@gammascarll.it' }] }
]

export type MockPractice = {
  id: string
  numero: string
  tipo_procedura: 'GIUDIZIALE' | 'STRAGIUDIZIALE'
  cliente_id: string
  controparti_ids: string[]
  autorita_giudiziaria?: string
  rg?: string
  giudice?: string
}

export const MOCK_PRACTICES: MockPractice[] = [
  { id: 'p1', numero: '2025/001', tipo_procedura: 'GIUDIZIALE', cliente_id: 'c1', controparti_ids: ['c2'], autorita_giudiziaria: 'Tribunale di Roma', rg: '12345/2025', giudice: 'Dott. Bianchi' },
  { id: 'p2', numero: '2025/002', tipo_procedura: 'STRAGIUDIZIALE', cliente_id: 'c3', controparti_ids: ['c4'] },
  { id: 'p3', numero: '2025/003', tipo_procedura: 'STRAGIUDIZIALE', cliente_id: 'c5', controparti_ids: ['c6'] }
]

export type MockActivity = {
  id: string
  pratica_id: string
  attivita: string
  categoria: string
  data: string
  ora: string
  stato: 'todo' | 'done'
  urgent?: boolean
  note?: string
}

const today = new Date()
const iso = (d: Date) => d.toISOString().split('T')[0]

export const MOCK_ACTIVITIES: MockActivity[] = [
  { id: 'a1', pratica_id: 'p1', attivita: 'Deposito ricorso', categoria: 'Scadenza Processuale', data: iso(today), ora: '10:00', stato: 'todo', urgent: true, note: 'Predisporre atti e allegati' },
  { id: 'a2', pratica_id: 'p2', attivita: 'Udienza di comparizione', categoria: 'Udienza', data: iso(new Date(today.getTime() + 86400000)), ora: '09:30', stato: 'todo' },
  { id: 'a3', pratica_id: 'p3', attivita: 'Telefonata con cliente', categoria: 'Attività da Svolgere', data: iso(new Date(today.getTime() + 2*86400000)), ora: '15:00', stato: 'todo' }
]

export function getClientNameById(id: string): string | null {
  const c = MOCK_CLIENTS.find(x => x.id === id)
  if (!c) return null
  if (c.ragione) return c.ragione
  const full = `${c.nome || ''} ${c.cognome || ''}`.trim()
  return full || null
}

export function getPracticeById(id: string) {
  return MOCK_PRACTICES.find(p => p.id === id)
}


