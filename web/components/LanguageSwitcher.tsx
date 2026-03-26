import type { AppLang } from '@/lib/i18n'
import { t } from '@/lib/i18n'

interface LanguageSwitcherProps {
  lang: AppLang
  redirectTo: string
}

export default function LanguageSwitcher({ lang, redirectTo }: LanguageSwitcherProps) {
  const m = t(lang)

  const buildHref = (target: AppLang) =>
    `/api/lang?lang=${encodeURIComponent(target)}&redirect=${encodeURIComponent(redirectTo)}`

  return (
    <div className="language-switcher" aria-label={m.language}>
      <span className="language-switcher__label">{m.language}:</span>
      <a className={lang === 'en' ? 'is-active' : ''} href={buildHref('en')}>
        {m.english}
      </a>
      <span> / </span>
      <a className={lang === 'zh-CN' ? 'is-active' : ''} href={buildHref('zh-CN')}>
        {m.simplifiedChinese}
      </a>
    </div>
  )
}
