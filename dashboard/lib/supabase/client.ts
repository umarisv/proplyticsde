'use client'

import { createBrowserClient, type SupabaseClient } from '@supabase/ssr'
import type { Database } from '../database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let client: SupabaseClient<Database> | null = null

export function createClient(): SupabaseClient<Database> {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy client that will fail gracefully
    // This allows the build to succeed without env vars
    return null as unknown as SupabaseClient<Database>
  }
  
  if (!client) {
    client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  }
  
  return client
}

export function isClientConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}
