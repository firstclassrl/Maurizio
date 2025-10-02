import { supabase } from './supabase'

export interface DemoClient {
  tipologia: 'Persona fisica' | 'Ditta Individuale' | 'Persona Giuridica' | 'Altro ente'
  denominazione?: string
  nome?: string
  cognome?: string
  codice_fiscale?: string
  partita_iva?: string
  indirizzi: any[]
  contatti: any[]
  note?: string
  cliente?: boolean
  controparte?: boolean
  altri?: boolean
}

export interface DemoPractice {
  numero: string
  cliente_id: string
  controparti_ids: string[]
  tipo_procedura: 'STRAGIUDIZIALE' | 'GIUDIZIALE'
  autorita_giudiziaria?: string
  rg?: string
  giudice?: string
}

export interface DemoActivity {
  pratica_id: string
  categoria: string
  attivita: string
  data: string
  ora?: string
  autorita_giudiziaria?: string
  rg?: string
  giudice?: string
  note?: string
  stato: 'todo' | 'done'
  priorita: number
}

export const demoData = {
  demo1: {
    clients: [
      {
        tipologia: 'Persona fisica' as const,
        nome: 'Mario',
        cognome: 'Rossi',
        codice_fiscale: 'RSSMRA80E15H501Z',
        indirizzi: [{
          tipo: 'RESIDENZA',
          via: 'Via Roma 123',
          citta: 'Roma',
          cap: '00100',
          provincia: 'RM'
        }],
        contatti: [
          { tipo: 'TELEFONO', valore: '+39 333 1234567' },
          { tipo: 'EMAIL', valore: 'mario.rossi@email.com' }
        ],
        note: 'Cliente storico con molte pratiche',
        cliente: true
      },
      {
        tipologia: 'Ditta Individuale' as const,
        nome: 'Giulia',
        cognome: 'Bianchi',
        codice_fiscale: 'BNCGLA75C52F205X',
        partita_iva: '12345678901',
        indirizzi: [{
          tipo: 'SEDE',
          via: 'Corso Italia 45',
          citta: 'Milano',
          cap: '20100',
          provincia: 'MI'
        }],
        contatti: [
          { tipo: 'TELEFONO', valore: '+39 02 1234567' },
          { tipo: 'EMAIL', valore: 'giulia.bianchi@studio.it' }
        ],
        note: 'Avvocato specializzata in diritto civile',
        cliente: true
      },
      {
        tipologia: 'Persona Giuridica' as const,
        denominazione: 'ACME S.r.l.',
        partita_iva: '09876543210',
        indirizzi: [{
          tipo: 'SEDE',
          via: 'Via del Commercio 789',
          citta: 'Torino',
          cap: '10100',
          provincia: 'TO'
        }],
        contatti: [
          { tipo: 'TELEFONO', valore: '+39 011 9876543' },
          { tipo: 'EMAIL', valore: 'info@acme.it' }
        ],
        note: 'Società di consulenza aziendale',
        cliente: true
      },
      {
        tipologia: 'Altro ente' as const,
        denominazione: 'Comune di Roma',
        indirizzi: [{
          tipo: 'SEDE',
          via: 'Campidoglio 1',
          citta: 'Roma',
          cap: '00186',
          provincia: 'RM'
        }],
        contatti: [
          { tipo: 'TELEFONO', valore: '+39 06 0606' },
          { tipo: 'EMAIL', valore: 'protocollo@comune.roma.it' }
        ],
        note: 'Ente pubblico locale',
        controparte: true
      }
    ],
    practices: [
      {
        numero: '2025/001',
        cliente_id: '', // Will be filled after client creation
        controparti_ids: [],
        tipo_procedura: 'GIUDIZIALE' as const,
        autorita_giudiziaria: 'Tribunale di Roma',
        rg: 'RG 1234/2025',
        giudice: 'Dott. Rossi'
      },
      {
        numero: '2025/002',
        cliente_id: '',
        controparti_ids: [],
        tipo_procedura: 'STRAGIUDIZIALE' as const
      },
      {
        numero: '2025/003',
        cliente_id: '',
        controparti_ids: [],
        tipo_procedura: 'GIUDIZIALE' as const,
        autorita_giudiziaria: 'Tribunale di Torino',
        rg: 'RG 5678/2025',
        giudice: 'Dott.ssa Bianchi'
      }
    ],
    activities: [
      {
        pratica_id: '',
        categoria: 'Udienza',
        attivita: 'Prima udienza di comparizione',
        data: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ora: '09:30',
        autorita_giudiziaria: 'Tribunale di Roma',
        rg: 'RG 1234/2025',
        giudice: 'Dott. Rossi',
        note: 'Udienza preliminare per definire le questioni',
        stato: 'todo' as const,
        priorita: 8
      },
      {
        pratica_id: '',
        categoria: 'Scadenza',
        attivita: 'Scadenza per deposito memoria',
        data: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ora: '17:00',
        note: 'Memoria difensiva da depositare',
        stato: 'todo' as const,
        priorita: 9
      },
      {
        pratica_id: '',
        categoria: 'Appuntamento',
        attivita: 'Incontro con cliente per consulenza',
        data: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ora: '14:00',
        note: 'Discussione strategia negoziale',
        stato: 'todo' as const,
        priorita: 6
      },
      {
        pratica_id: '',
        categoria: 'Scadenza Processuale',
        attivita: 'Scadenza per ricorso',
        data: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ora: '23:59',
        autorita_giudiziaria: 'Tribunale di Torino',
        rg: 'RG 5678/2025',
        giudice: 'Dott.ssa Bianchi',
        note: 'Ricorso contro provvedimento comunale',
        stato: 'todo' as const,
        priorita: 10
      },
      {
        pratica_id: '',
        categoria: 'Attività da Svolgere',
        attivita: 'Redazione contratto',
        data: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ora: '10:00',
        note: 'Contratto di fornitura servizi',
        stato: 'todo' as const,
        priorita: 7
      }
    ]
  },
  demo2: {
    clients: [
      {
        tipologia: 'Persona fisica' as const,
        nome: 'Alessandro',
        cognome: 'Verdi',
        codice_fiscale: 'VRDLSN85M10D612Y',
        indirizzi: [{
          tipo: 'RESIDENZA',
          via: 'Via Firenze 456',
          citta: 'Firenze',
          cap: '50100',
          provincia: 'FI'
        }],
        contatti: [
          { tipo: 'TELEFONO', valore: '+39 055 1234567' },
          { tipo: 'EMAIL', valore: 'alessandro.verdi@studio.it' }
        ],
        note: 'Avvocato penalista',
        cliente: true
      },
      {
        tipologia: 'Persona Giuridica' as const,
        denominazione: 'TECHNOLOGY S.p.A.',
        partita_iva: '11223344556',
        indirizzi: [{
          tipo: 'SEDE',
          via: 'Via della Tecnologia 999',
          citta: 'Milano',
          cap: '20100',
          provincia: 'MI'
        }],
        contatti: [
          { tipo: 'TELEFONO', valore: '+39 02 9999999' },
          { tipo: 'EMAIL', valore: 'legal@technology.it' }
        ],
        note: 'Società tecnologica in espansione',
        cliente: true
      }
    ],
    practices: [
      {
        numero: '2025/005',
        cliente_id: '',
        controparti_ids: [],
        tipo_procedura: 'GIUDIZIALE' as const,
        autorita_giudiziaria: 'Tribunale di Firenze',
        rg: 'RG 9012/2025',
        giudice: 'Dott.ssa Neri'
      },
      {
        numero: '2025/006',
        cliente_id: '',
        controparti_ids: [],
        tipo_procedura: 'STRAGIUDIZIALE' as const
      }
    ],
    activities: [
      {
        pratica_id: '',
        categoria: 'Udienza',
        attivita: 'Udienza preliminare',
        data: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ora: '11:00',
        autorita_giudiziaria: 'Tribunale di Firenze',
        rg: 'RG 9012/2025',
        giudice: 'Dott.ssa Neri',
        note: 'Verifica ammissibilità ricorso',
        stato: 'todo' as const,
        priorita: 9
      },
      {
        pratica_id: '',
        categoria: 'Appuntamento',
        attivita: 'Consulenza aziendale',
        data: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ora: '16:00',
        note: 'Revisione contratti IT',
        stato: 'todo' as const,
        priorita: 7
      }
    ]
  },
  demo3: {
    clients: [
      {
        tipologia: 'Persona fisica' as const,
        nome: 'Francesca',
        cognome: 'Neri',
        codice_fiscale: 'NRIFNC90T43F839X',
        indirizzi: [{
          tipo: 'RESIDENZA',
          via: 'Via Napoli 789',
          citta: 'Napoli',
          cap: '80100',
          provincia: 'NA'
        }],
        contatti: [
          { tipo: 'TELEFONO', valore: '+39 081 9876543' },
          { tipo: 'EMAIL', valore: 'francesca.neri@email.com' }
        ],
        note: 'Imprenditrice nel settore moda',
        cliente: true
      },
      {
        tipologia: 'Altro ente' as const,
        denominazione: 'Regione Abruzzo',
        indirizzi: [{
          tipo: 'SEDE',
          via: 'Via XXIV Maggio',
          citta: "L'Aquila",
          cap: '67100',
          provincia: 'AQ'
        }],
        contatti: [
          { tipo: 'TELEFONO', valore: '+39 0862 345678' },
          { tipo: 'EMAIL', valore: 'protocollo@regione.abruzzo.it' }
        ],
        note: 'Amministrazione regionale',
        controparte: true
      }
    ],
    practices: [
      {
        numero: '2025/007',
        cliente_id: '',
        controparti_ids: [],
        tipo_procedura: 'STRAGIUDIZIALE' as const
      },
      {
        numero: '2025/008',
        cliente_id: '',
        controparti_ids: [],
        tipo_procedura: 'GIUDIZIALE' as const,
        autorita_giudiziaria: 'TAR Abruzzo',
        rg: 'RG 3456/2025',
        giudice: 'Dott. Bianchi'
      }
    ],
    activities: [
      {
        pratica_id: '',
        categoria: 'Appuntamento',
        attivita: 'Consulenza commerciale',
        data: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ora: '10:30',
        note: 'Supporto per nuova attività',
        stato: 'todo' as const,
        priorita: 7
      },
      {
        pratica_id: '',
        categoria: 'Udienza',
        attivita: 'Udienza TAR',
        data: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ora: '09:00',
        autorita_giudiziaria: 'TAR Abruzzo',
        rg: 'RG 3456/2025',
        giudice: 'Dott. Bianchi',
        note: 'Ricorso contro provvedimento regionale',
        stato: 'todo' as const,
        priorita: 9
      }
    ]
  }
}

export async function populateDemoData(userId: string, email: string) {
  try {
    console.log(`Populating demo data for ${email}...`)

    // Determine which demo data to use
    const demoKey = email.includes('demo1') ? 'demo1' : email.includes('demo2') ? 'demo2' : 'demo3'
    const data = demoData[demoKey as keyof typeof demoData]

    if (!data) {
      console.error('No demo data found for', email)
      return
    }

    // Clear existing data
    await supabase.from('activities').delete().eq('user_id', userId)
    await supabase.from('practices').delete().eq('user_id', userId)
    await supabase.from('clients').delete().eq('user_id', userId)
    await supabase.from('tasks').delete().eq('user_id', userId)

    // Insert clients
    const clientResults = []
    for (const clientData of data.clients) {
      const { data: client, error } = await supabase
        .from('clients')
        .insert({
          user_id: userId,
          tipologia: clientData.tipologia,
          denominazione: clientData.denominazione,
          nome: clientData.nome,
          cognome: clientData.cognome,
          codice_fiscale: clientData.codice_fiscale,
          partita_iva: clientData.partita_iva,
          indirizzi: clientData.indirizzi,
          contatti: clientData.contatti,
          note: clientData.note,
          cliente: clientData.cliente,
          controparte: clientData.controparte,
          altri: clientData.altri
        })
        .select()
        .single()

      if (error) {
        console.error('Error inserting client:', error)
        continue
      }

      clientResults.push(client)
    }

    // Insert practices
    const practiceResults = []
    for (let i = 0; i < data.practices.length; i++) {
      const practiceData = data.practices[i]
      const clientIndex = i < clientResults.length ? i : 0
      
      const { data: practice, error } = await supabase
        .from('practices')
        .insert({
          user_id: userId,
          numero: practiceData.numero,
          cliente_id: clientResults[clientIndex]?.id || '',
          controparti_ids: practiceData.controparti_ids,
          tipo_procedura: practiceData.tipo_procedura,
          autorita_giudiziaria: practiceData.autorita_giudiziaria,
          rg: practiceData.rg,
          giudice: practiceData.giudice
        })
        .select()
        .single()

      if (error) {
        console.error('Error inserting practice:', error)
        continue
      }

      practiceResults.push(practice)
    }

    // Insert activities
    for (let i = 0; i < data.activities.length; i++) {
      const activityData = data.activities[i]
      const practiceIndex = i < practiceResults.length ? i : 0
      
      const { error } = await supabase
        .from('activities')
        .insert({
          user_id: userId,
          pratica_id: practiceResults[practiceIndex]?.id || '',
          categoria: activityData.categoria,
          attivita: activityData.attivita,
          data: activityData.data,
          ora: activityData.ora,
          autorita_giudiziaria: activityData.autorita_giudiziaria,
          rg: activityData.rg,
          giudice: activityData.giudice,
          note: activityData.note,
          stato: activityData.stato,
          priorita: activityData.priorita
        })

      if (error) {
        console.error('Error inserting activity:', error)
      }
    }

    // Insert some legacy tasks for compatibility
    const legacyTasks = [
      {
        user_id: userId,
        attivita: 'Controllo scadenze mensili',
        pratica: 'Controllo generale',
        scadenza: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ora: '09:00',
        stato: 'todo',
        urgent: true,
        categoria: 'Amministrativa',
        cliente: 'Ufficio',
        controparte: null
      },
      {
        user_id: userId,
        attivita: 'Aggiornamento archivi',
        pratica: 'Amministrazione',
        scadenza: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ora: '14:00',
        stato: 'todo',
        urgent: false,
        categoria: 'Amministrativa',
        cliente: 'Ufficio',
        controparte: null
      },
      {
        user_id: userId,
        attivita: 'Riunione settimanale',
        pratica: 'Staff meeting',
        scadenza: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ora: '10:00',
        stato: 'todo',
        urgent: false,
        categoria: 'Appuntamento',
        cliente: 'Team',
        controparte: null
      }
    ]

    for (const task of legacyTasks) {
      const { error } = await supabase.from('tasks').insert(task)
      if (error) {
        console.error('Error inserting legacy task:', error)
      }
    }

    console.log(`Demo data populated successfully for ${email}`)
    return true
  } catch (error) {
    console.error('Error populating demo data:', error)
    return false
  }
}

export async function clearDemoData(userId: string) {
  try {
    await supabase.from('activities').delete().eq('user_id', userId)
    await supabase.from('practices').delete().eq('user_id', userId)
    await supabase.from('clients').delete().eq('user_id', userId)
    await supabase.from('tasks').delete().eq('user_id', userId)
    console.log('Demo data cleared successfully')
    return true
  } catch (error) {
    console.error('Error clearing demo data:', error)
    return false
  }
}
