import type { MetadataRoute } from 'next'
import { listEditions } from '@/lib/editions'

const BASE_URL = process.env.NEWSPAPER_BASE_URL ?? 'http://localhost:3000'

export default function sitemap(): MetadataRoute.Sitemap {
  const editions = listEditions()
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/skills`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/archive`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/topics/skills`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.84,
    },
  ]

  const editionRoutes: MetadataRoute.Sitemap = editions.flatMap(date => [
    {
      url: `${BASE_URL}/${date}`,
      lastModified: new Date(`${date}T00:00:00Z`),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/skills/${date}`,
      lastModified: new Date(`${date}T00:00:00Z`),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ])

  return [...staticRoutes, ...editionRoutes]
}
