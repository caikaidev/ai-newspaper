import type { Metadata } from 'next'
import './globals.css'
import { getRequestLang, t } from '@/lib/i18n'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'The Daily Byte',
  description: 'Daily AI-curated tech headlines in 1920s journalistic prose',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = getRequestLang()
  const m = t(lang)

  return (
    <html lang={lang}>
      <body aria-label={m.newspaperAria}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
