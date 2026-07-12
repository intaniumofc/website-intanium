import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/adminClient';
import { rateLimit, getClientIp } from '@/lib/auth/requireAdmin';

function getScratchTitle(score) {
  if (score >= 100) return 'Intanium Gem Master';
  if (score >= 60) return 'Intan Admirer';
  if (score >= 20) return 'Lucky Beginner';
  return 'Intanium Novice';
}

const MIN_REVEAL_INTERVAL_MS = 350;

export async function POST(request) {
  const ip = getClientIp(request);
  const { error: rlError } = rateLimit(ip, { key: 'scratch-reveal', max: 30, windowMs: 60_000 });
  if (rlError) return rlError;

  try {
    const { sessionId, cellIndex } = await request.json();
    const idx = parseInt(cellIndex);

    if (!sessionId || isNaN(idx) || idx < 0 || idx > 15) {
      return NextResponse.json(
        { success: false, error: 'Parameter tidak valid.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Fetch current scratch session
    const { data: session, error: fetchError } = await supabase
      .from('scratch_sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    if (fetchError || !session) {
      console.error('Error fetching scratch session:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Sesi permainan tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Anti-cheat: minimal time between reveals
    const lastUpdate = session.updated_at ? new Date(session.updated_at).getTime() : 0;
    if (lastUpdate && Date.now() - lastUpdate < MIN_REVEAL_INTERVAL_MS) {
      return NextResponse.json(
        { success: false, error: 'Terlalu cepat, tunggu sebentar.' },
        { status: 429 }
      );
    }

    if (session.created_at) {
      const ageMs = Date.now() - new Date(session.created_at).getTime();
      if (ageMs > 10 * 60 * 1000) {
        return NextResponse.json(
          { success: false, error: 'Sesi sudah kadaluarsa.' },
          { status: 410 }
        );
      }
    }

    // 2. Validate current session status
    if (session.status !== 'playing') {
      return NextResponse.json(
        { success: false, error: 'Sesi permainan sudah berakhir.' },
        { status: 400 }
      );
    }

    // 3. Prevent duplicate scratching of same cell
    const revealedCells = session.revealed_cells || [];
    if (revealedCells.includes(idx)) {
      return NextResponse.json(
        { success: false, error: 'Kotak ini sudah digosok.' },
        { status: 400 }
      );
    }

    // 4. Retrieve cell outcome
    const gridData = session.grid_data || [];
    const outcome = gridData[idx];
    if (!outcome) {
      return NextResponse.json(
        { success: false, error: 'Data grid tidak valid.' },
        { status: 500 }
      );
    }

    let nextScore = session.score;
    let nextStatus = 'playing';
    const nextRevealedCells = [...revealedCells, idx];

    if (outcome === 'bomb') {
      nextStatus = 'lost';
    } else if (outcome === 'diamond') {
      nextScore += 10;
      
      // Check if all diamonds on the board have been found
      const totalDiamonds = gridData.filter(cell => cell === 'diamond').length;
      const foundDiamonds = nextRevealedCells.filter(cellIdx => gridData[cellIdx] === 'diamond').length;

      if (foundDiamonds === totalDiamonds) {
        nextStatus = 'won';
      }
    }

    // 5. Update session in Supabase
    const { error: updateError } = await supabase
      .from('scratch_sessions')
      .update({
        revealed_cells: nextRevealedCells,
        score: nextScore,
        status: nextStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error updating scratch session:', updateError);
      return NextResponse.json(
        { success: false, error: 'Gagal memperbarui sesi permainan.' },
        { status: 500 }
      );
    }

    // 6. Submit score to Leaderboard if game ended
    if (nextStatus === 'lost' || nextStatus === 'won') {
      const { error: scoreInsertError } = await supabase
        .from('game_scores')
        .insert({
          username: session.username,
          score: nextScore,
          caught_count: Math.floor(nextScore / 10), // Number of diamonds found
          max_combo: nextStatus === 'won' ? 12 : 0, // Max diamond combo if won (12 diamonds)
          mode: 'gosok-intan',
          title: getScratchTitle(nextScore),
        });

      if (scoreInsertError) {
        console.error('Error submitting final game score:', scoreInsertError);
        // We log error but don't fail the reveal request to ensure visual game finishes
      }
    }

    return NextResponse.json({
      success: true,
      result: outcome,
      score: nextScore,
      status: nextStatus
    });

  } catch (error) {
    console.error('API Reveal Scratch Error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan sistem internal.' },
      { status: 500 }
    );
  }
}
