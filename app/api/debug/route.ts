import { NextResponse } from "next/server"

export async function GET() {
  const env = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV,
    urlStart: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30),
  }

  return NextResponse.json({
    environment: env,
    timestamp: new Date().toISOString(),
  })
}