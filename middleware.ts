import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // List of valid routes
  const validRoutes = [
    '/',
    '/6754382-thdbsa-637239/admin',
    '/6754382-thdbsa-637239/admin/login',
    '/8726-nalyswej/analytics',
    '/8726-nalyswej/analytics/login',
    '/toast-test',
    '/loaderio-330c2327e022e5e0b9176a70b78a1487.txt',
  ]

  // Check if the current path is valid or starts with a valid route
  const isValidRoute = validRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // If it's not a valid route and not a static file, redirect to home
  if (!isValidRoute && !pathname.startsWith('/_next') && !pathname.startsWith('/api') && !pathname.includes('.')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
