import { NextRequest } from 'next/server'
import { loadEdition } from '@/lib/editions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  if (!date) {
    return Response.json({ error: 'Missing date parameter' }, { status: 400 })
  }

  const edition = loadEdition(date)
  if (!edition) {
    return Response.json({ error: 'Edition not found' }, { status: 404 })
  }

  return Response.json(edition, {
    headers: {
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
