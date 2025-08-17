import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

let serverClient: SupabaseClient | null = null

export function getSupabaseServer(): SupabaseClient {
  if (serverClient) return serverClient
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase server client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env')
  }
  serverClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  return serverClient
}
