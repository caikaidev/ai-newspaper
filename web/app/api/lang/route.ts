import { NextRequest, NextResponse } from 'next/server'
import { LANG_COOKIE, normalizeLang } from '@/lib/i18n'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const lang = normalizeLang(url.searchParams.get('lang')) ?? 'en'
  const redirectTo = url.searchParams.get('redirect') || '/'
  const safeRedirect = redirectTo.startsWith('/') ? redirectTo : '/'

  const response = NextResponse.redirect(new URL(safeRedirect, url.origin))
  response.cookies.set(LANG_COOKIE, lang, {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  })

  return response
}
