import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { listEditions } from '@/lib/editions'
import { getRequestLang } from '@/lib/i18n'
import { homeMetadata } from '@/lib/seo'
import OnboardingPage from '@/components/OnboardingPage'

export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const lang = getRequestLang()
  return homeMetadata(lang)
}

export default function RootPage() {
  const editions = listEditions()
  const lang = getRequestLang()

  if (editions.length === 0) {
    return <OnboardingPage lang={lang} />
  }

  redirect(`/${editions[0]}`)
}
