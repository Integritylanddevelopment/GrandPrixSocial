import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Temporarily bypass Supabase middleware to fix Edge Runtime compatibility issues
  // This allows the app to build successfully while we work on proper Edge Runtime support
  return NextResponse.next({
    request,
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
