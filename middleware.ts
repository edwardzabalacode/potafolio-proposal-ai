import { NextRequest, NextResponse } from 'next/server'

// Define protected admin routes
const adminRoutes = ['/admin']

// Define public auth routes (no protection needed, handled by components)
const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is an admin route
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  // For admin routes, we add security headers and let AuthGuard components
  // handle the actual authentication logic since Firebase Auth is client-side
  if (isAdminRoute) {
    const response = NextResponse.next()

    // Add security headers for admin routes
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    )

    return response
  }

  // For auth routes, add cache control headers
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  if (isAuthRoute) {
    const response = NextResponse.next()

    // Prevent caching of auth pages
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
  }

  // For all other routes, continue normally
  return NextResponse.next()
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
