import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create a mock client if environment variables are not set
const createMockClient = () => ({
  from: () => ({
    select: () => ({ data: [], error: { message: "Supabase not configured - missing environment variables" } }),
    insert: () => ({ data: null, error: { message: "Supabase not configured - missing environment variables" } }),
    update: () => ({ data: null, error: { message: "Supabase not configured - missing environment variables" } }),
    delete: () => ({ data: null, error: { message: "Supabase not configured - missing environment variables" } }),
    upsert: () => ({ data: null, error: { message: "Supabase not configured - missing environment variables" } }),
  }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  }
} as any)

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : createMockClient()