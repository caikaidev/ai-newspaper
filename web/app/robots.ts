import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEWSPAPER_BASE_URL ?? 'https://ai-newspaper-web.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/skills', '/skills/*', '/archive', '/topics', '/topics/*'],
      disallow: ['/api/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
