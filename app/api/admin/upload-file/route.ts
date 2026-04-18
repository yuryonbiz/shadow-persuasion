import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export const maxDuration = 60;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// POST: Upload a file to Supabase Storage bucket "books"
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;
    const author = formData.get('author') as string | null;

    if (!file || !title) {
      return NextResponse.json({ error: 'file and title are required' }, { status: 400 });
    }

    const storagePath = file.name;

    const buffer = Buffer.from(await file.arrayBuffer());

    // Try to upload — if the bucket doesn't exist, return gracefully
    const { data, error } = await supabase.storage
      .from('books')
      .upload(storagePath, buffer, {
        contentType: file.type || 'application/pdf',
        upsert: true,
      });

    if (error) {
      const errorDetail = { message: error.message, name: (error as any).name, statusCode: (error as any).statusCode, cause: (error as any).cause, path: storagePath, bufferSize: buffer.length };
      console.error('[UPLOAD-FILE] Storage error:', JSON.stringify(errorDetail));
      return NextResponse.json({
        stored: false,
        storagePath: null,
        error: error.message,
        errorDetail,
      });
    }

    return NextResponse.json({
      stored: true,
      storagePath: data.path,
    });
  } catch (error: any) {
    console.error('[UPLOAD-FILE] Error:', error);
    return NextResponse.json({
      stored: false,
      storagePath: null,
      error: error.message || 'Upload failed',
    });
  }
}

// PUT: Attach a PDF to an existing book (upload + update storage_path on chunks)
export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const bookTitle = formData.get('bookTitle') as string | null;

    if (!file || !bookTitle) {
      return NextResponse.json({ error: 'file and bookTitle are required' }, { status: 400 });
    }

    const storagePath = file.name;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { data, error } = await supabase.storage
      .from('books')
      .upload(storagePath, buffer, {
        contentType: file.type || 'application/pdf',
        upsert: true,
      });

    if (error) {
      return NextResponse.json({ stored: false, error: error.message }, { status: 500 });
    }

    // Update storage_path on all chunks for this book
    await supabase
      .from('knowledge_chunks')
      .update({ storage_path: data.path })
      .eq('book_title', bookTitle);

    return NextResponse.json({ stored: true, storagePath: data.path });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: Generate a signed download URL for a file in Supabase Storage
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json({ error: 'path query parameter is required' }, { status: 400 });
    }

    const { data, error } = await supabase.storage
      .from('books')
      .createSignedUrl(path, 3600); // 1 hour expiry

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ url: data.signedUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
