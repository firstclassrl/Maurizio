import { createClient } from '@supabase/supabase-js'


// Usa sempre i valori hardcoded validi per evitare problemi con env
const supabaseUrl = 'https://xehvemqogsznmxgfemeu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaHZlbXFvZ3N6bm14Z2ZlbWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNzUyNzAsImV4cCI6MjA3Mzg1MTI3MH0.Y7vRtXVbU3fb_spwd7Nh6T_ppUK_wkTTLvN63dZpV7A'

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