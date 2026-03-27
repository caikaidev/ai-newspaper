import { redirect } from 'next/navigation'
import { listEditions } from '@/lib/editions'
import { getRequestLang } from '@/lib/i18n'
import OnboardingPage from '@/components/OnboardingPage'

export const revalidate = 0

export default function SkillsRootPage() {
  const editions = listEditions()
  const lang = getRequestLang()

  if (editions.length === 0) {
    return <OnboardingPage lang={lang} />
  }

  redirect(`/skills/${editions[0]}`)
}
