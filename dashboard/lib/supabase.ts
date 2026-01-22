import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only create client if configured
let supabaseClient: SupabaseClient<Database> | null = null

export const supabase: SupabaseClient<Database> = (() => {
  if (supabaseUrl && supabaseAnonKey) {
    if (!supabaseClient) {
      supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey)
    }
    return supabaseClient
  }
  // Return a dummy client that will be checked by isSupabaseConfigured
  return null as unknown as SupabaseClient<Database>
})()

// Helper function to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}
