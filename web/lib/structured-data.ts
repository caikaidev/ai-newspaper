import type { Edition, ScoredItem, WeeklyItem } from '@/lib/types'
import type { AppLang } from '@/lib/i18n'
import { getBaseUrl } from '@/lib/seo'
import { localizedHeadline, localizedSummary, t } from '@/lib/i18n'

function toArticle(item: ScoredItem | WeeklyItem, lang: AppLang, position?: number) {
  return {
    '@type': 'Article',
    ...(position ? { position } : {}),
    headline: localizedHeadline(item, lang),
    description: localizedSummary(item, lang),
    url: item.url,
    author: {
      '@type': 'Organization',
      name: t(lang).siteName,
    },
  }
}

export function collectionPageJsonLd(options: {
  path: string
  name: string
  description: string
  lang: AppLang
  items?: Array<ScoredItem | WeeklyItem>
}) {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}${options.path}`

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    inLanguage: options.lang,
    name: options.name,
    description: options.description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: t(options.lang).siteName,
      url: baseUrl,
    },
    ...(options.items && options.items.length > 0
      ? {
          hasPart: {
            '@type': 'ItemList',
            itemListElement: options.items.map((item, index) => toArticle(item, options.lang, index + 1)),
          },
        }
      : {}),
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  const baseUrl = getBaseUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
  }
}

export function editionJsonLd(edition: Edition, lang: AppLang) {
  const baseUrl = getBaseUrl()
  return [
    collectionPageJsonLd({
      path: `/${edition.date}`,
      name: `${edition.date} — ${t(lang).siteName}`,
      description: edition.front_page[0]?.retro_summary ?? t(lang).siteDescription,
      lang,
      items: edition.front_page.slice(0, 5),
    }),
    breadcrumbJsonLd([
      { name: t(lang).siteName, path: '/' },
      { name: edition.date, path: `/${edition.date}` },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: edition.front_page[0] ? localizedHeadline(edition.front_page[0], lang) : `${edition.date} — ${t(lang).siteName}`,
      description: edition.front_page[0] ? localizedSummary(edition.front_page[0], lang) : t(lang).siteDescription,
      url: `${baseUrl}/${edition.date}`,
      datePublished: edition.generated_at,
      author: {
        '@type': 'Organization',
        name: t(lang).siteName,
      },
    },
  ]
}
