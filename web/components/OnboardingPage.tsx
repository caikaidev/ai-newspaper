import type { AppLang } from '@/lib/i18n'
import { t } from '@/lib/i18n'
import Masthead from './Masthead'

interface OnboardingPageProps {
  lang: AppLang
}

export default function OnboardingPage({ lang }: OnboardingPageProps) {
  const m = t(lang)

  return (
    <main className="newspaper" aria-label={m.setupRequiredAria}>
      <a className="sr-only" href="#main-content">{m.skipToMain}</a>
      <Masthead lang={lang} redirectTo="/" />
      <hr className="rule rule--thick" />
      <div className="onboarding" id="main-content">
        <p className="onboarding__vol">{m.inauguralPending}</p>
        <h2 className="onboarding__headline">{m.firstEditionNotPublished}</h2>
        <div className="onboarding__body">
          <p>{m.onboardingBody1}</p>
          <br />
          <code className="onboarding__code">npm run fetch --workspace=skill</code>
          <br /><br />
          <p>{m.onboardingBody2}</p>
          <br />
          <p>{m.onboardingBody3}</p>
        </div>
      </div>
    </main>
  )
}
