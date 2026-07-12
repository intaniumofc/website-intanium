import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/adminClient';
import { rateLimit, getClientIp } from '@/lib/auth/requireAdmin';

export async function POST(request) {
  const ip = getClientIp(request);
  const { error: rlError } = rateLimit(ip, { key: 'scratch-start', max: 10, windowMs: 60_000 });
  if (rlError) return rlError;

  try {
    const { username } = await request.json();
    const cleanUsername = username?.trim().slice(0, 24);

    if (!cleanUsername || cleanUsername.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Nama pemain wajib diisi minimal 2 karakter.' },
        { status: 400 }
      );
    }

    // 1. Get Client IP address and hash it
    let ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    if (ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

    // 2. Determine start of today in UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const supabase = createAdminClient();

    // 3. Check ticket count for IP or Username today
    const { count, error: countError } = await supabase
      .from('scratch_sessions')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayISO)
      .or(`ip_hash.eq.${ipHash},username.ilike.${cleanUsername}`);

    if (countError) {
      console.error('Error counting daily scratch sessions:', countError);
      return NextResponse.json(
        { success: false, error: 'Gagal memproses pengecekan kuota tiket bermain.' },
        { status: 500 }
      );
    }

    const maxTickets = 5;
    if (count >= maxTickets) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Kuota tiket bermain harian Anda sudah habis (Maksimal 5 kali sehari). Silakan coba lagi besok!' 
        },
        { status: 429 }
      );
    }

    // 4. Generate 4x4 Grid (16 cells: 4 bombs, 12 diamonds, no zonks)
    const gridItems = [
      'bomb', 'bomb', 'bomb', 'bomb',
      'diamond', 'diamond', 'diamond', 'diamond',
      'diamond', 'diamond', 'diamond', 'diamond',
      'diamond', 'diamond', 'diamond', 'diamond'
    ];

    // Fisher-Yates shuffle
    for (let i = gridItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gridItems[i], gridItems[j]] = [gridItems[j], gridItems[i]];
    }

    // 5. Create new session in Supabase
    const { data: session, error: insertError } = await supabase
      .from('scratch_sessions')
      .insert({
        username: cleanUsername,
        ip_hash: ipHash,
        grid_data: gridItems,
        revealed_cells: [],
        score: 0,
        status: 'playing'
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error inserting scratch session:', insertError);
      return NextResponse.json(
        { success: false, error: 'Gagal membuat sesi permainan baru.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      ticketsLeft: maxTickets - (count + 1)
    });

  } catch (error) {
    console.error('API Start Scratch Session Error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan sistem internal.' },
      { status: 500 }
    );
  }
}
