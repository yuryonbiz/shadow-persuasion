import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export const maxDuration = 60;
export const config = { api: { bodyParser: { sizeLimit: '50mb' } } };

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

    const titleSlug = slugify(title);
    const storagePath = `${titleSlug}/${file.name}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    // Try to upload — if the bucket doesn't exist, return gracefully
    const { data, error } = await supabase.storage
      .from('books')
      .upload(storagePath, buffer, {
        contentType: file.type || 'application/pdf',
        upsert: true,
      });

    if (error) {
      console.error('[UPLOAD-FILE] Storage error:', JSON.stringify({ message: error.message, name: (error as any).name, statusCode: (error as any).statusCode, path: storagePath }));
      return NextResponse.json({
        stored: false,
        storagePath: null,
        error: error.message,
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
