import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import { loadEdition } from '@/lib/editions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Load fonts once at module startup — reused across all OG requests
const fontsDir = path.join(process.cwd(), 'public', 'fonts')
const fontPromise = Promise.all([
  fs.readFile(path.join(fontsDir, 'playfair-display-black.woff2')),
  fs.readFile(path.join(fontsDir, 'unifraktur-maguntia.woff2')),
]).catch(() => null)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return new Response('Missing date parameter', { status: 400 })
    }

    const edition = loadEdition(date)
    if (!edition) {
      return new Response('Edition not found', { status: 404 })
    }

    const top3 = edition.front_page.slice(0, 3)
    const fonts = await fontPromise

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
            fontFamily: fonts ? 'Playfair' : 'serif',
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
                fontFamily: fonts ? 'UnifrakturMaguntia' : 'serif',
                fontSize: '72px',
                color: '#0d0a04',
                lineHeight: 1,
              }}
            >
              The Daily Byte
            </div>
            <div
              style={{
                fontFamily: fonts ? 'Playfair' : 'serif',
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
                    fontFamily: 'serif',
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
                      fontFamily: fonts ? 'Playfair' : 'serif',
                      fontSize: i === 0 ? '26px' : '20px',
                      fontWeight: 700,
                      color: '#0d0a04',
                      lineHeight: 1.2,
                    }}
                  >
                    {item.retro_headline}
                  </div>
                  {i === 0 && item.retro_summary && (
                    <div
                      style={{
                        fontFamily: 'serif',
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
              fontFamily: 'serif',
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
        fonts: fonts
          ? [
              { name: 'Playfair', data: fonts[0], weight: 900 as const, style: 'normal' as const },
              { name: 'UnifrakturMaguntia', data: fonts[1], weight: 400 as const, style: 'normal' as const },
            ]
          : [],
      }
    )
  } catch (err) {
    console.error('[og] Satori render failed — returning plain response:', err)
    return new Response('OG image generation failed', { status: 500 })
  }
}
