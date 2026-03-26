import type { AppLang } from '@/lib/i18n'
import { localeForLang, t } from '@/lib/i18n'
import LanguageSwitcher from './LanguageSwitcher'

interface MastheadProps {
  date?: string
  edition?: number
  lang: AppLang
  redirectTo: string
}

export default function Masthead({ date, edition, lang, redirectTo }: MastheadProps) {
  const m = t(lang)
  const displayDate = date
    ? new Date(date + 'T00:00:00Z').toLocaleDateString(localeForLang(lang), {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      })
    : lang === 'zh-CN'
      ? '创刊纪元 MMXXVI'
      : 'Est. MMXXVI'

  return (
    <header className="masthead">
      <LanguageSwitcher lang={lang} redirectTo={redirectTo} />
      <h1 className="masthead__name">{m.siteName}</h1>
      <div className="masthead__meta">
        <span>{displayDate}</span>
        <span>{m.curatedMeta}</span>
        {edition ? <span>{m.volumeLabel} {edition}</span> : <span>{m.volumeLabel} 0</span>}
      </div>
    </header>
  )
}
