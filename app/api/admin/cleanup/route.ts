import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    const results: string[] = [];

    // 1. Delete "The Psychology Book"
    const { error: e1 } = await supabase
      .from('knowledge_chunks')
      .delete()
      .eq('book_title', 'The Psychology Book - Big Ideas Simply Explained');
    results.push(e1 ? `Psychology Book: ERROR ${e1.message}` : 'Psychology Book: deleted');

    // 2. Delete Ryan Mace duplicate chunks (originals end at ~06:36, dupes start at ~07:00+)
    const { error: e2 } = await supabase
      .from('knowledge_chunks')
      .delete()
      .eq('book_title', 'Dark Psychology and Gaslighting Manipulation')
      .gt('created_at', '2026-04-18T07:00:00');
    results.push(e2 ? `Mace dupes: ERROR ${e2.message}` : 'Mace dupes: deleted');

    // 3. Verify final counts
    const { data: books } = await supabase
      .from('knowledge_chunks')
      .select('book_title')
    const counts: Record<string, number> = {};
    for (const row of books || []) {
      counts[row.book_title] = (counts[row.book_title] || 0) + 1;
    }

    return NextResponse.json({ results, finalCounts: counts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
