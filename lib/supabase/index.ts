import { createClient, isClientConfigured } from './client'

// Re-export createClient() result directly.
// client.ts already manages a singleton internally so this is safe.
export const supabase = createClient()

// Re-export with the name used by lib/api/bewertungen.ts
export const isSupabaseConfigured = isClientConfigured
