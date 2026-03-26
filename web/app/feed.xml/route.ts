import fs from 'fs'
import path from 'path'
import { resolveEditionsDir } from '@/lib/editions'

export const runtime = 'nodejs'

export async function GET() {
  const feedPath = path.join(resolveEditionsDir(), 'feed.xml')

  try {
    const xml = fs.readFileSync(feedPath, 'utf-8')
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch {
    return new Response('Feed not found', { status: 404 })
  }
}
