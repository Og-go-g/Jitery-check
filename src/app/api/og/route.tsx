import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const daysActive =
      searchParams.get('daysActive') ||
      searchParams.get('days') ||
      '0'
    const txCount = searchParams.get('txCount') || '0'
    const gasSpent =
      searchParams.get('gasSpent') ||
      searchParams.get('gas') ||
      '0.00000'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            backgroundImage: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '60px 80px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '60px',
            }}
          >
            <h1
              style={{
                fontSize: '64px',
                fontWeight: 'bold',
                color: '#0052FF',
                textShadow: '0 0 20px rgba(0, 82, 255, 0.5)',
                letterSpacing: '2px',
              }}
            >
              BASE WRAPPED
            </h1>
          </div>

          {/* Cards Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '40px',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
            }}
          >
            {/* Days Active Card */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid #333',
                borderRadius: '16px',
                padding: '40px 50px',
                minWidth: '280px',
              }}
            >
              <div
                style={{
                  fontSize: '18px',
                  color: '#888',
                  marginBottom: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Days Active
              </div>
              <div
                style={{
                  fontSize: '72px',
                  fontWeight: 'bold',
                  color: '#00ff88',
                  textShadow: '0 0 15px rgba(0, 255, 136, 0.4)',
                }}
              >
                {daysActive}
              </div>
            </div>

            {/* Transactions Card */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid #333',
                borderRadius: '16px',
                padding: '40px 50px',
                minWidth: '280px',
              }}
            >
              <div
                style={{
                  fontSize: '18px',
                  color: '#888',
                  marginBottom: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Transactions
              </div>
              <div
                style={{
                  fontSize: '72px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  textShadow: '0 0 15px rgba(255, 255, 255, 0.3)',
                }}
              >
                {parseInt(txCount).toLocaleString()}
              </div>
            </div>

            {/* Gas Spent Card */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid #333',
                borderRadius: '16px',
                padding: '40px 50px',
                minWidth: '280px',
              }}
            >
              <div
                style={{
                  fontSize: '18px',
                  color: '#888',
                  marginBottom: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Gas Spent (ETH)
              </div>
              <div
                style={{
                  fontSize: '72px',
                  fontWeight: 'bold',
                  color: '#00ff88',
                  textShadow: '0 0 15px rgba(0, 255, 136, 0.4)',
                }}
              >
                {parseFloat(gasSpent).toFixed(4)}
              </div>
            </div>
          </div>

          {/* Footer - Built on Base */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              width: '100%',
              marginTop: 'auto',
            }}
          >
            <div
              style={{
                fontSize: '20px',
                color: '#666',
                fontWeight: '500',
              }}
            >
              Built on Base
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}

