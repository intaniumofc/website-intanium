import { createAdminClient } from '@/lib/supabase/adminClient';

export async function upsertEventsFromJKT48(matched) {
  const supabase = createAdminClient();

  if (!matched || !matched.length) {
    return { upserted: 0, saved: [] };
  }

  // 1. Fetch existing JKT48 events to avoid database conflict constraint issues
  const { data: existingEvents, error: fetchError } = await supabase
    .from('events')
    .select('id, source_id')
    .eq('source', 'jkt48');
    
  if (fetchError) {
    throw new Error(`Gagal mengambil data event lama: ${fetchError.message}`);
  }

  const existingMap = new Map(existingEvents.map(e => [e.source_id, e.id]));
  let upsertedCount = 0;
  const saved = [];

  // 2. Perform comparative insert or update
  for (const m of matched) {
    const sourceId = String(m.link);
    const row = {
      title: m.title,
      description: m.description,
      time: m.time ? new Date(m.time).toISOString() : null,
      platform: m.platform,
      link: m.link_url,
      duration: m.duration,
      thumbnail: m.thumbnail,
      status: 'draft',
      source: 'jkt48',
      source_id: sourceId,
      raw_data: m.raw,
    };

    if (existingMap.has(sourceId)) {
      // Update
      const id = existingMap.get(sourceId);
      const { data: updatedData, error: updateError } = await supabase
        .from('events')
        .update(row)
        .eq('id', id)
        .select('id, title, source_id, status')
        .single();

      if (updateError) {
        throw new Error(`Gagal mengupdate event ${sourceId}: ${updateError.message}`);
      }
      if (updatedData) {
        upsertedCount++;
        saved.push(updatedData);
      }
    } else {
      // Insert
      const { data: insertedData, error: insertError } = await supabase
        .from('events')
        .insert({
          id: `jkt48-${sourceId}`,
          ...row
        })
        .select('id, title, source_id, status')
        .single();

      if (insertError) {
        throw new Error(`Gagal memasukkan event ${sourceId}: ${insertError.message}`);
      }
      if (insertedData) {
        upsertedCount++;
        saved.push(insertedData);
      }
    }
  }

  return { upserted: upsertedCount, saved };
}
