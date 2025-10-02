import { supabase } from './supabase'

// Simple seeded random generator for deterministic demo data per user
function seededRandom(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

const firstNames = ['Mario', 'Giulia', 'Luca', 'Anna', 'Francesco', 'Elisa', 'Alessandro', 'Francesca']
const lastNames = ['Rossi', 'Bianchi', 'Verdi', 'Neri', 'Gialli', 'Esposito', 'Ferrari', 'Ricci']
const companies = ['ACME S.r.l.', 'TECHNOLOGY S.p.A.', 'ALFA S.r.l.', 'BETA Consulting S.r.l.', 'OMEGA S.p.A.']
const enti = ['Comune di Roma', 'Regione Abruzzo', 'Comune di Milano', 'ASL Roma 1']
const cities = ['Roma', 'Milano', 'Torino', 'Firenze', 'Napoli', "L'Aquila"]
const provinces = ['RM', 'MI', 'TO', 'FI', 'NA', 'AQ']
const categories = ['Udienza', 'Scadenza', 'Scadenza Processuale', 'Appuntamento', 'Attività da Svolgere']

function pick<T>(rand: () => number, arr: T[]): T { return arr[Math.floor(rand() * arr.length)] }

export async function populateDemoData(userId: string, email: string) {
  try {
    console.log(`=== DEMO DATA POPULATION START ===`)
    console.log(`User ID: ${userId}`)
    console.log(`Email: ${email}`)
    console.log(`Timestamp: ${new Date().toISOString()}`)
    
    const seed = Array.from(email).reduce((a, c) => a + c.charCodeAt(0), 0)
    const rand = seededRandom(seed || Date.now())
    console.log(`Seed: ${seed}`)

    // Clear existing data (in correct FK order)
    console.log('Clearing existing data...')
    const { error: delActivities } = await supabase.from('activities').delete().eq('user_id', userId)
    const { error: delPractices } = await supabase.from('practices').delete().eq('user_id', userId)
    const { error: delClients } = await supabase.from('clients').delete().eq('user_id', userId)
    
    if (delActivities) console.error('Error deleting activities:', delActivities)
    if (delPractices) console.error('Error deleting practices:', delPractices)
    if (delClients) console.error('Error deleting clients:', delClients)

    // Build demo clients: 6-10
    const numClients = 8
    const clientPayloads: any[] = []
    for (let i = 0; i < numClients; i++) {
      const isPF = rand() < 0.45
      const isPG = !isPF && rand() < 0.7
      const isEnte = !isPF && !isPG && rand() < 0.5
      const tipologia = isPF ? 'Persona fisica' : isPG ? 'Persona Giuridica' : isEnte ? 'Altro ente' : 'Ditta Individuale'
      const nome = isPF ? pick(rand, firstNames) : undefined
      const cognome = isPF ? pick(rand, lastNames) : undefined
      const ragione = !isPF ? (isPG ? pick(rand, companies) : pick(rand, enti)) : `${nome} ${cognome}`
      const partita_iva = !isPF ? String(Math.floor(1e10 + rand() * 9e10)) : null
      const indirizzi = [{ tipo: isPF ? 'RESIDENZA' : 'SEDE', via: `Via ${pick(rand, lastNames)} ${Math.floor(rand()*200)+1}`, citta: pick(rand, cities), cap: String(10000 + Math.floor(rand()*90000)), provincia: pick(rand, provinces) }]
      const contatti = [{ tipo: 'TELEFONO', valore: `+39 ${Math.floor(100000000 + rand()*899999999)}` }, { tipo: 'EMAIL', valore: `demo${i+1}@example.com` }]
      clientPayloads.push({
        user_id: userId,
        tipologia,
        ragione,
        nome,
        cognome,
        partita_iva,
        indirizzi,
        contatti,
        note: 'Dati dimostrativi'
      })
    }

        console.log('Inserting clients...', clientPayloads.length)
        console.log('Client payloads:', JSON.stringify(clientPayloads.slice(0, 2), null, 2)) // Log first 2 for debugging
        
        const { data: insertedClients, error: clientsError } = await supabase
          .from('clients')
          .insert(clientPayloads)
          .select('*')

        if (clientsError) {
          console.error('=== CLIENT INSERTION ERROR ===')
          console.error('Error inserting clients:', clientsError)
          console.error('Error details:', JSON.stringify(clientsError, null, 2))
          return false
        }
        console.log('Clients inserted successfully:', insertedClients?.length)

    // Practices: 6
    const clientList = insertedClients || []
    const practicePayloads: any[] = []
    for (let i = 0; i < 6; i++) {
      const cliente = pick(rand, clientList.filter(c => c.cliente !== false) || clientList)
      const contropartiCandidates = clientList.filter(c => c.controparte === true && c.id !== cliente.id)
      const controparti_ids = contropartiCandidates.slice(0, Math.floor(rand()*3)).map(c => ({ id: c.id, ragione: c.ragione || `${c.nome || ''} ${c.cognome || ''}`.trim() }))
      const tipo_procedura = rand() < 0.5 ? 'GIUDIZIALE' : 'STRAGIUDIZIALE'
      const numero = `2025/${String(i+1).padStart(3, '0')}`
      practicePayloads.push({ user_id: userId, numero, cliente_id: cliente.id, controparti_ids, tipo_procedura })
    }

    console.log('Inserting practices...', practicePayloads.length)
    const { data: insertedPractices, error: practicesError } = await supabase
      .from('practices')
      .insert(practicePayloads)
      .select('*')

    if (practicesError) {
      console.error('Error inserting practices:', practicesError)
      return false
    }
    console.log('Practices inserted:', insertedPractices?.length)

    // Activities: 12-18 spread over past/future
    const practiceList = insertedPractices || []
    const activityPayloads: any[] = []
    const numActivities = 15
    for (let i = 0; i < numActivities; i++) {
      const pratica = pick(rand, practiceList)
      const categoria = pick(rand, categories)
      const offsetDays = Math.floor(rand()*20) - 5 // from -5 to +14 days
      const date = new Date()
      date.setDate(date.getDate() + offsetDays)
      const data = date.toISOString().split('T')[0]
      const ora = `${String(8 + Math.floor(rand()*9)).padStart(2,'0')}:${rand() < 0.5 ? '00' : '30'}`
      const giudiziale = pratica.tipo_procedura === 'GIUDIZIALE'
      activityPayloads.push({
        user_id: userId,
        pratica_id: pratica.id,
        categoria,
        attivita: categoria === 'Udienza' ? 'Udienza' : categoria === 'Scadenza' ? 'Scadenza' : categoria,
        data,
        ora,
        autorita_giudiziaria: giudiziale ? 'Tribunale di Roma' : null,
        rg: giudiziale ? `RG ${Math.floor(1000 + rand()*9000)}/2025` : null,
        giudice: giudiziale ? 'Dott. Rossi' : null,
        note: 'Demo',
        stato: rand() < 0.2 ? 'done' : 'todo',
        priorita: 5 + Math.floor(rand()*6)
      })
    }

    console.log('Inserting activities...', activityPayloads.length)
    const { error: activitiesError } = await supabase
      .from('activities')
      .insert(activityPayloads)

    if (activitiesError) {
      console.error('Error inserting activities:', activitiesError)
      return false
    }
    console.log('Activities inserted successfully')

    console.log(`=== DEMO DATA POPULATION COMPLETE ===`)
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
    console.log('Demo data cleared successfully')
    return true
  } catch (error) {
    console.error('Error clearing demo data:', error)
    return false
  }
}
