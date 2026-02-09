import { createClient, isClientConfigured } from './client'

// Lazy singleton – avoids creating the Supabase client at module-load time
// which can trigger AbortErrors from the auth token-refresh lock.
let _client: ReturnType<typeof createClient> | null = null

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    if (!_client) _client = createClient()
    return (_client as Record<string | symbol, unknown>)[prop]
  },
})

// Re-export with the name used by lib/api/bewertungen.ts
export const isSupabaseConfigured = isClientConfigured
