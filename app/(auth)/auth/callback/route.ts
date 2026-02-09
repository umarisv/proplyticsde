import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/portal'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successful authentication - redirect to confirm page or next
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}/auth/confirm?next=${encodeURIComponent(next)}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}/auth/confirm?next=${encodeURIComponent(next)}`)
      } else {
        return NextResponse.redirect(`${origin}/auth/confirm?next=${encodeURIComponent(next)}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
