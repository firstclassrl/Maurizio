import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

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
          priorita: number
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
          priorita?: number
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
          priorita?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}