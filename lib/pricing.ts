/**
 * Single source of truth for funnel product slugs, pricing, and delivery.
 * All amounts in CENTS.
 */

export type ProductSlug = 'book' | 'briefing' | 'playbooks' | 'vault';

export type DownloadFile = {
  name: string;       // human-readable
  path: string;       // relative to /public
};

export type ProductDef = {
  slug: ProductSlug;
  name: string;
  priceCents: number;
  retailCents: number;
  /** All files delivered to the buyer for this product. Most have one. The book has 5 (main + 4 free bonuses). */
  downloads: DownloadFile[];
  description: string;
};

export const PRODUCTS: Record<ProductSlug, ProductDef> = {
  book: {
    slug: 'book',
    name: 'Shadow Persuasion — The 47 Counterintuitive Conversation Tactics',
    priceCents: 700,
    retailCents: 4700,
    description: 'The field manual. 47 tactics. 4-part system.',
    downloads: [
      { name: 'Shadow Persuasion (The Book)',              path: '/downloads/shadow-persuasion-book.pdf' },
      { name: 'Bonus #1 — The Manipulation Tactics Decoder',       path: '/downloads/bonus-1-manipulation-decoder.pdf' },
      { name: 'Bonus #2 — The Power Dynamics Cheatsheet',          path: '/downloads/bonus-2-power-dynamics-cheatsheet.pdf' },
      { name: 'Bonus #3 — 48 Salary Negotiation Scripts',          path: '/downloads/bonus-3-salary-scripts.pdf' },
      { name: 'Bonus #4 — The Reactance Detector Cheatsheet',      path: '/downloads/bonus-4-reactance-detector.pdf' },
    ],
  },
  briefing: {
    slug: 'briefing',
    name: 'The Pre-Conversation Briefing',
    priceCents: 1700,
    retailCents: 1700,
    description: 'The 10-minute system you fill out before any conversation that matters.',
    downloads: [
      { name: 'The Pre-Conversation Briefing', path: '/downloads/pre-conversation-briefing.pdf' },
    ],
  },
  playbooks: {
    slug: 'playbooks',
    name: 'The Situation Playbooks',
    priceCents: 0, // sold only as part of the $47 upsell bundle
    retailCents: 4700,
    description: '20 deep-dive playbooks for the conversations that actually decide your life.',
    downloads: [
      { name: 'The Situation Playbooks', path: '/downloads/situation-playbooks.pdf' },
    ],
  },
  vault: {
    slug: 'vault',
    name: 'The Shadow Persuasion Vault',
    priceCents: 0, // sold only as part of the $47 upsell bundle
    retailCents: 3700,
    description: '250 field-tested techniques with full deployment breakdowns.',
    downloads: [
      { name: 'The Shadow Persuasion Vault', path: '/downloads/shadow-persuasion-vault.pdf' },
    ],
  },
};

/**
 * Flat list of all downloads across a set of products, in order.
 *
 * Sync version — uses the hardcoded `PRODUCTS` definitions above.
 * Kept for any caller that can't await a DB query. The DB-backed
 * version below (`fetchProductFiles`) should be preferred because
 * it respects admin-uploaded / deactivated files.
 */
export function flattenDownloads(slugs: ProductSlug[]): DownloadFile[] {
  return slugs.flatMap((s) => PRODUCTS[s].downloads);
}

/**
 * Async version that reads from the `product_files` Supabase table.
 * This is the source of truth for the delivery email (and anything
 * else that wants to respect the admin's file management at
 * /app/admin/files).
 *
 * Fallback: if the DB query fails OR returns zero rows for a given
 * product slug, we fall back to the hardcoded `PRODUCTS[slug].downloads`
 * so delivery never silently breaks while migrations are being applied.
 */
export async function fetchProductFiles(slugs: ProductSlug[]): Promise<DownloadFile[]> {
  // Dynamic import so this module doesn't pull supabase on pages that
  // only use the sync helpers above (keeps client bundles small).
  const { createClient } = await import('@supabase/supabase-js');
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data, error } = await supabase
      .from('product_files')
      .select('product_slug, name, storage_url, sort_order')
      .in('product_slug', slugs)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;

    const rows = data ?? [];
    // Preserve the order of `slugs` in the output (e.g. book first,
    // then briefing), and within each slug sort by sort_order.
    const out: DownloadFile[] = [];
    for (const slug of slugs) {
      const forSlug = rows.filter((r) => r.product_slug === slug);
      if (forSlug.length === 0) {
        // DB has nothing for this slug → fall back to hardcoded list.
        out.push(...(PRODUCTS[slug]?.downloads ?? []));
      } else {
        for (const r of forSlug) {
          out.push({ name: r.name as string, path: r.storage_url as string });
        }
      }
    }
    return out;
  } catch (err) {
    console.warn('[fetchProductFiles] DB lookup failed, falling back to static:', err);
    return flattenDownloads(slugs);
  }
}

// Bundle: playbooks + vault sold together for $47
export const UPSELL_PLAYBOOKS_BUNDLE = {
  items: ['playbooks', 'vault'] as const satisfies readonly ProductSlug[],
  priceCents: 4700,
  retailCents: 8400,
  name: 'The Situation Playbooks + Shadow Persuasion Vault',
};

/**
 * Compute the total price in cents for a list of product slugs.
 * For the book checkout flow: pass ['book'] or ['book', 'briefing'].
 */
export function computeTotalCents(slugs: ProductSlug[]): number {
  // Check if this is the playbooks+vault bundle
  const isBundle =
    slugs.length === 2 &&
    slugs.includes('playbooks') &&
    slugs.includes('vault');
  if (isBundle) {
    return UPSELL_PLAYBOOKS_BUNDLE.priceCents;
  }
  return slugs.reduce((sum, slug) => sum + PRODUCTS[slug].priceCents, 0);
}

/**
 * Human-readable summary of what was purchased (for emails + thank-you pages).
 */
export function describeOrder(slugs: ProductSlug[]): string {
  if (slugs.length === 0) return 'your order';
  return slugs.map((s) => PRODUCTS[s].name).join(' + ');
}
