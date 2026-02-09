import { createClient, isClientConfigured } from './client'

// Singleton client instance for use in client-side API modules
export const supabase = createClient()

// Re-export with the name used by lib/api/bewertungen.ts
export const isSupabaseConfigured = isClientConfigured
