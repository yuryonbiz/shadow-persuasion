import { NextResponse } from 'next/server';
import { supabase } from '@/lib/rag';

export async function GET() {
  try {
    const { data: categories, error: catError } = await supabase
      .from('taxonomy_categories')
      .select('id, name, emoji, description, sort_order')
      .eq('is_active', true)
      .order('sort_order');

    if (catError) {
      return NextResponse.json({ error: catError.message }, { status: 500 });
    }

    const { data: useCases, error: ucError } = await supabase
      .from('taxonomy_use_cases')
      .select('id, category_id, title, sort_order')
      .eq('is_active', true)
      .order('sort_order');

    if (ucError) {
      return NextResponse.json({ error: ucError.message }, { status: 500 });
    }

    const result = (categories || []).map((cat) => ({
      id: cat.id,
      name: cat.name,
      emoji: cat.emoji,
      description: cat.description,
      useCases: (useCases || [])
        .filter((uc) => uc.category_id === cat.id)
        .map((uc) => ({ id: uc.id, title: uc.title })),
    }));

    return NextResponse.json({ categories: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
