import { supabase } from './supabase'

/**
 * Funzione per verificare e creare la tabella tasks se non esiste
 * Questa è una soluzione temporanea per gestire il caso in cui la migrazione non sia stata applicata
 */
export async function ensureTasksTableExists(): Promise<boolean> {
  try {
    console.log('Verificando esistenza tabella tasks...')
    
    // Prova a fare una query semplice sulla tabella tasks
    const { error } = await supabase
      .from('tasks')
      .select('id')
      .limit(1)

    if (error) {
      console.error('Errore accesso tabella tasks:', error)
      
      // Se l'errore indica che la tabella non esiste, proviamo a crearla
      if (error.code === 'PGRST116' || error.message.includes('relation "public.tasks" does not exist')) {
        console.log('Tabella tasks non esiste, tentativo di creazione...')
        return await createTasksTable()
      }
      
      return false
    }

    console.log('Tabella tasks esiste e accessibile')
    return true
  } catch (error) {
    console.error('Errore nella verifica tabella tasks:', error)
    return false
  }
}

/**
 * Crea la tabella tasks usando una query SQL diretta
 */
async function createTasksTable(): Promise<boolean> {
  try {
    console.log('Creazione tabella tasks...')
    
    // Query SQL per creare la tabella tasks
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.tasks (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        pratica TEXT NOT NULL,
        attivita TEXT NOT NULL,
        scadenza DATE NOT NULL,
        ora TIME,
        stato TEXT DEFAULT 'todo' CHECK (stato IN ('todo', 'done')),
        urgent BOOLEAN DEFAULT FALSE,
        note TEXT,
        cliente TEXT,
        controparte TEXT,
        categoria TEXT,
        evaso BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `

    // Esegui la query usando rpc o una funzione personalizzata
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    
    if (error) {
      console.error('Errore creazione tabella tasks:', error)
      return false
    }

    console.log('Tabella tasks creata con successo')
    return true
  } catch (error) {
    console.error('Errore nella creazione tabella tasks:', error)
    return false
  }
}

/**
 * Funzione di fallback che crea la tabella tasks usando un approccio alternativo
 */
export async function createTasksTableFallback(): Promise<boolean> {
  try {
    console.log('Tentativo fallback creazione tabella tasks...')
    
    // Prova a inserire un record di test per forzare la creazione della tabella
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('Utente non autenticato')
      return false
    }

    // Prova a inserire un record temporaneo
    const { error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        pratica: 'TEMP',
        attivita: 'Test',
        scadenza: new Date().toISOString().split('T')[0],
        stato: 'todo'
      })

    if (error) {
      console.error('Errore inserimento test:', error)
      return false
    }

    // Se l'inserimento è riuscito, elimina il record di test
    await supabase
      .from('tasks')
      .delete()
      .eq('pratica', 'TEMP')
      .eq('user_id', user.id)

    console.log('Tabella tasks verificata e funzionante')
    return true
  } catch (error) {
    console.error('Errore nel fallback creazione tabella:', error)
    return false
  }
}
