/**
 * GET /api/product-files?items=book,briefing
 *
 * Public endpoint — returns the file list the buyer should see on
 * the thank-you page. Queries the `product_files` table (the same
 * source the delivery email reads from), so admin changes at
 * /app/admin/files are reflected here without a deploy.
 *
 * No auth: the thank-you page is public and the URLs returned are
 * public URLs anyway (either /downloads/*.pdf on the site or
 * Supabase Storage public URLs on our product-files bucket).
 * Nothing sensitive leaks.
 */

import { NextResponse } from 'next/server';
import { fetchProductFiles, type ProductSlug } from '@/lib/pricing';

const ALLOWED: ProductSlug[] = ['book', 'briefing', 'playbooks', 'vault'];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const raw = url.searchParams.get('items') || '';
    const slugs = raw
      .split(',')
      .map((s) => s.trim())
      .filter((s): s is ProductSlug => ALLOWED.includes(s as ProductSlug));

    if (slugs.length === 0) {
      return NextResponse.json({ files: [] });
    }

    const files = await fetchProductFiles(slugs);
    return NextResponse.json({ files });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[product-files GET]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
