import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS for inserting scores
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request) {
  try {
    const { username, score, caughtCount, maxCombo, mode, title } = await request.json();

    if (!username || typeof score !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('game_scores')
      .insert({
        username,
        score,
        caught_count: caughtCount,
        max_combo: maxCombo,
        mode: mode || 'classic',
        title,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting game score:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('API submit-score error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
