import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user')?.slice(0, 30) || 'Pemain Misterius';
    const score = searchParams.get('score') || '0';
    const game = searchParams.get('game') || 'Game IRIS';
    
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
            backgroundColor: '#ffffff',
            backgroundImage: 'radial-gradient(circle at center, #ffffff 0%, #fdf2f8 100%)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* Header Label */}
          <div style={{
            position: 'absolute',
            top: 40,
            left: 40,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ padding: '8px 24px', background: '#FF5FB2', borderRadius: '100px', color: 'white', fontWeight: 800, fontSize: 24, letterSpacing: '0.1em' }}>
              IRIS GAMING
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <h1 style={{ fontSize: 72, fontWeight: 900, color: '#170C79', marginBottom: 0, marginTop: 20 }}>
              {game === 'gosok-intan' ? 'GOSOK INTAN' : 'MINI GAME'}
            </h1>
            <p style={{ fontSize: 32, color: '#8B94A7', marginTop: 10, fontWeight: 600 }}>
              Berhasil mencetak rekor baru!
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40, background: 'rgba(255,255,255,0.95)', border: '4px solid #FF5FB2', borderRadius: 32, padding: '40px 80px', boxShadow: '0 20px 40px rgba(236,72,153,0.15)' }}>
              <span style={{ fontSize: 40, fontWeight: 800, color: '#FF5FB2', textTransform: 'uppercase' }}>{user}</span>
              <span style={{ fontSize: 120, fontWeight: 900, color: '#170C79', marginTop: -10, lineHeight: 1.1 }}>
                {score} <span style={{ fontSize: 48, color: '#FF5FB2' }}>Pts</span>
              </span>
            </div>
            
            <p style={{ fontSize: 28, color: '#8B94A7', marginTop: 60, fontWeight: 600 }}>
              Mainkan dan uji keberuntunganmu sekarang!
            </p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    return new Response(`Failed to generate image`, { status: 500 });
  }
}
