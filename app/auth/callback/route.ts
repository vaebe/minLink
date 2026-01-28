
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function getSafeNext(nextParam: string | null) {
  if (!nextParam) return '/'
  if (!nextParam.startsWith('/')) return '/'
  if (nextParam.startsWith('//')) return '/'
  if (nextParam.includes('\\')) return '/'
  if (nextParam.includes('://')) return '/'
  return nextParam
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = getSafeNext(searchParams.get('next'))

  if (code) {
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'
    const redirectUrl =
      !isLocalEnv && forwardedHost ? `https://${forwardedHost}${next}` : `${origin}${next}`

    const response = NextResponse.redirect(redirectUrl)
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return response
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
