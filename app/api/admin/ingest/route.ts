import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY!;

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/text-embedding-3-small',
      input: text.slice(0, 8000),
    }),
  });
  if (!res.ok) throw new Error(`Embedding error: ${res.status}`);
  const data = await res.json();
  return data.data[0].embedding;
}

async function extractMetadata(chunk: string, bookTitle: string, author: string) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4',
      messages: [
        { role: 'system', content: 'Extract metadata from book text. Respond ONLY with valid JSON, no markdown.' },
        { role: 'user', content: `From "${bookTitle}" by ${author}. Extract:
{
  "technique_name": "main technique/concept or General",
  "technique_id": "slug-version",
  "category": "one of: influence, persuasion, negotiation, body_language, nlp, social_dynamics, power_strategy, dark_psychology, defense",
  "chunk_type": "one of: technique_overview, technique_application, example, framework, exercise",
  "difficulty": "beginner/intermediate/advanced",
  "use_cases": ["array of situations"],
  "risk_level": "low/medium/high",
  "related_techniques": ["array"]
}

Text: ${chunk.slice(0, 1500)}` }
      ],
      temperature: 0.1,
      max_tokens: 500,
    }),
  });

  if (!res.ok) return defaultMetadata();
  try {
    const data = await res.json();
    const content = data.choices[0].message.content
      .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(content);
  } catch {
    return defaultMetadata();
  }
}

function defaultMetadata() {
  return {
    technique_name: 'General', technique_id: 'general', category: 'influence',
    chunk_type: 'technique_overview', difficulty: 'beginner',
    use_cases: [], risk_level: 'low', related_techniques: [],
  };
}

// POST: Process a BATCH of chunks (client sends 3 at a time)
export async function POST(req: NextRequest) {
  try {
    const { chunks, title, author } = await req.json();

    if (!chunks || !Array.isArray(chunks) || !title || !author) {
      return NextResponse.json({ error: 'chunks array, title, and author required' }, { status: 400 });
    }

    let successCount = 0;

    for (const chunk of chunks) {
      try {
        const [metadata, embedding] = await Promise.all([
          extractMetadata(chunk, title, author),
          getEmbedding(chunk),
        ]);

        const { error } = await supabase.from('knowledge_chunks').insert({
          book_title: title,
          author: author,
          section: metadata.technique_name,
          chunk_type: metadata.chunk_type,
          technique_name: metadata.technique_name,
          technique_id: metadata.technique_id,
          category: metadata.category,
          difficulty: metadata.difficulty,
          use_cases: metadata.use_cases,
          risk_level: metadata.risk_level,
          related_techniques: metadata.related_techniques,
          content: chunk,
          token_count: chunk.split(/\s+/).length,
          embedding: embedding,
        });

        if (!error) successCount++;
      } catch (e) {
        console.error('Chunk error:', e);
      }
    }

    return NextResponse.json({ success: true, processed: successCount });

  } catch (error: any) {
    console.error('[INGEST] Error:', error);
    return NextResponse.json({ error: error.message || 'Ingestion failed' }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  try {
    const { title } = await req.json();
    const { error } = await supabase.from('knowledge_chunks').delete().eq('book_title', title);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
