import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Skip auth if Supabase is not configured
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not write any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make your app slow
  // or unresponsive to users.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define protected routes
  const protectedRoutes = ['/portal', '/vergleich']
  const authRoutes = ['/login', '/register']
  const pathname = request.nextUrl.pathname

  // If user is not logged in and trying to access protected route
  if (!user && protectedRoutes.some(route => pathname.startsWith(route))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // If user is logged in and trying to access auth routes, send to portal
  if (user && authRoutes.some(route => pathname.startsWith(route))) {
    const url = request.nextUrl.clone()
    url.pathname = '/portal'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as is.
  return supabaseResponse
}
