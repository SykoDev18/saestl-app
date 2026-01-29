import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build time, return a mock client that won't be used
    // This prevents prerender errors
    throw new Error('Supabase environment variables are not set')
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
