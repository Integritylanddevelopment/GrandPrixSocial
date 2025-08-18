import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}
