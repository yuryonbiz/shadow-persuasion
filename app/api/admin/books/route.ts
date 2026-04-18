import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// PUT: Update book title and/or author across all chunks
export async function PUT(req: NextRequest) {
  try {
    const { oldTitle, newTitle, newAuthor } = await req.json();

    if (!oldTitle) {
      return NextResponse.json({ error: 'oldTitle is required' }, { status: 400 });
    }

    const updates: Record<string, string> = {};
    if (newTitle) updates.book_title = newTitle;
    if (newAuthor) updates.author = newAuthor;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const { error, count } = await supabase
      .from('knowledge_chunks')
      .update(updates)
      .eq('book_title', oldTitle);

    if (error) throw error;

    return NextResponse.json({ updated: count });
  } catch (error: any) {
    console.error('[ADMIN_BOOKS]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: List all books with chunk counts
export async function GET() {
  try {
    // Try with storage_path first, fall back without it if column doesn't exist
    let data: any[] | null = null;
    let hasStoragePath = true;

    const res1 = await supabase
      .from('knowledge_chunks')
      .select('book_title, author, storage_path');

    if (res1.error) {
      // Column likely doesn't exist, retry without it
      hasStoragePath = false;
      const res2 = await supabase
        .from('knowledge_chunks')
        .select('book_title, author');
      if (res2.error) throw res2.error;
      data = res2.data;
    } else {
      data = res1.data;
    }

    // Group by book
    const bookMap: Record<string, { title: string; author: string; chunks: number; storage_path?: string }> = {};
    for (const row of data || []) {
      const key = row.book_title;
      if (!bookMap[key]) {
        bookMap[key] = { title: row.book_title, author: row.author, chunks: 0 };
      }
      bookMap[key].chunks++;
      if (hasStoragePath && row.storage_path && !bookMap[key].storage_path) {
        bookMap[key].storage_path = row.storage_path;
      }
    }

    return NextResponse.json(Object.values(bookMap));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
