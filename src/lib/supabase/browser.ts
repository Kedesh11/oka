import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

let client: SupabaseClient | null = null

export function getSupabaseBrowser(): SupabaseClient {
  if (client) return client
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Supabase browser client requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in env')
    }
  client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
  return client
}
