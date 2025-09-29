import { createClient } from '@supabase/supabase-js'

function getEnv(name: string): string | undefined {
  try {
    const v = (import.meta as any)?.env?.[name]
    return typeof v === 'string' ? v : undefined
  } catch {
    return undefined
  }
}

function isValidHttpUrl(v?: string): v is string {
  return !!v && (v.startsWith('http://') || v.startsWith('https://'))
}

// Valori di default (progetto attuale)
const DEFAULT_URL = 'https://xehvemqogsznmxgfemeu.supabase.co'
const DEFAULT_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaHZlbXFvZ3N6bm14Z2ZlbWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNzUyNzAsImV4cCI6MjA3Mzg1MTI3MH0.Y7vRtXVbU3fb_spwd7Nh6T_ppUK_wkTTLvN63dZpV7A'

// Prendi dalle env solo se valide, altrimenti fallback ai default
const envUrl = getEnv('VITE_SUPABASE_URL')
const envAnon = getEnv('VITE_SUPABASE_ANON_KEY')

const supabaseUrl = isValidHttpUrl(envUrl) ? envUrl : DEFAULT_URL
const supabaseAnonKey = typeof envAnon === 'string' && envAnon.length > 20 ? envAnon : DEFAULT_ANON

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          pratica: string
          attivita: string
          scadenza: string
          stato: 'todo' | 'done'
          urgent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pratica: string
          attivita: string
          scadenza: string
          stato?: 'todo' | 'done'
          urgent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pratica?: string
          attivita?: string
          scadenza?: string
          stato?: 'todo' | 'done'
          urgent?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}