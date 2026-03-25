import { redirect } from 'next/navigation'
import { listEditions } from '@/lib/editions'
import OnboardingPage from '@/components/OnboardingPage'

// Always serve the latest redirect fresh
export const revalidate = 0

export default function RootPage() {
  const editions = listEditions()

  if (editions.length === 0) {
    return <OnboardingPage />
  }

  redirect(`/${editions[0]}`)
}
