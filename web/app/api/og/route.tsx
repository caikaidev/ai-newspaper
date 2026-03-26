import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

interface OgItem {
  id: string
  retro_headline?: string
  retro_summary?: string
}

interface OgEdition {
  front_page: OgItem[]
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const date = url.searchParams.get('date')

    if (!date) {
      return new Response('Missing date parameter', { status: 400 })
    }

    const editionRes = await fetch(`${url.origin}/api/edition?date=${encodeURIComponent(date)}`, {
      headers: { accept: 'application/json' },
      cache: 'no-store',
    })

    if (!editionRes.ok) {
      return new Response('Edition not found', { status: editionRes.status })
    }

    const edition = (await editionRes.json()) as OgEdition
    const top3 = edition.front_page.slice(0, 3)

    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            background: '#e8dcc8',
            display: 'flex',
            flexDirection: 'column',
            padding: '40px 60px',
            fontFamily: 'Georgia, serif',
          }}
        >
          <div
            style={{
              borderTop: '4px solid #0d0a04',
              borderBottom: '4px solid #0d0a04',
              textAlign: 'center',
              padding: '12px 0',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                fontSize: '64px',
                color: '#0d0a04',
                lineHeight: 1,
                fontWeight: 700,
              }}
            >
              The Daily Byte
            </div>
            <div
              style={{
                fontSize: '14px',
                color: '#7a5a30',
                marginTop: '6px',
              }}
            >
              {date} · Curated by Artificial Intelligence
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            {top3.map((item, i) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#7a5a30',
                    minWidth: '20px',
                    paddingTop: '2px',
                  }}
                >
                  {i + 1}.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      fontSize: i === 0 ? '26px' : '20px',
                      fontWeight: 700,
                      color: '#0d0a04',
                      lineHeight: 1.2,
                    }}
                  >
                    {item.retro_headline ?? 'The Daily Byte'}
                  </div>
                  {i === 0 && item.retro_summary && (
                    <div
                      style={{
                        fontSize: '14px',
                        color: '#5a3a10',
                        marginTop: '6px',
                        lineHeight: 1.4,
                      }}
                    >
                      {item.retro_summary.slice(0, 160)}
                      {item.retro_summary.length > 160 ? '…' : ''}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: '2px solid #0d0a04',
              paddingTop: '10px',
              marginTop: '16px',
              fontSize: '12px',
              color: '#7a5a30',
              textAlign: 'center',
            }}
          >
            ai-newspaper-web.vercel.app · All headlines rewritten in the manner of 1920s correspondence
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (err) {
    console.error('[og] Satori render failed — returning plain response:', err)
    return new Response('OG image generation failed', { status: 500 })
  }
}
